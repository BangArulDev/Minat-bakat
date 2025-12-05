"use client";
import { useState } from "react";
import { 
  School, 
  MapPin, 
  Building2, 
  Flag, 
  Globe, 
  Edit3, 
  Save, 
  Camera, 
  UploadCloud,
  Hash
} from "lucide-react";

export default function SekolahPage() {
  const [isEditing, setIsEditing] = useState(false);

  // State Data Sekolah
  const [schoolData, setSchoolData] = useState({
    name: "SMA Negeri 1 Harapan Bangsa",
    npsn: "20100199", // Read-only (biasanya ID tidak boleh ganti)
    address: "Jl. Pendidikan No. 45, RT.01/RW.02, Kebayoran Baru",
    province: "DKI Jakarta",
    regency: "Jakarta Selatan",
    aliasCity: "Jakarta", // Untuk keperluan kop surat/tanggal surat
    logo: null // URL gambar jika ada
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchoolData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Logika simpan ke API bisa ditaruh di sini
    alert("Data sekolah berhasil diperbarui!");
  };

  const handleLogoUpload = () => {
    if (!isEditing) return;
    alert("Membuka file dialog untuk upload logo...");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Sekolah</h1>
        <p className="text-gray-500 text-sm">Kelola identitas sekolah untuk keperluan laporan dan administrasi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === PANEL KIRI: LOGO & VISUAL === */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
            
            {/* Banner Background */}
            <div className="h-32 bg-linear-to-r from-blue-700 to-cyan-600 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
            </div>

            <div className="px-6 pb-8 text-center relative">
              {/* Logo Container */}
              <div className="-mt-16 mb-4 relative inline-block">
                <div 
                  onClick={handleLogoUpload}
                  className={`w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden relative group
                    ${isEditing ? "cursor-pointer hover:border-blue-200" : "cursor-default"}
                  `}
                >
                  {schoolData.logo ? (
                    <img src={schoolData.logo} alt="Logo Sekolah" className="w-full h-full object-contain p-2" />
                  ) : (
                    <School size={48} className="text-gray-300" />
                  )}
                  
                  {/* Overlay Upload saat Edit Mode */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                      <UploadCloud size={24} />
                      <span className="text-[10px] font-bold mt-1">Ubah Logo</span>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">{schoolData.name}</h2>
              <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm">
                <MapPin size={14} />
                <span>{schoolData.regency}, {schoolData.province}</span>
              </div>
            </div>
            
            {/* Info Footer Kecil */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
               <div className="flex justify-between text-xs text-gray-500">
                  <span>Status Data</span>
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    Terverifikasi
                  </span>
               </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
              <Flag size={16} /> Info Penting
            </h4>
            <p className="text-xs text-blue-700/80 leading-relaxed">
              Pastikan <strong>Kota Alias</strong> diisi dengan benar (Contoh: "Jakarta", bukan "Jakarta Selatan"). Data ini akan digunakan secara otomatis pada kop surat dan tanggal laporan hasil tes siswa.
            </p>
          </div>
        </div>


        {/* === PANEL KANAN: FORM DATA === */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Header Form */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Building2 size={18} /> Detail Sekolah
              </h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isEditing 
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                {isEditing ? (
                  <><Save size={16} /> Simpan Data</>
                ) : (
                  <><Edit3 size={16} /> Edit Data</>
                )}
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Nama Sekolah */}
              <InputField 
                label="Nama Sekolah" 
                name="name"
                icon={School}
                value={schoolData.name} 
                onChange={handleChange} 
                isEditing={isEditing} 
              />

              {/* NPSN (Read Only) */}
              <div className="space-y-1.5 opacity-70">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">NPSN (Kode Sekolah)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash size={18} className="text-gray-400" />
                  </div>
                  <input 
                    value={schoolData.npsn} 
                    disabled 
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Alamat Lengkap</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    value={schoolData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all resize-none
                      ${isEditing 
                        ? "bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
                        : "bg-gray-50 border border-transparent text-gray-800 font-medium cursor-default"
                      }
                    `}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provinsi */}
                <InputField 
                  label="Provinsi" 
                  name="province"
                  icon={Globe}
                  value={schoolData.province} 
                  onChange={handleChange} 
                  isEditing={isEditing} 
                />

                {/* Kabupaten / Kota */}
                <InputField 
                  label="Kabupaten / Kota" 
                  name="regency"
                  icon={Building2}
                  value={schoolData.regency} 
                  onChange={handleChange} 
                  isEditing={isEditing} 
                />
              </div>

              {/* Kota Alias (Penting untuk Surat) */}
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <InputField 
                  label="Kota (Alias untuk Laporan)" 
                  name="aliasCity"
                  icon={Flag}
                  value={schoolData.aliasCity} 
                  onChange={handleChange} 
                  isEditing={isEditing} 
                  placeholder="Contoh: Jakarta"
                />
                <p className="text-[10px] text-yellow-700 mt-2">
                  *Akan ditampilkan pada bagian tanggal di cover laporan. (Misal: <strong>Jakarta</strong>, 25 Oktober 2024)
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- REUSABLE INPUT COMPONENT ---
function InputField({ label, name, value, onChange, isEditing, icon: Icon, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={18} className="text-gray-400" />
        </div>
        <input 
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          disabled={!isEditing}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all
            ${isEditing 
              ? "bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
              : "bg-gray-50 border border-transparent text-gray-800 font-medium cursor-default"
            }
          `}
        />
      </div>
    </div>
  );
}