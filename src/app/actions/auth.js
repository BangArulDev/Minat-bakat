"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerGuru(data) {
  try {
    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar!" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        email: data.email,
        username: data.email,
        password: hashedPassword,
        role: "GURU",
        teacherProfile: {
          create: {
            fullName: data.namaLengkap,
            nip: data.nip || null,
            gender: data.gender || null,
            whatsapp: data.whatsapp || null,
            schoolName: data.namaSekolah,
            schoolCode: data.kodeSekolah || null,
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error registerGuru:", error);
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }
}

export async function registerSiswa(data) {
  try {
    // Cek apakah username sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    });

    if (existingUser) {
      return { error: "Username sudah digunakan!" };
    }

    // Cari kelas
    const classroom = await prisma.classroom.findUnique({
      where: { classCode: data.kodeKelas }
    });

    if (!classroom) {
      return { error: "Kode Kelas tidak ditemukan! (Gunakan contoh: X-IPA-1 atau X-IPS-1)" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        username: data.username,
        email: `${data.username}@siswa.local`, // Email placeholder untuk siswa
        password: hashedPassword,
        role: "SISWA",
        studentProfile: {
          create: {
            fullName: data.namaLengkap,
            nis: data.nis || null,
            gender: data.jenisKelamin || null,
            birthPlace: data.kotaLahir || null,
            birthDate: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
            classroomId: classroom.id,
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error registerSiswa:", error);
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }
}

export async function getUserProfile(username) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }]
      },
      include: {
        teacherProfile: true,
        studentProfile: true
      }
    });

    if (!user) return { error: "User tidak ditemukan" };

    const profile = user.role === "GURU" ? user.teacherProfile : user.studentProfile;
    
    return { 
      success: true, 
      profile: { ...profile, email: user.email, role: user.role } 
    };
  } catch (error) {
    console.error("Error getUserProfile:", error);
    return { error: "Gagal mengambil data." };
  }
}

export async function updateUserProfile(username, data) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }]
      },
      include: {
        teacherProfile: true,
        studentProfile: true
      }
    });

    if (!user) return { error: "User tidak ditemukan" };

    if (user.role === "GURU" && user.teacherProfile) {
      await prisma.teacherProfile.update({
        where: { id: user.teacherProfile.id },
        data: {
          fullName: data.name || undefined,
          nip: data.nip !== undefined ? data.nip : undefined,
          gender: data.gender || undefined,
          whatsapp: data.phone !== undefined ? data.phone : undefined,
        }
      });
      if (data.email && data.email !== user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: { email: data.email, username: data.email }
        });
      }
    } else if (user.role === "SISWA" && user.studentProfile) {
      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: {
          fullName: data.name || undefined,
          gender: data.gender || undefined,
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updateUserProfile:", error);
    return { error: "Gagal menyimpan data profil." };
  }
}
