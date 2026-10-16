import { NextResponse } from "next/server";
import { createFlipBill } from "@/lib/flip";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // userId = User.id dari session next-auth (bukan TeacherProfile.id)
    let { userId, amount, quotaAdded } = body;

    if (!userId || !amount || !quotaAdded) {
      return NextResponse.json(
        { error: "Missing required fields (userId, amount, quotaAdded)" },
        { status: 400 }
      );
    }

    // Validasi amount minimum Flip (Rp 10.000)
    if (amount < 10000) {
      return NextResponse.json(
        { error: "Amount minimum adalah Rp 10.000" },
        { status: 400 }
      );
    }

    // Cari TeacherProfile berdasarkan userId (dari session)
    let teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    // Jika guru belum ada di DB (mode testing sandbox)
    if (!teacher) {
      // Coba cari user dulu
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json(
          { error: `User tidak ditemukan (userId: ${userId}). Pastikan Anda sudah login.` },
          { status: 404 }
        );
      }

      // Guru ada tapi belum punya profil lengkap — buat profil minimal
      teacher = await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          fullName: user.username || user.email || "Guru",
          schoolName: "Belum diisi",
        },
      });
    }

    // 1. Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 2. Tentukan redirect URL setelah pembayaran
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${appUrl}/guru/payment/status?order_id=${orderId}`;

    // 3. Buat Bill di Flip
    const flipBill = await createFlipBill({
      title: `Pembelian Kuota ${quotaAdded} Siswa - ${teacher.fullName}`,
      type: "SINGLE",
      amount: amount,
      redirectUrl: redirectUrl,
      senderName: teacher.fullName,
      senderEmail: teacher.whatsapp ? `wa${teacher.whatsapp}@flip.id` : "guru@sekolah.id",
    });

    // 4. Simpan transaksi ke database
    await prisma.transaction.create({
      data: {
        orderId,
        teacherId: teacher.id, // gunakan TeacherProfile.id
        amount,
        quotaAdded,
        status: "PENDING",
        snapToken: String(flipBill.link_id), // simpan link_id Flip
        paymentType: "FLIP",
      },
    });

    return NextResponse.json({
      // payment_url = URL langsung ke halaman bayar Flip
      // link_url = halaman info tagihan Flip (fallback jika payment_url tidak ada)
      redirect_url: flipBill.payment_url || flipBill.link_url,
      link_id: flipBill.link_id,
      order_id: orderId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
