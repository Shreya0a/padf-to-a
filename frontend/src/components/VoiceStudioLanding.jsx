import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, ArrowRight, AudioLines, Download, Timer, Check, ChevronDown } from "lucide-react";
import PdfToAudioTool from "./PdfToAudioTool.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import HistoryModal from "./HistoryModal.jsx";

const VOICES = [
  { id: "en-GB-RyanNeural", name: "Ryan", tag: "male", desc: "Hello, I'm Ryan — calm, measured, and easy on the ear.", lang: "en-GB" },
  { id: "en-US-EricNeural", name: "Eric", tag: "male", desc: "Hello, I'm Eric — bright and clear, great for long documents.", lang: "en-US" },
  { id: "en-US-AriaNeural", name: "Aria", tag: "female", desc: "Hi, I'm Aria. A little more expressive, a little more warmth.", lang: "en-US" },
  { id: "en-IE-EmilyNeural", name: "Emily", tag: "female", desc: "Hello, I'm Emily — a pleasant Irish lilt for any text.", lang: "en-IE" },
  { id: "en-AU-NatashaNeural", name: "Natasha", tag: "female", desc: "Hello, I'm Natasha — a breezy Australian voice for casual reading.", lang: "en-AU" },
  { id: "en-GB-SoniaNeural", name: "Sonia", tag: "female", desc: "Good day, I'm Sonia. Crisp and precise, with a British lilt.", lang: "en-GB" },
  { id: "en-IN-NeerjaNeural", name: "Neerja", tag: "female", desc: "Hi, I'm Neerja — warm and natural, in Indian English.", lang: "en-IN" },
  { id: "en-US-MichelleNeural", name: "Michelle", tag: "female", desc: "Hi, I'm Michelle — warm, friendly, and easy to listen to.", lang: "en-US" },
  { id: "en-US-GuyNeural", name: "Guy", tag: "male", desc: "Hey there, I'm Guy — direct, steady, easy to follow.", lang: "en-US" },
  { id: "en-US-JennyNeural", name: "Jenny", tag: "female", desc: "Hi, I'm Jenny. I'll read your documents clearly and naturally.", lang: "en-US" },
  { id: "en-US-ChristopherNeural", name: "Christopher", tag: "male", desc: "I'm Christopher — deep, confident, built for narration.", lang: "en-US" },
  { id: "en-GB-LibbyNeural", name: "Libby", tag: "female", desc: "Hi, I'm Libby. Gentle and clear, perfect for stories and study notes.", lang: "en-GB" },
  { id: "en-CA-ClaraNeural", name: "Clara", tag: "female", desc: "Hi, I'm Clara — clear and friendly, with a Canadian accent.", lang: "en-CA" },
];

const FEATURES = [
  { icon: AudioLines, title: "Thirteen distinct voices", body: "Warm, neutral, crisp, calm — pick the tone that fits the text, not just a name from a list." },
  { icon: Download, title: "One-click MP3 export", body: "Every generated line saves as a clean MP3 file, ready to drop into an app, video, or podcast." },
  { icon: Timer, title: "Ready in seconds", body: "No render queues. Paste your text, choose a voice, and the audio is ready before you've switched tabs." },
];

const STEPS = [
  { num: "01", title: "Paste your text", body: "Drop in a script, a paragraph, or a whole document — whatever needs a voice." },
  { num: "02", title: "Choose a voice", body: "Preview any of the thirteen voices right in the browser until one feels right." },
  { num: "03", title: "Download the MP3", body: "Your audio renders instantly and downloads as a ready-to-use file." },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Try every voice before you commit.",
    features: ["3 voice previews a day", "Standard MP3 export", "Up to 500 characters per file", "Community support"],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    tagline: "For creators publishing regularly.",
    features: ["Unlimited voice previews", "High-fidelity MP3 export", "Up to 20,000 characters per file", "All thirteen voices, no limits", "Priority email support"],
    cta: "Start Pro trial",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$39",
    period: "/ month",
    tagline: "For teams shipping audio at scale.",
    features: ["Everything in Pro", "Batch exports", "Commercial usage rights", "Shared team workspace", "Dedicated support"],
    cta: "Start Studio trial",
    highlighted: false,
  },
];

const BASE = import.meta.env.VITE_API_URL || "";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(26px)",
        transition: "opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {children}
    </div>
  );
}

function HeroBars() {
  const heights = useMemo(() => Array.from({ length: 9 }, () => 30 + Math.random() * 40), []);
  return (
    <div className="flex items-center" style={{ gap: 5, height: 70 }}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="block"
          style={{
            width: 5,
            borderRadius: 3,
            background: "linear-gradient(180deg, #e8c98a, #d4a24e)",
            animation: `vs-pulse ${1.2 + Math.random() * 0.8}s ease-in-out ${i * 0.12}s infinite`,
            "--h": `${h}px`,
          }}
        />
      ))}
    </div>
  );
}

