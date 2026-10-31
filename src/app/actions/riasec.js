"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function saveRiasecResult(rawScores, dominantCode, consistency) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true }
    });

    if (!user) return { error: "User tidak ditemukan" };
    if (user.role !== "SISWA") return { error: "Hanya siswa yang dapat menyimpan hasil tes" };
    if (!user.studentProfile) return { error: "Profil siswa belum lengkap. Hubungi guru untuk mengecek akun Anda." };

    // Hapus hasil lama (opsional: simpan hanya hasil terbaru)
    // Bisa dihapus jika ingin menyimpan semua riwayat
    // await prisma.riasecResult.deleteMany({ where: { studentId: user.studentProfile.id } });

    const result = await prisma.riasecResult.create({
      data: {
        studentId: user.studentProfile.id,
        rawScores: JSON.stringify(rawScores),
        dominantCode,
        consistency
      }
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error saving riasec result:", error);
    return { error: "Gagal menyimpan hasil tes: " + (error.message || "Unknown error") };
  }
}

export async function getSiswaRiasecResults() {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true }
    });

    if (!user || user.role !== "SISWA" || !user.studentProfile) {
      return { error: "Akses ditolak" };
    }

    const results = await prisma.riasecResult.findMany({
      where: { studentId: user.studentProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Error getting riasec results:", error);
    return { error: "Gagal mengambil data hasil tes" };
  }
}

// Ambil hasil tes terbaru siswa (untuk halaman hasil)
export async function getSiswaLatestResult() {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true }
    });

    if (!user || user.role !== "SISWA" || !user.studentProfile) {
      return { error: "Akses ditolak" };
    }

    const result = await prisma.riasecResult.findFirst({
      where: { studentId: user.studentProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!result) return { success: true, data: null };

    return {
      success: true,
      data: {
        id: result.id,
        rawScores: JSON.parse(result.rawScores || "{}"),
        dominantCode: result.dominantCode,
        consistency: result.consistency,
        createdAt: result.createdAt
      }
    };
  } catch (error) {
    console.error("Error getting latest result:", error);
    return { error: "Gagal mengambil hasil tes terbaru" };
  }
}

export async function getRiasecQuestions() {
  try {
    const questions = await prisma.riasecQuestion.findMany({
      orderBy: { id: 'asc' }
    });
    const selfEstimates = await prisma.riasecSelfEstimate.findMany({
      orderBy: { id: 'asc' }
    });
    return { success: true, data: { questions, selfEstimates } };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { error: "Gagal mengambil data pertanyaan" };
  }
}
