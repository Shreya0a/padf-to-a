import React, { useEffect, useState } from "react";
import api from "../api.js";

const BASE = import.meta.env.VITE_API_URL || "";

const statusStyle = (s) =>
  ({
    completed: { color: "#7fdca2", background: "rgba(127,220,162,0.12)", border: "1px solid rgba(127,220,162,0.3)" },
    failed: { color: "#f2a7a7", background: "rgba(242,167,167,0.08)", border: "1px solid rgba(242,167,167,0.25)" },
    processing: { color: "#e8c98a", background: "rgba(232,201,138,0.1)", border: "1px solid rgba(232,201,138,0.3)" },
  })[s] || { color: "#8b93ad", background: "rgba(139,147,173,0.1)", border: "1px solid rgba(139,147,173,0.25)" };

export default function HistoryModal({ open, onClose }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    api
      .get("/api/history")
      .then((res) => setJobs(res.data))
      .catch(() => setError("Couldn't load history"))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(6,9,18,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg p-8 relative max-h-[80vh] overflow-y-auto"
        style={{ background: "#0e1226", border: "1px solid rgba(212,162,78,0.15)", borderRadius: 22 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 hover:opacity-80 transition-opacity"
          style={{ color: "#6b7392" }}
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="text-2xl mb-6" style={{ fontFamily: "Georgia, serif" }}>
          Conversion history
        </h3>

        {loading && (
          <p className="text-sm" style={{ fontFamily: "monospace", color: "#6b7392" }}>
            Loading…
          </p>
        )}

        {error && (
          <p
            className="text-xs px-3 py-2 rounded-lg"
            style={{
              color: "#f2a7a7",
              background: "rgba(242,167,167,0.08)",
              border: "1px solid rgba(242,167,167,0.25)",
            }}
          >
            {error}
          </p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <p className="text-sm" style={{ color: "#6b7392" }}>
            No conversions yet.
          </p>
        )}

        <ul className="divide-y" style={{ borderTop: "1px solid rgba(212,162,78,0.1)" }}>
          {jobs.map((job) => (
            <li
              key={job._id}
              className="py-4 flex items-center justify-between gap-4"
              style={{ borderBottom: "1px solid rgba(212,162,78,0.1)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#f5f0e6" }}>
                  {job.inputFileName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7392" }}>
                  {new Date(job.createdAt).toLocaleString()}
                </p>
                {job.errorMessage && (
                  <p className="text-xs mt-1" style={{ color: "#f2a7a7" }}>
                    {job.errorMessage}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {job.status === "completed" && job.outputUrl && (
                  <a
                    href={`${BASE}${job.outputUrl}`}
                    download
                    className="text-xs hover:opacity-80 transition-opacity"
                    style={{ color: "#e8c98a" }}
                  >
                    Download
                  </a>
                )}
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ ...statusStyle(job.status) }}
                >
                  {job.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
