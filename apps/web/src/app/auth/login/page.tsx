"use client";

import { setSelection } from "@testing-library/user-event/dist/cjs/event/selection/setSelection.js";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setValidationErrors([]);

    const errors: string[] = [];

    if (!email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push("Enter a valid email");
    }

    if (!password) {
      errors.push("Password is required");
    } else if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
const response = await fetch("/api/auth/login", {
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
  setError(result.message ?? "Login failed");
  return;
 }

   window.location.href = "/";
}finally {
  setIsLoading(false);
}
}
    
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="relative min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.1),transparent_35%)]" />

        {/* LEFT — Brand / marketing */}
        <section className="relative hidden min-h-screen overflow-hidden border-r border-white/10 px-8 py-10 lg:flex lg:flex-col lg:justify-between xl:px-14">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />

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

          <div className="relative z-10 max-w-xl py-12">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.28em] text-blue-300/80">
              Communication Platform
            </p>

            <h2 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] xl:text-6xl">
              Communication,
              <span className="block bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                without limits.
              </span>
            </h2>

            <p className="mt-7 max-w-lg text-base leading-7 text-white/55 xl:text-lg">
              A modern communication space for teams, communities, and
              meaningful conversations.
            </p>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
              {[
                {
                  icon: "✦",
                  title: "Real-time",
                  text: "Instant conversations",
                },
                {
                  icon: "◈",
                  title: "Secure",
                  text: "Protected sessions",
                },
                {
                  icon: "◉",
                  title: "Connected",
                  text: "Stay in sync",
                },
                {
                  icon: "▣",
                  title: "Multi-platform",
                  text: "Web, mobile, desktop",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 backdrop-blur-xl"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-300">
                    {item.icon}
                  </div>

                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-8 text-sm text-white/40">
            <span>Better conversations</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>Brighter tomorrow</span>
          </div>
        </section>

        {/* RIGHT — Login */}
        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-[560px]">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-lg font-black shadow-[0_0_30px_rgba(99,102,241,0.35)]">
                C
              </div>

              <div>
                <p className="font-semibold">Chat Platform</p>
                <p className="text-xs text-white/40">
                  Communication · Together
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8 lg:p-10">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-blue-300/70">
                    Welcome back
                  </p>

                  <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                    Welcome back 👋
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-white/45 sm:text-base">
                    Sign in to continue to Chat Platform
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/65 transition-colors hover:bg-white/[0.08]"
                >
                  English
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-white/80"
                  >
                    Email
                  </label>

                  <div className="group rounded-2xl border border-white/10 bg-[#0b1223]/90 transition-all focus-within:border-blue-400/60 focus-within:ring-4 focus-within:ring-blue-500/10">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 sm:py-4"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-white/80"
                  >
                    Password
                  </label>

                  <div className="flex items-center rounded-2xl border border-white/10 bg-[#0b1223]/90 transition-all focus-within:border-blue-400/60 focus-within:ring-4 focus-within:ring-blue-500/10">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 sm:py-4"
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

                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/55">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 accent-blue-500"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
                  >
                    Forgot password?
                  </button>
                </div>

                {validationErrors.map((message) => (
                  <div
                    key={message}
                    role="alert"
                    className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  >
                    {message}
                  </div>
                ))}

                {error && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  aria-label={isLoading ? "Logging in..." : "Login"}
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 px-5 py-4 text-sm font-semibold shadow-[0_12px_35px_rgba(59,130,246,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {isLoading ? "Signing in..." : "Sign In →"}
                  </span>

                  <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/25">
                  Or continue with
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3.5 text-sm text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                >
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3.5 text-sm text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                >
                  Continue with Apple
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-white/40">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="font-semibold text-blue-300 transition-colors hover:text-blue-200"
                  >
                    Create account
                  </Link>
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/20">
                <span>Terms of Service</span>
                <span>Privacy Policy</span>
                <span>Help</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