function MiniBars({ speaking }) {
  const heights = useMemo(() => Array.from({ length: 14 }, () => 8 + Math.random() * 16), []);
  return (
    <div className="flex items-end h-6 mt-4" style={{ gap: 3 }}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="rounded-sm"
          style={{
            width: 3,
            background: "#d4a24e",
            height: speaking ? undefined : "4px",
            opacity: speaking ? 1 : 0.35,
            animation: speaking ? `vs-minipulse .8s ease-in-out ${i * 0.05}s infinite` : "none",
            "--mh": `${h}px`,
          }}
        />
      ))}
    </div>
  );
}

function VoiceCard({ voice, isPlaying, onToggle }) {
  return (
    <div
      className="p-6 border transition-all duration-300"
      style={{
        borderRadius: 22,
        background: isPlaying ? "#161c38" : "#0e1226",
        borderColor: isPlaying ? "#d4a24e" : "rgba(212,162,78,0.12)",
        transform: isPlaying ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-serif text-lg" style={{ fontFamily: "Georgia, serif", color: "#f5f0e6" }}>
            {voice.name}
          </div>
          <div className="tracking-wide" style={{ fontFamily: "monospace", color: "#6b7392", fontSize: 11 }}>
            {voice.tag}
          </div>
        </div>
        <button
          onClick={onToggle}
          aria-label={`Play ${voice.name} sample`}
          className="rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105"
          style={{
            width: 42,
            height: 42,
            border: "1px solid rgba(212,162,78,0.4)",
            background: isPlaying ? "#d4a24e" : "transparent",
            color: isPlaying ? "#0e1226" : "#e8c98a",
          }}
        >
          {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </button>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "#8b93ad", minHeight: 42 }}>
        {voice.desc}
      </p>
      <MiniBars speaking={isPlaying} />
    </div>
  );
}

export default function VoiceStudioLanding() {
  const { user, logout } = useAuth();
  const [playingIndex, setPlayingIndex] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName =
    user?.name || (user?.email ? user.email.split("@")[0] : "");

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const toggleVoice = (index) => {
    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
      return;
    }

    audioRef.current?.pause();
    const v = VOICES[index];
    const audio = new Audio(`${BASE}/uploads/samples/${v.id}.mp3`);
    audio.onended = () => setPlayingIndex(null);
    audio.onerror = () => setPlayingIndex(null);
    audioRef.current = audio;
    audio.play().catch(() => setPlayingIndex(null));
    setPlayingIndex(index);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "#080b17",
        color: "#f5f0e6",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes vs-pulse { 0%,100%{ height:14px; opacity:.65;} 50%{ height:var(--h,48px); opacity:1;} }
        @keyframes vs-minipulse { 0%,100%{ height:4px;} 50%{ height:var(--mh,20px);} }
        @keyframes vs-spin { to { transform: rotate(360deg); } }
        .vs-footer-link:hover { color: #e8c98a; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      {/* NAV */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "rgba(8,11,23,0.72)", borderBottom: "1px solid rgba(212,162,78,0.12)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5 text-lg font-semibold" style={{ fontFamily: "Georgia, serif" }}>
            <span
              className="rounded-lg flex items-center justify-center"
              style={{ width: 26, height: 26, background: "linear-gradient(145deg, #e8c98a, #d4a24e)" }}
            >
              <AudioLines size={14} color="#0e1226" />
            </span>
            Voicestudio
          </div>
          <div className="hidden md:flex gap-8 text-sm" style={{ color: "#8b93ad" }}>
            <a href="#tool" className="hover:text-white transition-colors">PDF to audio</a>
            <a href="#voices" className="hover:text-white transition-colors">Voices</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-5">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors hover:opacity-80"
                  style={{ color: "#e8c98a", border: "1px solid rgba(212,162,78,0.25)" }}
                >
                  {displayName}
                  <ChevronDown
                    size={14}
                    style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}
                  />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden"
                    style={{
                      background: "#0e1226",
                      border: "1px solid rgba(212,162,78,0.15)",
                      borderRadius: 14,
                      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                      zIndex: 60,
                    }}
                  >
                    <button
                      onClick={() => {
                        setHistoryOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm transition-colors hover:opacity-80"
                      style={{ color: "#f5f0e6" }}
                    >
                      History
                    </button>
                    <div style={{ height: 1, background: "rgba(212,162,78,0.1)" }} />
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm transition-colors hover:opacity-80"
                      style={{ color: "#f2a7a7" }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a
                  href="#/login"
                  className="hidden sm:inline text-sm font-semibold transition-colors"
                  style={{ color: "#f5f0e6" }}
                >
                  Log in
                </a>
                <a
                  href="#/signup"
                  className="text-sm font-semibold px-5 py-2.5 rounded-full transition-transform hover:-translate-y-0.5"
                  style={{ background: "#d4a24e", color: "#080b17" }}
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-6xl mx-auto px-8 pt-24 pb-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="relative z-10">
          <span
            className="block text-xs uppercase mb-4"
            style={{ fontFamily: "monospace", color: "#d4a24e", letterSpacing: "0.14em" }}
          >
            Text to speech, thirteen voices deep
          </span>
          <h1
            className="text-4xl md:text-6xl font-semibold mb-6"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.01em", lineHeight: 1.06 }}
          >
            Give your words{" "}
            <em style={{ fontStyle: "italic", color: "#e8c98a" }}>a voice</em> worth listening to.
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#8b93ad", maxWidth: 460 }}>
            Turn any script into natural, downloadable audio. Thirteen assistant-grade voices, studio clarity, exported straight to MP3 — no recording booth required.
          </p>
          <div className="flex items-center gap-5 flex-wrap">
            <a
              href="#voices"
              className="inline-flex items-center gap-2.5 text-sm font-bold px-7 py-4 rounded-full transition-transform hover:-translate-y-0.5"
              style={{ background: "#d4a24e", color: "#080b17" }}
            >
              Hear the voices <ArrowRight size={14} />
            </a>
            <a
              href="#how"
              className="text-sm font-semibold py-4 border-b transition-colors"
              style={{ borderColor: "rgba(245,240,230,0.25)", color: "#f5f0e6" }}
            >
              How it works
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-center" style={{ height: 380 }}>
          <div
            className="absolute rounded-full"
            style={{ width: 340, height: 340, border: "1px solid rgba(212,162,78,0.18)", animation: "vs-spin 40s linear infinite" }}
          />
          <div
            className="absolute rounded-full"
            style={{ width: 410, height: 410, border: "1px solid rgba(212,162,78,0.10)", animation: "vs-spin 60s linear infinite reverse" }}
          />
          <div
            className="relative rounded-full flex items-center justify-center"
            style={{
              width: 210,
              height: 210,
              background: "radial-gradient(circle at 35% 30%, #1c2445, #0e1226 70%)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), 0 0 60px rgba(212,162,78,0.12)",
            }}
          >
            <HeroBars />
          </div>
        </div>
      </section>

      {/* PDF TO AUDIO */}
      <section id="tool" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <Reveal className="max-w-xl mb-14">
            <span className="block text-xs uppercase mb-3" style={{ fontFamily: "monospace", color: "#d4a24e", letterSpacing: "0.14em" }}>
              PDF to audio
            </span>
            <h2 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Turn any PDF into speech.
            </h2>
            <p className="text-base" style={{ color: "#8b93ad" }}>
              Upload a document, pick a neural voice, and get an MP3 you can listen to anywhere.
            </p>
          </Reveal>
          <Reveal className="max-w-xl mx-auto">
            <PdfToAudioTool />
          </Reveal>
        </div>
      </section>

      {/* VOICES */}
      <section id="voices" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <Reveal className="max-w-xl mb-14">
            <span className="block text-xs uppercase mb-3" style={{ fontFamily: "monospace", color: "#d4a24e", letterSpacing: "0.14em" }}>
              Sample the voices
            </span>
            <h2 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Thirteen voices. Press play, judge for yourself.
            </h2>
            <p className="text-base" style={{ color: "#8b93ad" }}>
              Every card below actually speaks — click a voice to hear a short line read aloud.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VOICES.map((v, i) => (
              <VoiceCard key={v.name} voice={v} isPlaying={playingIndex === i} onToggle={() => toggleVoice(i)} />
            ))}
          </div>
          <p className="text-center text-xs mt-11" style={{ fontFamily: "monospace", color: "#6b7392" }}>
            Previews play the actual neural MP3s from the sample library.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <Reveal className="max-w-xl mb-14">
            <span className="block text-xs uppercase mb-3" style={{ fontFamily: "monospace", color: "#d4a24e", letterSpacing: "0.14em" }}>
              What you get
            </span>
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
              Built for people who'd rather listen than read.
            </h2>
          </Reveal>

          <Reveal>
            <div
              className="grid grid-cols-1 md:grid-cols-3 overflow-hidden"
              style={{ background: "rgba(212,162,78,0.12)", gap: 2, borderRadius: 22 }}
            >
              {FEATURES.map((f) => (
                <div key={f.title} className="p-9" style={{ background: "#080b17" }}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: "#0e1226", border: "1px solid rgba(212,162,78,0.2)" }}
                  >
                    <f.icon size={20} color="#e8c98a" />
                  </div>
                  <h3 className="text-lg mb-2.5" style={{ fontFamily: "Georgia, serif" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#8b93ad" }}>{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <Reveal className="max-w-xl mb-14">
            <span className="block text-xs uppercase mb-3" style={{ fontFamily: "monospace", color: "#d4a24e", letterSpacing: "0.14em" }}>
              Plans
            </span>
            <h2 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Start free. Upgrade when you outgrow it.
            </h2>
            <p className="text-base" style={{ color: "#8b93ad" }}>
              Every plan includes all thirteen voices — the difference is how much you can export.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="p-8 flex flex-col"
                style={{
                  borderRadius: 22,
                  background: plan.highlighted ? "#161c38" : "#0e1226",
                  border: plan.highlighted ? "1px solid #d4a24e" : "1px solid rgba(212,162,78,0.12)",
                  boxShadow: plan.highlighted ? "0 20px 50px rgba(212,162,78,0.14)" : "none",
                  position: "relative",
                }}
              >
                {plan.highlighted && (
                  <span
                    className="absolute uppercase font-semibold"
                    style={{
                      top: -12,
                      left: 28,
                      fontFamily: "monospace",
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      background: "#d4a24e",
                      color: "#080b17",
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    Most popular
                  </span>
                )}

                <h3 className="text-xl mb-1" style={{ fontFamily: "Georgia, serif" }}>{plan.name}</h3>
                <p className="text-sm mb-6" style={{ color: "#8b93ad" }}>{plan.tagline}</p>

                <div className="flex items-baseline gap-1.5 mb-7">
                  <span className="text-4xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: "#6b7392" }}>{plan.period}</span>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#c9cbdb" }}>
                      <Check size={16} color="#d4a24e" style={{ marginTop: 2, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#/signup"
                  className="text-center text-sm font-bold py-3.5 rounded-full transition-transform hover:-translate-y-0.5"
                  style={
                    plan.highlighted
                      ? { background: "#d4a24e", color: "#080b17" }
                      : { background: "transparent", color: "#f5f0e6", border: "1px solid rgba(245,240,230,0.25)" }
                  }
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section id="how" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <Reveal className="max-w-xl mb-14">
            <span className="block text-xs uppercase mb-3" style={{ fontFamily: "monospace", color: "#d4a24e", letterSpacing: "0.14em" }}>
              Three steps
            </span>
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
              From text to audio, start to finish.
            </h2>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {STEPS.map((s) => (
                <div key={s.num} className="relative pt-2">
                  <span className="block text-sm mb-4" style={{ fontFamily: "monospace", color: "#d4a24e" }}>{s.num}</span>
                  <h3 className="text-xl mb-2.5" style={{ fontFamily: "Georgia, serif" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#8b93ad" }}>{s.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8">
        <Reveal className="max-w-6xl mx-auto px-8">
          <div
            className="relative overflow-hidden px-10 py-16 text-center"
            style={{ background: "#0e1226", border: "1px solid rgba(212,162,78,0.15)", borderRadius: 28 }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(212,162,78,0.12), transparent 60%)" }}
            />
            <h2 className="relative text-3xl md:text-4xl mb-4" style={{ fontFamily: "Georgia, serif" }}>
              Ready to hear your words out loud?
            </h2>
            <p className="relative mb-8" style={{ color: "#8b93ad" }}>
              Thirteen voices are waiting. No sign-up required to try one.
            </p>
            <a
              href="#voices"
              className="relative inline-flex items-center gap-2.5 text-sm font-bold px-7 py-4 rounded-full transition-transform hover:-translate-y-0.5"
              style={{ background: "#d4a24e", color: "#080b17" }}
            >
              Hear the voices <ArrowRight size={14} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-8 py-12 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5 text-base font-semibold" style={{ fontFamily: "Georgia, serif" }}>
          <span
            className="rounded-lg flex items-center justify-center"
            style={{ width: 26, height: 26, background: "linear-gradient(145deg, #e8c98a, #d4a24e)" }}
          >
            <AudioLines size={14} color="#0e1226" />
          </span>
          Voicestudio
        </div>
        <div className="flex gap-6 text-sm" style={{ color: "#6b7392" }}>
          <a href="#tool" className="vs-footer-link transition-colors">PDF to audio</a>
          <a href="#voices" className="vs-footer-link transition-colors">Voices</a>
          <a href="#features" className="vs-footer-link transition-colors">Features</a>
          <a href="#pricing" className="vs-footer-link transition-colors">Pricing</a>
          <a href="#how" className="vs-footer-link transition-colors">How it works</a>
          <a href="#/login" className="vs-footer-link transition-colors">Log in</a>
        </div>
      </footer>

      <HistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
