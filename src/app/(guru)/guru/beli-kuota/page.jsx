"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ChevronRight, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Store, 
  QrCode 
} from "lucide-react";

// --- MOCK DATA ---

// 1. Daftar Paket Kuota
const quotaPackages = [
  {
    id: 1,
    name: "Paket Starter",
    quota: 20,
    price: 50000,
    features: ["Akses Instrumen Dasar", "Masa Aktif Selamanya", "Support Email"],
    isPopular: false,
    color: "bg-white border-gray-200"
  },
  {
    id: 2,
    name: "Paket Sekolah",
    quota: 100,
    price: 200000,
    features: ["Hemat Rp 50.000", "Akses Semua Instrumen", "Prioritas Support", "Export Excel"],
    isPopular: true,
    color: "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
  },
  {
    id: 3,
    name: "Paket Institusi",
    quota: 500,
    price: 900000,
    features: ["Hemat Besar", "Dashboard Analytics Pro", "Multi-Admin", "Training Gratis"],
    isPopular: false,
    color: "bg-white border-gray-200"
  }
];

// 2. Metode Pembayaran
const paymentMethods = [
  { id: "qris", name: "QRIS (GoPay, OVO, Dana)", icon: QrCode },
  { id: "bca", name: "Virtual Account BCA", icon: CreditCard },
  { id: "bri", name: "Virtual Account BRI", icon: CreditCard },
  { id: "retail", name: "Alfamart / Indomaret", icon: Store },
];

export default function BeliKuotaPage() {
  const [step, setStep] = useState(1); // 1: Pilih, 2: Konfirmasi, 3: Bayar
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(number);
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

  // Hitung Total (Termasuk PPN 11%)
  const subtotal = selectedPackage ? selectedPackage.price : 0;
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quotaPackages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-lg
                      ${selectedPackage?.id === pkg.id 
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 scale-105" 
                        : "border-gray-200 hover:border-blue-300 bg-white"
                      }
                    `}
                  >
                    {pkg.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Zap size={12} fill="white" /> Terlaris
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{pkg.name}</h3>
                    <div className="text-center mb-6">
                      <span className="text-3xl font-extrabold text-blue-600">{pkg.quota}</span>
                      <span className="text-gray-500 text-sm font-medium"> Siswa</span>
                    </div>

                    <div className="space-y-3 mb-8">
                      {pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <Check size={12} className="text-green-600" />
                          </div>
                          {feat}
                        </div>
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">Harga Paket</p>
                      <p className="text-xl font-bold text-gray-900">{formatRupiah(pkg.price)}</p>
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
                      <span className="font-bold text-gray-700">{method.name}</span>
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
                    <p className="text-xs text-blue-600 font-medium">+{selectedPackage?.quota} Kuota Siswa</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Metode Bayar</p>
                    <div className="flex items-center justify-end gap-2 font-bold text-gray-900">
                      <CreditCard size={16} />
                      {selectedPayment?.name}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Harga Paket</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>PPN (11%)</span>
                    <span>{formatRupiah(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Biaya Layanan</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Pembayaran</span>
                    <span className="font-bold text-2xl text-blue-600">{formatRupiah(total)}</span>
                  </div>
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
          onClick={step === 3 ? () => alert("Mengarahkan ke Payment Gateway...") : nextStep}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-200
            ${!selectedPackage && step === 1 ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 hover:scale-105"}
          `}
          disabled={!selectedPackage && step === 1}
        >
          {step === 3 ? "Bayar Sekarang" : "Lanjut"} 
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