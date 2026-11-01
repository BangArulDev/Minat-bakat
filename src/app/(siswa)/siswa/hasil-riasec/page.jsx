"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import RiasecStudentReport from "@/components/riasec/RiasecStudentReport";
import { getSiswaLatestResult } from "@/app/actions/riasec";
import { getSiswaReportIdentity } from "@/app/actions/siswa-report";

export default function HasilRiasecPage() {
  const [resultData, setResultData] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResults = async () => {
    setLoading(true);
    setError("");
    try {
      const [resultResponse, identityResponse] = await Promise.all([
        getSiswaLatestResult(),
        getSiswaReportIdentity(),
      ]);

      if (!identityResponse?.success || !identityResponse.data) {
        throw new Error(
          identityResponse?.error || "Identitas peserta tidak ditemukan."
        );
      }

      setIdentity(identityResponse.data);

      if (!resultResponse?.success || !resultResponse.data) {
        throw new Error(
          resultResponse?.error || "Hasil asesmen belum tersedia di database."
        );
      }

      setResultData(resultResponse.data);
    } catch (err) {
      console.error("Load RIASEC result:", err);
      setResultData(null);
      setError(err.message || "Gagal mengambil hasil asesmen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [resultResponse, identityResponse] = await Promise.all([
          getSiswaLatestResult(),
          getSiswaReportIdentity(),
        ]);
        if (!active) return;
        if (identityResponse?.success && identityResponse.data) {
          setIdentity(identityResponse.data);
        }
        if (resultResponse?.success && resultResponse.data) {
          setResultData(resultResponse.data);
        } else {
          setError(resultResponse?.error || "Hasil asesmen belum tersedia di database.");
        }
      } catch (err) {
        if (active) setError(err.message || "Gagal mengambil hasil asesmen.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center gap-3 text-gray-500">
        <RefreshCw className="animate-spin text-blue-600" size={28} />
        <span>Memuat hasil asesmen...</span>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xs my-10">
        <AlertCircle size={36} className="mx-auto mb-3 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">
          Hasil Asesmen Belum Tersedia
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {error || "Data hasil tes tidak ditemukan."}
        </p>
        <button
          type="button"
          onClick={loadResults}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <RiasecStudentReport
      identity={identity}
      rawScores={resultData.rawScores}
      date={resultData.createdAt || resultData.date}
      dominantCode={resultData.dominantCode}
      consistency={resultData.consistency}
      title="Hasil Tes RIASEC"
      subtitle="Hasil analisis minat karier berdasarkan teori Holland."
    />
  );
}
