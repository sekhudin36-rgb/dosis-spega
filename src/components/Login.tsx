import React, { useState } from 'react';
import { UserAccount } from '../types';
import { 
  GraduationCap, 
  Lock, 
  User, 
  ShieldCheck, 
  Library, 
  Server, 
  LayoutDashboard, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface LoginProps {
  onLogin: (account: UserAccount) => void;
  accounts: UserAccount[];
}

export default function Login({ onLogin, accounts }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for a more realistic feel
    setTimeout(() => {
      const account = accounts.find(
        (a) => a.username === username && a.password === password
      );

      if (account) {
        onLogin(account);
      } else {
        setError('Kredensial tidak valid. Silakan periksa kembali username dan password Anda.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* LEFT SIDE - BRANDING & VISUALS (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-900 overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[25%] -left-[10%] w-[80%] h-[80%] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute top-[60%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[100px]" />
        </div>

        {/* Logo & Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform -rotate-6">
            <GraduationCap className="w-7 h-7 text-white transform rotate-6" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">
            EduMaster<span className="text-indigo-400">Pro</span>
          </span>
        </div>

        {/* Main Copy */}
        <div className="relative z-10 max-w-lg mt-12">
          <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-sm">
            Sistem Akademik Terpadu
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-6">
            Digitalisasi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400">
              Buku Induk Sekolah
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-10">
            Kelola data siswa, pendidik, dan alumni dalam satu platform cerdas yang dirancang khusus untuk ekosistem pendidikan modern.
          </p>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                <Server className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Penyimpanan Terpusat & Aman</h4>
                <p className="text-xs text-slate-400 mt-0.5">Data terstruktur dengan baik dan disimpan secara presisi.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                <LayoutDashboard className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Antarmuka Modern & Intuitif</h4>
                <p className="text-xs text-slate-400 mt-0.5">Mudah digunakan tanpa memerlukan pelatihan khusus.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Hak Akses Berlapis</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pemisahan wewenang antara Administrator dan Guru pendidik.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="relative z-10 mt-16 flex items-center gap-4">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
            Developed by <span className="text-white font-bold">Khabibu Rohman</span>
          </span>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-slate-50 lg:bg-white overflow-hidden">
        
        {/* Decorative background circle on mobile */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl lg:hidden"></div>
        
        {/* Mobile Header */}
        <div className="absolute top-8 left-6 flex items-center gap-2.5 lg:hidden">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 text-lg font-bold tracking-tight">
            EduMaster<span className="text-indigo-600">Pro</span>
          </span>
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Selamat Datang</h2>
            <p className="mt-3 text-slate-500 font-medium">Masuk ke akun Anda untuk mengakses sistem akademik sekolah.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-800 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-800 outline-none"
                  placeholder="Masukkan username akun Anda"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-800 outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white transition-all ${
                  isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/40 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dasbor</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
          </form>
          
          <div className="mt-10 lg:hidden text-center text-xs font-medium text-slate-400 uppercase tracking-widest">
            Developed by <span className="font-bold text-slate-600">Khabibu Rohman</span>
          </div>

        </div>
      </div>
    </div>
  );
}

