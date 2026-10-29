"use client";
import { Signal, SignalMedium, SignalLow } from "lucide-react";

const NODES = [
  { letter: "R", x: 50, y: 9, fill: "fill-green-100", text: "fill-green-800" },
  { letter: "I", x: 85.5, y: 29.5, fill: "fill-blue-100", text: "fill-blue-800" },
  { letter: "A", x: 85.5, y: 70.5, fill: "fill-violet-100", text: "fill-violet-800" },
  { letter: "S", x: 50, y: 91, fill: "fill-pink-100", text: "fill-pink-800" },
  { letter: "E", x: 14.5, y: 70.5, fill: "fill-orange-100", text: "fill-orange-800" },
  { letter: "C", x: 14.5, y: 29.5, fill: "fill-amber-100", text: "fill-amber-800" },
];

const POS = Object.fromEntries(NODES.map((n) => [n.letter, n]));

const RING = ["R-I", "I-A", "A-S", "S-E", "E-C", "C-R"];
const CROSS = ["R-A", "I-S", "A-E", "S-C", "E-R", "C-I"];

const TONES = {
  green: {
    badge: "bg-green-100 text-green-600",
    title: "text-green-600",
    chip: "border-green-200 bg-green-50 text-green-700",
    line: "stroke-green-400",
  },
  blue: {
    badge: "bg-blue-100 text-blue-600",
    title: "text-blue-600",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    line: "stroke-blue-400",
  },
  red: {
    badge: "bg-red-100 text-red-600",
    title: "text-red-600",
    chip: "border-red-200 bg-red-50 text-red-700",
    line: "stroke-red-400",
  },
};

const levels = [
  {
    title: "Konsistensi Tinggi",
    icon: Signal,
    tone: "green",
    solid: RING,
    cross: false,
    desc: "Tipe yang berdekatan dalam heksagon. Menunjukkan minat yang saling mendukung dan lebih stabil.",
    combos: "RI, IA, AS, SE, EC, CR",
  },
  {
    title: "Konsistensi Sedang",
    icon: SignalMedium,
    tone: "blue",
    solid: CROSS,
    cross: true,
    desc: "Tipe yang berjarak satu langkah. Masih cocok selaras, tetapi tidak sekuat tipe berdekatan.",
    combos: "RA, IS, AE, SC, ER, CI",
  },
  {
    title: "Konsistensi Rendah",
    icon: SignalLow,
    tone: "red",
    solid: [],
    cross: true,
    desc: "Tipe yang saling berlawanan. Menunjukkan minat yang cenderung kurang selaras.",
    combos: "RS, IE, AC",
  },
];

function Hexa({ solid, cross, line }) {
  return (
    <svg viewBox="0 0 100 100" className="w-28 shrink-0" aria-hidden="true">
      {[...RING, ...(cross ? CROSS : [])].map((e) => {
        const [a, b] = e.split("-").map((l) => POS[l]);
        const on = solid.includes(e);
        return (
          <line
            key={e}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={on ? undefined : "2.5 3.5"}
            className={on ? line : "stroke-slate-300"}
          />
        );
      })}
      {NODES.map((n) => (
        <g key={n.letter}>
          <circle cx={n.x} cy={n.y} r="11" strokeWidth="3.5" className={`${n.fill} stroke-white`} />
          <text
            x={n.x}
            y={n.y + 3.6}
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            className={n.text}
          >
            {n.letter}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Features() {
  return (
    <section id="konsistensi-holland" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">
        <p className="inline-block rounded-full bg-[#6d5cff]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#6d5cff]">
          POLA HUBUNGAN TIPE
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141b3d] sm:text-4xl">
          Konsistensi Holland Code
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">
          Enam tipe RIASEC membentuk heksagon dengan tingkat kedekatan yang menunjukkan seberapa
          selaras kombinasi minatmu.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {levels.map((l) => {
            const tone = TONES[l.tone];
            return (
              <div key={l.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-left shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className={`rounded-full p-2 ${tone.badge}`}>
                    <l.icon size={18} />
                  </span>
                  <h3 className={`text-base font-extrabold ${tone.title}`}>{l.title}</h3>
                </div>

                <div className="mt-4 flex items-start gap-4">
                  <Hexa solid={l.solid} cross={l.cross} line={tone.line} />
                  <div>
                    <p className="text-[13px] leading-relaxed text-slate-600">{l.desc}</p>
                    <p className={`mt-3 rounded-xl border px-3 py-2 text-xs ${tone.chip}`}>
                      <span className="block text-[11px] text-slate-500">Contoh kombinasi:</span>
                      {l.combos}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}