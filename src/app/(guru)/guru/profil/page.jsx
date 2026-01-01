"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Edit3, 
  Save, 
  Camera,
  BadgeCheck,
  Briefcase,
  Hash,
  ShoppingCart
} from "lucide-react";

export default function ProfilGuruPage() {
  const [isEditing, setIsEditing] = useState(false);
  
  // State Data Profil
  const [profile, setProfile] = useState({
    name: "Budi Santoso, S.Pd",
    nip: "19850101 201001 1 001",
    gender: "Laki-laki",
    phone: "0812-3456-7890",
    email: "budi.santoso@sekolah.sch.id",
    role: "Guru BK",
    school: "SMA Negeri 1 Harapan Bangsa"
  });

  // State Kuota (Mockup)
  const quota = {
    total: 11,
    type: "Premium",
    validUntil: "Selamanya"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Di sini nanti ada logika API request untuk simpan data
    alert("Perubahan berhasil disimpan!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-500 text-sm">Kelola informasi pribadi dan pantau sisa kuota Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === PANEL KIRI: AVATAR & KUOTA === */}
        <div className="space-y-6">
          
          {/* 1. Kartu Identitas Singkat */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-blue-600 to-indigo-600 z-0" />
            
            <div className="relative z-10 mt-8 mb-4">
              <div className="w-28 h-28 mx-auto bg-white rounded-full p-1.5 shadow-lg relative group cursor-pointer">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  <User size={64} className="text-gray-400" />
                  {/* Image tag kalau ada foto: <img src="..." /> */}
                </div>
                {/* Tombol Ganti Foto (Overlay) */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{profile.school}</p>
            
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                {profile.role}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1">
                <BadgeCheck size={12} /> Terverifikasi
              </span>
            </div>
          </div>

          {/* 2. Kartu Kuota (Sosiometri & Bakat Minat) */}
          <div className="bg-linear-to-br from-indigo-900 to-blue-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-yellow-400 to-orange-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Sisa Kuota Siswa</p>
                <h3 className="text-3xl font-bold">
                  {quota.total} <span className="text-sm font-normal text-blue-200">Siswa</span>
                </h3>
              </div>
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <CreditCard className="text-yellow-400" size={24} />
              </div>
            </div>

            <div className="space-y-3 mb-6 relative z-10">
              <div className="flex justify-between text-sm text-blue-100 border-b border-white/10 pb-2">
                <span>Status Paket</span>
                <span className="font-bold text-white">{quota.type}</span>
              </div>
              <div className="flex justify-between text-sm text-blue-100">
                <span>Masa Aktif</span>
                <span className="text-white">{quota.validUntil}</span>
              </div>
            </div>

            <Link href="/guru/beli-kuota">
              <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                Beli Kuota Tambahan
              </button>
            </Link>
          </div>

        </div>


        {/* === PANEL KANAN: FORM EDIT === */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Header Form */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <User size={18} /> Informasi Pribadi
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
                  <><Save size={16} /> Simpan Perubahan</>
                ) : (
                  <><Edit3 size={16} /> Edit Profil</>
                )}
              </button>
            </div>

            {/* Isi Form */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nama Lengkap */}
                <InputField 
                  label="Nama Lengkap" 
                  name="name"
                  icon={User}
                  value={profile.name} 
                  onChange={handleChange} 
                  isEditing={isEditing} 
                />

                {/* NIP */}
                <InputField 
                  label="NIP / NUPTK" 
                  name="nip"
                  icon={Hash}
                  value={profile.nip} 
                  onChange={handleChange} 
                  isEditing={isEditing} 
                />

                {/* Jenis Kelamin (Dropdown saat Edit) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Jenis Kelamin</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    ) : (
                      <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-gray-800 font-medium">
                        {profile.gender}
                      </div>
                    )}
                  </div>
                </div>

                {/* No HP */}
                <InputField 
                  label="Nomor WhatsApp / HP" 
                  name="phone"
                  icon={Phone}
                  value={profile.phone} 
                  onChange={handleChange} 
                  isEditing={isEditing} 
                  type="tel"
                />

                {/* Email */}
                <div className="md:col-span-2">
                  <InputField 
                    label="Alamat Email" 
                    name="email"
                    icon={Mail}
                    value={profile.email} 
                    onChange={handleChange} 
                    isEditing={isEditing} 
                    type="email"
                  />
                </div>

                {/* Data Read-only (Sekolah) */}
                <div className="md:col-span-2">
                   <div className="space-y-1.5 opacity-70">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      Sekolah / Instansi <BadgeCheck size={14} className="text-blue-500" />
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase size={18} className="text-gray-400" />
                      </div>
                      <input 
                        value={profile.school} 
                        disabled 
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    {isEditing && <p className="text-[10px] text-gray-400">*Hubungi admin untuk pindah sekolah.</p>}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- COMPONENT INPUT REUSABLE ---
function InputField({ label, name, value, onChange, isEditing, icon: Icon, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={18} className="text-gray-400" />
        </div>
        <input 
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={!isEditing}
          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all
            ${isEditing 
              ? "bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" 
              : "bg-gray-50 border border-transparent text-gray-800 font-medium cursor-default"
            }
          `}
        />
      </div>
    </div>
  );
}