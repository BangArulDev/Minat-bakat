import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/payment/status?order_id=ORDER-xxx
 * Mengecek status transaksi berdasarkan order_id
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order_id parameter" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { orderId },
      select: {
        orderId: true,
        status: true,
        amount: true,
        quotaAdded: true,
        paymentType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment Status API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
