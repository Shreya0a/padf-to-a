import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, AudioLines, Check, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Field({ label, type, value, onChange, placeholder, error, rightSlot }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium mb-2" style={{ color: "#c9cbdb" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full text-sm outline-none transition-colors"
          style={{
            background: "#0e1226",
            border: `1px solid ${error ? "#e26b6b" : "rgba(212,162,78,0.18)"}`,
            borderRadius: 12,
            padding: "13px 16px",
            color: "#f5f0e6",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#d4a24e")}
          onBlur={(e) => (e.target.style.borderColor = error ? "#e26b6b" : "rgba(212,162,78,0.18)")}
        />
        {rightSlot && (
          <div className="absolute" style={{ right: 14, top: "50%", transform: "translateY(-50%)" }}>
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs mt-1.5" style={{ color: "#e26b6b" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function AuthPage({ mode: initialMode = "signin" }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const [fields, setFields] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const update = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (mode === "signup" && !fields.name.trim()) next.name = "Enter your name.";
    if (!fields.email.trim()) next.email = "Enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(fields.email)) next.email = "That email doesn't look right.";
    if (!fields.password) next.password = "Enter a password.";
    else if (mode === "signup" && fields.password.length < 8) next.password = "Use at least 8 characters.";
    if (mode === "signup" && fields.confirm !== fields.password) next.confirm = "Passwords don't match.";
    if (mode === "signup" && !agreed) next.agreed = "You need to accept the terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setBusy(true);
    setFormError(null);
    try {
      if (mode === "signin") {
        await login(fields.email.trim(), fields.password);
      } else {
        await register({
          name: fields.name.trim(),
          email: fields.email.trim(),
          password: fields.password,
        });
      }
      setSubmitted(true);
    } catch (err) {
      setFormError(
        err.response?.data?.error || (mode === "signin" ? "Login failed" : "Sign up failed")
      );
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setSubmitted(false);
    setFormError(null);
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: "#080b17", color: "#f5f0e6", fontFamily: "'Manrope', system-ui, sans-serif" }}
      >
        <div className="text-center max-w-sm">
          <div
            className="mx-auto flex items-center justify-center mb-6"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(212,162,78,0.12)",
              border: "1px solid rgba(212,162,78,0.3)",
            }}
          >
            <Check size={24} color="#d4a24e" />
          </div>
          <h1 className="text-2xl mb-2" style={{ fontFamily: "Georgia, serif" }}>
            {mode === "signup" ? "Account created" : "Welcome back"}
          </h1>
          <p className="text-sm mb-8" style={{ color: "#8b93ad" }}>
            {mode === "signup"
              ? `We've sent a confirmation link to ${fields.email}.`
              : "You're signed in."}
          </p>
          <a
            href="#/"
            className="inline-block text-sm font-semibold px-6 py-3 rounded-full transition-transform hover:-translate-y-0.5"
            style={{ background: "#d4a24e", color: "#080b17" }}
          >
            Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-12"
      style={{ background: "#080b17", color: "#f5f0e6", fontFamily: "'Manrope', system-ui, sans-serif" }}
    >
      <div className="w-full" style={{ maxWidth: 420 }}>
        {/* Back to home */}
        <a
          href="#/"
          className="inline-flex items-center gap-2 text-xs mb-8 transition-colors hover:opacity-80"
          style={{ color: "#8b93ad", fontFamily: "monospace" }}
        >
          <ArrowLeft size={13} /> Back to Voicestudio
        </a>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <span
            className="rounded-lg flex items-center justify-center"
            style={{ width: 26, height: 26, background: "linear-gradient(145deg, #e8c98a, #d4a24e)" }}
          >
            <AudioLines size={14} color="#0e1226" />
          </span>
          <span className="text-lg font-semibold" style={{ fontFamily: "Georgia, serif" }}>
            Voicestudio
          </span>
        </div>

        <div
          className="p-8"
          style={{ background: "#0e1226", border: "1px solid rgba(212,162,78,0.12)", borderRadius: 22 }}
        >
          {/* Tabs */}
          <div className="flex mb-8" style={{ background: "#080b17", borderRadius: 12, padding: 4 }}>
            <button
              onClick={() => switchMode("signin")}
              className="flex-1 text-sm font-semibold py-2.5 transition-colors"
              style={{
                borderRadius: 9,
                background: mode === "signin" ? "#d4a24e" : "transparent",
                color: mode === "signin" ? "#080b17" : "#8b93ad",
              }}
            >
              Log in
            </button>
            <button
              onClick={() => switchMode("signup")}
              className="flex-1 text-sm font-semibold py-2.5 transition-colors"
              style={{
                borderRadius: 9,
                background: mode === "signup" ? "#d4a24e" : "transparent",
                color: mode === "signup" ? "#080b17" : "#8b93ad",
              }}
            >
              Sign up
            </button>
          </div>

          <h1 className="text-2xl mb-2" style={{ fontFamily: "Georgia, serif" }}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm mb-7" style={{ color: "#8b93ad" }}>
            {mode === "signin"
              ? "Log in to keep working with your voices."
              : "Six voices, free to try, no card required."}
          </p>

          {mode === "signup" && (
            <Field
              label="Name"
              type="text"
              value={fields.name}
              onChange={update("name")}
              placeholder="Your name"
              error={errors.name}
            />
          )}

          <Field
            label="Email"
            type="email"
            value={fields.email}
            onChange={update("email")}
            placeholder="you@example.com"
            error={errors.email}
          />

          <Field
            label="Password"
            type={showPassword ? "text" : "password"}
            value={fields.password}
            onChange={update("password")}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            error={errors.password}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{ color: "#6b7392", display: "flex" }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />

          {mode === "signup" && (
            <Field
              label="Confirm password"
              type={showConfirm ? "text" : "password"}
              value={fields.confirm}
              onChange={update("confirm")}
              placeholder="Type your password again"
              error={errors.confirm}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  style={{ color: "#6b7392", display: "flex" }}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />
          )}

          {mode === "signin" ? (
            <div className="flex justify-end mb-6" style={{ marginTop: -8 }}>
              <a href="#forgot" className="text-xs font-medium transition-colors" style={{ color: "#8b93ad" }}>
                Forgot password?
              </a>
            </div>
          ) : (
            <div className="mb-6" style={{ marginTop: -4 }}>
              <label className="flex items-start gap-2.5 text-xs cursor-pointer" style={{ color: "#8b93ad" }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#d4a24e" }}
                />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>
              {errors.agreed && (
                <p className="text-xs mt-1.5" style={{ color: "#e26b6b" }}>
                  {errors.agreed}
                </p>
              )}
            </div>
          )}

          {formError && (
            <p
              className="text-xs px-3 py-2 rounded-lg mb-4"
              style={{
                color: "#e26b6b",
                background: "rgba(226,107,107,0.08)",
                border: "1px solid rgba(226,107,107,0.25)",
              }}
            >
              {formError}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3.5 rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ background: "#d4a24e", color: "#080b17" }}
          >
            {busy ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {mode === "signin" ? "Logging in…" : "Creating…"}
              </>
            ) : (
              <>
                {mode === "signin" ? "Log in" : "Create account"}
                <ArrowRight size={14} />
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-6">
            <div style={{ flex: 1, height: 1, background: "rgba(245,240,230,0.1)" }} />
            <span className="text-xs" style={{ color: "#6b7392" }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(245,240,230,0.1)" }} />
          </div>

          <button
            className="w-full flex items-center justify-center gap-2.5 text-sm font-semibold py-3.5 transition-colors"
            style={{
              background: "transparent",
              border: "1px solid rgba(245,240,230,0.16)",
              borderRadius: 999,
              color: "#f5f0e6",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 10.8v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.9 14.7 3 12 3 6.98 3 3 6.9 3 12s3.98 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.06-1-.14-1.5H12z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm mt-7" style={{ color: "#8b93ad" }}>
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="font-semibold"
                style={{ color: "#e8c98a" }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => switchMode("signin")}
                className="font-semibold"
                style={{ color: "#e8c98a" }}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
