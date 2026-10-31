
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Check,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  QrCode,
  Wallet,
  Loader2,
} from "lucide-react";

// ============================================
// DAFTAR PAKET RESMI CARE INDONESIA
// ============================================

const quotaPackages = [
  { id: 1, name: "PERSONAL", quota: 1, price: 15000 },
  { id: 2, name: "SPARK", quota: 35, price: 110000 },
  { id: 3, name: "RISE", quota: 100, price: 140000 },
  { id: 4, name: "PRIME", quota: 150, price: 185000 },
  { id: 5, name: "ADVANCE", quota: 300, price: 260000 },
  { id: 6, name: "GROW", quota: 500, price: 440000 },
  { id: 7, name: "PRESTIGE", quota: 650, price: 540000 },
  { id: 8, name: "PROFESSIONAL", quota: 1000, price: 830000 },
  { id: 9, name: "ULTIMATE", quota: 1500, price: 980000 },
  { id: 10, name: "ACADEMY", quota: 3000, price: 1400000 },
  { id: 11, name: "REGIONAL", quota: 5000, price: 2400000 },
  { id: 12, name: "ENTERPRISE", quota: 12500, price: 4800000 },
  { id: 13, name: "ENTERPRISE MAX", quota: 15000, price: 5900000 },
];

// ============================================
// METODE PEMBAYARAN FLIP
// ============================================

const paymentMethods = [
  {
    id: "qris",
    name: "QRIS",
    desc: "Semua e-wallet dan mobile banking",
    icon: QrCode,
  },
  {
    id: "bca",
    name: "Virtual Account BCA",
    desc: "Transfer melalui m-BCA atau ATM",
    icon: CreditCard,
  },
  {
    id: "bri",
    name: "Virtual Account BRI",
    desc: "Transfer melalui BRImo atau ATM",
    icon: CreditCard,
  },
  {
    id: "bni",
    name: "Virtual Account BNI",
    desc: "Transfer melalui BNI Mobile atau ATM",
    icon: CreditCard,
  },
  {
    id: "mandiri",
    name: "Virtual Account Mandiri",
    desc: "Transfer melalui Livin' atau ATM",
    icon: CreditCard,
  },
  {
    id: "ovo",
    name: "OVO",
    desc: "Pembayaran melalui OVO",
    icon: Wallet,
  },
];

// ============================================
// FORMAT RUPIAH
// ============================================

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number || 0);
};

const formatNumber = (number) => {
  return new Intl.NumberFormat("id-ID").format(number || 0);
};

// ============================================
// HALAMAN PEMBELIAN KUOTA
// ============================================

