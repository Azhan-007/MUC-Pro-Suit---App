"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { User } from "@/types/domain";
import {
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  X,
  Check,
  CheckCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function LoginClient() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const userEmail = username.toLowerCase().trim();
    const pass = password.trim();

    try {
      // 1. Post to login
      await import("@/lib/apiClient").then((mod) =>
        mod.apiClient.post("/auth/login", {
          identifier: userEmail,
          password: pass,
          clientType: "WEB",
        })
      );

      // 2. Fetch /me
      const { apiClient } = await import("@/lib/apiClient");
      const meRes = await apiClient.get("/auth/me");
      const user = meRes.data.user;

      // 3. Find primary role
      const roleAssignments = user.roleAssignments || user.roles || [];
      const roleCodes = roleAssignments.map((r: any) => r.role?.code || r.code || r);
      const isSuperAdmin = roleCodes.includes("SUPER_ADMIN");
      const isMasterAdmin = roleCodes.includes("MASTER_ADMIN");

      // 4. Transform to UI User
      const uiUser: User = {
        id: user.id,
        username: user.username || userEmail,
        email: user.email || userEmail,
        firstName: user.firstName || "User",
        lastName: user.lastName || "",
        status: user.status as any,
        lastLogin: user.lastLoginAt || new Date().toISOString(),
      };

      if (isSuperAdmin) {
        login(uiUser, "SUPER_ADMIN");
        router.push("/super-admin/command-center");
      } else if (isMasterAdmin) {
        login(uiUser, "MASTER_ADMIN");
        router.push("/master-admin/command-center");
      } else {
        // Fallback for unauthorized roles
        await apiClient.post("/auth/logout");
        setError("You do not have administrative access.");
      }
    } catch (err: any) {
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError(
          "Server is waking up (free-tier cold start). Please wait a moment and try again."
        );
      } else if (!err.response) {
        setError(
          "Unable to connect to the authentication server. Please check your internet connection."
        );
      } else {
        setError(
          err.response?.data?.message || err.response?.data?.error || "Invalid username or password."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes("@") || forgotEmail.length < 5) {
      return;
    }
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotModal(false);
      setForgotEmail("");
    }, 2500);
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#eaf4ee] flex flex-col font-sans relative select-none">
      {/* Subtle Dot Grid Canvas Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0da87a_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-25 z-0 pointer-events-none" />

      {/* Ambient Atmospheric Emerald Glows */}
      <div className="absolute -top-36 -left-36 w-96 h-96 bg-[#0da87a]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-36 w-96 h-96 bg-[#059669]/15 rounded-full blur-3xl pointer-events-none" />

      {/* --- MOBILE ONLY HEADER --- */}
      <div className="flex flex-col items-center text-center lg:hidden w-full mt-8 mb-4 z-10 relative px-6">
        <div className="w-28 h-28 mb-3 bg-white/75 backdrop-blur-xl border border-white/80 rounded-2xl p-3 shadow-[0_8px_32px_rgba(5,150,105,0.1)] flex items-center justify-center relative overflow-hidden">
          <img
            src="/logo.png"
            alt="MUC Logo Crest"
            className="w-full h-full object-contain relative z-10 drop-shadow-xs"
          />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 shadow-2xs mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0da87a] animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-[#047857] uppercase font-sans">
            Institutional ERP &bull; Beta
          </span>
        </div>
        <h1 className="font-extrabold text-2xl tracking-tight leading-tight">
          <span className="text-slate-900">MUC </span>
          <span className="text-[#059669]">PRO SUITE</span>
        </h1>
        <p className="text-slate-500 font-semibold text-xs tracking-wider uppercase mt-1.5">
          Modern College Management System
        </p>
      </div>

      {/* --- DESKTOP ALIGNMENT WRAPPER --- */}
      <div className="flex-1 flex flex-col justify-center relative z-10 w-full lg:h-full pb-16 lg:pb-0 pt-8 lg:pt-0">
        {/* CENTER CONTENT ROW (Hero Card & Login Form) */}
        <div className="flex flex-col lg:flex-row items-end w-full">
          {/* Left Center: Brand & Identity (40%) */}
          <div className="hidden lg:flex flex-col items-center justify-end w-[40%] px-12 xl:px-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center flex-shrink-0 translate-x-16 xl:translate-x-24">
              {/* Glass Crest Tile */}
              <div className="w-64 h-64 xl:w-72 xl:h-72 mb-6 bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2.25rem] p-6 xl:p-8 shadow-[0_12px_40px_rgba(5,150,105,0.12)] flex items-center justify-center relative overflow-hidden group hover:shadow-[0_16px_48px_rgba(5,150,105,0.18)] transition-all duration-500">
                <img
                  src="/logo.png"
                  alt="Mazharul Uloom College Shield Crest"
                  className="w-full h-full object-contain relative z-10 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* ERP Pill & Title */}
              <div className="text-center mb-8 relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 backdrop-blur-md shadow-2xs mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#0da87a] animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest text-[#047857] uppercase font-sans">
                    Institutional ERP &bull; Beta
                  </span>
                </div>

                <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-none mb-3 font-sans">
                  <span className="text-slate-900">MUC </span>
                  <span className="text-[#059669]">PRO SUITE</span>
                </h1>

                <p className="text-slate-500 font-semibold text-xs xl:text-sm tracking-widest uppercase font-sans">
                  Modern College Management System
                </p>
              </div>
            </div>
          </div>

          {/* Right Center: Login Form (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col items-center justify-end px-8 sm:px-16 lg:px-20">
            <div className="max-w-[420px] w-full mx-auto lg:pb-12">
              {/* Login Card */}
              <div className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-[2.25rem] p-8 sm:p-10 shadow-[0_12px_40px_rgba(5,150,105,0.1)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
                <div className="mb-8 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2.5">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Administrator Login
                    </h2>
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      BETA
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    Use your institutional credentials to continue.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Username Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="login-username" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Username / Email
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#059669] transition-colors">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        id="login-username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username or email"
                        disabled={isLoading}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-600/15 focus:border-[#059669] focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="login-password" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#059669] transition-colors">
                        <Key className="w-4 h-4" />
                      </span>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        disabled={isLoading}
                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-600/15 focus:border-[#059669] focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400 shadow-xs"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          id="rememberMe"
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded-lg border border-slate-300 bg-slate-100/90 peer-checked:bg-[#059669] peer-checked:border-[#059669] transition-all flex items-center justify-center peer-focus:ring-2 peer-focus:ring-emerald-500/25 group-hover:border-slate-400">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-bold text-[#047857] hover:text-[#059669] transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="p-4 bg-rose-50/90 backdrop-blur-sm border border-rose-200 rounded-2xl flex gap-3 text-xs text-rose-700 font-medium animate-in fade-in shadow-xs mt-4">
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  {/* Submit Button - Vibrant Sidebar Emerald Gradient */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[52px] mt-4 bg-gradient-to-r from-[#0da87a] via-[#059669] to-[#047e5b] hover:from-[#0c9c71] hover:via-[#04875e] hover:to-[#036e4f] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>Login In</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ROW (College Info & Security Badges) */}
        <div className="flex flex-col lg:flex-row items-start w-full">
          {/* Left Footer: College Info */}
          <div className="hidden lg:flex w-[40%] flex-col items-center px-12 xl:px-16">
            <div className="w-full max-w-md flex flex-col items-center pt-6 translate-x-16 xl:translate-x-24">
              {/* Tapered Divider Line above College Name */}
              <div className="w-48 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent rounded-full mb-3.5" />

              <h2 className="text-base lg:text-lg font-sans font-extrabold text-slate-900 tracking-tight leading-snug whitespace-nowrap mb-1">
                Mazharul Uloom College (Autonomous), Ambur
              </h2>
              <p className="text-slate-500 text-[11px] font-medium tracking-wide whitespace-nowrap">
                Established in 1969. Managed by Ambur Muslim Educational Society (AMES).
              </p>
            </div>
          </div>

          {/* Right Footer: Security Info */}
          <div className="w-full lg:w-[60%] flex flex-col items-center px-8 sm:px-16 lg:px-20 mt-8 lg:mt-0">
            <div className="max-w-[420px] w-full mx-auto lg:pt-8 animate-in fade-in duration-1000 delay-500 fill-mode-both">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                    Secure Institutional Login
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span>SSL Protected</span>
                </div>

                <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Beta Version (v1.0) &bull; &copy; MUC Ambur &bull; Powered by MUC Pro Suite
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* MODAL: Forgot Password */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-md w-full p-7 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              aria-label="Close forgot password modal"
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(false);
                setForgotEmail("");
              }}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {!forgotSuccess ? (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3.5 border border-emerald-100">
                    <Key className="w-6 h-6 text-[#059669]" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Reset Password
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter your institutional email address to receive a secure password reset link.
                  </p>
                </div>
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Institutional Email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@muc.edu"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-[#059669] transition-all font-medium"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#0da87a] via-[#059669] to-[#047e5b] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Reset Link</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-xl font-black text-slate-900">
                  Reset Link Sent!
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Check your institutional email inbox for password recovery instructions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
