import React, { useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, Download, Check } from "lucide-react";
import api from "../api.js";

const BASE = import.meta.env.VITE_API_URL || "";

export default function PdfToAudioTool() {
  const [file, setFile] = useState(null);
  const [voices, setVoices] = useState([]);
  const [serverVoice, setServerVoice] = useState("en-US-JennyNeural");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api
      .get("/api/voices")
      .then((res) => {
        const list = res.data.voices || [];
        setVoices(list);
        if (list.length) setServerVoice(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleConvert = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    setDone(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("voice", serverVoice);

    try {
      const res = await api.post("/api/convert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAudioUrl(res.data.audioUrl || null);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDone(false);
    setAudioUrl(null);
    setError(null);
  };

  return (
    <div
      className="p-7 border transition-all duration-300"
      style={{
        borderRadius: 22,
        background: "#0e1226",
        borderColor: done ? "rgba(212,162,78,0.5)" : "rgba(212,162,78,0.12)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          setFile(e.target.files[0]);
          setDone(false);
          setAudioUrl(null);
          setError(null);
        }}
      />

      {!file && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) {
              setFile(dropped);
              setDone(false);
              setAudioUrl(null);
              setError(null);
            }
          }}
          className="rounded-2xl border border-dashed cursor-pointer hover:border-[#d4a24e] transition-colors flex flex-col items-center justify-center gap-4 py-14 text-center px-6"
          style={{ borderColor: "rgba(212,162,78,0.25)", background: "#0b0f1f" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(212,162,78,0.12)", border: "1px solid rgba(212,162,78,0.2)" }}
          >
            <UploadCloud size={24} color="#e8c98a" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#f5f0e6" }}>
              Drag &amp; drop your PDF here, or browse
            </p>
            <p className="text-xs" style={{ fontFamily: "monospace", color: "#6b7392" }}>
              up to 10MB · .pdf
            </p>
          </div>
        </div>
      )}

      {file && !done && (
        <div>
          <div
            className="rounded-2xl border flex items-center gap-4 px-5 py-4"
            style={{ borderColor: "rgba(212,162,78,0.2)", background: "#0b0f1f" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(212,162,78,0.12)", border: "1px solid rgba(212,162,78,0.2)" }}
            >
              <FileText size={20} color="#e8c98a" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: "#f5f0e6" }}>
                {file.name}
              </p>
              <p className="text-xs" style={{ fontFamily: "monospace", color: "#6b7392" }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={reset}
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ fontFamily: "monospace", color: "#6b7392" }}
            >
              remove
            </button>
          </div>

          <label
            className="block text-[11px] uppercase mb-2 mt-6"
            style={{ fontFamily: "monospace", color: "#d4a24e", letterSpacing: "0.12em" }}
          >
            Voice
          </label>
          <select
            value={serverVoice}
            onChange={(e) => setServerVoice(e.target.value)}
            className="w-full px-4 py-3 rounded-xl outline-none cursor-pointer"
            style={{
              background: "#0b0f1f",
              border: "1px solid rgba(212,162,78,0.25)",
              color: "#f5f0e6",
              fontSize: 14,
            }}
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full mt-6 inline-flex items-center justify-center gap-2.5 text-sm font-bold px-7 py-4 rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ background: "#d4a24e", color: "#080b17" }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Converting…
              </>
            ) : (
              "Convert to audio"
            )}
          </button>
        </div>
      )}

      {done && (
        <div>
          <div
            className="rounded-2xl border flex items-center gap-4 px-5 py-4"
            style={{ borderColor: "rgba(212,162,78,0.25)", background: "#0b0f1f" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(212,162,78,0.12)", border: "1px solid rgba(212,162,78,0.2)" }}
            >
              <Check size={20} color="#e8c98a" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: "#f5f0e6" }}>
                {file.name}
              </p>
              <p className="text-xs" style={{ fontFamily: "monospace", color: "#6b7392" }}>
                ready · MP3
              </p>
            </div>
            <button
              onClick={reset}
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ fontFamily: "monospace", color: "#6b7392" }}
            >
              new file
            </button>
          </div>

          <audio controls src={`${BASE}${audioUrl}`} className="w-full mt-6" />

          <a
            href={`${BASE}${audioUrl}`}
            download
            className="w-full mt-4 inline-flex items-center justify-center gap-2.5 text-sm font-bold px-7 py-4 rounded-full transition-transform hover:-translate-y-0.5"
            style={{ border: "1px solid rgba(212,162,78,0.4)", color: "#e8c98a" }}
          >
            <Download size={15} /> Download MP3
          </a>
        </div>
      )}

      {error && (
        <p
          className="mt-4 text-xs px-3 py-2 rounded-lg"
          style={{ color: "#f2a7a7", background: "rgba(242,167,167,0.08)", border: "1px solid rgba(242,167,167,0.25)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
