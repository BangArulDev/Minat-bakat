
"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  BookOpen,
  Wrench,
  BriefcaseBusiness,
  Star,
  Info,
  Zap,
  Loader2,
} from "lucide-react";

import {
  getRiasecQuestions,
  saveRiasecResult,
} from "@/app/actions/riasec";

import {
  riasecDescriptions,
  RIASEC_ORDER,
} from "@/data/riasecDescriptions";

import {
  calculateScores,
  getTopThreeCode,
  getConsistencyLevel,
} from "@/utils/riasecScoring";

const ITEMS_PER_PAGE = 10;

const STEPS = [
  {
    id: "intro",
    label: "Pengantar",
    icon: BookOpen,
  },
  {
    id: "aktivitas",
    label: "Aktivitas",
    icon: Zap,
    group: "Aktivitas",
  },
  {
    id: "kemampuan",
    label: "Kemampuan",
    icon: Wrench,
    group: "Kemampuan/Keterampilan",
  },
  {
    id: "pekerjaan",
    label: "Pekerjaan",
    icon: BriefcaseBusiness,
    group: "Pekerjaan",
  },
  {
    id: "self-estimate",
    label: "Self-Estimate",
    icon: Star,
  },
];

export default function TesRiasecPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [answers, setAnswers] = useState({});
  const [selfEstimates, setSelfEstimates] = useState({});

  const [dbQuestions, setDbQuestions] = useState([]);
  const [dbEstimates, setDbEstimates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  // ============================================
  // AMBIL PERTANYAAN DARI DATABASE
  // ============================================

  useEffect(() => {
    let mounted = true;

    async function loadQuestions() {
      try {
        const res = await getRiasecQuestions();

        if (!mounted) return;

        if (!res?.success) {
          throw new Error(
            res?.error || "Gagal mengambil instrumen tes."
          );
        }

        const questions = res.data?.questions || [];
        const estimates = res.data?.selfEstimates || [];

        if (
          questions.length !== 216 ||
          estimates.length !== 12
        ) {
          throw new Error(
            "Instrumen tidak lengkap. Pastikan terdapat 216 soal utama dan 12 Self-Estimate."
          );
        }

        setDbQuestions(questions);
        setDbEstimates(estimates);
      } catch (error) {
        if (mounted) {
          setLoadingError(error.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================
  // DATA STEP
  // ============================================

  const step = STEPS[currentStep];

  const currentQuestions = useMemo(() => {
    if (!step.group) return [];

    return dbQuestions.filter(
      (q) => q.group === step.group
    );
  }, [step.group, dbQuestions]);

  const totalPages = Math.ceil(
    currentQuestions.length / ITEMS_PER_PAGE
  );

  const pageQuestions = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;

    return currentQuestions.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [currentQuestions, currentPage]);

  // ============================================
  // PROGRESS
  // ============================================

  const totalAnswerable = 228;

  const totalAnswered =
    Object.keys(answers).length +
    Object.keys(selfEstimates).length;

  const progressPercent = Math.min(
    100,
    Math.round((totalAnswered / totalAnswerable) * 100)
  );

  const isCurrentPageComplete = useMemo(() => {
    if (step.id === "intro") return true;

    if (step.id === "self-estimate") {
      return dbEstimates.every(
        (se) =>
          selfEstimates[se.id] !== undefined &&
          selfEstimates[se.id] !== ""
      );
    }

    return pageQuestions.every(
      (q) => answers[q.id] !== undefined
    );
  }, [
    step.id,
    pageQuestions,
    answers,
    selfEstimates,
    dbEstimates,
  ]);

  const isStepComplete = useCallback(
    (stepIndex) => {
      const selectedStep = STEPS[stepIndex];

      if (selectedStep.id === "intro") return true;

      if (selectedStep.id === "self-estimate") {
        return dbEstimates.every(
          (se) =>
            selfEstimates[se.id] !== undefined &&
            selfEstimates[se.id] !== ""
        );
      }

      const questions = dbQuestions.filter(
        (q) => q.group === selectedStep.group
      );

      return (
        questions.length > 0 &&
        questions.every(
          (q) => answers[q.id] !== undefined
        )
      );
    },
    [answers, selfEstimates, dbQuestions, dbEstimates]
  );

  // ============================================
  // INPUT JAWABAN
  // ============================================

  const handleAnswer = (questionId, value) => {
    // YA = 1, TIDAK = 0
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    setShowValidation(false);
  };

  const handleSelfEstimate = (id, value) => {
    // Self-Estimate = nilai 1 sampai 7
    setSelfEstimates((prev) => ({
      ...prev,
      [id]: value,
    }));

    setShowValidation(false);
  };

  // ============================================
  // SIMPAN SELURUH HASIL TES
  // ============================================

  const handleSaveResult = async () => {
    if (saving) return;

    const mainComplete =
      dbQuestions.length === 216 &&
      dbQuestions.every(
        (q) =>
          answers[q.id] === 0 ||
          answers[q.id] === 1
      );

    const estimateComplete =
      dbEstimates.length === 12 &&
      dbEstimates.every((se) => {
        const value = selfEstimates[se.id];

        return (
          Number.isInteger(value) &&
          value >= 1 &&
          value <= 7
        );
      });

    if (!mainComplete || !estimateComplete) {
      setShowValidation(true);
      setSaveError(
        "Seluruh 216 soal dan 12 Self-Estimate harus dijawab sebelum hasil disimpan."
      );
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      // Perhitungan RIASEC tetap menggunakan
      // fungsi asli proyek CARE Indonesia.
      const scores = calculateScores(
        answers,
        selfEstimates,
        dbQuestions,
        dbEstimates
      );

      const code = getTopThreeCode(scores);

      const consistency =
        getConsistencyLevel(code).level;

      // PENTING:
      // Kirim seluruh jawaban ke database,
      // bukan hanya skor akhirnya.
      const res = await saveRiasecResult(
        scores,
        code,
        consistency,
        answers,
        selfEstimates
      );

      if (!res?.success) {
        throw new Error(
          res?.error || "Gagal menyimpan hasil tes."
        );
      }

      // Cache untuk halaman hasil siswa
      try {
        sessionStorage.setItem(
          "riasec_answers",
          JSON.stringify({
            answers,
            selfEstimates,
            scores,
          })
        );
      } catch (cacheError) {
        console.warn(
          "Cache browser tidak tersedia:",
          cacheError
        );
      }

      router.push("/siswa/hasil-riasec");
    } catch (error) {
      setSaveError(
        error.message || "Gagal menyimpan hasil tes."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // NAVIGASI SELANJUTNYA
  // ============================================

  const handleNext = async () => {
    if (saving) return;

    if (!isCurrentPageComplete) {
      setShowValidation(true);
      return;
    }

    if (step.group && currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      setShowValidation(false);
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setCurrentPage(0);
      setShowValidation(false);
      return;
    }

    await handleSaveResult();
  };

  // ============================================
  // NAVIGASI SEBELUMNYA
  // ============================================

  const handlePrev = () => {
    if (saving) return;

    setShowValidation(false);

    if (step.group && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      return;
    }

    if (currentStep > 0) {
      const prevStep = STEPS[currentStep - 1];

      setCurrentStep((prev) => prev - 1);

      if (prevStep.group) {
        const previousQuestions = dbQuestions.filter(
          (q) => q.group === prevStep.group
        );

        setCurrentPage(
          Math.max(
            0,
            Math.ceil(
              previousQuestions.length / ITEMS_PER_PAGE
            ) - 1
          )
        );
      } else {
        setCurrentPage(0);
      }
    }
  };

  // ============================================
  // SCROLL OTOMATIS
  // ============================================

  useEffect(() => {
    window.scrollTo?.({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep, currentPage]);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] gap-3">
        <Loader2
          className="animate-spin text-blue-600"
          size={25}
        />
        <p className="text-gray-500">
          Memuat pertanyaan RIASEC...
        </p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex gap-3 text-red-700">
          <AlertCircle className="shrink-0" />
          <div>
            <h2 className="font-bold">
              Gagal Memuat Tes
            </h2>
            <p className="text-sm mt-2">
              {loadingError}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-xl"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  // ============================================
  // HALAMAN TES UTAMA
  // ============================================

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">

      {/* HEADER PROGRESS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles
                size={22}
                className="text-blue-600"
              />
              Tes Minat Karier Holland RIASEC
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              216 pertanyaan + 12 self-estimate
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-blue-600">
              {progressPercent}%
            </p>

            <p className="text-xs text-gray-400">
              {totalAnswered}/228 dijawab
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{
              width: `${progressPercent}%`,
            }}
            transition={{
              duration: 0.4,
            }}
          />
        </div>

        {/* STEP INDICATORS */}
        <div className="flex items-center justify-between mt-4 gap-1">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const completed = isStepComplete(index);
            const active = index === currentStep;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                    : completed
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {completed && !active ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <Icon size={15} />
                )}

                <span className="hidden sm:inline">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* KONTEN TES */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentStep}-${currentPage}`}
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{
            opacity: 0,
            x: -20,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          {step.id === "intro" && (
            <IntroStep />
          )}

          {step.group && (
            <QuestionStep
              questions={pageQuestions}
              answers={answers}
              onAnswer={handleAnswer}
              currentPage={currentPage}
              totalPages={totalPages}
              groupLabel={step.label}
              showValidation={showValidation}
            />
          )}

          {step.id === "self-estimate" && (
            <SelfEstimateStep
              selfEstimates={selfEstimates}
              dbEstimates={dbEstimates}
              onEstimate={handleSelfEstimate}
              showValidation={showValidation}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* NAVIGASI */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={
            saving ||
            (currentStep === 0 && currentPage === 0)
          }
          className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
          Sebelumnya
        </button>

        {showValidation && (
          <p className="text-sm text-red-600 font-medium">
            Lengkapi jawaban terlebih dahulu.
          </p>
        )}

        <button
          onClick={handleNext}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200"
        >
          {saving ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Menyimpan...
            </>
          ) : step.id === "self-estimate" ? (
            <>
              Lihat Hasil
              <Sparkles size={18} />
            </>
          ) : (
            <>
              Selanjutnya
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* ERROR PENYIMPANAN */}
      {saveError && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle
                  size={24}
                  className="text-red-600"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Gagal Menyimpan Hasil
                </h3>

                <p className="text-sm text-gray-500">
                  Hasil tes belum berhasil disimpan.
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm text-red-700">
                {saveError}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSaveError(null)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold"
              >
                Kembali
              </button>

              <button
                onClick={() => {
                  setSaveError(null);
                  handleSaveResult();
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MENYIMPAN */}
      {saving && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />

          <p className="text-lg font-bold text-gray-800">
            Menyimpan hasil tes...
          </p>

          <p className="text-sm text-gray-500">
            Mohon jangan tutup halaman ini.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// HALAMAN PENGANTAR
// ============================================

function IntroStep() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-6 sm:px-8 py-10 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles size={25} />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Tes Minat Karier Holland RIASEC
            </h2>

            <p className="text-blue-100 text-sm mt-1">
              Temukan potensi dan arah kariermu!
            </p>
          </div>
        </div>

        <p className="text-blue-100 leading-relaxed">
          Tes ini membantu kamu mengenali minat dan
          kecenderungan karier berdasarkan teori Holland
          RIASEC. Tidak ada jawaban benar atau salah.
          Jawablah sesuai dengan minat dan kondisi dirimu.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info
              size={18}
              className="text-blue-600"
            />
            Apa itu RIASEC?
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {RIASEC_ORDER.map((type) => {
              const desc = riasecDescriptions[type];
              const Icon = desc.icon;

              return (
                <div
                  key={type}
                  className="p-3 rounded-xl border border-gray-100"
                  style={{
                    backgroundColor: desc.colorLight,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      size={20}
                      style={{
                        color: desc.color,
                      }}
                    />

                    <span
                      className="font-bold text-sm"
                      style={{
                        color: desc.color,
                      }}
                    >
                      {desc.name}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    {desc.shortDesc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* PETUNJUK */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <BookOpen size={18} />
            Petunjuk Pengerjaan
          </h3>

          <ol className="space-y-3 text-sm text-amber-800 list-decimal pl-5">
            <li>
              Baca setiap pernyataan dengan saksama.
            </li>

            <li>
              Pilih <strong>Ya</strong> jika sesuai dengan
              minat atau kondisimu, atau{" "}
              <strong>Tidak</strong> jika tidak sesuai.
            </li>

            <li>
              Untuk bagian Self-Estimate, berikan nilai
              1 sampai 7 sesuai penilaian terhadap dirimu.
            </li>

            <li>
              Jawablah sesuai dirimu sendiri, bukan harapan
              orang lain.
            </li>
          </ol>
        </div>

        {/* INFORMASI JUMLAH SOAL */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              216
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Pertanyaan Utama
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              12
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Self-Estimate
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock size={18} />
              <p className="text-2xl font-bold text-gray-900">
                30
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Menit (estimasi)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HALAMAN SOAL UTAMA 1-216
// ============================================

function QuestionStep({
  questions,
  answers,
  onAnswer,
  currentPage,
  totalPages,
  groupLabel,
  showValidation,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
        <h2 className="font-bold text-gray-900">
          Bagian: {groupLabel}
        </h2>

        <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-lg border border-gray-200">
          Halaman {currentPage + 1} / {totalPages}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {questions.map((q, index) => {
          const isAnswered =
            answers[q.id] !== undefined;

          const isUnanswered =
            showValidation && !isAnswered;

          const typeDesc = riasecDescriptions[q.type];

          return (
            <motion.div
              key={q.id}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.02,
              }}
              className={`px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4 ${
                isUnanswered
                  ? "bg-red-50"
                  : isAnswered
                  ? "bg-green-50/30"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* NOMOR SOAL */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    backgroundColor:
                      typeDesc?.colorLight || "#f3f4f6",
                    color:
                      typeDesc?.color || "#6b7280",
                  }}
                >
                  {q.id}
                </div>

                {/* PERNYATAAN */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">
                    {q.statement}
                  </p>

                  {isUnanswered && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle size={13} />
                      Belum dijawab
                    </p>
                  )}
                </div>
              </div>

              {/* PILIHAN JAWABAN */}
              <div className="flex gap-2 sm:shrink-0 ml-14 sm:ml-0">
                <button
                  type="button"
                  onClick={() => onAnswer(q.id, 1)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    answers[q.id] === 1
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}
                >
                  Ya
                </button>

                <button
                  type="button"
                  onClick={() => onAnswer(q.id, 0)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    answers[q.id] === 0
                      ? "bg-gray-700 text-white border-gray-700 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  Tidak
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* INDIKATOR HALAMAN */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2 flex-wrap">
          {Array.from({
            length: totalPages,
          }).map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentPage
                  ? "bg-blue-600 scale-125"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// HALAMAN SELF-ESTIMATE 1-12
// ============================================

function SelfEstimateStep({
  selfEstimates,
  dbEstimates,
  onEstimate,
  showValidation,
}) {
  const pengetahuan = dbEstimates.filter(
    (se) => se.aspect === "Pengetahuan"
  );

  const keterampilan = dbEstimates.filter(
    (se) => se.aspect === "Keterampilan"
  );

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
        <h3 className="font-bold text-indigo-800 flex items-center gap-2 mb-2">
          <Star size={18} />
          Self-Estimate (Penilaian Diri)
        </h3>

        <p className="text-sm text-indigo-700 leading-relaxed">
          Berikan nilai <strong>1 sampai 7</strong> pada
          setiap bidang sesuai penilaian dirimu sendiri.
          Nilai 1 berarti sangat rendah, sedangkan nilai
          7 berarti sangat tinggi.
        </p>
      </div>

      <SelfEstimateGroup
        title="Pengetahuan Diri"
        subtitle="Seberapa tinggi pengetahuanmu dalam bidang berikut?"
        items={pengetahuan}
        estimates={selfEstimates}
        onEstimate={onEstimate}
        showValidation={showValidation}
      />

      <SelfEstimateGroup
        title="Keterampilan Diri"
        subtitle="Seberapa tinggi keterampilanmu dalam bidang berikut?"
        items={keterampilan}
        estimates={selfEstimates}
        onEstimate={onEstimate}
        showValidation={showValidation}
      />
    </div>
  );
}

// ============================================
// KOMPONEN PENILAIAN SELF-ESTIMATE
// ============================================

function SelfEstimateGroup({
  title,
  subtitle,
  items,
  estimates,
  onEstimate,
  showValidation,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-gray-900">
          {title}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          {subtitle}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((se) => {
          const currentValue = estimates[se.id];

          const isUnanswered =
            showValidation &&
            (
              currentValue === undefined ||
              currentValue === ""
            );

          const fieldParts = se.field.split("—");

          const fieldTitle =
            fieldParts[0]?.trim() || se.field;

          const fieldDesc =
            fieldParts[1]?.trim() || "";

          const typeDesc =
            riasecDescriptions[se.type];

          return (
            <div
              key={se.id}
              className={`px-5 sm:px-6 py-5 ${
                isUnanswered ? "bg-red-50" : ""
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    backgroundColor:
                      typeDesc?.colorLight || "#f3f4f6",
                    color:
                      typeDesc?.color || "#6b7280",
                  }}
                >
                  {se.type}
                </div>

                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {fieldTitle}
                  </p>

                  {fieldDesc && (
                    <p className="text-xs text-gray-500 mt-1">
                      {fieldDesc}
                    </p>
                  )}
                </div>
              </div>

              {/* NILAI 1 SAMPAI 7 */}
              <div className="ml-0 sm:ml-12">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">
                    Rendah
                  </span>

                  {[1, 2, 3, 4, 5, 6, 7].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          onEstimate(se.id, value)
                        }
                        className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                          currentValue === value
                            ? "bg-blue-600 text-white border-blue-600 shadow-md scale-110"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {value}
                      </button>
                    )
                  )}

                  <span className="text-xs text-gray-400">
                    Tinggi
                  </span>
                </div>

                {isUnanswered && (
                  <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                    <AlertCircle size={13} />
                    Belum dinilai
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
