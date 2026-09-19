"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
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
  ArrowRight,
  Info,
  Zap,
} from "lucide-react";
import { riasecQuestions } from "@/data/riasecQuestions";
import { riasecSelfEstimate } from "@/data/riasecSelfEstimate";
import { riasecDescriptions, RIASEC_ORDER } from "@/data/riasecDescriptions";

const ITEMS_PER_PAGE = 10;

// ============================================================
//  STEP DEFINITIONS
// ============================================================
const STEPS = [
  { id: "intro", label: "Pengantar", icon: BookOpen },
  { id: "aktivitas", label: "Aktivitas", icon: Zap, group: "Aktivitas" },
  { id: "kemampuan", label: "Kemampuan", icon: Wrench, group: "Kemampuan/Keterampilan" },
  { id: "pekerjaan", label: "Pekerjaan", icon: BriefcaseBusiness, group: "Pekerjaan" },
  { id: "self-estimate", label: "Self-Estimate", icon: Star },
];

export default function TesRiasecPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selfEstimates, setSelfEstimates] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // ============================================================
  //  DERIVED DATA
  // ============================================================
  const step = STEPS[currentStep];

  // Questions for the current group step
  const currentQuestions = useMemo(() => {
    if (!step.group) return [];
    return riasecQuestions.filter((q) => q.group === step.group);
  }, [step.group]);

  // Paginated questions
  const totalPages = Math.ceil(currentQuestions.length / ITEMS_PER_PAGE);
  const pageQuestions = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return currentQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [currentQuestions, currentPage]);

  // Total progress
  const totalAnswerable = 216 + 12;
  const totalAnswered = Object.keys(answers).length + Object.keys(selfEstimates).length;
  const progressPercent = Math.round((totalAnswered / totalAnswerable) * 100);

  // Check if current page is fully answered
  const isCurrentPageComplete = useMemo(() => {
    if (step.id === "intro") return true;
    if (step.id === "self-estimate") {
      return riasecSelfEstimate.every((se) => selfEstimates[se.id] !== undefined && selfEstimates[se.id] !== "");
    }
    return pageQuestions.every((q) => answers[q.id] !== undefined);
  }, [step.id, pageQuestions, answers, selfEstimates]);

  // Check if entire step is complete
  const isStepComplete = useCallback(
    (stepIndex) => {
      const s = STEPS[stepIndex];
      if (s.id === "intro") return true;
      if (s.id === "self-estimate") {
        return riasecSelfEstimate.every((se) => selfEstimates[se.id] !== undefined && selfEstimates[se.id] !== "");
      }
      const qs = riasecQuestions.filter((q) => q.group === s.group);
      return qs.every((q) => answers[q.id] !== undefined);
    },
    [answers, selfEstimates]
  );

  // ============================================================
  //  HANDLERS
  // ============================================================
  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setShowValidation(false);
  };

  const handleSelfEstimate = (id, value) => {
    setSelfEstimates((prev) => ({ ...prev, [id]: value }));
    setShowValidation(false);
  };

  const handleNext = () => {
    // For question steps, check page completion
    if (step.group && !isCurrentPageComplete) {
      setShowValidation(true);
      return;
    }
    if (step.id === "self-estimate" && !isCurrentPageComplete) {
      setShowValidation(true);
      return;
    }

    // If there are more pages in current step
    if (step.group && currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
      setShowValidation(false);
      return;
    }

    // Move to next step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setCurrentPage(0);
      setShowValidation(false);
    } else {
      // All steps done — navigate to results
      // Store answers in sessionStorage
      sessionStorage.setItem(
        "riasec_answers",
        JSON.stringify({ answers, selfEstimates })
      );
      router.push("/siswa/hasil-riasec");
    }
  };

  const handlePrev = () => {
    setShowValidation(false);
    if (step.group && currentPage > 0) {
      setCurrentPage((p) => p - 1);
      return;
    }
    if (currentStep > 0) {
      const prevStep = STEPS[currentStep - 1];
      setCurrentStep((s) => s - 1);
      if (prevStep.group) {
        const prevQuestions = riasecQuestions.filter((q) => q.group === prevStep.group);
        setCurrentPage(Math.ceil(prevQuestions.length / ITEMS_PER_PAGE) - 1);
      } else {
        setCurrentPage(0);
      }
    }
  };

  // Auto-scroll to top on page change
  useEffect(() => {
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [currentStep, currentPage]);

  // ============================================================
  //  RENDER
  // ============================================================
  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      {/* PROGRESS HEADER */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={22} className="text-blue-600" />
              Tes Minat Karier Holland RIASEC
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              216 pertanyaan + 12 self-estimate
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{progressPercent}%</p>
            <p className="text-xs text-gray-400">
              {totalAnswered}/{totalAnswerable} dijawab
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mt-4 gap-1">
          {STEPS.map((s, i) => {
            const completed = isStepComplete(i);
            const active = i === currentStep;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${active ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : ""}
                  ${completed && !active ? "text-green-600" : ""}
                  ${!completed && !active ? "text-gray-400" : ""}
                `}
              >
                {completed && !active ? (
                  <CheckCircle2 size={14} className="text-green-500" />
                ) : (
                  <s.icon size={14} />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentStep}-${currentPage}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step.id === "intro" && <IntroStep />}
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
              onEstimate={handleSelfEstimate}
              showValidation={showValidation}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* NAVIGATION BUTTONS */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0 && currentPage === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
          Sebelumnya
        </button>

        {showValidation && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-red-500 font-medium flex items-center gap-1"
          >
            <AlertCircle size={16} />
            Jawab semua soal terlebih dahulu
          </motion.p>
        )}

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          {currentStep === STEPS.length - 1 && (step.id === "self-estimate") ? (
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
    </div>
  );
}

// ============================================================
//  INTRO STEP
// ============================================================
function IntroStep() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-8 py-10 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Tes Minat Karier Holland RIASEC</h2>
            <p className="text-blue-200 text-sm">
              Temukan potensi dan arah kariermu!
            </p>
          </div>
        </div>
        <p className="text-blue-100 leading-relaxed max-w-2xl">
          Tes ini akan membantu kamu mengenali minat dan kecenderungan kariermu berdasarkan
          teori Holland RIASEC. Tidak ada jawaban benar atau salah — jawablah sesuai
          dengan minat dan kondisi dirimu sendiri.
        </p>
      </div>

      <div className="p-8 space-y-6">
        {/* What is RIASEC */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Info size={18} className="text-blue-600" />
            Apa itu RIASEC?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {RIASEC_ORDER.map((type) => {
              const desc = riasecDescriptions[type];
              return (
                <div
                  key={type}
                  className="p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all group"
                  style={{ backgroundColor: desc.colorLight }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{desc.emoji}</span>
                    <span
                      className="font-bold text-sm"
                      style={{ color: desc.color }}
                    >
                      {desc.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{desc.shortDesc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <BookOpen size={18} />
            Petunjuk Pengerjaan
          </h3>
          <ul className="space-y-2 text-sm text-amber-700">
            <li className="flex gap-2">
              <span className="font-bold text-amber-500">1.</span>
              Baca setiap pernyataan dengan seksama.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-500">2.</span>
              Pilih <strong>Ya</strong> jika pernyataan sesuai dengan minat/kondisimu, atau <strong>Tidak</strong> jika tidak sesuai.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-500">3.</span>
              Untuk bagian Self-Estimate, beri nilai 1–7 sesuai penilaianmu terhadap diri sendiri.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-500">4.</span>
              Tidak ada jawaban benar atau salah. Jawablah sesuai dirimu, bukan harapan orang lain.
            </li>
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">216</p>
            <p className="text-xs text-gray-500 mt-1">Pertanyaan Utama</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-500 mt-1">Self-Estimate</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-gray-900">
              <Clock size={18} />
              <p className="text-2xl font-bold">30</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Menit (estimasi)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  QUESTION STEP (untuk Aktivitas, Kemampuan, Pekerjaan)
// ============================================================
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
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          Bagian: {groupLabel}
        </h2>
        <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-lg border border-gray-200">
          Halaman {currentPage + 1} / {totalPages}
        </span>
      </div>

      {/* Questions */}
      <div className="divide-y divide-gray-50">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;
          const isUnanswered = showValidation && !isAnswered;
          const typeDesc = riasecDescriptions[q.type];
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`px-6 py-4 flex items-start gap-4 transition-colors ${
                isUnanswered ? "bg-red-50/60" : isAnswered ? "bg-green-50/30" : "hover:bg-gray-50/50"
              }`}
            >
              {/* Number */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold mt-0.5"
                style={{
                  backgroundColor: typeDesc?.colorLight || "#f3f4f6",
                  color: typeDesc?.color || "#6b7280",
                }}
              >
                {q.id}
              </div>

              {/* Statement */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {q.statement}
                </p>
                {isUnanswered && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Belum dijawab
                  </p>
                )}
              </div>

              {/* Answer Buttons */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onAnswer(q.id, 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                    answers[q.id] === 1
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  Ya
                </button>
                <button
                  onClick={() => onAnswer(q.id, 0)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                    answers[q.id] === 0
                      ? "bg-gray-700 text-white border-gray-700 shadow-md"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                  }`}
                >
                  Tidak
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Page dots */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentPage ? "bg-blue-600 scale-125" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
//  SELF-ESTIMATE STEP
// ============================================================
function SelfEstimateStep({ selfEstimates, onEstimate, showValidation }) {
  // Group by aspect: Pengetahuan and Keterampilan
  const pengetahuan = riasecSelfEstimate.filter((se) => se.aspect === "Pengetahuan");
  const keterampilan = riasecSelfEstimate.filter((se) => se.aspect === "Keterampilan");

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
        <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
          <Star size={18} /> Self-Estimate (Penilaian Diri)
        </h3>
        <p className="text-sm text-indigo-700">
          Beri nilai <strong>1–7</strong> pada setiap bidang berikut sesuai penilaianmu
          terhadap dirimu sendiri. <strong>1 = sangat rendah</strong>, <strong>7 = sangat tinggi</strong>.
        </p>
      </div>

      {/* Pengetahuan */}
      <SelfEstimateGroup
        title="Pengetahuan Diri"
        subtitle="Seberapa tinggi pengetahuanmu di bidang-bidang berikut?"
        items={pengetahuan}
        estimates={selfEstimates}
        onEstimate={onEstimate}
        showValidation={showValidation}
      />

      {/* Keterampilan */}
      <SelfEstimateGroup
        title="Keterampilan Diri"
        subtitle="Seberapa tinggi keterampilanmu di bidang-bidang berikut?"
        items={keterampilan}
        estimates={selfEstimates}
        onEstimate={onEstimate}
        showValidation={showValidation}
      />
    </div>
  );
}

function SelfEstimateGroup({ title, subtitle, items, estimates, onEstimate, showValidation }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="divide-y divide-gray-50">
        {items.map((se, idx) => {
          const currentValue = estimates[se.id];
          const isUnanswered = showValidation && (currentValue === undefined || currentValue === "");
          // Extract the short name before the dash
          const fieldParts = se.field.split("—");
          const fieldTitle = fieldParts[0]?.trim() || se.field;
          const fieldDesc = fieldParts[1]?.trim() || "";
          const typeDesc = riasecDescriptions[se.type];

          return (
            <div
              key={se.id}
              className={`px-6 py-5 transition-colors ${
                isUnanswered ? "bg-red-50/60" : ""
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    backgroundColor: typeDesc?.colorLight || "#f3f4f6",
                    color: typeDesc?.color || "#6b7280",
                  }}
                >
                  {se.type}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{fieldTitle}</p>
                  {fieldDesc && (
                    <p className="text-xs text-gray-500 mt-0.5">{fieldDesc}</p>
                  )}
                </div>
              </div>

              {/* Scale Buttons 1-7 */}
              <div className="flex items-center gap-2 ml-11">
                <span className="text-xs text-gray-400 mr-1">Rendah</span>
                {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                  <button
                    key={val}
                    onClick={() => onEstimate(se.id, val)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
                      currentValue === val
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-110"
                        : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:scale-105"
                    }`}
                  >
                    {val}
                  </button>
                ))}
                <span className="text-xs text-gray-400 ml-1">Tinggi</span>
              </div>

              {isUnanswered && (
                <p className="text-xs text-red-500 mt-2 ml-11 flex items-center gap-1">
                  <AlertCircle size={12} /> Belum dinilai
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
