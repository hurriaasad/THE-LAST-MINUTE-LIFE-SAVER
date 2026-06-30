import React, { useState } from "react";
import { Shield, Fingerprint, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface AuthScreensProps {
  onLoginSuccess: (username: string, email: string, biometricLinked: boolean) => void;
  currentUsername: string;
}

export default function AuthScreens({ onLoginSuccess, currentUsername }: AuthScreensProps) {
  const [screen, setScreen] = useState<"login" | "signup" | "forgot">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityKey, setSecurityKey] = useState(""); // used for E2E encryption
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Biometric login simulator
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save credentials for E2E encryption password matching
      localStorage.setItem("life_saver_sec_key", password); // Use password to derive encryption keys
      onLoginSuccess(data.username, data.email, data.hasBiometrics);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setError(null);

    const generatedEmail = `${username.toLowerCase().trim()}@example.com`;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email: generatedEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setInfo("Account created successfully! Logging you into your secure workspace...");
      setTimeout(() => {
        localStorage.setItem("life_saver_sec_key", password);
        onLoginSuccess(data.username, generatedEmail, false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to register.");
      setLoading(false);
    }
  };

  const triggerBiometricAuth = async () => {
    setBiometricError(null);
    setIsBiometricPromptOpen(true);

    // Simulate standard WebAuthn Biometric touch ID delay
    setTimeout(async () => {
      try {
        const localBioUser = localStorage.getItem("life_saver_bio_user");
        if (!localBioUser) {
          throw new Error("No biometric credentials linked on this device yet. Please register or log in normally and link biometrics in Settings.");
        }

        const res = await fetch("/api/auth/biometric/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: localBioUser }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Biometric login failed");
        }

        setIsBiometricPromptOpen(false);
        // Load the saved security password
        const savedPass = localStorage.getItem("life_saver_bio_sec_key");
        if (savedPass) {
          localStorage.setItem("life_saver_sec_key", savedPass);
        }
        onLoginSuccess(data.username, data.email, true);
      } catch (err: any) {
        setBiometricError(err.message || "Biometric authentication failed");
      }
    }, 1800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 font-sans text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-rose-500/10 blur-[128px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[128px]"></div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl shadow-2xl">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 shadow-lg shadow-rose-500/20">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">LifeSaver AI</h1>
          <p className="mt-2 text-sm text-slate-400">Your AI-Powered Premium Productivity Companion</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {info && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-400">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>{info}</div>
          </div>
        )}

        {/* SCREEN: LOGIN */}
        {screen === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. janesmith"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-600 outline-none transition duration-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setScreen("forgot")}
                  className="text-xs font-medium text-rose-400 hover:text-rose-300 transition"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pr-10 pl-10 text-sm text-white placeholder-slate-600 outline-none transition duration-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 py-3 font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Decrypting Vault..." : "Access Workspace"}
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Biometric Integration Link */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800/60"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-widest text-slate-500">or use security</span>
              <div className="flex-grow border-t border-slate-800/60"></div>
            </div>

            <button
              type="button"
              onClick={triggerBiometricAuth}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-950/20 py-3 font-medium text-slate-300 transition hover:bg-slate-800/50 hover:text-white"
            >
              <Fingerprint className="h-5 w-5 text-rose-500" />
              Secure Biometric Login
            </button>

            <p className="text-center text-sm text-slate-500">
              New user?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setScreen("signup");
                }}
                className="font-medium text-rose-400 hover:text-rose-300 transition"
              >
                Create secure account
              </button>
            </p>
          </form>
        )}

        {/* SCREEN: SIGNUP */}
        {screen === "signup" && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. janesmith"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-600 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password / Decryption Key</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pr-10 pl-10 text-sm text-white placeholder-slate-600 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500">This password generates your local E2E encryption keys.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 py-3 font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Generating Security Vault..." : "Register Secure Account"}
              <ArrowRight className="h-5 w-5" />
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setScreen("login");
                }}
                className="font-medium text-rose-400 hover:text-rose-300 transition"
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* SCREEN: FORGOT PASSWORD */}
        {screen === "forgot" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInfo("If the username matches, reset credentials have been dispatched. Use test credential login.");
              setScreen("login");
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Username or Email</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter username or email"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pr-4 pl-10 text-sm text-white outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 py-3 font-semibold text-white transition hover:brightness-110"
            >
              Dispatch Reset Link
            </button>

            <button
              type="button"
              onClick={() => setScreen("login")}
              className="w-full text-center text-sm text-slate-400 hover:text-white transition"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>

      {/* TouchID / Biometric Dialog Mock */}
      {isBiometricPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
            <Fingerprint className="mx-auto h-16 w-16 text-rose-500 animate-pulse" />
            <h3 className="mt-4 text-xl font-bold text-white">Security Verification</h3>
            <p className="mt-2 text-sm text-slate-400">Place your finger on the sensor or face the camera to authenticate with TouchID / FaceID</p>
            
            <div className="my-6 flex justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500/10 opacity-75"></span>
                <Lock className="h-6 w-6 text-rose-400" />
              </div>
            </div>

            {biometricError && (
              <div className="mb-4 text-xs text-rose-400 border border-rose-500/20 bg-rose-500/5 rounded-xl p-3">
                {biometricError}
              </div>
            )}

            <button
              onClick={() => setIsBiometricPromptOpen(false)}
              className="mt-2 text-xs text-slate-500 hover:text-slate-300 font-semibold"
            >
              Cancel Authentication
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
