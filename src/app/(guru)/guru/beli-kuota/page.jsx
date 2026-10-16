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
  Wallet
} from "lucide-react";

// --- MOCK DATA ---

// 1. Daftar Paket Kuota (harga sudah termasuk PPN)
const quotaPackages = [
  { id: 1, name: "PERSONAL", quota: 1, price: 10000 },
  { id: 2, name: "SPARK", quota: 35, price: 100000 },
  { id: 3, name: "RISE", quota: 100, price: 125000 },
  { id: 4, name: "PRIME", quota: 150, price: 165000 },
  { id: 5, name: "ADVANCE", quota: 300, price: 270000 },
  { id: 6, name: "GROW", quota: 500, price: 420000 },
  { id: 7, name: "PRESTIGE", quota: 650, price: 520000 },
  { id: 8, name: "PROFESSIONAL", quota: 1000, price: 750000 },
  { id: 9, name: "ULTIMATE", quota: 1500, price: 975000 },
  { id: 10, name: "ACADEMY", quota: 3000, price: 1499000 },
  { id: 11, name: "REGIONAL", quota: 5000, price: 2249000 },
  { id: 12, name: "ENTERPRISE", quota: 12500, price: 4999000 },
  { id: 13, name: "ENTERPRISE MAX", quota: 15000, price: 5699000 },
];

// 2. Metode pembayaran yang tersedia di Flip (sender_bank)
const paymentMethods = [
  { id: "qris", name: "QRIS", desc: "Semua e-wallet & mobile banking", icon: QrCode },
  { id: "bca", name: "Virtual Account BCA", desc: "Transfer via m-BCA / ATM", icon: CreditCard },
  { id: "bri", name: "Virtual Account BRI", desc: "Transfer via BRImo / ATM", icon: CreditCard },
  { id: "bni", name: "Virtual Account BNI", desc: "Transfer via BNI Mobile / ATM", icon: CreditCard },
  { id: "mandiri", name: "Virtual Account Mandiri", desc: "Transfer via Livin' / ATM", icon: CreditCard },
  { id: "ovo", name: "OVO", desc: "Bayar dari saldo OVO", icon: Wallet },
];

export default function BeliKuotaPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1); // 1: Pilih Paket, 2: Metode Bayar, 3: Konfirmasi
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Ambil userId dari session next-auth (User.id, bukan TeacherProfile.id)
      const userId = session?.user?.id;
      if (!userId) {
        alert("Sesi login tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId, // User.id dari session
          amount: selectedPackage.price, // Harga paket (sudah termasuk PPN)
          quotaAdded: selectedPackage.quota,
          method: selectedPayment?.id, // Metode pembayaran pilihan pembeli
        }),
      });

      const data = await response.json();

      if (data.redirect_url) {
        // Flip menggunakan redirect — buka halaman pembayaran Flip
        window.location.href = data.redirect_url;
      } else {
        alert("Gagal membuat tagihan: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membuat tagihan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(number);
  };

  // Format angka (pemisah ribuan)
  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  // Navigasi Step
  const nextStep = () => {
    if (step === 1 && !selectedPackage) return alert("Pilih paket dulu!");
    if (step === 2 && !selectedPayment) return alert("Pilih metode pembayaran!");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beli Kuota Siswa</h1>
        <p className="text-gray-500 text-sm">Top up kuota untuk menambah jumlah siswa yang bisa mengikuti tes.</p>
      </div>

      {/* STEP INDICATOR (Stepper) */}
      <div className="flex items-center justify-center mb-8">
        <StepItem number={1} label="Pilih Paket" currentStep={step} />
        <StepDivider active={step > 1} />
        <StepItem number={2} label="Metode Bayar" currentStep={step} />
        <StepDivider active={step > 2} />
        <StepItem number={3} label="Konfirmasi" currentStep={step} />
      </div>

      {/* CONTENT AREA (Dynamic) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* --- STEP 1: PILIH PAKET --- */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Pilih Paket Sesuai Kebutuhan</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {quotaPackages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between
                      ${selectedPackage?.id === pkg.id 
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
                        : "border-gray-200 hover:border-blue-300 bg-white"
                      }
                    `}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-extrabold tracking-wide text-gray-900">{pkg.name}</h3>
                        {selectedPackage?.id === pkg.id && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <span className="text-2xl font-extrabold text-blue-600">{formatNumber(pkg.quota)}</span>
                        <span className="text-gray-500 text-xs font-medium"> Pengguna</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-gray-400 text-xs mb-0.5">Harga</p>
                      <p className="text-lg font-bold text-gray-900">{formatRupiah(pkg.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- STEP 2: METODE PEMBAYARAN --- */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pilih Cara Pembayaran</h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
                      ${selectedPayment?.id === method.id 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-gray-600">
                        <method.icon size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-700 block">{method.name}</span>
                        <span className="text-xs text-gray-500">{method.desc}</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                       ${selectedPayment?.id === method.id ? "border-blue-500" : "border-gray-300"}
                    `}>
                      {selectedPayment?.id === method.id && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-yellow-50 p-4 rounded-xl flex gap-3 border border-yellow-100">
                <ShieldCheck className="text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-800">
                  Pembayaran Anda aman dan terenkripsi. Konfirmasi otomatis dalam 5-10 menit setelah pembayaran.
                </p>
              </div>
            </motion.div>
          )}

          {/* --- STEP 3: KONFIRMASI (REVIEW) --- */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Ringkasan Pesanan</h2>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Paket Dipilih</p>
                    <p className="font-bold text-lg text-gray-900">{selectedPackage?.name}</p>
                    <p className="text-xs text-blue-600 font-medium">+{formatNumber(selectedPackage?.quota || 0)} Kuota Pengguna</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Metode Bayar</p>
                    <div className="flex items-center justify-end gap-2 font-bold text-gray-900">
                      <CreditCard size={16} />
                      {selectedPayment?.name}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Pembayaran</span>
                  <span className="font-bold text-2xl text-blue-600">{formatRupiah(selectedPackage?.price || 0)}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Dengan mengklik tombol di bawah, invoice akan dibuat dan dikirim ke email Anda.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FOOTER ACTIONS (Tombol Next/Back) */}
      <div className="flex justify-between items-center pt-4">
        {step > 1 ? (
          <button 
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} /> Kembali
          </button>
        ) : (
          <div></div> // Spacer kosong
        )}

        <button 
          onClick={step === 3 ? handlePay : nextStep}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-200
            ${(!selectedPackage && step === 1) || (step === 2 && !selectedPayment) || loading ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 hover:scale-105"}
          `}
          disabled={(!selectedPackage && step === 1) || (step === 2 && !selectedPayment) || loading}
        >
          {step === 3 ? (loading ? "Memproses..." : "Bayar Sekarang") : "Lanjut"} 
          {step !== 3 && <ChevronRight size={20} />}
        </button>
      </div>

    </div>
  );
}

// --- HELPER COMPONENTS (Stepper UI) ---

function StepItem({ number, label, currentStep }) {
  const isActive = currentStep >= number;
  const isCurrent = currentStep === number;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors
        ${isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}
        ${isCurrent ? "ring-4 ring-blue-100" : ""}
      `}>
        {isActive && currentStep > number ? <Check size={16} /> : number}
      </div>
      <span className={`text-sm font-medium hidden sm:block ${isActive ? "text-blue-900" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}

function StepDivider({ active }) {
  return (
    <div className={`w-12 h-1 mx-4 rounded-full transition-colors ${active ? "bg-blue-600" : "bg-gray-200"}`} />
  );
}
