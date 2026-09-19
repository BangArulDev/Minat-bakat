// Utilitas perhitungan skor Holland RIASEC
import { riasecQuestions } from "@/data/riasecQuestions";
import { riasecSelfEstimate } from "@/data/riasecSelfEstimate";
import { riasecCareers } from "@/data/riasecCareers";
import { consistencyMatrix, RIASEC_ORDER } from "@/data/riasecDescriptions";

/**
 * Menghitung skor per tipe RIASEC
 * @param {Object} answers - Object { itemId: 0|1 } untuk 216 soal
 * @param {Object} selfEstimates - Object { itemId: 1-7 } untuk 12 self-estimate
 * @returns {Object} { R: number, I: number, A: number, S: number, E: number, C: number }
 */
export function calculateScores(answers, selfEstimates) {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  // 1. Hitung dari 216 soal utama (0 atau 1)
  riasecQuestions.forEach((q) => {
    const answer = answers[q.id];
    if (answer === 1) {
      scores[q.type] += 1;
    }
  });

  // 2. Tambahkan Self-Estimate (nilai 1-7)
  // Menggunakan data dari riasecSelfEstimate yang ID-nya 217-228
  
  Object.entries(selfEstimates).forEach(([id, value]) => {
    const seItem = riasecSelfEstimate.find((se) => se.id === parseInt(id));
    if (seItem && value) {
      scores[seItem.type] += parseInt(value);
    }
  });

  return scores;
}

/**
 * Menentukan kode 3-huruf dominan
 * @param {Object} scores - { R, I, A, S, E, C }
 * @returns {string} Kode 3 huruf, mis. "RIA"
 */
export function getTopThreeCode(scores) {
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return sorted.map(([type]) => type).join("");
}

/**
 * Mendapatkan urutan peringkat semua tipe
 * @param {Object} scores
 * @returns {Array} [{type, score, rank}]
 */
export function getRankedScores(scores) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([type, score], index) => ({
      type,
      score,
      rank: index + 1,
    }));
}

/**
 * Menghitung tingkat konsistensi berdasarkan 2 tipe dominan
 * Berdasarkan hexagonal model Holland:
 * - Tinggi (3): pasangan berdekatan di hexagon
 * - Sedang (2): selisih 1 posisi
 * - Rendah (1): berlawanan di hexagon
 * @param {string} code - Kode 3 huruf
 * @returns {{ level: string, score: number, description: string }}
 */
export function getConsistencyLevel(code) {
  if (!code || code.length < 2) return { level: "Tidak Diketahui", score: 0, description: "" };

  const first = code[0];
  const second = code[1];
  const score = consistencyMatrix[first]?.[second] || 0;

  const levels = {
    3: {
      level: "Tinggi",
      description:
        "Kedua tipe dominanmu saling berdekatan di model hexagonal Holland, menunjukkan minat yang konsisten dan terarah.",
    },
    2: {
      level: "Sedang",
      description:
        "Kedua tipe dominanmu memiliki jarak sedang di model hexagonal, menunjukkan minat yang cukup konsisten dengan beberapa variasi.",
    },
    1: {
      level: "Rendah",
      description:
        "Kedua tipe dominanmu berada di posisi berlawanan di model hexagonal, menunjukkan minat yang beragam dan multidimensi.",
    },
  };

  return levels[score] || { level: "Tidak Diketahui", score: 0, description: "" };
}

/**
 * Mencari rekomendasi karier berdasarkan kode 3-huruf
 * @param {string} code - Kode 3 huruf
 * @returns {{ code: string, recommendations: string[], interpretation: string } | null}
 */
export function getCareerRecommendations(code) {
  if (!code) return null;

  // Cari exact match
  const career = riasecCareers.find((c) => c.code === code);
  if (career) {
    return {
      code: career.code,
      recommendations: career.recommendations.split(";").map((r) => r.trim()).filter(Boolean),
      interpretation: career.interpretation,
    };
  }

  // Jika tidak ditemukan, coba permutasi dari 3 huruf
  const letters = code.split("");
  const permutations = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
  ];

  for (const perm of permutations) {
    const permCode = perm.map((i) => letters[i]).join("");
    const found = riasecCareers.find((c) => c.code === permCode);
    if (found) {
      return {
        code: found.code,
        recommendations: found.recommendations.split(";").map((r) => r.trim()).filter(Boolean),
        interpretation: found.interpretation,
      };
    }
  }

  return null;
}

/**
 * Menghitung persentase skor untuk visualisasi radar chart
 * @param {Object} scores
 * @returns {Object} { R: 0-100, I: 0-100, ... }
 */
export function getScorePercentages(scores) {
  // Skor maksimum per tipe: 36 soal (masing-masing 1) + 2 self-estimate (masing-masing max 7) = 36 + 14 = 50
  const maxScore = 50;
  const percentages = {};
  RIASEC_ORDER.forEach((type) => {
    percentages[type] = Math.min(100, Math.round((scores[type] / maxScore) * 100));
  });
  return percentages;
}
