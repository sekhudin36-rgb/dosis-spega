/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Student, SchoolSettings, UserAccount, MutationApplication } from '../types';
import { defaultMutationApplications } from '../data/mockMutationApplications';
import PublicMutationSubmission from './PublicMutationSubmission';
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  UserCheck, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  Printer, 
  UserPlus, 
  Calendar,
  Award,
  IdCard,
  Share2,
  X,
  Clock,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Lock,
  Users,
  Download,
  FileDown,
  FileText,
  Check,
  Copy,
  SlidersHorizontal,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Eye,
  ExternalLink,
  ChevronRight,
  Filter,
  CreditCard,
  ShieldAlert,
  KeyRound,
  EyeOff,
  FileCheck,
  ArrowLeftRight
} from 'lucide-react';
import { exportStudentVerificationLetterPDF, exportAlumniCardPDF, exportStudentIdCardPDF } from '../utils/pdfUtils';

interface PublicPortalProps {
  students: Student[];
  settings: SchoolSettings;
  initialTab?: 'cek-siswa' | 'daftar-alumni' | 'verifikasi-qr' | 'pengajuan-mutasi';
  currentUser?: UserAccount | null;
  mutationApplications?: MutationApplication[];
  onSubmitMutationApplication?: (app: MutationApplication) => void;
  onOpenLogin?: () => void;
  onGoToDashboard?: () => void;
  onLogout?: () => void;
  onRegisterAlumni: (alumniData: {
    namaLengkap: string;
    nis?: string;
    nisn?: string;
    jenisKelamin: 'L' | 'P';
    tahunLulus: string;
    alumniLanjutKe: string;
    alumniCatatan?: string;
    telepon: string;
    email?: string;
    alamat?: string;
    foto?: string;
  }) => { success: boolean; message: string; student: Student };
}

