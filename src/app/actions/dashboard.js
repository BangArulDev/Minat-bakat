"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getSiswaDashboardData() {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentProfile: {
          include: {
            classroom: {
              include: {
                teacher: true,
                _count: { select: { students: true } }
              }
            }
          }
        }
      }
    });
    
    if (!user || user.role !== "SISWA" || !user.studentProfile) {
      return { error: "User not found or not a siswa" };
    }

    const profile = user.studentProfile;
    const classroom = profile.classroom;
    const teacherProfile = classroom?.teacher;

    return {
      success: true,
      data: {
        stats: {
          classCode: classroom?.classCode || "-",
          className: classroom?.name || "-",
          totalStudents: classroom?._count?.students || 0,
          totalInstruments: 3, 
        },
        studentData: {
          nis: profile.nis || "-",
          name: profile.fullName || user.username,
          class: classroom?.name || "-",
          gender: profile.gender === "L" || profile.gender?.toLowerCase() === "laki-laki" ? "Laki-laki" : 
                  profile.gender === "P" || profile.gender?.toLowerCase() === "perempuan" ? "Perempuan" : 
                  profile.gender || "-"
        },
        schoolData: {
          name: teacherProfile?.schoolName || "-",
          province: "Jawa Tengah", // Fallback
          city: "Kab. Grobogan", // Fallback
          teacher: teacherProfile?.fullName || "-"
        }
      }
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal memuat data dashboard siswa." };
  }
}

export async function getGuruDashboardData() {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        teacherProfile: {
          include: {
            classrooms: {
              include: {
                _count: { select: { students: true } }
              }
            }
          }
        }
      }
    });
    
    if (!user || user.role !== "GURU" || !user.teacherProfile) {
      return { error: "User not found or not a guru" };
    }

    const profile = user.teacherProfile;
    const totalStudents = profile.classrooms.reduce((acc, curr) => acc + curr._count.students, 0);

    return {
      success: true,
      data: {
        stats: {
          totalStudents: totalStudents,
          totalClassrooms: profile.classrooms.length,
          totalInstruments: 3, // Default
          quota: profile.quota || 0,
        },
        schoolData: {
          schoolCode: profile.schoolCode || "-",
          name: profile.schoolName || "-",
          address: "-", // Fallback
          city: "-", // Fallback
          province: "-", // Fallback
        }
      }
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal memuat data dashboard guru." };
  }
}
