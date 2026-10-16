"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState("loading"); // loading | success | pending | failed

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    // Cek status transaksi dari server
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status?order_id=${orderId}`);
        const data = await res.json();

        if (data.status === "SUCCESS") {
          setStatus("success");
        } else if (data.status === "PENDING") {
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch {
        // Jika tidak ada API status, asumsikan pending (Flip akan kirim webhook)
        setStatus("pending");
      }
    };

    checkStatus();
  }, [orderId]);

  const statusConfig = {
    loading: {
      icon: <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />,
      title: "Mengecek Status...",
      description: "Mohon tunggu sebentar",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    success: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={1.5} />,
      title: "Pembayaran Berhasil!",
      description: "Kuota Anda telah ditambahkan. Sekarang Anda bisa menggunakan kuota baru untuk siswa.",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-yellow-500" strokeWidth={1.5} />,
      title: "Menunggu Konfirmasi",
      description: "Pembayaran Anda sedang diproses. Kuota akan ditambahkan otomatis setelah pembayaran dikonfirmasi (5-15 menit).",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    failed: {
      icon: <XCircle className="w-16 h-16 text-red-500" strokeWidth={1.5} />,
      title: "Pembayaran Gagal",
      description: "Pembayaran tidak berhasil atau dibatalkan. Silakan coba lagi.",
      color: "text-red-600",
      bg: "bg-red-50",
    },
  };

  const current = statusConfig[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
      >
        <div className={`w-24 h-24 ${current.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {current.icon}
        </div>

        <h1 className={`text-2xl font-bold mb-3 ${current.color}`}>
          {current.title}
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          {current.description}
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs text-gray-400 mb-1">Order ID</p>
            <p className="text-sm font-mono text-gray-700 break-all">{orderId}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/guru/beli-kuota")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Beli Lagi
          </button>
          <button
            onClick={() => router.push("/guru/dashboard")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <Home size={18} />
            Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
