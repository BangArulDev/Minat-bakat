"use server";
import { getDB, saveDB, generateId } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// === Helper ===
async function requireGuru() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const db = getDB();
  const user = db.users.find(u => u.id === session.user.id || u.username === session.user.username);
  if (!user || user.role !== "GURU") throw new Error("Unauthorized");
  return { db, user };
}

// === KELAS ===
export async function getClassrooms() {
  try {
    const { db, user } = await requireGuru();
    const classrooms = db.classrooms.filter(c => c.teacherId === user.id);
    
    // Enrich with student count
    const enriched = classrooms.map(c => {
      const studentCount = db.users.filter(u => u.role === "SISWA" && u.profile?.classroomId === c.id).length;
      return {
        id: c.id,
        code: c.classCode,
        name: c.name,
        status: c.status || "active",
        createdAt: c.createdAt || new Date().toLocaleDateString("id-ID"),
        studentCount
      };
    });
    // Sort descending by ID or createdAt if possible (just reverse for now to mimic new first)
    return { success: true, data: enriched.reverse() };
  } catch (error) {
    return { error: error.message };
  }
}

export async function saveClassroom(data) {
  try {
    const { db, user } = await requireGuru();
    
    if (data.id && typeof data.id === "string" && data.id.startsWith("CLS-ID-")) {
      // Update
      const idx = db.classrooms.findIndex(c => c.id === data.id && c.teacherId === user.id);
      if (idx !== -1) {
        db.classrooms[idx].classCode = data.code;
        db.classrooms[idx].name = data.name;
        db.classrooms[idx].status = data.status;
      }
    } else {
      // Create
      const newClass = {
        id: "CLS-ID-" + generateId(),
        classCode: data.code,
        name: data.name,
        teacherId: user.id,
        status: data.status,
        createdAt: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
      };
      db.classrooms.push(newClass);
    }
    saveDB(db);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteClassroom(id) {
  try {
    const { db, user } = await requireGuru();
    db.classrooms = db.classrooms.filter(c => !(c.id === id && c.teacherId === user.id));
    saveDB(db);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

// === SISWA ===
export async function getStudents() {
  try {
    const { db, user } = await requireGuru();
    const classroomIds = db.classrooms.filter(c => c.teacherId === user.id).map(c => c.id);
    
    const students = db.users.filter(u => u.role === "SISWA" && classroomIds.includes(u.profile?.classroomId));
    
    const enriched = students.map(s => {
      const cls = db.classrooms.find(c => c.id === s.profile?.classroomId);
      return {
        id: s.id,
        nis: s.profile?.nis || s.username,
        username: s.username,
        name: s.profile?.fullName,
        pob: s.profile?.birthPlace,
        dob: s.profile?.birthDate,
        gender: s.profile?.gender,
        classroomId: cls?.id,
        className: cls?.name,
        classCode: cls?.classCode
      };
    });
    
    return { success: true, data: enriched.reverse() };
  } catch (error) {
    return { error: error.message };
  }
}

export async function saveStudent(data) {
  try {
    const { db, user } = await requireGuru();
    
    // Cari classroom by name (krn di UI pakai select name)
    const cls = db.classrooms.find(c => c.name === data.className && c.teacherId === user.id);
    if (!cls) return { error: "Kelas tidak ditemukan" };
    
    if (data.id && typeof data.id === "string" && data.id.startsWith("U-")) {
      // Update
      const idx = db.users.findIndex(u => u.id === data.id);
      if (idx !== -1) {
        db.users[idx].profile.nis = data.nis;
        db.users[idx].username = data.nis; // Sync username dgn NIS
        db.users[idx].profile.fullName = data.name;
        db.users[idx].profile.birthPlace = data.pob;
        db.users[idx].profile.birthDate = data.dob;
        db.users[idx].profile.gender = data.gender;
        db.users[idx].profile.classroomId = cls.id;
      }
    } else {
      // Create
      const hashedPassword = await bcrypt.hash(data.nis, 10);
      const newStudent = {
        id: "U-" + generateId(),
        username: data.nis,
        email: `${data.nis}@siswa.local`,
        password: hashedPassword,
        role: "SISWA",
        profile: {
          fullName: data.name,
          nis: data.nis,
          gender: data.gender,
          birthPlace: data.pob,
          birthDate: data.dob,
          classroomId: cls.id,
        },
        createdAt: new Date().toISOString()
      };
      db.users.push(newStudent);
    }
    saveDB(db);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteStudent(id) {
  try {
    const { db } = await requireGuru();
    db.users = db.users.filter(u => u.id !== id);
    saveDB(db);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

// === SEKOLAH ===
export async function getSchoolProfile() {
  try {
    const { user } = await requireGuru();
    return { 
      success: true, 
      data: {
        name: user.profile?.schoolName || "",
        npsn: user.profile?.schoolCode || "",
        address: user.profile?.address || "",
        province: user.profile?.province || "",
        regency: user.profile?.regency || "",
        aliasCity: user.profile?.aliasCity || "",
        logo: user.profile?.logo || null
      }
    };
  } catch(error) {
    return { error: error.message };
  }
}

export async function saveSchoolProfile(data) {
  try {
    const { db, user } = await requireGuru();
    const idx = db.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      db.users[idx].profile = {
        ...db.users[idx].profile,
        schoolName: data.name,
        address: data.address,
        province: data.province,
        regency: data.regency,
        aliasCity: data.aliasCity,
        logo: data.logo
      };
      saveDB(db);
      return { success: true };
    }
    return { error: "User tidak ditemukan" };
  } catch(error) {
    return { error: error.message };
  }
}

// === TRANSAKSI ===
export async function getTransactions() {
  try {
    const { db, user } = await requireGuru();
    const tx = (db.transactions || []).filter(t => t.teacherId === user.id);
    return { success: true, data: tx.reverse() };
  } catch(error) {
    return { error: error.message };
  }
}

export async function createTransaction(amount, items, method) {
  try {
    const { db, user } = await requireGuru();
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

// === HASIL TES (Untuk Pilihan, Tabulasi, dll) ===
export async function getResults() {
  try {
    const { db, user } = await requireGuru();
    const classroomIds = db.classrooms.filter(c => c.teacherId === user.id).map(c => c.id);
    
    // Students of this teacher
    const students = db.users.filter(u => u.role === "SISWA" && classroomIds.includes(u.profile?.classroomId));
    const studentIds = students.map(s => s.id);
    
    const results = (db.results || []).filter(r => studentIds.includes(r.studentId));
    
    // Enrich with student details
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
