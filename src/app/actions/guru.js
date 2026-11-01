"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { getDB, saveDB, generateId } from "@/lib/db";

// === Helper (Prisma) ===
async function requireGuru() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true }
  });
  
  if (!user || user.role !== "GURU") throw new Error("Unauthorized");
  if (!user.teacherProfile) throw new Error("Profil guru tidak ditemukan");
  
  return { user, teacherProfile: user.teacherProfile };
}

// === Helper (Mock DB for legacy functions) ===
async function requireGuruMock() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const db = getDB();
  const user = db.users.find(u => u.id === session.user.id || u.username === session.user.username);
  // Allow if Prisma user exists but mock user doesn't, we just mock the user ID.
  if (!user) {
     return { db, user: { id: session.user.id, role: "GURU" } };
  }
  return { db, user };
}

// === KELAS ===
export async function getClassrooms() {
  try {
    const { teacherProfile } = await requireGuru();
    
    const classrooms = await prisma.classroom.findMany({
      where: { teacherId: teacherProfile.id },
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const enriched = classrooms.map(c => ({
      id: c.id,
      code: c.classCode,
      name: c.name,
      status: "active", // Tidak ada di skema Prisma, di-hardcode sementara
      createdAt: c.createdAt.toLocaleDateString("id-ID"),
      studentCount: c._count.students
    }));
    
    return { success: true, data: enriched };
  } catch (error) {
    console.error("Error getClassrooms:", error);
    return { error: error.message };
  }
}

export async function saveClassroom(data) {
  try {
    const { teacherProfile } = await requireGuru();
    
    // UI mungkin mengirim data.id berupa timestamp (number) jika baru ditambah
    const isUpdate = typeof data.id === 'string' && data.id.length > 20;
    
    if (isUpdate) {
      const existing = await prisma.classroom.findFirst({
        where: { id: data.id, teacherId: teacherProfile.id }
      });
      if (!existing) return { error: "Kelas tidak ditemukan atau bukan milik Anda" };
      
      await prisma.classroom.update({
        where: { id: data.id },
        data: {
          classCode: data.code,
          name: data.name
        }
      });
    } else {
      const existingCode = await prisma.classroom.findUnique({
        where: { classCode: data.code }
      });
      if (existingCode) return { error: "Kode kelas sudah digunakan, gunakan kode unik lain." };
      
      await prisma.classroom.create({
        data: {
          classCode: data.code,
          name: data.name,
          teacherId: teacherProfile.id
        }
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error saveClassroom:", error);
    return { error: error.message };
  }
}

export async function deleteClassroom(id) {
  try {
    const { teacherProfile } = await requireGuru();
    
    const existing = await prisma.classroom.findFirst({
      where: { id: id, teacherId: teacherProfile.id }
    });
    if (!existing) return { error: "Kelas tidak ditemukan atau bukan milik Anda" };
    
    await prisma.classroom.delete({
      where: { id: id }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleteClassroom:", error);
    return { error: error.message };
  }
}

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
        classroom: { teacherId: teacherProfile.id }
      },
      include: {
        user: true,
        classroom: true
      },
      orderBy: {
        user: { createdAt: 'desc' }
      }
    });
    
    const enriched = students.map(s => ({
      id: s.id, 
      nis: s.nis || s.user.username,
      username: s.user.username,
      name: s.fullName,
      pob: s.birthPlace || "",
      dob: s.birthDate ? s.birthDate.toISOString().split('T')[0] : "", // Gunakan format standar YYYY-MM-DD
      gender: s.gender || "L",
      classroomId: s.classroomId,
      className: s.classroom.name,
      classCode: s.classroom.classCode
    }));
    
    return { success: true, data: enriched };
  } catch (error) {
    console.error("Error getStudents:", error);
    return { error: error.message };
  }
}

export async function saveStudent(data) {
  try {
    console.log("saveStudent received data:", data);
    const { teacherProfile } = await requireGuru();
    
    // Cari kelas berdasarkan nama (karena UI pakai select name)
    const classroom = await prisma.classroom.findFirst({
      where: { name: data.className, teacherId: teacherProfile.id }
    });
    if (!classroom) {
      return { error: `Kelas '${data.className}' tidak ditemukan untuk guru ini. (Pastikan Anda sudah membuat kelas tersebut)` };
    }
    
    let parsedDob = null;
    if (data.dob) {
      const parsed = new Date(data.dob);
      if (!isNaN(parsed.getTime())) parsedDob = parsed;
    }
    
    const isUpdate = typeof data.id === 'string' && data.id.length > 20;
    
    if (isUpdate) {
      const existing = await prisma.studentProfile.findUnique({
        where: { id: data.id },
        include: { user: true }
      });
      if (!existing) return { error: "Data siswa tidak ditemukan" };
      
      // Update User Auth jika NIS diganti
      if (existing.user.username !== data.nis) {
         const existingUser = await prisma.user.findUnique({
           where: { username: data.nis }
         });
         if (existingUser && existingUser.id !== existing.userId) {
           return { error: "NIS sudah digunakan siswa lain." };
         }
         await prisma.user.update({
           where: { id: existing.userId },
           data: { username: data.nis, email: `${data.nis}@siswa.local` }
         });
      }
      
      // Update Profil Siswa
      await prisma.studentProfile.update({
        where: { id: data.id },
        data: {
          nis: data.nis,
          fullName: data.name,
          birthPlace: data.pob,
          ...(parsedDob ? { birthDate: parsedDob } : {}),
          gender: data.gender,
          classroomId: classroom.id
        }
      });
    } else {
      // Create new student
      if (teacherProfile.quota <= 0) {
        return { error: "Kuota habis. Silakan beli kuota terlebih dahulu untuk menambah siswa." };
      }

      const existingUser = await prisma.user.findUnique({
        where: { username: data.nis }
      });
      if (existingUser) return { error: "NIS sudah terdaftar." };
      
      const hashedPassword = await bcrypt.hash(data.nis, 10);
      
      await prisma.$transaction(async (tx) => {
        const fresh = await tx.teacherProfile.findUnique({
          where: { id: teacherProfile.id },
          select: { quota: true }
        });
        if (!fresh || fresh.quota <= 0) {
          throw new Error("Kuota habis. Silakan beli kuota terlebih dahulu untuk menambah siswa.");
        }

        await tx.user.create({
          data: {
            username: data.nis,
            email: `${data.nis}@siswa.local`,
            password: hashedPassword,
            role: "SISWA",
            studentProfile: {
              create: {
                fullName: data.name,
                nis: data.nis,
                gender: data.gender,
                birthPlace: data.pob,
                birthDate: parsedDob,
                classroomId: classroom.id
              }
            }
          }
        });

        await tx.teacherProfile.update({
          where: { id: teacherProfile.id },
          data: { quota: { decrement: 1 } }
        });
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error saveStudent:", error);
    return { error: error.message };
  }
}

export async function deleteStudent(id) {
  try {
    const { teacherProfile } = await requireGuru();
    
    const student = await prisma.studentProfile.findFirst({
      where: { 
        id: id,
        classroom: { teacherId: teacherProfile.id }
      }
    });
    
    if (!student) return { error: "Siswa tidak ditemukan." };
    
    await prisma.user.delete({
      where: { id: student.userId }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleteStudent:", error);
    return { error: error.message };
  }
}

// === SEKOLAH ===
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
        logo: null
      }
    };
  } catch(error) {
    return { error: error.message };
  }
}

export async function saveSchoolProfile(data) {
  try {
    const { teacherProfile } = await requireGuru();
    await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        schoolName: data.name,
        schoolCode: data.npsn || null
      }
    });
    return { success: true };
  } catch(error) {
    return { error: error.message };
  }
}

