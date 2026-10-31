
import { NextResponse } from "next/server";
import { createFlipBill } from "@/lib/flip";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ============================================
// DAFTAR PAKET CARE INDONESIA
// ============================================

const PACKAGES = [
  { name: "PERSONAL", quota: 1, price: 15000 },
  { name: "SPARK", quota: 35, price: 110000 },
  { name: "RISE", quota: 100, price: 140000 },
  { name: "PRIME", quota: 150, price: 185000 },
  { name: "ADVANCE", quota: 300, price: 260000 },
  { name: "GROW", quota: 500, price: 440000 },
  { name: "PRESTIGE", quota: 650, price: 540000 },
  { name: "PROFESSIONAL", quota: 1000, price: 830000 },
  { name: "ULTIMATE", quota: 1500, price: 980000 },
  { name: "ACADEMY", quota: 3000, price: 1400000 },
  { name: "REGIONAL", quota: 5000, price: 2400000 },
  { name: "ENTERPRISE", quota: 12500, price: 4800000 },
  { name: "ENTERPRISE MAX", quota: 15000, price: 5900000 },
] as const;

// ============================================
// METODE PEMBAYARAN FLIP
// ============================================

const FLIP_PAYMENT_METHODS: Record<
  string,
  {
    senderBank: string;
    senderBankType: string;
  }
> = {
  qris: {
    senderBank: "qris",
    senderBankType: "wallet_account",
  },
  bca: {
    senderBank: "bca",
    senderBankType: "virtual_account",
  },
  bri: {
    senderBank: "bri",
    senderBankType: "virtual_account",
  },
  bni: {
    senderBank: "bni",
    senderBankType: "virtual_account",
  },
  mandiri: {
    senderBank: "mandiri",
    senderBankType: "virtual_account",
  },
  ovo: {
    senderBank: "ovo",
    senderBankType: "wallet_account",
  },
};

// ============================================
// API PEMBUATAN TAGIHAN
// ============================================

export async function POST(req: Request) {
  try {
    // 1. Verifikasi sesi login
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // 2. Ambil permintaan pembayaran
    const body = await req.json();

    const { amount, quotaAdded, method } = body;

    if (
      !Number.isInteger(amount) ||
      !Number.isInteger(quotaAdded) ||
      typeof method !== "string"
    ) {
      return NextResponse.json(
        { error: "Data pembayaran tidak valid." },
        { status: 400 }
      );
    }

    // 3. Cari paket berdasarkan kuota
    const selectedPackage = PACKAGES.find(
      (pkg) => pkg.quota === quotaAdded
    );

    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Paket kuota tidak ditemukan." },
        { status: 400 }
      );
    }

    // 4. Pastikan harga sesuai daftar resmi
    if (amount !== selectedPackage.price) {
      return NextResponse.json(
        {
          error:
            "Harga paket tidak sesuai dengan harga resmi. " +
            "Silakan muat ulang halaman pembelian.",
        },
        { status: 400 }
      );
    }

    // 5. Validasi metode pembayaran
    const selectedMethod =
      FLIP_PAYMENT_METHODS[method];

    if (!selectedMethod) {
      return NextResponse.json(
        { error: "Metode pembayaran tidak tersedia." },
        { status: 400 }
      );
    }

    // 6. Verifikasi pengguna dan profil guru
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        teacherProfile: true,
      },
    });

    if (!user || user.role !== "GURU") {
      return NextResponse.json(
        { error: "Pembelian kuota hanya untuk guru." },
        { status: 403 }
      );
    }

    const teacher = user.teacherProfile;

    if (!teacher) {
      return NextResponse.json(
        {
          error:
            "Profil guru belum tersedia. " +
            "Silakan lengkapi profil terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    // 7. Nominal yang digunakan selalu dari server
    const finalAmount = selectedPackage.price;
    const finalQuota = selectedPackage.quota;

    // 8. Buat nomor transaksi
    const orderId = `ORDER-${crypto.randomUUID()}`;

    // 9. URL kembali setelah pembayaran
    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const redirectUrl =
      `${appUrl}/guru/payment/status?order_id=${orderId}`;

    // 10. Buat tagihan melalui Flip
    const flipBill = await createFlipBill({
      title:
        `Pembelian Paket ${selectedPackage.name} - ` +
        `${finalQuota} Siswa - ${teacher.fullName}`,

      type: "SINGLE",
      amount: finalAmount,
      redirectUrl,

      senderName: teacher.fullName,

      senderEmail: user.email ||
        `${user.username || "guru"}@sekolah.id`,

      senderBank: selectedMethod.senderBank,
      senderBankType: selectedMethod.senderBankType,
    });

    if (!flipBill?.link_id) {
      throw new Error(
        "Flip tidak mengembalikan identitas tagihan."
      );
    }

    // 11. Simpan transaksi PostgreSQL
    await prisma.transaction.create({
      data: {
        orderId,
        teacherId: teacher.id,
        amount: finalAmount,
        quotaAdded: finalQuota,
        status: "PENDING",
        snapToken: String(flipBill.link_id),
        paymentType: "FLIP",
      },
    });

    // 12. Siapkan URL pembayaran
    const rawUrl =
      flipBill.payment_url ||
      flipBill.link_url ||
      "";

    if (!rawUrl) {
      throw new Error(
        "Link pembayaran Flip tidak tersedia."
      );
    }

    const paymentUrl = rawUrl.startsWith("http")
      ? rawUrl
      : `https://${rawUrl}`;

    const parsedUrl = new URL(paymentUrl);

    if (parsedUrl.protocol !== "https:") {
      throw new Error(
        "Protokol URL pembayaran tidak valid."
      );
    }

    // 13. Kembalikan informasi tagihan
    return NextResponse.json({
      success: true,
      redirect_url: paymentUrl,
      link_id: flipBill.link_id,
      order_id: orderId,

      package: {
        name: selectedPackage.name,
        quota: finalQuota,
        amount: finalAmount,
      },
    });
  } catch (error: unknown) {
    console.error("Payment API Error:", error);

    return NextResponse.json(
      {
        error:
          "Gagal membuat tagihan pembayaran. " +
          "Silakan periksa status transaksi atau hubungi admin.",
      },
      { status: 500 }
    );
  }
}
