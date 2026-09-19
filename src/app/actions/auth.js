"use server";

import bcrypt from "bcryptjs";
import { getDB, saveDB, generateId } from "@/lib/db";

export async function registerGuru(data) {
  try {
    const db = getDB();
    
    // Cek apakah email sudah ada
    if (db.users.find(u => u.email === data.email)) {
      return { error: "Email sudah terdaftar!" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newId = "U-" + generateId();

    const newUser = {
      id: newId,
      email: data.email,
      username: data.email,
      password: hashedPassword,
      role: "GURU",
      profile: {
        fullName: data.namaLengkap,
        nip: data.nip || null,
        gender: data.gender,
        whatsapp: data.whatsapp || null,
        schoolName: data.namaSekolah,
        schoolCode: data.kodeSekolah,
      },
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }
}

export async function registerSiswa(data) {
  try {
    const db = getDB();
    
    if (db.users.find(u => u.username === data.username)) {
      return { error: "Username sudah digunakan!" };
    }

    const classroom = db.classrooms.find(c => c.classCode === data.kodeKelas);
    if (!classroom) {
      return { error: "Kode Kelas tidak ditemukan! (Gunakan contoh: X-IPA-1 atau X-IPS-1)" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newId = "U-" + generateId();

    const newUser = {
      id: newId,
      username: data.username,
      email: `${data.username}@siswa.local`,
      password: hashedPassword,
      role: "SISWA",
      profile: {
        fullName: data.namaLengkap,
        nis: data.nis || null,
        gender: data.jenisKelamin,
        birthPlace: data.kotaLahir || null,
        birthDate: data.tanggalLahir || null,
        classroomId: classroom.id,
      },
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }
}

export async function getUserProfile(username) {
  try {
    const db = getDB();
    const user = db.users.find(u => u.username === username || u.email === username);
    if (!user) return { error: "User tidak ditemukan" };
    return { success: true, profile: { ...user.profile, email: user.email, role: user.role } };
  } catch (error) {
    return { error: "Gagal mengambil data." };
  }
}

export async function updateUserProfile(username, data) {
  try {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.username === username || u.email === username);
    
    if (userIndex === -1) return { error: "User tidak ditemukan" };

    const user = db.users[userIndex];
    user.profile = {
      ...user.profile,
      fullName: data.name || user.profile.fullName,
      nip: data.nip !== undefined ? data.nip : user.profile.nip,
      gender: data.gender || user.profile.gender,
      whatsapp: data.phone !== undefined ? data.phone : user.profile.whatsapp,
    };
    
    if (data.email && data.email !== user.email) {
      user.email = data.email;
      if (user.role === "GURU") user.username = data.email;
    }

    db.users[userIndex] = user;
    saveDB(db);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data profil." };
  }
}
