
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSiswaReportIdentity() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sesi login tidak ditemukan.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user || user.role !== "SISWA") {
      return {
        success: false,
        error: "Halaman ini hanya untuk siswa.",
      };
    }

    const student = await prisma.studentProfile.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        classroom: true,
      },
    });

    if (!student) {
      return {
        success: false,
        error: "Profil siswa tidak ditemukan.",
      };
    }

    let schoolName = "";

    if (student.classroom?.teacherId) {
      const teacher = await prisma.teacherProfile.findUnique({
        where: {
          id: student.classroom.teacherId,
        },
        select: {
          schoolName: true,
        },
      });

      schoolName = teacher?.schoolName || "";
    }

    return {
      success: true,
      data: {
        name: student.fullName || "",
        nis: student.nis || user.username || "",
        className: student.classroom?.name || "",
        gender: student.gender || "",
        schoolName,
      },
    };
  } catch (error) {
    console.error("getSiswaReportIdentity:", error);

    return {
      success: false,
      error: "Gagal mengambil identitas siswa.",
    };
  }
}
