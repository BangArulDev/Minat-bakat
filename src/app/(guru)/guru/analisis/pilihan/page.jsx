"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  BarChart2,
  Calendar
} from "lucide-react";
import { getResults } from "@/app/actions/guru";
import { useEffect } from "react";

export default function DataHasilPilihanPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTest, setFilterTest] = useState("Semua");

  useEffect(() => {
    async function load() {
      const res = await getResults();
      if (res?.success) {
        setData(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  // Filter Logika
  const filteredData = data.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                        item.className.toLowerCase().includes(search.toLowerCase());
    const matchTest = filterTest === "Semua" ? true : item.testType.includes(filterTest);
    return matchSearch && matchTest;
  });

  // Fungsi Export (Simulasi)
  const handleExport = () => {
    alert("Mengunduh data hasil tes dalam format .XLSX...");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Hasil Pilihan</h1>
          <p className="text-gray-500 text-sm">Rekapitulasi hasil tes minat bakat yang telah dikerjakan siswa.</p>
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-200"
        >
          <Download size={20} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        
        {/* Filter Jenis Tes */}
        <div className="w-full md:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select 
            value={filterTest}
            onChange={(e) => setFilterTest(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
          >
            <option value="Semua">Semua Jenis Tes</option>
            <option value="RIASEC">RIASEC (Minat)</option>
            <option value="VAK">VAK (Gaya Belajar)</option>
            <option value="Multiple">Kecerdasan Majemuk</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama siswa atau kelas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-16 text-center">No</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Nama Siswa</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Kelas</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Jenis Tes</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Tanggal Tes</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Hasil Dominan</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-center w-24">Detail</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm text-center text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      
                      <td className="whitespace-nowrap w-auto py-4 px-6">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{item.nis}</p>
                        </div>
                      </td>
                      
                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm text-gray-600 font-medium">
                        {item.className}
                      </td>

                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FileText size={16} className="text-blue-500" />
                          {item.testType}
                        </div>
                      </td>

                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {item.date}
                        </div>
                      </td>

                      <td className="whitespace-nowrap w-auto py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${item.color}`}>
                          {item.result}
                        </span>
                      </td>

                      <td className="whitespace-nowrap w-auto py-4 px-6 text-center">
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                          title="Lihat Detail Analisis"
                          onClick={() => alert(`Membuka detail hasil tes ${item.name}`)}
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <BarChart2 size={32} className="text-gray-300" />
                        <p>Belum ada data hasil tes</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-bold text-gray-900">{filteredData.length}</span> hasil
          </p>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-500 disabled:opacity-50" disabled>Sebelumnya</button>
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50">Selanjutnya</button>
          </div>
        </div>

      </div>
    </div>
  );
}