import React, { useState } from 'react';
import { Anchor, ShieldCheck, Lock, User, ArrowRight, Sparkles, Ship, AlertCircle, Compass, CheckCircle2, Globe2, Radio } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserType) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, showToast }) => {
  // Default prefilled with flexible credentials, user can type anything
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    setLoading(true);
    try {
      // Username and password bebas tanpa ada ketentuan
      const res = await api.login(identifier || 'admin', password || '123');
      showToast('success', 'Akses Diberikan', `Selamat datang di Javara Nusantara, ${res.user.fullName}.`);
      onLoginSuccess(res.user);
    } catch (err: any) {
      const msg = err.message || 'Gagal masuk. Silakan coba kembali.';
      setErrorMessage(msg);
      showToast('error', 'Login Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoIdentifier: string, demoPass: string, roleName: string) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPass);
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.login(demoIdentifier, demoPass);
      showToast('success', `Akses Cepat ${roleName}`, `Berhasil masuk sebagai ${res.user.fullName}.`);
      onLoginSuccess(res.user);
    } catch (err: any) {
      const msg = err.message || 'Gagal login demo.';
      setErrorMessage(msg);
      showToast('error', 'Login Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glows & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header / Brand */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 z-10 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/40">
            <Anchor className="w-6 h-6 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-widest leading-tight">
                JAVARA NUSANTARA
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold tracking-wider uppercase">
                SHIPPING & FLEET
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400">
              PT Javara Nusantara Tbk • Sistem Manajemen Operasional Terpadu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Online Real-Time Sync</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-6 z-10">
        {/* Left Column: Maritime Prestige & Demo Access */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-sky-300 text-xs font-semibold tracking-wide">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            Live Multi-User Fleet Monitoring
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Manajemen Armada Laut <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-sky-300">Modern & Terkoneksi</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Pengawasan armada pelayaran nasional secara real-time. Setiap perubahan kapal, jadwal pelayaran, kargo B/L, dan sertifikasi awak langsung tersinkronisasi otomatis untuk semua pengguna.
            </p>
          </div>

          {/* Quick Demo Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pilih Akun Cepat (1-Klik Tanpa Ketentuan)
              </span>
              <span className="text-[11px] text-sky-300 font-medium bg-sky-500/15 border border-sky-400/30 px-2 py-0.5 rounded-full">
                Instan Masuk
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Demo User 1 */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin', 'Direktur Operasi')}
                disabled={loading}
                className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all group flex items-center justify-between backdrop-blur-md cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
                    HW
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      Capt. Hendra Wicaksono, M.Mar
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-amber-400 font-semibold">Direktur Operasi & Super Admin</span>
                      <span>• admin</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-amber-400/20 group-hover:bg-amber-400 group-hover:text-slate-950 text-amber-300 text-xs font-bold transition flex items-center gap-1">
                  Pilih <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </button>

              {/* Demo User 2 */}
              <button
                type="button"
                onClick={() => handleQuickLogin('fleet.manager', '123', 'Fleet Superintendent')}
                disabled={loading}
                className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-400/40 transition-all group flex items-center justify-between backdrop-blur-md cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
                    RP
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                      Ir. Raditya Pratama, S.T.
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-sky-400 font-semibold">Fleet Superintendent</span>
                      <span>• fleet.manager</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-sky-400/20 group-hover:bg-sky-400 group-hover:text-slate-950 text-sky-300 text-xs font-bold transition flex items-center gap-1">
                  Pilih <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </button>

              {/* Demo User 3 */}
              <button
                type="button"
                onClick={() => handleQuickLogin('cargo.officer', '123', 'Cargo Officer')}
                disabled={loading}
                className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 transition-all group flex items-center justify-between backdrop-blur-md cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
                    DS
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      Dewi Sartika, S.Log
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-emerald-400 font-semibold">Senior Cargo Officer</span>
                      <span>• cargo.officer</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-400/20 group-hover:bg-emerald-400 group-hover:text-slate-950 text-emerald-300 text-xs font-bold transition flex items-center gap-1">
                  Pilih <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Elegan Glass Login Form (Bebas Tanpa Ketentuan) */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-sky-400 to-amber-500"></div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Masuk Sistem Maritim
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Ketik <span className="text-amber-300 font-semibold">username & kata sandi bebas</span> tanpa ada batasan ketentuan, atau gunakan akun yang sudah ada.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username bebas */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Username Bebas (Nama / ID Bebas)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ketik username bebas apa saja..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/10 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Bebas ketik apa saja (contoh: wisnu, admin, direktur, dll)</p>
              </div>

              {/* Password bebas */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Kata Sandi (Password Bebas)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ketik password bebas apa saja..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/10 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Bebas tanpa batasan panjang karakter atau format</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                    <span>Memproses Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard Javara Nusantara</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Real-Time Online Server
              </span>
              <span>PT Javara Nusantara Tbk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 z-10">
        <div>
          © {new Date().getFullYear()} PT Javara Nusantara Tbk. Seluruh Hak Cipta Dilindungi.
        </div>
        <div className="flex items-center gap-3">
          <span>Standar IMO & Solas Maritime Compliance</span>
          <span>•</span>
          <span className="text-amber-400">Javara Real-Time Sync v2.0</span>
        </div>
      </footer>
    </div>
  );
};
