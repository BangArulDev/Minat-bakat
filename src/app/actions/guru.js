
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { getDB, saveDB } from "@/lib/db";

// ============================================
// HELPER AUTENTIKASI GURU
// ============================================

async function requireGuru() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      teacherProfile: true,
    },
  });

  if (!user || user.role !== "GURU") {
    throw new Error("Akses hanya untuk guru.");
  }

  if (!user.teacherProfile) {
    throw new Error("Profil guru tidak ditemukan.");
  }

  return {
    user,
    teacherProfile: user.teacherProfile,
  };
}

// ============================================
// HELPER DATABASE LAMA
// Dipertahankan untuk kompatibilitas transaksi
// ============================================

async function requireGuruMock() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  const db = getDB();

  const user = db.users.find(
    (u) =>
      u.id === session.user.id ||
      u.username === session.user.username
  );

  if (!user) {
    return {
      db,
      user: {
        id: session.user.id,
        role: "GURU",
      },
    };
  }

  return { db, user };
}

// ============================================
// DATA MASTER - KELAS
// ============================================

export async function getClassrooms() {
  try {
    const { teacherProfile } = await requireGuru();

    const classrooms = await prisma.classroom.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const enriched = classrooms.map((c) => ({
      id: c.id,
      code: c.classCode,
      name: c.name,
      status: "active",
      createdAt: c.createdAt.toLocaleDateString("id-ID"),
      studentCount: c._count.students,
    }));

    return {
      success: true,
      data: enriched,
    };
  } catch (error) {
    console.error("Error getClassrooms:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// SIMPAN KELAS
// ============================================

export async function saveClassroom(data) {
  try {
    const { teacherProfile } = await requireGuru();

    const classCode = String(data.code || "").trim();
    const className = String(data.name || "").trim();

    if (!classCode || !className) {
      return {
        success: false,
        error: "Kode dan nama kelas wajib diisi.",
      };
    }

    const isUpdate =
      typeof data.id === "string" &&
      data.id.length > 20;

    if (isUpdate) {
      const existing = await prisma.classroom.findFirst({
        where: {
          id: data.id,
          teacherId: teacherProfile.id,
        },
      });

      if (!existing) {
        return {
          success: false,
          error: "Kelas tidak ditemukan atau bukan milik Anda.",
        };
      }

      await prisma.classroom.update({
        where: {
          id: data.id,
        },
        data: {
          classCode,
          name: className,
        },
      });
    } else {
      const existingCode = await prisma.classroom.findUnique({
        where: {
          classCode,
        },
      });

      if (existingCode) {
        return {
          success: false,
          error:
            "Kode kelas sudah digunakan. Gunakan kode unik lain.",
        };
      }

      await prisma.classroom.create({
        data: {
          classCode,
          name: className,
          teacherId: teacherProfile.id,
        },
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error saveClassroom:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// HAPUS KELAS
// ============================================

export async function deleteClassroom(id) {
  try {
    const { teacherProfile } = await requireGuru();

    const existing = await prisma.classroom.findFirst({
      where: {
        id,
        teacherId: teacherProfile.id,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Kelas tidak ditemukan atau bukan milik Anda.",
      };
    }

    await prisma.classroom.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleteClassroom:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// DATA MASTER - SISWA
// ============================================

export async function getStudentsByClassroom(classroomId) {
  try {
    const { teacherProfile } = await requireGuru();

    const students = await prisma.studentProfile.findMany({
      where: {
        classroomId: classroomId,
        classroom: { teacherId: teacherProfile.id }
      },
      include: {
        user: true,
        classroom: true,
        results: {
          select: { dominantCode: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    const enriched = students.map(s => ({
      id: s.id,
      nis: s.nis || s.user?.username || "-",
      name: s.fullName,
      gender: s.gender || "L",
      pob: s.birthPlace || "-",
      dob: s.birthDate ? s.birthDate.toISOString().split('T')[0] : "-",
      testCompleted: s.results && s.results.length > 0,
      dominantCode: s.results?.[0]?.dominantCode || "-"
    }));

    return { success: true, data: enriched };
  } catch (error) {
    console.error("Error getStudentsByClassroom:", error);
    return { error: error.message };
  }
}

// === SISWA ===

export async function getStudents() {
  try {
    const { teacherProfile } = await requireGuru();

    const students = await prisma.studentProfile.findMany({
      where: {
        classroom: {
          teacherId: teacherProfile.id,
        },
      },
      include: {
        user: true,
        classroom: true,
      },
      orderBy: {
        user: {
          createdAt: "desc",
        },
      },
    });

    const enriched = students.map((s) => ({
      id: s.id,
      nis: s.nis || s.user.username,
      username: s.user.username,
      name: s.fullName,
      pob: s.birthPlace || "",
      dob: s.birthDate
        ? s.birthDate.toISOString().split("T")[0]
        : "",
      gender: s.gender || "L",
      classroomId: s.classroomId,
      className: s.classroom.name,
      classCode: s.classroom.classCode,
    }));

    return {
      success: true,
      data: enriched,
    };
  } catch (error) {
    console.error("Error getStudents:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// TAMBAH DAN EDIT SISWA
// Username = NIS
// Password awal = NIS
// ============================================

export async function saveStudent(data) {
  try {
    const { teacherProfile } = await requireGuru();

    const nis = String(data.nis || "").trim();
    const name = String(data.name || "").trim();
    const className = String(data.className || "").trim();

    const gender = String(
      data.gender || "L"
    ).toUpperCase();

    if (!/^[0-9A-Za-z_-]{3,30}$/.test(nis)) {
      return {
        success: false,
        error:
          "NIS harus terdiri dari 3–30 karakter " +
          "berupa huruf, angka, _ atau -.",
      };
    }

    if (!name || !className) {
      return {
        success: false,
        error: "NIS, nama siswa, dan kelas wajib diisi.",
      };
    }

    if (name.length > 150) {
      return {
        success: false,
        error: "Nama siswa terlalu panjang.",
      };
    }

    if (gender !== "L" && gender !== "P") {
      return {
        success: false,
        error: "Jenis kelamin harus L atau P.",
      };
    }

    const classroom = await prisma.classroom.findFirst({
      where: {
        name: className,
        teacherId: teacherProfile.id,
      },
    });

    if (!classroom) {
      return {
        success: false,
        error:
          `Kelas "${className}" tidak ditemukan. ` +
          "Silakan buat kelas terlebih dahulu.",
      };
    }

    let parsedDob = null;

    if (data.dob) {
      const parsed = new Date(data.dob);

      if (Number.isNaN(parsed.getTime())) {
        return {
          success: false,
          error: "Tanggal lahir tidak valid.",
        };
      }

      parsedDob = parsed;
    }

    const isUpdate =
      typeof data.id === "string" &&
      data.id.length > 20;

    // ----------------------------------------
    // EDIT SISWA
    // ----------------------------------------

    if (isUpdate) {
      const existing = await prisma.studentProfile.findFirst({
        where: {
          id: data.id,
          classroom: {
            teacherId: teacherProfile.id,
          },
        },
        include: {
          user: true,
        },
      });

      if (!existing) {
        return {
          success: false,
          error: "Data siswa tidak ditemukan.",
        };
      }

      if (existing.user.username !== nis) {
        const existingUser = await prisma.user.findUnique({
          where: {
            username: nis,
          },
        });

        if (
          existingUser &&
          existingUser.id !== existing.userId
        ) {
          return {
            success: false,
            error: "NIS sudah digunakan siswa lain.",
          };
        }

        // Mengganti NIS hanya mengubah username.
        // Password lama tidak direset otomatis.
        await prisma.user.update({
          where: {
            id: existing.userId,
          },
          data: {
            username: nis,
            email: `${nis}@siswa.local`,
          },
        });
      }

      await prisma.studentProfile.update({
        where: {
          id: existing.id,
        },
        data: {
          nis,
          fullName: name,
          birthPlace: data.pob || "",
          birthDate: parsedDob,
          gender,
          classroomId: classroom.id,
        },
      });

      return {
        success: true,
        message: "Data siswa berhasil diperbarui.",
      };
    }

    // ----------------------------------------
    // TAMBAH SISWA BARU
    // ----------------------------------------

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: nis,
          },
          {
            email: `${nis}@siswa.local`,
          },
        ],
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "NIS sudah terdaftar.",
      };
    }

    const hashedPassword = await bcrypt.hash(nis, 10);

    await prisma.$transaction(async (tx) => {
      // Pengurangan kuota bersifat atomik.
      const quotaUpdate = await tx.teacherProfile.updateMany({
        where: {
          id: teacherProfile.id,
          quota: {
            gte: 1,
          },
        },
        data: {
          quota: {
            decrement: 1,
          },
        },
      });

      if (quotaUpdate.count !== 1) {
        throw new Error(
          "Kuota habis. Silakan beli kuota terlebih dahulu."
        );
      }

      await tx.user.create({
        data: {
          username: nis,
          email: `${nis}@siswa.local`,
          password: hashedPassword,
          role: "SISWA",

          studentProfile: {
            create: {
              fullName: name,
              nis,
              gender,
              birthPlace: data.pob || "",
              birthDate: parsedDob,
              classroomId: classroom.id,
            },
          },
        },
      });
    });

    return {
      success: true,
      message:
        "Siswa berhasil ditambahkan. " +
        "Username dan password awal menggunakan NIS.",
    };
  } catch (error) {
    console.error("Error saveStudent:", error);

    return {
      success: false,
      error:
        error?.code === "P2002"
          ? "NIS atau email sudah digunakan."
          : error.message,
    };
  }
}

// ============================================
// HAPUS SISWA
// ============================================

export async function deleteStudent(id) {
  try {
    const { teacherProfile } = await requireGuru();

    const student = await prisma.studentProfile.findFirst({
      where: {
        id,
        classroom: {
          teacherId: teacherProfile.id,
        },
      },
    });

    if (!student) {
      return {
        success: false,
        error: "Siswa tidak ditemukan.",
      };
    }

    await prisma.user.delete({
      where: {
        id: student.userId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleteStudent:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// IMPORT SISWA MASSAL DARI EXCEL
//
// Data yang diterima dari halaman:
// [
//   {
//     nis: "22004",
//     name: "Widi Hartanto",
//     className: "X IPA 1",
//     gender: "L"
//   }
// ]
//
// Username = NIS
// Password awal = NIS
// ============================================

export async function importStudentsExcel(rows) {
  try {
    const { teacherProfile } = await requireGuru();

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        success: false,
        error: "File Excel tidak berisi data siswa.",
      };
    }

    if (rows.length > 200) {
      return {
        success: false,
        error:
          "Maksimal 200 siswa dalam satu kali impor. " +
          "Silakan bagi data menjadi beberapa file.",
      };
    }

    // ----------------------------------------
    // VALIDASI DATA
    // ----------------------------------------

    const students = rows.map((row, index) => {
      if (!row || typeof row !== "object") {
        throw new Error(
          `Baris ${index + 2}: Format data tidak valid.`
        );
      }

      const nis = String(row.nis ?? "").trim();
      const name = String(row.name ?? "").trim();
      const className = String(
        row.className ?? ""
      ).trim();

      const gender = String(
        row.gender ?? "L"
      ).trim().toUpperCase();

      if (!/^[0-9A-Za-z_-]{3,30}$/.test(nis)) {
        throw new Error(
          `Baris ${index + 2}: NIS tidak valid.`
        );
      }

      if (!name || !className) {
        throw new Error(
          `Baris ${index + 2}: Nama dan kelas wajib diisi.`
        );
      }

      if (name.length > 150 || className.length > 150) {
        throw new Error(
          `Baris ${index + 2}: Nama atau kelas terlalu panjang.`
        );
      }

      if (gender !== "L" && gender !== "P") {
        throw new Error(
          `Baris ${index + 2}: Jenis kelamin harus L atau P.`
        );
      }

      return {
        nis,
        name,
        className,
        gender,
      };
    });

    // ----------------------------------------
    // PERIKSA NIS DUPLIKAT DALAM FILE
    // ----------------------------------------

    const nisList = students.map((student) => student.nis);

    if (new Set(nisList).size !== nisList.length) {
      return {
        success: false,
        error: "Terdapat NIS duplikat dalam file Excel.",
      };
    }

    // ----------------------------------------
    // PERIKSA KELAS MILIK GURU
    // ----------------------------------------

    const classrooms = await prisma.classroom.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const classMap = new Map();

    for (const classroom of classrooms) {
      const key = classroom.name.trim().toLowerCase();

      // Hindari pemetaan ambigu bila guru mempunyai
      // beberapa kelas dengan nama identik.
      if (classMap.has(key)) {
        return {
          success: false,
          error:
            `Terdapat lebih dari satu kelas bernama ` +
            `"${classroom.name}". Gunakan nama kelas unik.`,
        };
      }

      classMap.set(key, classroom.id);
    }

    for (const student of students) {
      const key = student.className.toLowerCase();

      if (!classMap.has(key)) {
        return {
          success: false,
          error:
            `Kelas "${student.className}" belum terdaftar. ` +
            "Buat kelas tersebut terlebih dahulu.",
        };
      }
    }

    // ----------------------------------------
    // PERIKSA NIS SUDAH TERDAFTAR
    // ----------------------------------------

    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              in: nisList,
            },
          },
          {
            email: {
              in: nisList.map(
                (nis) => `${nis}@siswa.local`
              ),
            },
          },
        ],
      },
      select: {
        username: true,
      },
    });

    if (existingUsers.length > 0) {
      return {
        success: false,
        error:
          "NIS berikut sudah terdaftar: " +
          existingUsers.map((u) => u.username).join(", "),
      };
    }

    // ----------------------------------------
    // SIAPKAN PASSWORD HASH
    // ----------------------------------------

    const prepared = await Promise.all(
      students.map(async (student) => ({
        ...student,
        classroomId: classMap.get(
          student.className.toLowerCase()
        ),
        hashedPassword: await bcrypt.hash(
          student.nis,
          10
        ),
      }))
    );

    // ----------------------------------------
    // TRANSAKSI DATABASE
    // Semua berhasil atau semua dibatalkan
    // ----------------------------------------

    await prisma.$transaction(
      async (tx) => {
        const quotaUpdate =
          await tx.teacherProfile.updateMany({
            where: {
              id: teacherProfile.id,
              quota: {
                gte: prepared.length,
              },
            },
            data: {
              quota: {
                decrement: prepared.length,
              },
            },
          });

        if (quotaUpdate.count !== 1) {
          throw new Error(
            `Kuota tidak cukup untuk mengimpor ` +
            `${prepared.length} siswa.`
          );
        }

        for (const student of prepared) {
          await tx.user.create({
            data: {
              username: student.nis,
              email: `${student.nis}@siswa.local`,
              password: student.hashedPassword,
              role: "SISWA",

              studentProfile: {
                create: {
                  nis: student.nis,
                  fullName: student.name,
                  gender: student.gender,
                  birthPlace: "",
                  birthDate: null,
                  classroomId: student.classroomId,
                },
              },
            },
          });
        }
      },
      {
        maxWait: 10000,
        timeout: 60000,
      }
    );

    return {
      success: true,
      imported: prepared.length,
      message:
        `${prepared.length} siswa berhasil diimpor. ` +
        "Username dan password awal menggunakan NIS.",
    };
  } catch (error) {
    console.error("Error importStudentsExcel:", error);

    return {
      success: false,
      error:
        error?.code === "P2002"
          ? "NIS atau email sudah terdaftar."
          : error?.message ||
            "Terjadi kesalahan ketika mengimpor siswa.",
    };
  }
}

// ============================================
// DATA MASTER - SEKOLAH
// ============================================

export async function getSchoolProfile() {
  try {
    const { teacherProfile } = await requireGuru();

    return {
      success: true,
      data: {
        name: teacherProfile.schoolName || "",
        npsn: teacherProfile.schoolCode || "",
        address: "",
        province: "",
        regency: "",
        aliasCity: "",
        logo: null,
      },
    };
  } catch (error) {
    console.error("Error getSchoolProfile:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// SIMPAN PROFIL SEKOLAH
// ============================================

export async function saveSchoolProfile(data) {
  try {
    const { teacherProfile } = await requireGuru();

    await prisma.teacherProfile.update({
      where: {
        id: teacherProfile.id,
      },
      data: {
        schoolName: data.name,
        schoolCode: data.npsn || null,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error saveSchoolProfile:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// TRANSAKSI
// Fungsi lama dipertahankan
// ============================================

export async function getTransactions() {
  try {
    const { teacherProfile } = await requireGuru();
    const txList = await prisma.transaction.findMany({
      where: { teacherId: teacherProfile.id },
      orderBy: { createdAt: "desc" }
    });

    const enriched = txList.map(t => ({
      id: t.orderId,
      date: t.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      paymentDate: t.updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      service: `Kuota ${t.quotaAdded} Siswa`,
      price: t.amount,
      method: t.paymentType || "Transfer",
      status: t.status === "SUCCESS" ? "success" : t.status === "FAILED" || t.status === "CANCEL" || t.status === "EXPIRED" ? "failed" : "pending",
    }));

    return { success: true, data: enriched };
  } catch(error) {
    console.error("Error getTransactions:", error);
    return { error: error.message };
  }
}

// ============================================
// BUAT TRANSAKSI
// Fungsi lama dipertahankan
// ============================================

export async function createTransaction(
  amount,
  items,
  method
) {
  try {
    const { db, user } = await requireGuruMock();

    const newTx = {
      id: "INV-" + Date.now(),
      teacherId: user.id,
      date: new Date().toLocaleDateString("id-ID"),
      amount,
      items,
      method,
      status: "Menunggu Pembayaran",
    };

    if (!db.transactions) {
      db.transactions = [];
    }

    db.transactions.push(newTx);

    saveDB(db);

    return {
      success: true,
      data: newTx,
    };
  } catch (error) {
    console.error("Error createTransaction:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// HASIL TES SISWA
// ============================================

export async function getResults() {
  try {
    const { teacherProfile } = await requireGuru();

    const results = await prisma.riasecResult.findMany({
      where: {
        student: {
          classroom: {
            teacherId: teacherProfile.id,
          },
        },
      },
      include: {
        student: {
          include: {
            user: true,
            classroom: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const enriched = results.map((r) => {
      let parsedScores = {};

      try {
        parsedScores =
          typeof r.rawScores === "string"
            ? JSON.parse(r.rawScores || "{}")
            : r.rawScores || {};
      } catch {
        parsedScores = {};
      }

      return {
        id: r.id,
        nis:
          r.student.nis ||
          r.student.user.username,
        name: r.student.fullName,
        className: r.student.classroom.name,
        testType: "RIASEC",
        date: r.createdAt.toLocaleDateString("id-ID"),
        createdAt: r.createdAt.toISOString(),
        result: r.dominantCode || "-",
        dominantCode: r.dominantCode || "-",
        score: r.rawScores || "{}",
        rawScores: parsedScores,
        consistency: r.consistency || "-",
        status: "Selesai",
        color:
          "bg-blue-100 text-blue-700 border-blue-200",
      };
    });

    return {
      success: true,
      data: enriched,
    };
  } catch (error) {
    console.error("Error getResults:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// HASIL TES DETAIL
// ============================================

export async function getDetailedResults() {
  try {
    const { teacherProfile } = await requireGuru();

    const results = await prisma.riasecResult.findMany({
      where: {
        student: {
          classroom: {
            teacherId: teacherProfile.id,
          },
        },
      },
      include: {
        student: {
          include: {
            user: true,
            classroom: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const detailed = results.map((r) => {
      let parsedScores = {};

      try {
        parsedScores =
          typeof r.rawScores === "string"
            ? JSON.parse(r.rawScores || "{}")
            : r.rawScores || {};
      } catch {
        parsedScores = {};
      }

      return {
        id: r.id,
        nis:
          r.student.nis ||
          r.student.user.username,
        name: r.student.fullName,
        className: r.student.classroom.name,
        dominantCode: r.dominantCode || "-",
        rawScores: parsedScores,
        consistency: r.consistency || "-",
        date: r.createdAt.toISOString(),
      };
    });

    return {
      success: true,
      data: detailed,
    };
  } catch (error) {
    console.error("Error getDetailedResults:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// TABULASI JAWABAN SISWA RIASEC
//
// 216 jawaban utama
// 12 nilai Self-Estimate
// ============================================

export async function getTabulasiAnswers() {
  try {
    const { teacherProfile } = await requireGuru();

    const [questions, estimates, results] =
      await Promise.all([
        prisma.riasecQuestion.findMany({
          select: {
            id: true,
          },
          orderBy: {
            id: "asc",
          },
        }),

        prisma.riasecSelfEstimate.findMany({
          select: {
            id: true,
          },
          orderBy: {
            id: "asc",
          },
        }),

        prisma.riasecResult.findMany({
          where: {
            student: {
              classroom: {
                teacherId: teacherProfile.id,
              },
            },
          },
          include: {
            student: {
              include: {
                user: true,
                classroom: true,
              },
            },
          },
          orderBy: [
            {
              createdAt: "desc",
            },
            {
              id: "desc",
            },
          ],
        }),
      ]);

    // ----------------------------------------
    // AMBIL HASIL TERBARU PER SISWA
    // ----------------------------------------

    const latestResults = new Map();

    for (const result of results) {
      if (latestResults.has(result.studentId)) {
        continue;
      }

      latestResults.set(result.studentId, {
        id: result.id,
        studentId: result.studentId,

        nis:
          result.student.nis ||
          result.student.user.username ||
          "",

        name: result.student.fullName,

        classId: result.student.classroomId,

        className:
          result.student.classroom.name,

        // Jawaban asli 216 soal
        answers: result.answers ?? null,

        // Nilai asli 12 Self-Estimate
        selfEstimates:
          result.selfEstimates ?? null,

        date: result.createdAt.toISOString(),
      });
    }

    return {
      success: true,
      data: {
        questionIds: questions.map(
          (question) => question.id
        ),

        estimateIds: estimates.map(
          (estimate) => estimate.id
        ),

        students: Array.from(
          latestResults.values()
        ),
      },
    };
  } catch (error) {
    console.error(
      "Error getTabulasiAnswers:",
      error
    );

    return {
      success: false,
      error:
        "Gagal mengambil data tabulasi siswa.",
    };
  }
}

// === KUOTA GURU ===
export async function getTeacherQuota() {
  try {
    const { teacherProfile } = await requireGuru();
    return {
      success: true,
      data: {
        quota: teacherProfile.quota ?? 0,
        type: teacherProfile.quota > 0 ? "Aktif" : "Habis",
        validUntil: "Selamanya"
      }
    };
  } catch (error) {
    console.error("Error getTeacherQuota:", error);
    return { error: error.message };
  }
}

// === RESET TES SISWA ===
export async function resetStudentTest(studentId) {
  try {
    const { teacherProfile } = await requireGuru();

    // Pastikan siswa benar-benar milik guru ini
    const student = await prisma.studentProfile.findFirst({
      where: {
        id: studentId,
        classroom: { teacherId: teacherProfile.id }
      }
    });
    if (!student) return { error: "Siswa tidak ditemukan atau bukan milik Anda." };

    await prisma.riasecResult.deleteMany({
      where: { studentId: studentId }
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetStudentTest:", error);
    return { error: error.message };
  }
}