export default function PublicPortal({
  students,
  settings,
  initialTab = 'cek-siswa',
  currentUser,
  mutationApplications,
  onSubmitMutationApplication,
  onOpenLogin,
  onGoToDashboard,
  onLogout,
  onRegisterAlumni
}: PublicPortalProps) {
  const [activeTab, setActiveTab] = useState<'cek-siswa' | 'daftar-alumni' | 'verifikasi-qr' | 'pengajuan-mutasi'>(initialTab);

  // Mutation Applications state fallback
  const [internalMutationApps, setInternalMutationApps] = useState<MutationApplication[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('buku_induk_mutation_applications') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return defaultMutationApplications;
  });

  const currentMutationApps = mutationApplications || internalMutationApps;

  const handleSubmitMutationApp = (newApp: MutationApplication) => {
    if (onSubmitMutationApplication) {
      onSubmitMutationApplication(newApp);
    } else {
      const updated = [newApp, ...currentMutationApps];
      setInternalMutationApps(updated);
      localStorage.setItem('buku_induk_mutation_applications', JSON.stringify(updated));
    }
    setToastMessage(`✓ Pengajuan mutasi siswa ${newApp.namaSiswa} (${newApp.nomorRegistrasi}) berhasil didaftarkan!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- PRIVACY PROTECTION (UU PDP No. 27/2022) STATES ---
  const [privacyMode, setPrivacyMode] = useState<boolean>(true);
  const [verifiedStudentIds, setVerifiedStudentIds] = useState<string[]>([]);
  const [unlockStudentTarget, setUnlockStudentTarget] = useState<Student | null>(null);
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // --- TAB 3: QR & DOKUMEN VERIFICATION TERMINAL STATES ---
  const [qrInput, setQrInput] = useState('');
  const [qrVerifiedResult, setQrVerifiedResult] = useState<{
    found: boolean;
    student?: Student;
    searchedCode: string;
    verifiedAt: string;
    registrationNo: string;
  } | null>(null);

  // --- TAB 1: CEK DATA SISWA STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Lulus' | 'Mutasi'>('Semua');
  const [gradeFilter, setGradeFilter] = useState<string>('Semua');
  const [genderFilter, setGenderFilter] = useState<'Semua' | 'L' | 'P'>('Semua');
  const [sortBy, setSortBy] = useState<'nama-asc' | 'nama-desc' | 'nis-asc' | 'nis-desc'>('nama-asc');
  const [showAllDirectory, setShowAllDirectory] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Verification document options & feedback
  const [suratKeperluan, setSuratKeperluan] = useState('Kelanjutan Studi ke Jenjang SMA / SMK / MA');
  const [customKeperluan, setCustomKeperluan] = useState('');
  const [suratNomor, setSuratNomor] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);

  // --- RAHASIA AKSES OPERATOR: Triple-Tap pada Logo Sekolah ---
  const [logoTapCount, setLogoTapCount] = useState<number>(0);
  const logoTapTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSecretLogoTap = () => {
    if (currentUser) {
      if (onGoToDashboard) onGoToDashboard();
      return;
    }

    setLogoTapCount((prev) => {
      const next = prev + 1;
      if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);

      if (next === 1) {
        setToastMessage('✦ 1/3 Kunci Operator...');
      } else if (next === 2) {
        setToastMessage('✦ 2/3 Kunci Operator...');
      } else if (next >= 3) {
        setToastMessage('🔐 Akses Operator Divalidasi: Membuka Portal Login...');
        setTimeout(() => {
          if (onOpenLogin) onOpenLogin();
        }, 400);
        return 0;
      }

      logoTapTimerRef.current = setTimeout(() => {
        setLogoTapCount(0);
        setToastMessage(null);
      }, 1600);

      return next;
    });
  };

  // Sample quick students for quick demonstration/testing
  const sampleStudents = useMemo(() => {
    return students.slice(0, 4);
  }, [students]);

  // Filtered and Sorted Students for Search
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query && !showAllDirectory) return [];

    let list = students.filter((s) => {
      // Status filter
      if (statusFilter === 'Aktif' && s.statusSiswa !== 'Aktif') return false;
      if (statusFilter === 'Lulus' && s.statusSiswa !== 'Lulus') return false;
      if (statusFilter === 'Mutasi' && (s.statusSiswa !== 'Pindah' && s.statusSiswa !== 'Keluar')) return false;

      // Grade filter
      if (gradeFilter !== 'Semua') {
        if (gradeFilter === 'Alumni') {
          if (s.statusSiswa !== 'Lulus') return false;
        } else if (gradeFilter === '7') {
          if (!s.kelasSaatIni?.startsWith('7') || s.statusSiswa !== 'Aktif') return false;
        } else if (gradeFilter === '8') {
          if (!s.kelasSaatIni?.startsWith('8') || s.statusSiswa !== 'Aktif') return false;
        } else if (gradeFilter === '9') {
          if (!s.kelasSaatIni?.startsWith('9') || s.statusSiswa !== 'Aktif') return false;
        }
      }

      // Gender filter
      if (genderFilter !== 'Semua' && s.jenisKelamin !== genderFilter) return false;

      // Query match: Nama Lengkap, Nama Panggilan, NIS, NISN, Orang Tua
      if (query) {
        const matchName = s.namaLengkap.toLowerCase().includes(query) || (s.namaPanggilan && s.namaPanggilan.toLowerCase().includes(query));
        const matchNIS = s.nis ? s.nis.toLowerCase().includes(query) : false;
        const matchNISN = s.nisn ? s.nisn.toLowerCase().includes(query) : false;
        const matchKelas = s.kelasSaatIni ? s.kelasSaatIni.toLowerCase().includes(query) : false;
        const matchOrtu = (s.namaAyah && s.namaAyah.toLowerCase().includes(query)) || (s.namaIbu && s.namaIbu.toLowerCase().includes(query));
        return matchName || matchNIS || matchNISN || matchKelas || matchOrtu;
      }

      return true;
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'nama-asc') return a.namaLengkap.localeCompare(b.namaLengkap);
      if (sortBy === 'nama-desc') return b.namaLengkap.localeCompare(a.namaLengkap);
      if (sortBy === 'nis-asc') return (a.nis || '').localeCompare(b.nis || '', undefined, { numeric: true });
      if (sortBy === 'nis-desc') return (b.nis || '').localeCompare(a.nis || '', undefined, { numeric: true });
      return 0;
    });
  }, [students, searchQuery, statusFilter, gradeFilter, genderFilter, sortBy, showAllDirectory]);

  // --- TAB 2: DAFTAR ALUMNI FORM STATE ---
  const [alumniForm, setAlumniForm] = useState({
    namaLengkap: '',
    nis: '',
    nisn: '',
    jenisKelamin: 'L' as 'L' | 'P',
    tahunLulus: '2025',
    kategoriLanjutan: 'SMA/SMK Negeri',
    alumniLanjutKe: '',
    telepon: '',
    email: '',
    alamat: '',
    alumniCatatan: '',
    foto: ''
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    message: string;
    student: Student;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate Year Options for Graduation (from 2026 down to 1990)
  const graduationYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let y = currentYear; y >= 1990; y--) {
      years.push(y.toString());
    }
    return years;
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAlumniForm((prev) => ({ ...prev, foto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitAlumni = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!alumniForm.namaLengkap.trim()) {
      setFormError('Nama lengkap alumni wajib diisi.');
      return;
    }

    if (!alumniForm.telepon.trim()) {
      setFormError('Nomor WhatsApp / HP aktif wajib diisi untuk verifikasi jaringan alumni.');
      return;
    }

    const sekolahLanjutan = alumniForm.alumniLanjutKe.trim() 
      ? alumniForm.alumniLanjutKe.trim()
      : alumniForm.kategoriLanjutan;

    setIsSubmitting(true);

    setTimeout(() => {
      const res = onRegisterAlumni({
        namaLengkap: alumniForm.namaLengkap.trim(),
        nis: alumniForm.nis.trim() || undefined,
        nisn: alumniForm.nisn.trim() || undefined,
        jenisKelamin: alumniForm.jenisKelamin,
        tahunLulus: alumniForm.tahunLulus,
        alumniLanjutKe: sekolahLanjutan,
        alumniCatatan: alumniForm.alumniCatatan.trim() || undefined,
        telepon: alumniForm.telepon.trim(),
        email: alumniForm.email.trim() || undefined,
        alamat: alumniForm.alamat.trim() || undefined,
        foto: alumniForm.foto || undefined
      });

      setIsSubmitting(false);

      if (res.success) {
        setRegisteredSuccess({
          message: res.message,
          student: res.student
        });
      } else {
        setFormError('Gagal memproses pendaftaran. Silakan periksa kembali formulir Anda.');
      }
    }, 400);
  };

  const openVerificationModal = (student: Student) => {
    setSelectedStudentDetail(student);
    const yearNow = new Date().getFullYear();
    setSuratNomor(`421.3 / VERIF-BI / ${yearNow} / ${student.nis || '001'}`);
    if (student.statusSiswa === 'Lulus') {
      setSuratKeperluan('Verifikasi Ijazah & Pembuktian Kelulusan Resmi');
    } else if (student.statusSiswa === 'Aktif') {
      setSuratKeperluan('Kelanjutan Studi ke Jenjang SMA / SMK / MA');
    } else {
      setSuratKeperluan('Kelengkapan Berkas Administrasi Mutasi Sekolah');
    }
    setCustomKeperluan('');
  };

  const handleDownloadVerificationPDF = (student: Student) => {
    setIsGeneratingPDF(true);
    const keperluan = suratKeperluan === 'Lainnya' 
      ? (customKeperluan.trim() || 'Verifikasi Keabsahan Data Siswa') 
      : suratKeperluan;
    const nomor = suratNomor.trim() || `421.3 / VERIF-BI / ${new Date().getFullYear()} / ${student.nis || '001'}`;

    setTimeout(() => {
      try {
        exportStudentVerificationLetterPDF(student, settings, {
          keperluan,
          nomorSurat: nomor
        });
        setToastMessage(`✓ Berhasil mengunduh Surat Verifikasi PDF untuk ${student.namaLengkap}!`);
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err) {
        console.error('Gagal generate PDF:', err);
        alert('Terjadi kendala teknis saat menyusun PDF. Silakan coba kembali.');
      } finally {
        setIsGeneratingPDF(false);
      }
    }, 150);
  };

  const handleDownloadAlumniCardPDF = (student: Student) => {
    try {
      exportAlumniCardPDF(student, settings);
      setToastMessage(`✓ Berhasil mengunduh Kartu Alumni PDF untuk ${student.namaLengkap}!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Gagal generate Kartu Alumni:', err);
    }
  };

  const handleCopySummary = (student: Student) => {
    const text = `SURAT KETERANGAN VERIFIKASI KEABSAHAN DATA SISWA
Nama Lengkap   : ${student.namaLengkap}
Nomor Induk    : ${student.nis || '-'}
NISN           : ${student.nisn || '-'}
Status Siswa   : ${student.statusSiswa === 'Aktif' ? 'Aktif (Kelas ' + (student.kelasSaatIni || '-') + ')' : student.statusSiswa === 'Lulus' ? 'Alumni Lulus Tahun ' + (student.tanggalLulus ? student.tanggalLulus.substring(0, 4) : 'Tercatat') : 'Mutasi Keluar'}
Asal Sekolah   : ${settings.namaSekolah}
Pangkalan Data : Buku Induk Digital (Buku Pokok Siswa Resmi)
Status Cek     : SAH & TERDAFTAR SECARA RESMI ✓`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedStudentId(student.id);
      setToastMessage(`✓ Data ${student.namaLengkap} berhasil disalin ke clipboard!`);
      setTimeout(() => {
        setCopiedStudentId(null);
        setToastMessage(null);
      }, 3000);
    }).catch(() => {
      // Fallback
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Masking string for privacy (UU PDP)
  const maskText = (text?: string, unmaskedStart = 3, studentId?: string) => {
    if (!text) return '-';
    // If privacyMode is disabled or student is verified or operator is logged in, show full text
    if (!privacyMode || currentUser || (studentId && verifiedStudentIds.includes(studentId))) {
      return text;
    }
    if (text.length <= unmaskedStart) return text;
    return text.substring(0, unmaskedStart) + '•'.repeat(Math.min(text.length - unmaskedStart, 8));
  };

  const handleVerifyStudentAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockStudentTarget) return;
    const input = unlockInput.trim().toLowerCase();
    if (!input) {
      setUnlockError('Silakan masukkan 4 digit terakhir NISN atau Tanggal Lahir (YYYY-MM-DD).');
      return;
    }

    const nisnLast4 = (unlockStudentTarget.nisn || '').slice(-4).toLowerCase();
    const tglLahir = (unlockStudentTarget.tanggalLahir || '').toLowerCase();
    const nis = (unlockStudentTarget.nis || '').toLowerCase();

    if (
      (nisnLast4 && input === nisnLast4) ||
      (tglLahir && input === tglLahir) ||
      (nis && input === nis)
    ) {
      setVerifiedStudentIds((prev) => [...prev, unlockStudentTarget.id]);
      setToastMessage(`✓ Identitas terverifikasi! Akses data lengkap & dokumen untuk ${unlockStudentTarget.namaLengkap} telah dibuka.`);
      setUnlockStudentTarget(null);
      setUnlockInput('');
      setUnlockError(null);
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setUnlockError('Verifikasi gagal. Pastikan 4 digit terakhir NISN atau Tanggal Lahir (YYYY-MM-DD) sesuai.');
    }
  };

  const handleVerifyQRDocument = (codeToSearch?: string) => {
    const rawCode = (codeToSearch || qrInput).trim();
    if (!rawCode) return;

    // Clean query: e.g. from "421.3 / VERIF-BI / 2026 / 2101" or "2101"
    const cleaned = rawCode.toLowerCase();
    const found = students.find((s) => {
      const matchNis = s.nis && (cleaned.includes(s.nis.toLowerCase()) || s.nis.toLowerCase() === cleaned);
      const matchNisn = s.nisn && (cleaned.includes(s.nisn.toLowerCase()) || s.nisn.toLowerCase() === cleaned);
      const matchId = s.id.toLowerCase() === cleaned;
      return matchNis || matchNisn || matchId;
    });

    const now = new Date();
    const verifiedTimestamp = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ' pukul ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const regNo = `REG-SM3K-${now.getFullYear()}-${found?.nis || Math.floor(1000 + Math.random() * 9000)}`;

    setQrVerifiedResult({
      found: !!found,
      student: found,
      searchedCode: rawCode,
      verifiedAt: verifiedTimestamp,
      registrationNo: regNo
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & School Title */}
          <div className="flex items-center gap-3">
            <div 
              onClick={handleSecretLogoTap}
              title={currentUser ? "Buka Dasbor Buku Induk" : undefined}
              className={`w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 select-none cursor-pointer transition-all duration-300 ${
                logoTapCount === 1 ? 'ring-2 ring-indigo-400 scale-95' :
                logoTapCount === 2 ? 'ring-4 ring-amber-400 scale-90 rotate-6' :
                'hover:scale-105 active:scale-95'
              }`}
            >
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  {settings.namaSekolah}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 bg-indigo-50 border border-indigo-200/60 rounded-full text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                  Portal Publik
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pusat Informasi Data Siswa & Jejaring Alumni
              </p>
            </div>
          </div>

          {/* Navigation & Operator Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-950">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Operator: <strong className="uppercase">{currentUser.username}</strong></span>
                </div>
                {onGoToDashboard && (
                  <button
                    onClick={onGoToDashboard}
                    className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    title="Buka Dasbor Buku Induk"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard Buku Induk</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer"
                    title="Keluar / Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Public View: Hidden login button. Shows clean status badge with secret micro-dot trigger */
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-medium text-slate-600 select-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Layanan Online Aktif</span>
                  {/* Subtle secret trigger dot that only an operator knows */}
                  {onOpenLogin && (
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      aria-label="Akses Internal"
                      className="w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-indigo-500 transition-colors cursor-pointer ml-1"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TAB NAVIGATION BAR - Hidden on mobile, visible on tablet/desktop */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200">
            <div className="hidden sm:flex gap-4 sm:gap-8 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('cek-siswa');
                  setSelectedStudentDetail(null);
                }}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'cek-siswa'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Cek Data Siswa</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('daftar-alumni');
                  setRegisteredSuccess(null);
                }}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'daftar-alumni'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Pendaftaran Alumni</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('verifikasi-qr');
                  setSelectedStudentDetail(null);
                }}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'verifikasi-qr'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Validasi Dokumen & Scan QR</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('pengajuan-mutasi');
                  setSelectedStudentDetail(null);
                }}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'pengajuan-mutasi'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Pengajuan & Lacak Mutasi</span>
              </button>
            </div>

            {/* Privacy Badge / Status */}
            <div className="py-2 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 text-[11px] font-bold">
              <span className="sm:hidden text-xs font-semibold text-slate-600">
                {activeTab === 'cek-siswa' && '🔍 Cek Data Siswa'}
                {activeTab === 'daftar-alumni' && '🎓 Pendaftaran Alumni'}
                {activeTab === 'verifikasi-qr' && '🛡️ Validasi Dokumen'}
                {activeTab === 'pengajuan-mutasi' && '📋 Pengajuan & Lacak Mutasi'}
              </span>
              <button
                onClick={() => setPrivacyMode(prev => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  privacyMode 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
                title="Klik untuk mengubah mode proteksi sensor privasi data pribadi (UU Perlindungan Data Pribadi No. 27/2022)"
              >
                {privacyMode ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>UU PDP: Aktif</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sensor: Terbuka</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BODY WORKSPACE */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-8">
        
        {/* ==================================================================== */}
        {/* TAB 1: CEK DATA SISWA DENGAN NAMA / NIS */}
        {/* ==================================================================== */}
        {activeTab === 'cek-siswa' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* HERO SEARCH BANNER */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden no-print">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="max-w-3xl relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold text-indigo-200 backdrop-blur-xs border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  Pencarian Terbuka & Verifikasi Buku Induk Digital
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Cek & Verifikasi Status Siswa Resmi
                </h2>
                
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Masukkan <strong>Nama Lengkap</strong> atau <strong>Nomor Induk Siswa (NIS)</strong> untuk memverifikasi keabsahan data siswa, nomor induk, status kelulusan, dan unduh <strong>Surat Keterangan Verifikasi resmi (Format PDF)</strong> berstandar dinas pendidikan.
                </p>

                {/* Interactive statistical highlight pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      setStatusFilter('Semua');
                      setShowAllDirectory(true);
                    }}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      statusFilter === 'Semua' && showAllDirectory
                        ? 'bg-indigo-600/60 border-indigo-400'
                        : 'bg-white/10 border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <span className="text-[10px] text-indigo-200 font-semibold uppercase block">Total Database</span>
                    <span className="text-base sm:text-lg font-bold text-white">{students.length} Siswa</span>
                  </button>

                  <button
                    onClick={() => {
                      setStatusFilter('Aktif');
                      setShowAllDirectory(true);
                    }}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      statusFilter === 'Aktif'
                        ? 'bg-indigo-600/60 border-indigo-400'
                        : 'bg-white/10 border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <span className="text-[10px] text-emerald-300 font-semibold uppercase block">Siswa Aktif</span>
                    <span className="text-base sm:text-lg font-bold text-white">{students.filter(s => s.statusSiswa === 'Aktif').length} Siswa</span>
                  </button>

                  <button
                    onClick={() => {
                      setStatusFilter('Lulus');
                      setShowAllDirectory(true);
                    }}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      statusFilter === 'Lulus'
                        ? 'bg-indigo-600/60 border-indigo-400'
                        : 'bg-white/10 border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <span className="text-[10px] text-blue-300 font-semibold uppercase block">Alumni Lulus</span>
                    <span className="text-base sm:text-lg font-bold text-white">{students.filter(s => s.statusSiswa === 'Lulus').length} Alumni</span>
                  </button>

                  <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                    <span className="text-[10px] text-amber-300 font-semibold uppercase block">Tahun Ajaran</span>
                    <span className="text-base sm:text-lg font-bold text-white truncate block">T.A {settings.tahunAjaranAktif}</span>
                  </div>
                </div>

                {/* SEARCH INPUT BAR */}
                <div className="pt-2">
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400 pointer-events-none">
                      <Search className="w-5 h-5 text-indigo-400" />
                    </div>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.trim() !== '') {
                          setShowAllDirectory(false);
                        }
                      }}
                      placeholder="Ketik Nama Siswa atau NIS (contoh: 2101 atau Ahmad)..."
                      className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm sm:text-base rounded-2xl shadow-lg border-2 border-white/20 focus:border-indigo-400 focus:outline-hidden transition-all"
                      autoFocus
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Bersihkan pencarian"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Examples */}
                {sampleStudents.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-300">
                    <span className="text-indigo-300 font-medium mr-1">Contoh Cepat:</span>
                    {sampleStudents.map((samp) => (
                      <button
                        key={samp.id}
                        onClick={() => {
                          setSearchQuery(samp.namaLengkap);
                          setShowAllDirectory(false);
                        }}
                        className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors cursor-pointer"
                      >
                        {samp.namaLengkap} ({samp.nis})
                      </button>
                    ))}
                  </div>
                )}

                {/* Filter and Sort Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-300 font-semibold mr-1">Status:</span>
                    {(['Semua', 'Aktif', 'Lulus', 'Mutasi'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          statusFilter === filter
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-xs'
                            : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {filter === 'Semua' ? 'Semua Status' : filter === 'Aktif' ? 'Siswa Aktif' : filter === 'Lulus' ? 'Alumni (Lulus)' : 'Mutasi / Pindah'}
                      </button>
                    ))}
                  </div>

                  {/* Level & Sort controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-white border border-white/20 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Semua">Semua Tingkat</option>
                      <option value="7">Kelas 7</option>
                      <option value="8">Kelas 8</option>
                      <option value="9">Kelas 9</option>
                      <option value="Alumni">Khusus Alumni</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-white border border-white/20 focus:outline-hidden cursor-pointer"
                    >
                      <option value="nama-asc">Nama (A - Z)</option>
                      <option value="nama-desc">Nama (Z - A)</option>
                      <option value="nis-asc">NIS (Terkecil)</option>
                      <option value="nis-desc">NIS (Terbesar)</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* RESULTS VIEW */}
            <div>
              {searchQuery.trim() === '' && !showAllDirectory ? (
                /* Empty state / instructions */
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-800">
                      Pencarian Data Siswa & Verifikasi Digital
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      Ketik Nama atau Nomor Induk Siswa (NIS) di kolom pencarian di atas, atau klik tombol di bawah untuk menjelajahi seluruh arsip buku induk sekolah.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => setShowAllDirectory(true)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Jelajahi Seluruh Siswa ({students.length})</span>
                    </button>
                    {sampleStudents[0] && (
                      <button
                        onClick={() => {
                          setSearchQuery(sampleStudents[0].namaLengkap);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Cari Contoh Siswa: {sampleStudents[0].namaLengkap}
                      </button>
                    )}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                /* No results found */
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center max-w-lg mx-auto space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Tidak Ditemukan Siswa dengan Kriteria Pencarian
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pastikan ejaan nama atau nomor induk sudah sesuai. Jika Anda adalah alumni yang lulus sebelum era digitalisasi, Anda dapat mendaftar mandiri agar terdata di Buku Induk Digital.
                  </p>
                  <div className="pt-3 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('Semua');
                        setGradeFilter('Semua');
                        setShowAllDirectory(true);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Reset Filter & Tampilkan Semua
                    </button>
                    <button
                      onClick={() => {
                        setAlumniForm((prev) => ({ ...prev, namaLengkap: searchQuery }));
                        setActiveTab('daftar-alumni');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Daftar Sebagai Alumni Baru →
                    </button>
                  </div>
                </div>
              ) : (
                /* Students Found List */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-bold">
                        {searchResults.length} Data Siswa Terdaftar
                      </span>
                      {statusFilter !== 'Semua' && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                          Filter Status: {statusFilter}
                        </span>
                      )}
                      {gradeFilter !== 'Semua' && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                          Tingkat: {gradeFilter}
                        </span>
                      )}
                    </div>

                    {(searchQuery || statusFilter !== 'Semua' || gradeFilter !== 'Semua') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('Semua');
                          setGradeFilter('Semua');
                          setShowAllDirectory(true);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Filter</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((student) => {
                      const isLulus = student.statusSiswa === 'Lulus';
                      const isMutasi = student.statusSiswa === 'Mutasi' || student.statusSiswa === 'Keluar' || student.statusSiswa === 'Pindah';

                      return (
                        <div
                          key={student.id}
                          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div className="flex items-start gap-4">
                            {/* Student Avatar / Photo */}
                            <div 
                              onClick={() => openVerificationModal(student)}
                              className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                            >
                              {student.foto ? (
                                <img 
                                  src={student.foto} 
                                  alt={student.namaLengkap} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                              ) : (
                                <div className="text-center p-1">
                                  <GraduationCap className="w-6 h-6 text-slate-400 mx-auto" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">
                                    {student.jenisKelamin === 'L' ? 'L' : 'P'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Student Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                                  isLulus 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : isMutasi
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                  {isLulus ? 'Alumni Lulus' : isMutasi ? 'Mutasi / Pindah' : 'Siswa Aktif'}
                                </span>
                                <span className="text-[11px] font-mono font-bold text-slate-500">
                                  NIS: {student.nis || '-'}
                                </span>
                              </div>

                              <h4 
                                onClick={() => openVerificationModal(student)}
                                className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate cursor-pointer"
                                title={student.namaLengkap}
                              >
                                {student.namaLengkap}
                              </h4>

                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs text-slate-500">
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-medium">Kelas / Rombel</span>
                                  <span className="font-semibold text-slate-700 truncate block">
                                    {isLulus ? 'Alumni' : student.kelasSaatIni || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-medium">
                                    {isLulus ? 'Tahun Lulus' : 'Tahun Masuk'}
                                  </span>
                                  <span className="font-semibold text-slate-700 truncate block">
                                    {isLulus ? (student.tanggalLulus ? student.tanggalLulus.substring(0, 4) : 'Tercatat') : student.tahunMasuk || '-'}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                                <div>
                                  NISN: <strong className="text-slate-600">{maskText(student.nisn, 4, student.id)}</strong>
                                </div>
                                {privacyMode && !currentUser && !verifiedStudentIds.includes(student.id) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUnlockStudentTarget(student);
                                      setUnlockInput('');
                                      setUnlockError(null);
                                    }}
                                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                                    title="Buka sensor privasi data pribadi (Kepatuhan UU PDP)"
                                  >
                                    <KeyRound className="w-2.5 h-2.5" />
                                    <span>Verifikasi Siswa</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* ACTION BUTTONS TOOLBAR */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {/* Copy button */}
                              <button
                                onClick={() => handleCopySummary(student)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-xs"
                                title="Salin Ringkasan Data"
                              >
                                {copiedStudentId === student.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Direct KTS Download Button */}
                              <button
                                onClick={() => {
                                  exportStudentIdCardPDF(student, settings);
                                  setToastMessage(`✓ Berhasil mengunduh Kartu Pelajar (KTS) untuk ${student.namaLengkap}!`);
                                  setTimeout(() => setToastMessage(null), 3500);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                                title="Unduh Kartu Pelajar Digital (KTS) 2 Sisi Format CR80"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Cetak KTS</span>
                              </button>

                              {/* Direct PDF Download Button */}
                              <button
                                onClick={() => handleDownloadVerificationPDF(student)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200/60 transition-colors cursor-pointer"
                                title="Unduh Surat Verifikasi (PDF)"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                                <span>Unduh Surat</span>
                              </button>
                            </div>

                            {/* View Full Document Modal Button */}
                            <button
                              onClick={() => openVerificationModal(student)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Surat</span>
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* DETAIL MODAL / OFFICIAL VERIFICATION DOCUMENT PREVIEW */}
            {selectedStudentDetail && (
              <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-scale-up my-auto max-h-[92vh] flex flex-col">
                  
                  {/* Modal Action Header (No-Print) */}
                  <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                          Surat Keterangan Verifikasi Keabsahan Data Siswa
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {settings.namaSekolah} • Pangkalan Data Buku Induk Digital
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          exportStudentIdCardPDF(selectedStudentDetail, settings);
                          setToastMessage(`✓ Berhasil mengunduh Kartu Pelajar (KTS) untuk ${selectedStudentDetail.namaLengkap}!`);
                          setTimeout(() => setToastMessage(null), 3500);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                        title="Unduh Kartu Pelajar Digital (KTS) 2 Sisi Format CR80"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cetak Kartu Siswa (KTS)</span>
                        <span className="sm:hidden">KTS</span>
                      </button>

                      <button
                        onClick={() => handleDownloadVerificationPDF(selectedStudentDetail)}
                        disabled={isGeneratingPDF}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                        title="Unduh Dokumen Berkas PDF Resmi"
                      >
                        {isGeneratingPDF ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileDown className="w-3.5 h-3.5" />
                        )}
                        <span>Unduh Surat PDF</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
                        title="Cetak Melalui Dialog Browser"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak</span>
                      </button>

                      <button
                        onClick={() => setSelectedStudentDetail(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                        title="Tutup"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* DOCUMENT CUSTOMIZATION CONTROLS BAR (No-Print) */}
                  <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 shrink-0 no-print flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">Keperluan Surat:</span>
                        <select
                          value={suratKeperluan}
                          onChange={(e) => setSuratKeperluan(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 text-xs focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                        >
                          <option value="Kelanjutan Studi ke Jenjang SMA / SMK / MA">Kelanjutan Studi ke Jenjang SMA / SMK / MA</option>
                          <option value="Verifikasi Ijazah & Pembuktian Kelulusan Resmi">Verifikasi Ijazah & Kelulusan Resmi</option>
                          <option value="Pengajuan & Syarat Beasiswa Pendidikan">Pengajuan & Syarat Beasiswa Pendidikan</option>
                          <option value="Pendaftaran Kursus / Kedinasan / TNI / POLRI">Pendaftaran Kursus / Kedinasan / TNI / POLRI</option>
                          <option value="Kelengkapan Berkas Administrasi Mutasi Sekolah">Kelengkapan Mutasi Sekolah</option>
                          <option value="Lainnya">Lainnya (Ketik Manual)...</option>
                        </select>
                      </div>

                      {suratKeperluan === 'Lainnya' && (
                        <input
                          type="text"
                          value={customKeperluan}
                          onChange={(e) => setCustomKeperluan(e.target.value)}
                          placeholder="Tuliskan keperluan surat di sini..."
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs flex-1 min-w-[200px]"
                        />
                      )}

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">Nomor Surat:</span>
                        <input
                          type="text"
                          value={suratNomor}
                          onChange={(e) => setSuratNomor(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs w-64 text-slate-800"
                        />
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Pengaturan di atas otomatis disematkan ke dalam berkas PDF.
                    </span>
                  </div>

                  {/* DOCUMENT PREVIEW & PRINTABLE SHEET */}
                  <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-50 flex justify-center">
                    
                    {/* A4 PRINTABLE CONTAINER */}
                    <div className="printable-sheet bg-white max-w-[210mm] w-full p-8 sm:p-12 shadow-md border border-slate-300 text-slate-900 space-y-6">
                      
                      {/* Official Letterhead (KOP SURAT) */}
                      <div className="text-center border-b-2 border-slate-900 pb-3 relative">
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                            <GraduationCap className="w-8 h-8" />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-[11px] font-bold tracking-wider uppercase text-slate-600">
                              Pemerintah Kabupaten {settings.kabupatenKota || 'Kediri'} • Dinas Pendidikan
                            </p>
                            <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                              {settings.namaSekolah}
                            </h3>
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                              {settings.alamat} • Kec. {settings.kecamatan || 'Kras'}, Kab. {settings.kabupatenKota || 'Kediri'}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Telp: {settings.telepon} • Email: {settings.email} • NPSN: {settings.npsn}
                            </p>
                          </div>
                        </div>
                        <div className="h-0.5 bg-slate-900 w-full mt-3" />
                        <div className="h-px bg-slate-500 w-full mt-0.5" />
                      </div>

                      {/* Document Title */}
                      <div className="text-center space-y-1">
                        <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 underline decoration-indigo-700 decoration-2 underline-offset-4">
                          SURAT KETERANGAN VERIFIKASI KEABSAHAN DATA SISWA
                        </h4>
                        <p className="text-[11px] font-mono font-medium text-slate-600">
                          Nomor: {suratNomor || `421.3 / VERIF-BI / ${new Date().getFullYear()} / ${selectedStudentDetail.nis || '001'}`}
                        </p>
                      </div>

                      {/* Introductory Statement */}
                      <p className="text-xs text-slate-700 leading-relaxed text-justify">
                        Yang bertanda tangan di bawah ini, Kepala Sekolah {settings.namaSekolah}, menerangkan dengan sesungguhnya bahwa data peserta didik di bawah ini benar-benar terdaftar dalam Pangkalan Data Buku Pokok Siswa (Buku Induk Digital) resmi sekolah:
                      </p>

                      {/* Student Identity Box */}
                      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-300 flex flex-col sm:flex-row gap-5 items-start">
                        {/* Student Photo */}
                        <div className="w-24 h-32 rounded-xl bg-white border border-slate-400 overflow-hidden flex items-center justify-center shrink-0 shadow-xs mx-auto sm:mx-0">
                          {selectedStudentDetail.foto ? (
                            <img 
                              src={selectedStudentDetail.foto} 
                              alt={selectedStudentDetail.namaLengkap} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="text-center p-2">
                              <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                              <span className="text-[9px] text-slate-400 font-bold block">PASFOTO</span>
                              <span className="text-[8px] text-slate-400 font-mono">3 x 4 CM</span>
                            </div>
                          )}
                        </div>

                        {/* Info Table */}
                        <div className="flex-1 w-full space-y-2 text-xs">
                          <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                            <span className="text-slate-500 font-semibold">Nama Lengkap</span>
                            <span className="col-span-2 font-bold text-slate-900 text-sm">{selectedStudentDetail.namaLengkap}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                            <span className="text-slate-500 font-semibold">Nomor Induk Siswa (NIS)</span>
                            <span className="col-span-2 font-bold font-mono text-indigo-700">{selectedStudentDetail.nis || '-'}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                            <span className="text-slate-500 font-semibold">NISN</span>
                            <span className="col-span-2 font-semibold font-mono text-slate-800">{selectedStudentDetail.nisn || '-'}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                            <span className="text-slate-500 font-semibold">Tempat, Tanggal Lahir</span>
                            <span className="col-span-2 font-semibold text-slate-800">
                              {selectedStudentDetail.tempatLahir}, {selectedStudentDetail.tanggalLahir || '-'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                            <span className="text-slate-500 font-semibold">Jenis Kelamin</span>
                            <span className="col-span-2 font-semibold text-slate-800">
                              {selectedStudentDetail.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                            <span className="text-slate-500 font-semibold">Nama Orang Tua / Wali</span>
                            <span className="col-span-2 font-semibold text-slate-800">
                              Ayah: {selectedStudentDetail.namaAyah || '-'} / Ibu: {selectedStudentDetail.namaIbu || '-'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                            <span className="text-slate-500 font-semibold">Status Siswa Saat Ini</span>
                            <div className="col-span-2">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                selectedStudentDetail.statusSiswa === 'Lulus'
                                  ? 'bg-blue-100 text-blue-800'
                                  : selectedStudentDetail.statusSiswa === 'Aktif'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {selectedStudentDetail.statusSiswa === 'Lulus' ? 'Telah Lulus (Alumni)' : selectedStudentDetail.statusSiswa === 'Aktif' ? 'Terdaftar Aktif' : selectedStudentDetail.statusSiswa}
                              </span>
                            </div>
                          </div>

                          {selectedStudentDetail.statusSiswa === 'Aktif' && (
                            <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                              <span className="text-slate-500 font-semibold">Rombel / Kelas Aktif</span>
                              <span className="col-span-2 font-bold text-slate-800">{selectedStudentDetail.kelasSaatIni}</span>
                            </div>
                          )}

                          {selectedStudentDetail.statusSiswa === 'Lulus' && (
                            <>
                              <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                                <span className="text-slate-500 font-semibold">Tahun Kelulusan</span>
                                <span className="col-span-2 font-bold text-slate-800">
                                  Tahun {selectedStudentDetail.tanggalLulus ? selectedStudentDetail.tanggalLulus.substring(0, 4) : 'Tercatat'}
                                </span>
                              </div>
                              {selectedStudentDetail.alumniLanjutKe && (
                                <div className="grid grid-cols-3 gap-2 pb-1 border-b border-slate-200">
                                  <span className="text-slate-500 font-semibold">Sekolah Lanjutan</span>
                                  <span className="col-span-2 font-semibold text-indigo-700">
                                    {selectedStudentDetail.alumniLanjutKe}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Purpose & Legal Statement */}
                      <div className="space-y-2 text-xs text-slate-700 leading-relaxed text-justify">
                        <p>
                          Surat keterangan verifikasi ini diterbitkan secara sah berdasarkan data otentik yang tercatat pada Buku Induk Siswa Digital dan sinkronisasi DAPODIK {settings.namaSekolah}, untuk dipergunakan sebagai kelengkapan administrasi <strong>{suratKeperluan === 'Lainnya' ? (customKeperluan || 'Verifikasi Keabsahan Data Siswa') : suratKeperluan}</strong>.
                        </p>
                        <p>
                          Demikian surat keterangan verifikasi ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.
                        </p>
                      </div>

                      {/* Signature & Seal Block */}
                      <div className="pt-4 flex items-end justify-between text-xs text-slate-700">
                        {/* Digital Verification QR & Seal */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 shadow-xs flex items-center justify-center">
                              <QrCode className="w-12 h-12 text-slate-800" />
                            </div>
                            <div className="text-[10px] text-slate-500 space-y-0.5">
                              <span className="font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                TERVERIFIKASI SAH
                              </span>
                              <p className="font-mono">Pangkalan Data Buku Induk</p>
                              <p className="font-mono">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                        </div>

                        {/* Headmaster Signature & Seal */}
                        <div className="text-center sm:text-right space-y-1 min-w-[200px] relative">
                          <p className="text-xs font-semibold text-slate-800">
                            {settings.kecamatan || 'Kras'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[11px] text-slate-600">Kepala {settings.namaSekolah}</p>
                          
                          {/* Official Stempel Cap Dinas */}
                          <div className="py-2 relative flex justify-center sm:justify-end">
                            <div className="w-24 h-12 border-2 border-dashed border-blue-600/40 rounded-full flex items-center justify-center text-[9px] font-bold text-blue-700 uppercase transform -rotate-6">
                              CAP DINAS RESMI
                            </div>
                          </div>

                          <p className="font-bold text-slate-900 underline text-xs">{settings.kepalaSekolah}</p>
                          <p className="text-[10px] font-mono text-slate-600">NIP. {settings.nipKepalaSekolah}</p>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Modal Footer (No-Print) */}
                  <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
                    <button
                      onClick={() => handleCopySummary(selectedStudentDetail)}
                      className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      {copiedStudentId === selectedStudentDetail.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Ringkasan</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedStudentDetail(null)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Tutup
                      </button>
                      <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Dokumen</span>
                      </button>
                      <button
                        onClick={() => handleDownloadVerificationPDF(selectedStudentDetail)}
                        disabled={isGeneratingPDF}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingPDF ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileDown className="w-4 h-4" />
                        )}
                        <span>Unduh Surat (Format PDF)</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: PORTAL PENDAFTARAN ALUMNI (TRACER STUDY) */}
        {/* ==================================================================== */}
        {activeTab === 'daftar-alumni' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            
            {/* SUCCESS VIEW */}
            {registeredSuccess ? (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6 text-center animate-scale-up">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Pendaftaran Berhasil!
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Terima Kasih, Rekan Alumni!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {registeredSuccess.message} Data Anda telah masuk ke dalam direktori Tracer Study & Buku Induk Alumni {settings.namaSekolah}.
                  </p>
                </div>

                {/* DIGITAL ALUMNI MEMBERSHIP CARD */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl text-left border border-white/10 relative overflow-hidden max-w-md mx-auto">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />
                  
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-400" />
                      <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-200">
                        KARTU ANGGOTA ALUMNI
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      SMPN 3 KRAS
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="w-14 h-18 rounded-xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                      {registeredSuccess.student.foto ? (
                        <img 
                          src={registeredSuccess.student.foto} 
                          alt={registeredSuccess.student.namaLengkap} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-xl font-bold text-white">
                          {registeredSuccess.student.namaLengkap.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-white truncate">
                        {registeredSuccess.student.namaLengkap}
                      </h4>
                      <p className="text-xs text-indigo-300 font-medium">
                        Lulus Tahun {registeredSuccess.student.tanggalLulus ? registeredSuccess.student.tanggalLulus.substring(0, 4) : 'Tercatat'}
                      </p>
                      <p className="text-[11px] text-slate-300 truncate mt-1">
                        Lanjut Ke: {registeredSuccess.student.alumniLanjutKe || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>NIS: {registeredSuccess.student.nis || '-'}</span>
                    <span>Tervalidasi Digital ✓</span>
                  </div>
                </div>

                {/* PDF & Action Buttons */}
                <div className="pt-4 flex flex-wrap justify-center gap-3 no-print">
                  <button
                    onClick={() => handleDownloadAlumniCardPDF(registeredSuccess.student)}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Unduh Kartu Alumni (PDF)</span>
                  </button>
                  <button
                    onClick={() => handleDownloadVerificationPDF(registeredSuccess.student)}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Unduh Surat Keterangan (PDF)</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Dokumen</span>
                  </button>
                  <button
                    onClick={() => {
                      setRegisteredSuccess(null);
                      setAlumniForm({
                        namaLengkap: '',
                        nis: '',
                        nisn: '',
                        jenisKelamin: 'L',
                        tahunLulus: '2025',
                        kategoriLanjutan: 'SMA/SMK Negeri',
                        alumniLanjutKe: '',
                        telepon: '',
                        email: '',
                        alamat: '',
                        alumniCatatan: '',
                        foto: ''
                      });
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Daftarkan Alumni Lain
                  </button>
                  <button
                    onClick={() => setActiveTab('cek-siswa')}
                    className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Ke Portal Cek Data Siswa
                  </button>
                </div>
              </div>
            ) : (
              /* ALUMNI REGISTRATION FORM */
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
                
                {/* Form Header */}
                <div className="space-y-2 border-b border-slate-100 pb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full text-indigo-700 text-xs font-bold tracking-wider uppercase">
                    <GraduationCap className="w-4 h-4" />
                    Tracer Study Alumni SMP Negeri 3 Kras
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Formulir Pendaftaran & Pendataan Alumni
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Bantu almamater mendata jejak langkah para alumni, membangun jejaring silaturahmi yang kuat, serta menjadi inspirasi bagi adik-adik kelas Anda.
                  </p>
                </div>

                {/* Error Banner */}
                {formError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Harap Periksa Data:</strong>
                      <span>{formError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmitAlumni} className="space-y-6">
                  
                  {/* SECTION 1: IDENTITAS ALUMNI */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                      <IdCard className="w-4 h-4 text-indigo-600" />
                      1. Identitas Pokok Alumni
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Nama Lengkap */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Nama Lengkap Sesuai Ijazah <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          value={alumniForm.namaLengkap}
                          onChange={(e) => setAlumniForm({ ...alumniForm, namaLengkap: e.target.value })}
                          placeholder="Masukkan nama lengkap Anda..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                        />
                      </div>

                      {/* NIS */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Nomor Induk Siswa (NIS) <span className="text-slate-400 font-normal">(opsional)</span>
                        </label>
                        <input 
                          type="text"
                          value={alumniForm.nis}
                          onChange={(e) => setAlumniForm({ ...alumniForm, nis: e.target.value })}
                          placeholder="Nomor NIS saat bersekolah..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Membantu pencocokan otomatis ke buku induk lama jika Anda mengingatnya.
                        </span>
                      </div>

                      {/* NISN */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          NISN <span className="text-slate-400 font-normal">(opsional)</span>
                        </label>
                        <input 
                          type="text"
                          value={alumniForm.nisn}
                          onChange={(e) => setAlumniForm({ ...alumniForm, nisn: e.target.value })}
                          placeholder="Nomor Induk Siswa Nasional..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                        />
                      </div>

                      {/* Jenis Kelamin */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Jenis Kelamin <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-4 pt-1">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input 
                              type="radio"
                              name="jenisKelamin"
                              checked={alumniForm.jenisKelamin === 'L'}
                              onChange={() => setAlumniForm({ ...alumniForm, jenisKelamin: 'L' })}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Laki-laki</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input 
                              type="radio"
                              name="jenisKelamin"
                              checked={alumniForm.jenisKelamin === 'P'}
                              onChange={() => setAlumniForm({ ...alumniForm, jenisKelamin: 'P' })}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Perempuan</span>
                          </label>
                        </div>
                      </div>

                      {/* Tahun Lulus */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Tahun Kelulusan / Angkatan <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={alumniForm.tahunLulus}
                          onChange={(e) => setAlumniForm({ ...alumniForm, tahunLulus: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all cursor-pointer"
                        >
                          {graduationYearOptions.map((year) => (
                            <option key={year} value={year}>
                              Tahun {year}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* SECTION 2: JEJAK PENDIDIKAN & KARIR */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Building className="w-4 h-4 text-indigo-600" />
                      2. Sekolah Lanjutan / Aktivitas Saat Ini
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Kategori Lanjutan */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Kategori Aktivitas Saat Ini
                        </label>
                        <select
                          value={alumniForm.kategoriLanjutan}
                          onChange={(e) => setAlumniForm({ ...alumniForm, kategoriLanjutan: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all cursor-pointer"
                        >
                          <option value="SMA/SMK Negeri">SMA / SMK Negeri</option>
                          <option value="SMA/SMK Swasta">SMA / SMK Swasta</option>
                          <option value="Madrasah Aliyah (MA)">Madrasah Aliyah (MA)</option>
                          <option value="Pondok Pesantren">Pondok Pesantren</option>
                          <option value="Perguruan Tinggi (Kuliah)">Perguruan Tinggi (Kuliah)</option>
                          <option value="Bekerja / Karir">Bekerja / Karyawan</option>
                          <option value="Wirausaha / Usaha Mandiri">Wirausaha / Bisnis Mandiri</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      {/* Detail Nama Institusi / Sekolah */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Nama Sekolah / Kampus / Tempat Kerja
                        </label>
                        <input 
                          type="text"
                          value={alumniForm.alumniLanjutKe}
                          onChange={(e) => setAlumniForm({ ...alumniForm, alumniLanjutKe: e.target.value })}
                          placeholder="Contoh: SMAN 1 Kras, SMKN 2 Kediri, atau PT. ABC"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                        />
                      </div>

                      {/* Domisili Saat Ini */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Kota / Alamat Tempat Tinggal Sekarang
                        </label>
                        <input 
                          type="text"
                          value={alumniForm.alamat}
                          onChange={(e) => setAlumniForm({ ...alumniForm, alamat: e.target.value })}
                          placeholder="Contoh: Kec. Kras, Kab. Kediri, Jawa Timur"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                        />
                      </div>

                    </div>
                  </div>

                  {/* SECTION 3: KONTAK & MEDIA KOMUNIKASI */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Phone className="w-4 h-4 text-indigo-600" />
                      3. Kontak Jaringan Alumni
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Nomor WA */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="tel"
                          required
                          value={alumniForm.telepon}
                          onChange={(e) => setAlumniForm({ ...alumniForm, telepon: e.target.value })}
                          placeholder="Contoh: 08123456789"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Digunakan oleh koordinator alumni untuk penyampaian agenda reuni/kabar sekolah.
                        </span>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Alamat Email <span className="text-slate-400 font-normal">(opsional)</span>
                        </label>
                        <input 
                          type="email"
                          value={alumniForm.email}
                          onChange={(e) => setAlumniForm({ ...alumniForm, email: e.target.value })}
                          placeholder="nama@gmail.com"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                        />
                      </div>

                    </div>
                  </div>

                  {/* SECTION 4: FOTO & PESAN ALUMNI */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      4. Pesan untuk Almamater & Pasfoto
                    </h3>

                    <div className="space-y-4">
                      
                      {/* Pesan Kesan */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Kesan, Pesan atau Harapan untuk {settings.namaSekolah}
                        </label>
                        <textarea
                          rows={3}
                          value={alumniForm.alumniCatatan}
                          onChange={(e) => setAlumniForm({ ...alumniForm, alumniCatatan: e.target.value })}
                          placeholder="Tuliskan sepatah kata pesan inspiratif untuk guru dan adik-adik kelas Anda..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all resize-none"
                        />
                      </div>

                      {/* Upload Foto */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Pasfoto / Foto Profil Alumni <span className="text-slate-400 font-normal">(opsional)</span>
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-18 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {alumniForm.foto ? (
                              <img src={alumniForm.foto} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <GraduationCap className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Format JPG, PNG atau WebP (Maksimal 2MB).</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-400">
                      Dengan mengirimkan formulir ini, Anda menyetujui penyimpanan data untuk keperluan jejaring alumni resmi {settings.namaSekolah}.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Menyimpan Data...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Kirim Pendaftaran Alumni</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>
            )}

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: VALIDASI KEABSAHAN DOKUMEN & SCAN QR CODE RESMI */}
        {/* ==================================================================== */}
        {activeTab === 'verifikasi-qr' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Validasi Keabsahan Dokumen & Scan QR Code
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Otoritas Terverifikasi
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  Gunakan portal ini untuk memverifikasi keaslian Surat Keterangan Siswa, Kartu Pelajar (KTS), atau Surat Kelulusan yang diterbitkan oleh pangkalan data resmi {settings.namaSekolah}.
                </p>
              </div>
            </div>

            {/* Verification Input Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Nomor Surat / NIS / NISN / Kode QR Dokumen
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleVerifyQRDocument();
                      }
                    }}
                    placeholder="Contoh: 421.3 / VERIF-BI / 2026 / 2101 atau NIS 2101"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 outline-hidden focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                <button
                  onClick={() => handleVerifyQRDocument()}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cek Keabsahan Sekarang</span>
                </button>
              </div>

              {/* Sample test shortcuts */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-400">Uji Cepat Dokumen:</span>
                {students.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setQrInput(s.nis || s.id);
                      handleVerifyQRDocument(s.nis || s.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Dokumen NIS {s.nis} ({s.namaLengkap.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Result Display */}
            {qrVerifiedResult && (
              qrVerifiedResult.found && qrVerifiedResult.student ? (
                /* Valid Official Certificate Card */
                <div className="bg-white rounded-3xl border-2 border-emerald-500 p-6 sm:p-10 shadow-lg space-y-6 relative overflow-hidden animate-scale-up">
                  {/* Watermark/Seal background */}
                  <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-emerald-50/70 border-8 border-emerald-100 flex items-center justify-center pointer-events-none opacity-40">
                    <ShieldCheck className="w-24 h-24 text-emerald-600" />
                  </div>

                  {/* Header of Authenticity */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                          STATUS VERIFIKASI RESMI
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          DOKUMEN DINYATAKAN ASLI, SAH & TERVERIFIKASI
                        </h3>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="font-mono text-[10px] font-bold text-slate-500 block">
                        No. Registrasi Sistem:
                      </span>
                      <span className="font-mono text-xs font-black text-indigo-700">
                        {qrVerifiedResult.registrationNo}
                      </span>
                    </div>
                  </div>

                  {/* Student Verified Data Table */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Nama Lengkap Siswa
                      </span>
                      <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                        {qrVerifiedResult.student.namaLengkap}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Nomor Induk Siswa (NIS / NISN)
                      </span>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">
                        NIS: {qrVerifiedResult.student.nis || '-'} • NISN: {qrVerifiedResult.student.nisn || '-'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Status & Rombongan Belajar
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {qrVerifiedResult.student.statusSiswa === 'Aktif' 
                          ? `Siswa Aktif (Kelas ${qrVerifiedResult.student.kelasSaatIni || '-'})` 
                          : qrVerifiedResult.student.statusSiswa === 'Lulus'
                          ? `Alumni Lulus Tahun ${qrVerifiedResult.student.tanggalLulus ? qrVerifiedResult.student.tanggalLulus.substring(0, 4) : '-'}`
                          : 'Mutasi / Pindah'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Lembaga Penerbit
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {settings.namaSekolah} (NPSN: {settings.npsn})
                      </p>
                    </div>
                  </div>

                  {/* Authority Footer & Signatory */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Diverifikasi pada: <strong>{qrVerifiedResult.verifiedAt}</strong></span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">Penandatangan Resmi:</span>
                      <span className="font-bold text-slate-800">{settings.kepalaSekolah}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">NIP. {settings.nipKepalaSekolah}</span>
                    </div>
                  </div>

                  {/* Actions for Verified Document */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleDownloadVerificationPDF(qrVerifiedResult.student!)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Unduh Surat Keterangan Sah (PDF)</span>
                    </button>
                    <button
                      onClick={() => {
                        exportStudentIdCardPDF(qrVerifiedResult.student!, settings);
                        setToastMessage(`✓ Berhasil mengunduh Kartu Pelajar (KTS) untuk ${qrVerifiedResult.student!.namaLengkap}!`);
                        setTimeout(() => setToastMessage(null), 3500);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Unduh Kartu Pelajar (KTS Digital)</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Bukti Verifikasi</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Document Not Found Alert */
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 text-center space-y-3 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-rose-900">
                    Dokumen Tidak Ditemukan / Tidak Terdaftar
                  </h3>
                  <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                    Kode pencarian "<strong>{qrVerifiedResult.searchedCode}</strong>" tidak cocok dengan arsip buku induk resmi SMP Negeri 3 Kras. Mohon periksa kembali nomor surat atau nomor induk siswa.
                  </p>
                </div>
              )
            )}

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: PENGAJUAN & PELACAKAN STATUS MUTASI SISWA */}
        {/* ==================================================================== */}
        {activeTab === 'pengajuan-mutasi' && (
          <PublicMutationSubmission
            settings={settings}
            students={students}
            applications={currentMutationApps}
            onSubmitApplication={handleSubmitMutationApp}
          />
        )}

      </main>

      {/* PRIVACY UNLOCK MODAL (UU PDP No. 27/2022) */}
      {unlockStudentTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Verifikasi Hak Akses Siswa / Wali</h3>
                  <span className="text-[10px] text-slate-400">Kepatuhan UU PDP No. 27 Tahun 2022</span>
                </div>
              </div>
              <button
                onClick={() => setUnlockStudentTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Untuk melindungi privasi data pribadi siswa <strong>{unlockStudentTarget.namaLengkap}</strong>, silakan konfirmasi identitas dengan memasukkan:
              <span className="block mt-1 font-semibold text-slate-700">
                • 4 digit terakhir NISN siswa, atau<br />
                • Tanggal Lahir (Format: YYYY-MM-DD, contoh: 2010-05-14)
              </span>
            </p>

            <form onSubmit={handleVerifyStudentAccess} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ketik 4 digit akhir NISN atau Tanggal Lahir..."
                  value={unlockInput}
                  onChange={(e) => setUnlockInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-hidden focus:border-indigo-600 focus:bg-white transition-all"
                />
                {unlockError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{unlockError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUnlockStudentTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Verifikasi & Buka Kunci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500 font-medium no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-bold text-slate-800">{settings.namaSekolah}</p>
            <p className="text-[11px] text-slate-400">Portal Utama Layanan Informasi Siswa & Tracer Study Alumni Terintegrasi.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px]">
            <span className="text-slate-400">
              Dev: <strong className="text-slate-700 font-bold">Khabibu Rohman</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Versi Sistem 2.6</span>
            {currentUser ? (
              <>
                <span className="text-slate-300">•</span>
                {onGoToDashboard && (
                  <button
                    onClick={onGoToDashboard}
                    className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
                  >
                    Dashboard Buku Induk
                  </button>
                )}
              </>
            ) : (
              /* Tanda Rahasia Footer: Ikon mikro-gembok halus yang hanya disadari oleh operator */
              onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  title="Sistem Terproteksi"
                  aria-label="Akses Internal Operator"
                  className="inline-flex items-center text-slate-400/40 hover:text-indigo-600 transition-colors cursor-pointer p-0.5 ml-0.5"
                >
                  <Lock className="w-2.5 h-2.5 opacity-25 hover:opacity-100 transition-opacity" />
                </button>
              )
            )}
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM MENU BAR */}
      <nav 
        aria-label="Navigasi Bawah Portal Publik"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] no-print flex items-center justify-around gap-1"
      >
        {/* 1. Cek Siswa */}
        <button
          onClick={() => {
            setActiveTab('cek-siswa');
            setSelectedStudentDetail(null);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'cek-siswa'
              ? 'bg-indigo-50 text-indigo-700 font-bold scale-[1.02]'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Cek Siswa</span>
        </button>

        {/* 2. Pendaftaran Alumni */}
        <button
          onClick={() => {
            setActiveTab('daftar-alumni');
            setRegisteredSuccess(null);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'daftar-alumni'
              ? 'bg-indigo-50 text-indigo-700 font-bold scale-[1.02]'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserPlus className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Alumni</span>
        </button>

        {/* 3. Validasi Dokumen & QR */}
        <button
          onClick={() => {
            setActiveTab('verifikasi-qr');
            setSelectedStudentDetail(null);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'verifikasi-qr'
              ? 'bg-indigo-50 text-indigo-700 font-bold scale-[1.02]'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Validasi QR</span>
        </button>

        {/* 4. Pengajuan & Lacak Mutasi */}
        <button
          onClick={() => {
            setActiveTab('pengajuan-mutasi');
            setSelectedStudentDetail(null);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'pengajuan-mutasi'
              ? 'bg-indigo-50 text-indigo-700 font-bold scale-[1.02]'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Mutasi</span>
        </button>

        {/* 5. Dasbor Buku Induk (Hanya muncul jika Operator sudah login) */}
        {currentUser && onGoToDashboard && (
          <button
            onClick={onGoToDashboard}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-indigo-700 bg-indigo-50/80 font-bold transition-all duration-200 cursor-pointer"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold leading-none">Dasbor</span>
          </button>
        )}
      </nav>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-slide-up no-print">
          <div className="bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md max-w-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-200 leading-snug">
              {toastMessage}
            </p>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
