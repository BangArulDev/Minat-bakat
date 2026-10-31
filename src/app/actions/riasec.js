
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ============================================
// SIMPAN HASIL DAN JAWABAN RIASEC
// ============================================

export async function saveRiasecResult(
  rawScores,
  dominantCode,
  consistency,
  answers,
  selfEstimates
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Silakan login terlebih dahulu." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true },
    });

    if (!user || user.role !== "SISWA") {
      return { error: "Akses hanya untuk siswa." };
    }

    if (!user.studentProfile) {
      return { error: "Profil siswa tidak ditemukan." };
    }

    const [questions, estimates] = await Promise.all([
      prisma.riasecQuestion.findMany({
        select: { id: true },
        orderBy: { id: "asc" },
      }),
      prisma.riasecSelfEstimate.findMany({
        select: { id: true },
        orderBy: { id: "asc" },
      }),
    ]);

    if (questions.length !== 216 || estimates.length !== 12) {
      return { error: "Instrumen tes tidak lengkap." };
    }

    if (
      !answers ||
      typeof answers !== "object" ||
      !selfEstimates ||
      typeof selfEstimates !== "object"
    ) {
      return { error: "Data jawaban belum tersedia." };
    }

    const validAnswers = questions.every(
      (q) => answers[q.id] === 0 || answers[q.id] === 1
    );

    const validEstimates = estimates.every((item) => {
      const value = selfEstimates[item.id];
      return Number.isInteger(value) && value >= 1 && value <= 7;
    });

    if (!validAnswers || !validEstimates) {
      return { error: "Lengkapi seluruh 228 jawaban tes." };
    }

    const answerData = Object.fromEntries(
      questions.map((q) => [
        String(q.id),
        answers[q.id],
      ])
    );

    const estimateData = Object.fromEntries(
      estimates.map((item) => [
        String(item.id),
        selfEstimates[item.id],
      ])
    );

    const result = await prisma.riasecResult.create({
      data: {
        studentId: user.studentProfile.id,
        rawScores: JSON.stringify(rawScores),
        dominantCode,
        consistency,
        answers: answerData,
        selfEstimates: estimateData,
      },
    });

    return {
      success: true,
      data: { id: result.id },
    };
  } catch (error) {
    console.error("saveRiasecResult:", error);

    return {
      error: "Gagal menyimpan hasil tes: " + error.message,
    };
  }
}

// ============================================
// RIWAYAT HASIL TES SISWA
// ============================================

export async function getSiswaRiasecResults() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true },
    });

    if (!user || user.role !== "SISWA" || !user.studentProfile) {
      return { error: "Akses ditolak." };
    }

    const results = await prisma.riasecResult.findMany({
      where: {
        studentId: user.studentProfile.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("getSiswaRiasecResults:", error);
    return { error: "Gagal mengambil riwayat tes." };
  }
}

// ============================================
// HASIL TES TERBARU SISWA
// ============================================

export async function getSiswaLatestResult() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true },
    });

    if (!user || user.role !== "SISWA" || !user.studentProfile) {
      return { error: "Akses ditolak." };
    }

    const result = await prisma.riasecResult.findFirst({
      where: {
        studentId: user.studentProfile.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!result) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: result.id,
        rawScores: JSON.parse(result.rawScores || "{}"),
        dominantCode: result.dominantCode,
        consistency: result.consistency,
        createdAt: result.createdAt,
      },
    };
  } catch (error) {
    console.error("getSiswaLatestResult:", error);
    return { error: "Gagal mengambil hasil tes." };
  }
}

// ============================================
// PERTANYAAN RIASEC
// ============================================

export async function getRiasecQuestions() {
  try {
    const questions = await prisma.riasecQuestion.findMany({
      orderBy: { id: "asc" },
    });

    const selfEstimates = await prisma.riasecSelfEstimate.findMany({
      orderBy: { id: "asc" },
    });

    return {
      success: true,
      data: { questions, selfEstimates },
    };
  } catch (error) {
    console.error("getRiasecQuestions:", error);

    return {
      error: "Gagal mengambil pertanyaan.",
    };
  }
}