export default function BeliKuotaPage() {
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // PILIH PAKET
  // ============================================

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setError("");
  };

  // ============================================
  // PILIH METODE PEMBAYARAN
  // ============================================

  const handleSelectPayment = (method) => {
    setSelectedPayment(method);
    setError("");
  };

  // ============================================
  // NAVIGASI
  // ============================================

  const nextStep = () => {
    if (step === 1 && !selectedPackage) {
      setError("Silakan pilih paket terlebih dahulu.");
      return;
    }

    if (step === 2 && !selectedPayment) {
      setError("Silakan pilih metode pembayaran.");
      return;
    }

    setError("");
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // ============================================
  // PROSES PEMBAYARAN
  // ============================================

  const handlePay = async () => {
    if (loading) return;

    if (!selectedPackage || !selectedPayment) {
      setError("Lengkapi paket dan metode pembayaran.");
      return;
    }

    const userId = session?.user?.id;

    if (!userId) {
      setError("Sesi login tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount: selectedPackage.price,
          quotaAdded: selectedPackage.quota,
          method: selectedPayment.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Gagal membuat transaksi pembayaran."
        );
      }

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }

      throw new Error(
        data.error || "Link pembayaran belum tersedia."
      );
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        err.message ||
          "Terjadi kesalahan saat membuat tagihan."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TAMPILAN HALAMAN
  // ============================================

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Beli Kuota Siswa
        </h1>

        <p className="text-gray-500 text-sm mt-2">
          Pilih paket asesmen minat karier CARE Indonesia
          sesuai kebutuhan sekolah dan peserta didik.
        </p>
      </div>

      {/* STEPPER */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <StepItem
          number={1}
          label="Pilih Paket"
          currentStep={step}
        />

        <StepDivider active={step > 1} />

        <StepItem
          number={2}
          label="Metode Bayar"
          currentStep={step}
        />

        <StepDivider active={step > 2} />

        <StepItem
          number={3}
          label="Konfirmasi"
          currentStep={step}
        />
      </div>

      {/* PESAN ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* KONTEN */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">

        <AnimatePresence mode="wait">

          {/* ====================================
              STEP 1 - PILIH PAKET
          ==================================== */}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-5 md:p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">
                  Pilih Paket Sesuai Kebutuhan
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  Harga paket mengikuti daftar harga
                  CARE Indonesia.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {quotaPackages.map((pkg) => {
                  const active =
                    selectedPackage?.id === pkg.id;

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handleSelectPackage(pkg)}
                      className={`relative p-5 rounded-2xl border text-left transition-all duration-200 hover:shadow-lg flex flex-col justify-between min-h-[170px] ${
                        active
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <h3 className="text-sm font-extrabold tracking-wide text-gray-900">
                            {pkg.name}
                          </h3>

                          {active && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check
                                size={14}
                                className="text-white"
                              />
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <span className="text-3xl font-extrabold text-blue-600">
                            {formatNumber(pkg.quota)}
                          </span>

                          <span className="text-gray-500 text-xs font-medium">
                            {" "}Pengguna
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-gray-400 text-xs mb-1">
                          Harga Paket
                        </p>

                        <p className="text-xl font-bold text-gray-900">
                          {formatRupiah(pkg.price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ====================================
              STEP 2 - METODE PEMBAYARAN
          ==================================== */}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-5 md:p-8 max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Pilih Cara Pembayaran
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;

                  const active =
                    selectedPayment?.id === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() =>
                        handleSelectPayment(method)
                      }
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        active
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                          <Icon size={24} />
                        </div>

                        <div>
                          <span className="font-bold text-gray-700 block">
                            {method.name}
                          </span>

                          <span className="text-xs text-gray-500">
                            {method.desc}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                          active
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {active && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 bg-yellow-50 p-4 rounded-xl flex gap-3 border border-yellow-100">
                <ShieldCheck className="text-yellow-600 shrink-0" />

                <p className="text-sm text-yellow-800">
                  Proses pembayaran ditangani oleh penyedia
                  pembayaran. Ikuti instruksi pada halaman
                  pembayaran untuk menyelesaikan transaksi.
                </p>
              </div>
            </motion.div>
          )}

          {/* ====================================
              STEP 3 - RINGKASAN PESANAN
          ==================================== */}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-5 md:p-8 max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Ringkasan Pesanan
              </h2>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">

                <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">
                      Paket Dipilih
                    </p>

                    <p className="font-bold text-lg text-gray-900 mt-1">
                      {selectedPackage?.name}
                    </p>

                    <p className="text-xs text-blue-600 font-medium mt-1">
                      +{formatNumber(selectedPackage?.quota)}
                      {" "}Kuota Pengguna
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Metode Bayar
                    </p>

                    <div className="flex items-center justify-end gap-2 font-bold text-gray-900 mt-1">
                      <CreditCard size={16} />
                      {selectedPayment?.name}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center gap-4">
                  <span className="font-bold text-gray-900">
                    Total Pembayaran
                  </span>

                  <span className="font-bold text-2xl text-blue-600">
                    {formatRupiah(selectedPackage?.price)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Periksa kembali nama paket, jumlah kuota,
                dan harga sebelum melanjutkan pembayaran.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ====================================
          TOMBOL NAVIGASI
      ==================================== */}

      <div className="flex justify-between items-center gap-4 pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={step === 3 ? handlePay : nextStep}
          disabled={
            loading ||
            (step === 1 && !selectedPackage) ||
            (step === 2 && !selectedPayment)
          }
          className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md"
        >
          {loading ? (
            <>
              <Loader2
                size={19}
                className="animate-spin"
              />
              Memproses...
            </>
          ) : step === 3 ? (
            <>
              Bayar Sekarang
              <CreditCard size={19} />
            </>
          ) : (
            <>
              Lanjut
              <ChevronRight size={19} />
            </>
          )}
        </button>
      </div>

    </div>
  );
}

// ============================================
// KOMPONEN STEPPER
// ============================================

function StepItem({ number, label, currentStep }) {
  const isActive = currentStep >= number;
  const isCurrent = currentStep === number;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
          isActive
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-500"
        } ${
          isCurrent
            ? "ring-4 ring-blue-100"
            : ""
        }`}
      >
        {isActive && currentStep > number ? (
          <Check size={16} />
        ) : (
          number
        )}
      </div>

      <span
        className={`text-sm font-medium hidden sm:block ${
          isActive
            ? "text-blue-900"
            : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function StepDivider({ active }) {
  return (
    <div
      className={`w-8 sm:w-12 h-1 mx-2 sm:mx-4 rounded-full transition-colors shrink-0 ${
        active
          ? "bg-blue-600"
          : "bg-gray-200"
      }`}
    />
  );
}
