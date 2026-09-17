"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setValidationErrors([]);

    const errors: string[] = [];

    if (!email.trim()) {
      errors.push("Email is required");
    }

    if (!password) {
      errors.push("Password is required");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Signup failed");
        return;
      }

      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="relative min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.1),transparent_35%)]" />

        {/* ============================================================
            LEFT BRANDING
            ============================================================ */}
        <section className="relative hidden min-h-screen overflow-hidden border-r border-white/10 px-8 py-10 lg:flex lg:flex-col lg:justify-between xl:px-14">
          {/* Ambient glow */}
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-black shadow-[0_0_35px_rgba(99,102,241,0.4)]">
                C
              </div>

              <div>
                <p className="text-lg font-semibold tracking-tight">
                  Chat Platform
                </p>
                <p className="text-sm text-white/45">
                  Connect · Chat · Share · Together
                </p>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="relative z-10 max-w-xl py-12">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.28em] text-blue-300/80">
              Communication Platform
            </p>

            <h2 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] xl:text-6xl">
              Communication,
              <span className="block bg-gradient-to-r from-blue-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                without limits.
              </span>
            </h2>

            <p className="mt-7 max-w-lg text-base leading-7 text-white/50">
              Create your account and connect with teams, communities, and
              meaningful conversations in one modern communication space.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-300">
                  ✦
                </div>

                <p className="text-sm font-semibold">Real-time</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Instant conversations
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-300">
                  ◇
                </div>

                <p className="text-sm font-semibold">Secure</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Protected sessions
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-300">
                  ◉
                </div>

                <p className="text-sm font-semibold">Connected</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Stay in sync
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-300">
                  ▣
                </div>

                <p className="text-sm font-semibold">Multi-platform</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Web, mobile, desktop
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center gap-4 text-xs text-white/30">
            <span>Better conversations</span>
            <span>•</span>
            <span>Brighter tomorrow</span>
          </div>
        </section>

        {/* ============================================================
            RIGHT SIGNUP
            ============================================================ */}
        <section className="relative flex min-h-screen items-start justify-center px-5 pt-24 pb-8 sm:px-8 lg:items-center lg:py-8 lg:px-10 xl:px-16">
          {/* Mobile logo */}
          <div className="absolute left-6 top-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 font-black shadow-[0_0_25px_rgba(99,102,241,0.35)]">
              C
            </div>

            <div>
              <p className="text-sm font-semibold">Chat Platform</p>
              <p className="text-xs text-white/40">Communication</p>
            </div>
          </div>

          {/* Signup card */}
          <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8 lg:max-w-[580px]">
            {/* Card header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-blue-300/75">
                  Get started
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Create your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/45">
                  Join Chat Platform and start connecting with your people.
                </p>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                English
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white/75"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-blue-400/40 focus:bg-black/30 focus:ring-4 focus:ring-blue-500/10 sm:py-4"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white/75"
                >
                  Password
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-black/20 transition-all focus-within:border-blue-400/40 focus-within:ring-4 focus-within:ring-blue-500/10">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 sm:py-4"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide" : "Show"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="mr-2 rounded-xl px-3 py-2 text-sm text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/80"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-white/75"
                >
                  Confirm Password
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-black/20 transition-all focus-within:border-blue-400/40 focus-within:ring-4 focus-within:ring-blue-500/10">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 sm:py-4"
                  />

                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide" : "Show"}
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="mr-2 rounded-xl px-3 py-2 text-sm text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/80"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Validation errors */}
              {validationErrors.length > 0 && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-400/15 bg-red-500/10 px-4 py-3"
                >
                  {validationErrors.map((message) => (
                    <p
                      key={message}
                      className="text-sm leading-6 text-red-200/90"
                    >
                      {message}
                    </p>
                  ))}
                </div>
              )}

              {/* API error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-400/15 bg-red-500/10 px-4 py-3"
                >
                  <p className="text-sm leading-6 text-red-200/90">
                    {error}
                  </p>
                </div>
              )}

              {/* Create account */}
              <button
                type="submit"
                disabled={isLoading}
                aria-label={
                  isLoading ? "Creating Account..." : "Create Account"
                }
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(59,130,246,0.22)] transition-all hover:scale-[1.01] hover:shadow-[0_16px_40px_rgba(99,102,241,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isLoading ? "Creating Account..." : "Create Account →"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/25">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3.5 text-sm text-white/65 transition-all hover:bg-white/[0.07] hover:text-white"
              >
                Continue with Google
              </button>

              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3.5 text-sm text-white/65 transition-all hover:bg-white/[0.07] hover:text-white"
              >
                Continue with Apple
              </button>
            </div>

            {/* Login link */}
            <p className="mt-7 text-center text-sm text-white/40">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-300 transition-colors hover:text-blue-200"
              >
                Sign in
              </Link>
            </p>

            {/* Footer */}
            <div className="mt-7 flex justify-center gap-5 text-[11px] text-white/20">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>Help</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}