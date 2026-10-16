import { NextResponse } from "next/server";
import { verifyFlipWebhookToken, FlipWebhookData } from "@/lib/flip";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Webhook handler untuk notifikasi pembayaran dari Flip
 *
 * Flip mengirim POST request dengan Content-Type: application/x-www-form-urlencoded
 * Payload berisi dua field:
 *   - data: JSON string berisi detail transaksi
 *   - token: validation token untuk verifikasi keaslian webhook
 *
 * Setup di dashboard Flip:
 *   Settings > API & Webhook > Callback URL = https://yourdomain.com/api/payment/webhook
 */
export async function POST(req: Request) {
  try {
    // Flip mengirim webhook sebagai form-urlencoded
    const formText = await req.text();
    const formData = new URLSearchParams(formText);

    const token = formData.get('token');
    const dataRaw = formData.get('data');

    // 1. Verifikasi token webhook dari Flip
    if (!token || !verifyFlipWebhookToken(token)) {
      console.warn("Flip Webhook: Invalid token received:", token);
      return NextResponse.json(
        { error: "Unauthorized: invalid webhook token" },
        { status: 401 }
      );
    }

    if (!dataRaw) {
      return NextResponse.json(
        { error: "Missing data payload" },
        { status: 400 }
      );
    }

    // 2. Parse data pembayaran dari Flip
    let paymentData: FlipWebhookData;
    try {
      paymentData = JSON.parse(dataRaw);
    } catch {
      console.error("Flip Webhook: Failed to parse data JSON:", dataRaw);
      return NextResponse.json(
        { error: "Invalid JSON in data field" },
        { status: 400 }
      );
    }

    const { bill_link_id, status, amount, sender_bank } = paymentData;

    console.log(`Flip Webhook received - bill_link_id: ${bill_link_id}, status: ${status}`);

    // 3. Konversi status Flip ke status internal aplikasi
    let finalStatus: string;
    switch (status) {
      case 'SUCCESSFUL':
        finalStatus = 'SUCCESS';
        break;
      case 'FAILED':
      case 'CANCELLED':
        finalStatus = 'FAILED';
        break;
      case 'PENDING':
      default:
        finalStatus = 'PENDING';
        break;
    }

    // 4. Cari transaksi berdasarkan bill_link_id (disimpan sebagai snapToken)
    // bill_link_id dari Flip adalah angka besar, konversi ke string untuk perbandingan
    const linkIdStr = String(bill_link_id);
    const transaction = await prisma.transaction.findFirst({
      where: { snapToken: linkIdStr },
    });

    if (!transaction) {
      console.error(`Flip Webhook: Transaction not found for bill_link_id: ${linkIdStr}`);
      // Kembalikan 200 agar Flip tidak retry terus-menerus
      return NextResponse.json({ status: "OK", note: "transaction not found" });
    }

    // 5. Update status transaksi (idempotent — hanya proses jika belum SUCCESS)
    if (transaction.status !== 'SUCCESS') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: finalStatus,
          paymentType: sender_bank || 'FLIP',
        },
      });

      // 6. Jika pembayaran berhasil, tambah kuota guru
      if (finalStatus === 'SUCCESS') {
        await prisma.teacherProfile.update({
          where: { id: transaction.teacherId },
          data: {
            quota: {
              increment: transaction.quotaAdded,
            },
          },
        });

        console.log(
          `Flip Webhook: SUCCESS - Teacher ${transaction.teacherId} quota increased by ${transaction.quotaAdded}`
        );
      }
    } else {
      console.log(`Flip Webhook: Transaction ${transaction.id} already SUCCESS, skipping.`);
    }

    // 7. Balas dengan 200 OK agar Flip tidak retry
    return NextResponse.json({ status: "OK" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Flip Webhook Error:", error);
    // Kembalikan 200 untuk menghindari retry loop pada error internal
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
