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
      const existingUser = await prisma.user.findUnique({
        where: { username: data.nis }
      });
      if (existingUser) return { error: "NIS sudah terdaftar." };
      
      const hashedPassword = await bcrypt.hash(data.nis, 10);
      
      await prisma.user.create({
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
    const { db, user } = await requireGuruMock();
    const tx = (db.transactions || []).filter(t => t.teacherId === user.id);
    return { success: true, data: tx.reverse() };
  } catch(error) {
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

// === HASIL TES (Legacy) ===
export async function getResults() {
  try {
    const { db, user } = await requireGuruMock();
    const classroomIds = db.classrooms.filter(c => c.teacherId === user.id).map(c => c.id);
    const students = db.users.filter(u => u.role === "SISWA" && classroomIds.includes(u.profile?.classroomId));
    const studentIds = students.map(s => s.id);
    const results = (db.results || []).filter(r => studentIds.includes(r.studentId));
    
    const enriched = results.map(r => {
      const student = students.find(s => s.id === r.studentId);
      const cls = db.classrooms.find(c => c.id === student?.profile?.classroomId);
      return {
        id: r.id,
        nis: student?.profile?.nis,
        name: student?.profile?.fullName,
        className: cls?.name,
        testType: r.testType || "RIASEC",
        date: r.date || new Date().toLocaleDateString("id-ID"),
        result: r.result || "-",
        score: r.score || "-",
        status: r.status || "Selesai",
        color: r.color || "bg-blue-100 text-blue-700 border-blue-200"
      };
    });
    
    return { success: true, data: enriched.reverse() };
  } catch(error) {
    return { error: error.message };
  }
}