// === TRANSAKSI ===
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

export async function createTransaction(amount, items, method) {
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
    if (!db.transactions) db.transactions = [];
    db.transactions.push(newTx);
    saveDB(db);
    return { success: true, data: newTx };
  } catch(error) {
    return { error: error.message };
  }
}

// === HASIL TES ===
export async function getResults() {
  try {
    const { teacherProfile } = await requireGuru();

    const results = await prisma.riasecResult.findMany({
      where: {
        student: {
          classroom: { teacherId: teacherProfile.id }
        }
      },
      include: {
        student: {
          include: {
            user: true,
            classroom: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enriched = results.map(r => {
      let parsedScores = {};
      try {
        parsedScores = typeof r.rawScores === "string" ? JSON.parse(r.rawScores || "{}") : (r.rawScores || {});
      } catch (e) {
        parsedScores = {};
      }

      return {
        id: r.id,
        nis: r.student.nis || r.student.user.username,
        name: r.student.fullName,
        className: r.student.classroom.name,
        testType: "RIASEC",
        date: r.createdAt.toLocaleDateString("id-ID"),
        createdAt: r.createdAt.toISOString(),
        result: r.dominantCode || "-",
        dominantCode: r.dominantCode || "-",
        // score tetap r.rawScores agar halaman tabulasi tidak rusak
        score: r.rawScores || "{}",
        rawScores: parsedScores,
        consistency: r.consistency || "-",
        status: "Selesai",
        color: "bg-blue-100 text-blue-700 border-blue-200"
      };
    });

    return { success: true, data: enriched };
  } catch(error) {
    console.error("Error getResults:", error);
    return { error: error.message };
  }
}


export async function getDetailedResults() {
  try {
    const { teacherProfile } = await requireGuru();

    const results = await prisma.riasecResult.findMany({
      where: {
        student: {
          classroom: { teacherId: teacherProfile.id }
        }
      },
      include: {
        student: {
          include: {
            user: true,
            classroom: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const detailed = results.map(r => {
      let parsedScores = {};
      try {
        parsedScores = typeof r.rawScores === "string" ? JSON.parse(r.rawScores || "{}") : (r.rawScores || {});
      } catch (e) {
        parsedScores = {};
      }

      return {
        id: r.id,
        nis: r.student.nis || r.student.user.username,
        name: r.student.fullName,
        className: r.student.classroom.name,
        dominantCode: r.dominantCode || "-",
        rawScores: parsedScores,
        consistency: r.consistency || "-",
        date: r.createdAt.toISOString()
      };
    });

    return { success: true, data: detailed };
  } catch(error) {
    console.error("Error getDetailedResults:", error);
    return { error: error.message };
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
