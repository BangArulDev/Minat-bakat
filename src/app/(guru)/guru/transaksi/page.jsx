"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle, 
  CreditCard,
  QrCode,
  Building,
  Printer,
  X
} from "lucide-react";

// --- MOCK DATA TRANSAKSI ---
const initialTransactions = [
  {
    id: "TRX-20241025-001",
    date: "25 Okt 2024, 14:30",
    service: "Paket Classroom (50 Kuota)",
    price: 111000, // Termasuk PPN
    method: "QRIS",
    status: "success", // success | pending | failed
    paymentDate: "25 Okt 2024, 14:32",
    imgUrl: "/placeholder-receipt.jpg" 
  },
  {
    id: "TRX-20241020-002",
    date: "20 Okt 2024, 09:15",
    service: "Paket Starter (20 Kuota)",
    price: 55500,
    method: "Virtual Account BCA",
    status: "success",
    paymentDate: "20 Okt 2024, 09:20",
  },
  {
    id: "TRX-20241015-003",
    date: "15 Okt 2024, 10:00",
    service: "Paket School (150 Kuota)",
    price: 277500,
    method: "Transfer Bank",
    status: "pending", // Belum bayar
    paymentDate: "-",
  },
  {
    id: "TRX-20240901-004",
    date: "01 Sep 2024, 11:00",
    service: "Paket Starter (20 Kuota)",
    price: 55500,
    method: "Alfamart",
    status: "failed", // Kadaluarsa
    paymentDate: "-",
  },
];

export default function TransaksiPage() {
  const [data, setData] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedTx, setSelectedTx] = useState(null); // Untuk Modal

  // Format Rupiah
  const formatRp = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  // Filter Data
  const filteredData = data.filter(item => {
    const matchSearch = item.id.toLowerCase().includes(search.toLowerCase()) || 
                        item.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" ? true : item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-500 text-sm">Daftar riwayat pembelian kuota dan layanan lainnya.</p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative">
             <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer text-sm font-medium"
            >
              <option value="Semua">Semua Status</option>
              <option value="success">Berhasil</option>
              <option value="pending">Menunggu</option>
              <option value="failed">Gagal</option>
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari No. ID / Layanan..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
            />
          </div>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Tanggal</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Layanan</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Harga</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Metode Pembayaran</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    {/* Kolom Tanggal */}
                    <td className="py-4 px-6 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{item.date.split(',')[0]}</span>
                        <span className="text-xs text-gray-400">{item.date.split(',')[1]}</span>
                      </div>
                    </td>

                    {/* Kolom Layanan & ID */}
                    <td className="py-4 px-6 text-sm">
                      <div className="mb-1 font-bold text-gray-800">{item.service}</div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.id}</span>
                         {/* Status Badge Inline */}
                         {item.status === 'success' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Lunas</span>}
                         {item.status === 'pending' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Pending</span>}
                         {item.status === 'failed' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Gagal</span>}
                      </div>
                    </td>

                    {/* Kolom Harga */}
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {formatRp(item.price)}
                    </td>

                    {/* Kolom Metode */}
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {item.method === 'QRIS' && <QrCode size={16} />}
                        {item.method.includes('Virtual') && <Building size={16} />}
                        {item.method === 'Alfamart' && <CreditCard size={16} />}
                        {item.method}
                      </div>
                    </td>

                    {/* Kolom Detail (Button) */}
                    <td className="py-4 px-6 text-center">
                      {item.status === 'success' ? (
                        <button 
                          onClick={() => setSelectedTx(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                        >
                          <FileText size={14} />
                          Bukti Pembayaran
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Tidak tersedia</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">Data transaksi tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL BUKTI PEMBAYARAN (INVOICE) --- */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  Bukti Pembayaran
                </h3>
                <button onClick={() => setSelectedTx(null)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content (Receipt Style) */}
              <div className="p-8 overflow-y-auto bg-white relative">
                {/* Decoration Zigzag Top */}
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 to-purple-500 opacity-20" />

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <FileText size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{formatRp(selectedTx.price)}</h2>
                  <p className="text-green-600 font-bold text-sm bg-green-50 inline-block px-3 py-1 rounded-full mt-2">Pembayaran Berhasil</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Tanggal Bayar</span>
                    <span className="font-medium text-gray-900">{selectedTx.paymentDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Metode</span>
                    <span className="font-medium text-gray-900">{selectedTx.method}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">No. Referensi</span>
                    <span className="font-mono text-gray-900">{selectedTx.id}</span>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-gray-500 mb-2">Item Pembelian:</p>
                    <div className="flex justify-between font-bold text-gray-900 bg-gray-50 p-3 rounded-lg">
                      <span>{selectedTx.service}</span>
                      <span>{formatRp(selectedTx.price)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Actions) */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors"
                >
                  <Printer size={18} /> Cetak
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  <Download size={18} /> Unduh PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}