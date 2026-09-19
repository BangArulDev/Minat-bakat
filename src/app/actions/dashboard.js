"use server";
import { getDB } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getSiswaDashboardData() {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const db = getDB();
    const user = db.users.find(u => u.id === session.user.id || u.username === session.user.username);
    
    if (!user || user.role !== "SISWA") return { error: "User not found or not a siswa" };

    const classroom = db.classrooms.find(c => c.id === user.profile.classroomId);
    
    const totalStudents = db.users.filter(u => u.role === "SISWA" && u.profile.classroomId === classroom?.id).length;
    
    let teacher = db.users.find(u => u.id === classroom?.teacherId);
    if (!teacher) {
      teacher = db.users.find(u => u.role === "GURU");
    }

    // Hitung instrumen / riasec results? (Biarkan 3 untuk sekarang sesuai dummy)
    
    return {
      success: true,
      data: {
        stats: {
          classCode: classroom?.classCode || "-",
          className: classroom?.name || "-",
          totalStudents: totalStudents || 0,
          totalInstruments: 3, 
        },
        studentData: {
          nis: user.profile.nis || "-",
          name: user.profile.fullName || user.username,
          class: classroom?.name || "-",
          gender: user.profile.gender === "L" || user.profile.gender?.toLowerCase() === "laki-laki" ? "Laki-laki" : 
                  user.profile.gender === "P" || user.profile.gender?.toLowerCase() === "perempuan" ? "Perempuan" : 
                  user.profile.gender || "-"
        },
        schoolData: {
          name: teacher?.profile?.schoolName || "-",
          province: "Jawa Tengah", // Fallback, tidak ada di DB saat ini
          city: "Kab. Grobogan", // Fallback, tidak ada di DB saat ini
          teacher: teacher?.profile?.fullName || "-"
        }
      }
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal memuat data." };
  }
}

export async function getGuruDashboardData() {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const db = getDB();
    const user = db.users.find(u => u.id === session.user.id || u.username === session.user.username);
    
    if (!user || user.role !== "GURU") return { error: "User not found or not a guru" };

    const classrooms = db.classrooms.filter(c => c.teacherId === user.id);
    const classroomIds = classrooms.map(c => c.id);
    
    // Students that belong to any of this teacher's classrooms
    const students = db.users.filter(u => u.role === "SISWA" && classroomIds.includes(u.profile?.classroomId));
    
    return {
      success: true,
      data: {
        stats: {
          totalStudents: students.length,
          totalClassrooms: classrooms.length,
          totalInstruments: 3, // Default or fetch from somewhere
          quota: 0, // In db user profile quota doesn't exist, we fallback to 0 or some logic
        },
        schoolData: {
          schoolCode: user.profile?.schoolCode || "-",
          name: user.profile?.schoolName || "-",
          address: "-", // Fallback
          city: "-", // Fallback
          province: "-", // Fallback
        }
      }
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal memuat data." };
  }
}
