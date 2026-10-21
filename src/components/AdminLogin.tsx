import React, { useState } from 'react';
import { Activity, Eye, EyeOff, ArrowLeft, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../lib/api.ts';

interface AdminLoginProps {
  onLoginSuccess: (admin: any) => void;
  onBackToPatient: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToPatient }) => {
  const [username, setUsername] = useState('mantri');
  const [password, setPassword] = useState('mantri123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Username atau email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(username.trim(), password);
      if (res.success) {
        onLoginSuccess(res.admin);
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#E8DFD0]/90 text-left">
        {/* Logo and clinic header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#34483D] flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <Activity className="w-6 h-6 text-[#E8DFD0]" />
          </div>
          <h2 className="text-xl font-bold text-[#34483D] tracking-tight">
            Sistem Antrean Pasien
          </h2>
          <p className="text-xs text-[#747C75] font-medium">
            Praktik Mandiri Mantri
          </p>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h3 className="text-xl font-bold text-[#26332B] tracking-tight">
            Masuk ke Dashboard
          </h3>
          <p className="text-xs text-[#747C75] mt-0.5">
            Silakan login menggunakan akun terdaftar Anda.
          </p>
        </div>

        {/* Quick Demo Login 1-Click Action */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#F7F5EF] to-[#EDE7DC] border-2 border-[#718776]/40 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#34483D] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#718776]" />
              <span>Demo Login Admin / Mantri</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#43865A] border border-[#C8E6D3]">
              Siap Digunakan
            </span>
          </div>

          <div className="text-xs text-[#747C75] bg-white/80 p-2.5 rounded-xl border border-[#E8DFD0] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Username:</span>
              <strong className="text-[#34483D]">mantri</strong>
            </div>
            <div className="flex justify-between">
              <span>Password:</span>
              <strong className="text-[#34483D]">mantri123</strong>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setUsername('mantri');
              setPassword('mantri123');
              setLoading(true);
              setError(null);
              try {
                const res = await api.login('mantri', 'mantri123');
                if (res.success) {
                  onLoginSuccess(res.admin);
                }
              } catch (err: any) {
                setError(err.message || 'Login demo gagal.');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#34483D] hover:bg-[#27362e] active:scale-[0.99] transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8DFD0]" />
            <span>Masuk Otomatis dengan Akun Demo (1-Klik)</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[#FDF2F2] border border-[#F8CACA] text-xs text-[#B94B4B] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#26332B] uppercase tracking-wider mb-1.5">
              Username atau Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau email"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2DED5] text-sm text-[#26332B] placeholder:text-[#A1A7A1] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#718776] focus:ring-1 focus:ring-[#718776] transition"
              />
              <User className="w-4 h-4 text-[#747C75] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26332B] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E2DED5] text-sm text-[#26332B] placeholder:text-[#A1A7A1] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#718776] focus:ring-1 focus:ring-[#718776] transition"
              />
              <Lock className="w-4 h-4 text-[#747C75] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#747C75] hover:text-[#26332B] transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#747C75]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#718776] border-[#D5CDC0] focus:ring-[#718776] cursor-pointer"
              />
              <span>Ingat saya</span>
            </label>
            <span className="text-[#747C75]">Portal Khusus Mantri</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl font-semibold text-white bg-[#718776] hover:bg-[#5d7162] active:bg-[#4d5e51] transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </div>

          <div className="pt-3 border-t border-[#E8DFD0] text-center">
            <button
              type="button"
              onClick={onBackToPatient}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#747C75] hover:text-[#34483D] transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Formulir Pendaftaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
