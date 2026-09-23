/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MutationApplication, Student, SchoolSettings } from '../types';
import { 
  exportStudentMutationApplicationPDF,
  exportOfficialSuratMutasiKeluarPDF,
  exportOfficialSuratMutasiMasukPDF
} from '../utils/pdfUtils';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Printer,
  Copy,
  Check,
  Building2,
  User,
  Phone,
  Calendar,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  ExternalLink,
  HelpCircle,
  RotateCcw,
  FileSignature,
  QrCode,
  MapPin,
  School,
  Briefcase
} from 'lucide-react';

interface PublicMutationSubmissionProps {
  settings: SchoolSettings;
  students: Student[];
  applications: MutationApplication[];
  onSubmitApplication: (application: MutationApplication) => void;
}

export default function PublicMutationSubmission({
  settings,
  students,
  applications,
  onSubmitApplication
}: PublicMutationSubmissionProps) {
  // Navigation mode inside this section: 'form' | 'tracking'
  const [mode, setMode] = useState<'form' | 'tracking'>('form');

  // Form states
  const [jenisMutasi, setJenisMutasi] = useState<'MUTASI_KELUAR' | 'MUTASI_MASUK'>('MUTASI_KELUAR');
  const [formNamaSiswa, setFormNamaSiswa] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formJenisKelamin, setFormJenisKelamin] = useState<'L' | 'P'>('L');
  const [formTempatLahir, setFormTempatLahir] = useState('Kediri');
  const [formTanggalLahir, setFormTanggalLahir] = useState('2011-01-01');
  const [formKelasAsal, setFormKelasAsal] = useState('7-A');
  const [formKelasTujuan, setFormKelasTujuan] = useState('7-A');
  const [formSekolahAsal, setFormSekolahAsal] = useState(settings.namaSekolah || 'SMP NEGERI 3 KRAS');
  const [formSekolahTujuan, setFormSekolahTujuan] = useState('');
  const [formAlasanMutasi, setFormAlasanMutasi] = useState('');

  // Detailed fields
  const [formJalurMutasi, setFormJalurMutasi] = useState<'ANTAR_KABUPATEN' | 'DALAM_KABUPATEN' | 'ANTAR_PROVINSI' | 'MADRASAH_KEMENAG' | 'SWASTA_KE_NEGERI' | 'LUAR_NEGERI'>('DALAM_KABUPATEN');
  const [formKategoriAlasan, setFormKategoriAlasan] = useState<'TUGAS_ORANG_TUA' | 'PINDAH_DOMISILI' | 'PONDOK_PESANTREN' | 'JARAK_TRANSPORTASI' | 'KESEHATAN' | 'LAINNYA'>('PINDAH_DOMISILI');
  const [formNpsnSekolahAsal, setFormNpsnSekolahAsal] = useState(settings.npsn || '20511999');
  const [formNpsnSekolahTujuan, setFormNpsnSekolahTujuan] = useState('');
  const [formKabupatenKotaTujuan, setFormKabupatenKotaTujuan] = useState('Kab. Kediri');

  // Parent / Applicant Form States
  const [formNamaPemohon, setFormNamaPemohon] = useState('');
  const [formHubungan, setFormHubungan] = useState<'Orang Tua' | 'Wali' | 'Siswa Sendiri' | 'Lainnya'>('Orang Tua');
  const [formKontakPemohon, setFormKontakPemohon] = useState('');
  const [formEmailPemohon, setFormEmailPemohon] = useState('');
  const [formAlamatPemohon, setFormAlamatPemohon] = useState('');
  const [formPekerjaanPemohon, setFormPekerjaanPemohon] = useState('Wiraswasta / Karyawan');

  // Physical checklist verification
  const [berkasSuratOrtu, setBerkasSuratOrtu] = useState(true);
  const [berkasRapor, setBerkasRapor] = useState(true);
  const [berkasKkKtp, setBerkasKkKtp] = useState(true);
  const [berkasPindahAsal, setBerkasPindahAsal] = useState(false);
  const [berkasBebasPerpus, setBerkasBebasPerpus] = useState(true);
  const [berkasRekomDinas, setBerkasRekomDinas] = useState(false);
  const [berkasKelakuanBaik, setBerkasKelakuanBaik] = useState(false);

  // Success result state
  const [submissionSuccess, setSubmissionSuccess] = useState<MutationApplication | null>(null);
  const [copiedResi, setCopiedResi] = useState(false);

  // Tracking query state
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingSearched, setTrackingSearched] = useState(false);

  // Student auto-lookup for Mutasi Keluar
  const handleSelectExistingStudent = (studentId: string) => {
    const found = students.find(s => s.id === studentId);
    if (found) {
      setFormNamaSiswa(found.namaLengkap);
      setFormNis(found.nis);
      setFormNisn(found.nisn);
      setFormJenisKelamin(found.jenisKelamin);
      setFormTempatLahir(found.tempatLahir);
      setFormTanggalLahir(found.tanggalLahir);
      setFormKelasAsal(found.kelasSaatIni);
      setFormSekolahAsal(settings.namaSekolah || 'SMP NEGERI 3 KRAS');
      setFormNpsnSekolahAsal(settings.npsn || '20511999');
      setFormNamaPemohon(found.namaAyah || found.namaIbu || '');
      setFormKontakPemohon(found.teleponOrangTua || found.telepon || '');
      setFormAlamatPemohon(found.alamatOrangTua || found.alamat || '');
      setFormPekerjaanPemohon(found.pekerjaanAyah || found.pekerjaanIbu || 'Wiraswasta');
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNamaSiswa || !formNisn || !formNamaPemohon || !formKontakPemohon || !formAlasanMutasi) {
      alert('Mohon lengkapi Nama Siswa, NISN, Nama Pemohon, No. WhatsApp, dan Alasan Mutasi.');
      return;
    }

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const generatedNoReg = `REG-MUT-${yearMonth}-${randomSeq}`;

    const newApp: MutationApplication = {
      id: 'mut-online-' + Date.now(),
      nomorRegistrasi: generatedNoReg,
      jenisMutasi,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      statusPengajuan: 'MENUNGGU_VERIFIKASI',
      namaPemohon: formNamaPemohon,
      hubunganDenganSiswa: formHubungan,
      kontakPemohon: formKontakPemohon,
      emailPemohon: formEmailPemohon,
      alamatPemohon: formAlamatPemohon,
      pekerjaanPemohon: formPekerjaanPemohon,
      namaSiswa: formNamaSiswa,
      nis: formNis,
      nisn: formNisn,
      jenisKelamin: formJenisKelamin,
      tempatLahir: formTempatLahir,
      tanggalLahir: formTanggalLahir,
      kelasAsal: formKelasAsal,
      kelasTujuan: formKelasTujuan,
      sekolahAsal: formSekolahAsal || (jenisMutasi === 'MUTASI_KELUAR' ? settings.namaSekolah : ''),
      sekolahTujuan: formSekolahTujuan || (jenisMutasi === 'MUTASI_MASUK' ? settings.namaSekolah : ''),
      npsnSekolahAsal: formNpsnSekolahAsal,
      npsnSekolahTujuan: formNpsnSekolahTujuan,
      kabupatenKotaTujuan: formKabupatenKotaTujuan,
      jalurMutasi: formJalurMutasi,
      kategoriAlasan: formKategoriAlasan,
      alasanMutasi: formAlasanMutasi,
      semesterMutasi: 'Genap',
      tahunAjaranMutasi: '2025/2026',
      berkas: {
        suratPermohonanOrtu: berkasSuratOrtu,
        fotokopiRapor: berkasRapor,
        fotokopiKkKtp: berkasKkKtp,
        suratKeteranganPindahAsal: jenisMutasi === 'MUTASI_MASUK' ? berkasPindahAsal : false,
        suratBebasPinjamPerpus: jenisMutasi === 'MUTASI_KELUAR' ? berkasBebasPerpus : false,
        suratRekomendasiDinas: berkasRekomDinas,
        suratKelakuanBaik: berkasKelakuanBaik,
        catatanBerkas: 'Pengajuan online via Portal Publik Layanan Terpadu'
      },
      bebasAdministrasi: {
        perpustakaan: false,
        keuanganKomite: false,
        kesiswaanBK: false,
        kurikulum: false
      },
      statusDapodik: {
        terdaftarDapodik: false,
        statusVervalPD: 'BELUM_VERVAL'
      },
      catatanVerifikasi: 'Berkas baru diterima via formulir portal publik. Menunggu penyerahan berkas fisik ke loket Tata Usaha.',
      verifikator: 'Sistem Portal Publik'
    };

    onSubmitApplication(newApp);
    setSubmissionSuccess(newApp);
  };

  // Copy registration code
  const handleCopyResi = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  // Tracking query results
  const trackingResults = useMemo(() => {
    if (!trackingQuery.trim()) return [];
    const q = trackingQuery.trim().toLowerCase();
    return applications.filter(app => {
      const matchReg = app.nomorRegistrasi.toLowerCase().includes(q);
      const matchNisn = app.nisn.toLowerCase().includes(q);
      const matchName = app.namaSiswa.toLowerCase().includes(q);
      const matchPemohon = app.namaPemohon.toLowerCase().includes(q);
      return matchReg || matchNisn || matchName || matchPemohon;
    });
  }, [applications, trackingQuery]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold text-indigo-200 backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Layanan Terpadu Satu Pintu (PTSP) Online &bull; {settings.namaSekolah}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pengajuan & Pelacakan Mutasi Siswa
          </h2>
          
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Fasilitas resmi bagi orang tua dan wali murid untuk mengajukan permohonan <strong>Mutasi Keluar</strong> (pindah sekolah) maupun <strong>Mutasi Masuk</strong> (siswa pindahan) secara transparan, akurat, dan dapat dilacak langsung status verifikasinya.
          </p>

          {/* Toggle buttons between Form & Tracking */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setMode('form');
                setSubmissionSuccess(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mode === 'form'
                  ? 'bg-white text-slate-900 shadow-md font-extrabold'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Formulir Pengajuan Mutasi</span>
            </button>

            <button
              onClick={() => setMode('tracking')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mode === 'tracking'
                  ? 'bg-white text-slate-900 shadow-md font-extrabold'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Lacak Status Permohonan (Cek Resi)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODE: FORM PENGAJUAN MUTASI */}
      {mode === 'form' && (
        <>
          {submissionSuccess ? (
            /* SUCCESS CONFIRMATION RECEIPT CARD */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm max-w-2xl mx-auto space-y-6 animate-scale-up">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Pengajuan Mutasi Berhasil Terkirim!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Permohonan mutasi Anda telah tercatat di sistem administrasi Tata Usaha {settings.namaSekolah}.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor Resi / Registrasi</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-sm bg-white px-2.5 py-1 rounded-lg border border-slate-300">
                      {submissionSuccess.nomorRegistrasi}
                    </span>
                    <button
                      onClick={() => handleCopyResi(submissionSuccess.nomorRegistrasi)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md border border-slate-200 transition-colors cursor-pointer"
                      title="Salin Nomor Resi"
                    >
                      {copiedResi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Nama Siswa:</span>
                    <strong className="font-bold text-slate-800">{submissionSuccess.namaSiswa}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">NISN:</span>
                    <strong className="font-mono text-slate-800">{submissionSuccess.nisn}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Jenis Mutasi:</span>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      submissionSuccess.jenisMutasi === 'MUTASI_MASUK' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {submissionSuccess.jenisMutasi === 'MUTASI_MASUK' ? 'Mutasi Masuk' : 'Mutasi Keluar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Status Awal:</span>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">
                      Menunggu Verifikasi
                    </span>
                  </div>
                </div>
              </div>

              {/* Next steps instruction banner */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-800 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-amber-900 mb-0.5">Petunjuk Langkah Selanjutnya:</strong>
                  Simpan atau cetak tanda terima permohonan ini. Bawa berkas fisik persyaratan (Surat Permohonan Ortu, Fotokopi Rapor, KK, dll.) ke ruang Tata Usaha {settings.namaSekolah} pada jam operasional (Senin-Jumat: 07.30 - 14.30 WIB).
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => exportStudentMutationApplicationPDF(submissionSuccess, settings)}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Unduh & Cetak Tanda Terima (PDF)</span>
                </button>

                <button
                  onClick={() => {
                    setTrackingQuery(submissionSuccess.nomorRegistrasi);
                    setMode('tracking');
                  }}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Lacak Status Sekarang</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setSubmissionSuccess(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Ajukan Permohonan Siswa Lain
                </button>
              </div>
            </div>
          ) : (
            /* FORM ENTRY */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Formulir Pendaftaran Mutasi Siswa
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Silakan isi seluruh informasi siswa dan pemohon dengan benar sesuai dokumen resmi.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              {/* Mutation Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Pilih Jenis Mutasi *</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setJenisMutasi('MUTASI_KELUAR');
                      setFormSekolahAsal(settings.namaSekolah || 'SMP NEGERI 3 KRAS');
                      setFormSekolahTujuan('');
                    }}
                    className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      jenisMutasi === 'MUTASI_KELUAR'
                        ? 'bg-white text-rose-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Mutasi Keluar (Pindah ke Sekolah Lain)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setJenisMutasi('MUTASI_MASUK');
                      setFormSekolahAsal('');
                      setFormSekolahTujuan(settings.namaSekolah || 'SMP NEGERI 3 KRAS');
                    }}
                    className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      jenisMutasi === 'MUTASI_MASUK'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Mutasi Masuk (Siswa Pindahan Masuk)</span>
                  </button>
                </div>
              </div>

              {/* If Mutasi Keluar: Quick Selector for existing active students */}
              {jenisMutasi === 'MUTASI_KELUAR' && (
                <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                  <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-rose-600" />
                    <span>Pilih Siswa Aktif SMP NEGERI 3 KRAS (Opsional untuk Autofill)</span>
                  </label>
                  <select
                    onChange={(e) => handleSelectExistingStudent(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-xl focus:outline-hidden focus:border-rose-500 font-semibold"
                  >
                    <option value="">-- Cari atau Pilih Nama Siswa Aktif --</option>
                    {students.filter(s => s.statusSiswa === 'Aktif').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.namaLengkap} &bull; Kelas: {s.kelasSaatIni} &bull; NIS: {s.nis} &bull; NISN: {s.nisn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* SECTION 1: IDENTITAS SISWA */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">1</span>
                    <span>Identitas Peserta Didik</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600">Nama Lengkap Siswa *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Muhammad Budi Pratama"
                        value={formNamaSiswa}
                        onChange={(e) => setFormNamaSiswa(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Jenis Kelamin *</label>
                      <select
                        value={formJenisKelamin}
                        onChange={(e) => setFormJenisKelamin(e.target.value as 'L' | 'P')}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">NISN (10 Digit) *</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="Contoh: 0098765432"
                        value={formNisn}
                        onChange={(e) => setFormNisn(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">NIS / Nomor Induk</label>
                      <input
                        type="text"
                        placeholder="NIS Siswa"
                        value={formNis}
                        onChange={(e) => setFormNis(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Kelas / Rombel *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 7-A atau Kelas 8"
                        value={formKelasAsal}
                        onChange={(e) => setFormKelasAsal(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ALUR KEPINDAHAN */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">2</span>
                    <span>Keterangan Alur & Legalitas Mutasi Sekolah</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Jalur Mutasi Kedinasan *</label>
                      <select
                        value={formJalurMutasi}
                        onChange={(e) => setFormJalurMutasi(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold bg-white"
                      >
                        <option value="DALAM_KABUPATEN">Dalam Kabupaten (Kab. Kediri)</option>
                        <option value="ANTAR_KABUPATEN">Antar-Kabupaten / Kota (Jawa Timur)</option>
                        <option value="ANTAR_PROVINSI">Antar-Provinsi (Nasional)</option>
                        <option value="MADRASAH_KEMENAG">Lembaga Kemenag (MTs / Pesantren)</option>
                        <option value="SWASTA_KE_NEGERI">Dari Sekolah Swasta ke Negeri</option>
                        <option value="LUAR_NEGERI">Sekolah Indonesia Luar Negeri (SILN)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Kategori Alasan Kepindahan *</label>
                      <select
                        value={formKategoriAlasan}
                        onChange={(e) => setFormKategoriAlasan(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold bg-white"
                      >
                        <option value="TUGAS_ORANG_TUA">Perpindahan Tugas Dinas / Pekerjaan Orang Tua</option>
                        <option value="PINDAH_DOMISILI">Perpindahan Domisili / Tempat Tinggal Keluarga</option>
                        <option value="PONDOK_PESANTREN">Melanjutkan Pembinaan di Pondok Pesantren</option>
                        <option value="JARAK_TRANSPORTASI">Jarak Tempuh & Efisiensi Transportasi Harian</option>
                        <option value="KESEHATAN">Kondisi Kesehatan / Pemulihan Medis</option>
                        <option value="LAINNYA">Alasan Khusus Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Sekolah Asal *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Sekolah Asal"
                        value={formSekolahAsal}
                        onChange={(e) => setFormSekolahAsal(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">NPSN Sekolah Asal</label>
                      <input
                        type="text"
                        placeholder="NPSN Sekolah Asal (8 Digit)"
                        value={formNpsnSekolahAsal}
                        onChange={(e) => setFormNpsnSekolahAsal(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Sekolah Tujuan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Sekolah Tujuan Kepindahan"
                        value={formSekolahTujuan}
                        onChange={(e) => setFormSekolahTujuan(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Kabupaten / Kota Sekolah Tujuan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kab. Kediri / Kota Surabaya"
                        value={formKabupatenKotaTujuan}
                        onChange={(e) => setFormKabupatenKotaTujuan(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600">Uraian Alasan Mutasi / Kepindahan Siswa *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Mengikuti perpindahan tugas kedinasan orang tua ke Surabaya dan pindah domisili KK"
                        value={formAlasanMutasi}
                        onChange={(e) => setFormAlasanMutasi(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: DATA PEMOHON */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">3</span>
                    <span>Identitas Pemohon (Orang Tua / Wali)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600">Nama Lengkap Orang Tua / Pemohon *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Orang Tua / Wali"
                        value={formNamaPemohon}
                        onChange={(e) => setFormNamaPemohon(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Hubungan dengan Siswa *</label>
                      <select
                        value={formHubungan}
                        onChange={(e) => setFormHubungan(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="Orang Tua">Orang Tua (Ayah / Ibu)</option>
                        <option value="Wali">Wali Siswa</option>
                        <option value="Siswa Sendiri">Siswa Sendiri</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">No. Handphone / WhatsApp Aktif *</label>
                      <input
                        type="text"
                        required
                        placeholder="08xxxxxxxxxx"
                        value={formKontakPemohon}
                        onChange={(e) => setFormKontakPemohon(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Pekerjaan Orang Tua / Pemohon</label>
                      <input
                        type="text"
                        placeholder="PNS / TNI / Swasta / Wiraswasta"
                        value={formPekerjaanPemohon}
                        onChange={(e) => setFormPekerjaanPemohon(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Alamat Email (Opsional)</label>
                      <input
                        type="email"
                        placeholder="email@domain.com"
                        value={formEmailPemohon}
                        onChange={(e) => setFormEmailPemohon(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[11px] font-semibold text-slate-600">Alamat Lengkap Domisili Pemohon</label>
                      <input
                        type="text"
                        placeholder="Alamat tempat tinggal orang tua / pemohon sesuai KK/KTP"
                        value={formAlamatPemohon}
                        onChange={(e) => setFormAlamatPemohon(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: DOKUMEN FISIK CHECKLIST */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">4</span>
                    <span>Konfirmasi Kesiapan Berkas Fisik Persyaratan</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Centang berkas yang telah Anda persiapkan untuk diserahkan ke loket Tata Usaha {settings.namaSekolah}:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 pt-1">
                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={berkasSuratOrtu}
                        onChange={(e) => setBerkasSuratOrtu(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                      />
                      <span className="font-medium">Surat Permohonan Orang Tua (Bermaterai)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={berkasRapor}
                        onChange={(e) => setBerkasRapor(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                      />
                      <span className="font-medium">Fotokopi Rapor Semester Lengkap Legalisir</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={berkasKkKtp}
                        onChange={(e) => setBerkasKkKtp(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                      />
                      <span className="font-medium">Fotokopi KK & KTP Orang Tua</span>
                    </label>

                    {jenisMutasi === 'MUTASI_MASUK' ? (
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={berkasPindahAsal}
                          onChange={(e) => setBerkasPindahAsal(e.target.checked)}
                          className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                        />
                        <span className="font-medium">Surat Keterangan Pindah dari Sekolah Asal</span>
                      </label>
                    ) : (
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={berkasBebasPerpus}
                          onChange={(e) => setBerkasBebasPerpus(e.target.checked)}
                          className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                        />
                        <span className="font-medium">Surat Bebas Pinjam Perpustakaan</span>
                      </label>
                    )}

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={berkasRekomDinas}
                        onChange={(e) => setBerkasRekomDinas(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                      />
                      <span className="font-medium">Surat Rekomendasi Dinas Pendidikan (Jika luar daerah)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={berkasKelakuanBaik}
                        onChange={(e) => setBerkasKelakuanBaik(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                      />
                      <span className="font-medium">Surat Keterangan Kelakuan Baik</span>
                    </label>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirimkan Pengajuan Mutasi Siswa</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Setelah dikirim, Anda akan langsung menerima Nomor Registrasi dan berkas tanda terima digital (PDF).
                  </p>
                </div>

              </form>
            </div>
          )}
        </>
      )}

      {/* 3. MODE: TRACKING / LACAK STATUS MUTASI */}
      {mode === 'tracking' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <span>Lacak Status Permohonan Mutasi Siswa</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan Nomor Registrasi (Contoh: REG-MUT-202609-101), NISN, atau Nama Siswa.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik Nomor Registrasi / NISN / Nama Siswa..."
                value={trackingQuery}
                onChange={(e) => {
                  setTrackingQuery(e.target.value);
                  setTrackingSearched(true);
                }}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold"
              />
              <button
                type="button"
                onClick={() => setTrackingSearched(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Cari
              </button>
            </div>

            {/* Quick Suggestions for demonstration */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-400 font-medium">Contoh Registrasi Cepat:</span>
              {applications.slice(0, 3).map(app => (
                <button
                  key={app.id}
                  onClick={() => {
                    setTrackingQuery(app.nomorRegistrasi);
                    setTrackingSearched(true);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono font-bold cursor-pointer transition-colors"
                >
                  {app.nomorRegistrasi}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Results Card */}
          {trackingQuery.trim() && (
            <div className="space-y-4">
              {trackingResults.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-2">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">Tidak Ditemukan Data Pengajuan</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Nomor registrasi atau nama siswa &quot;{trackingQuery}&quot; tidak ditemukan. Pastikan nomor registrasi yang Anda masukkan tepat.
                  </p>
                </div>
              ) : (
                trackingResults.map(app => (
                  <div key={app.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 animate-scale-up">
                    
                    {/* Header with status badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-800">
                            {app.nomorRegistrasi}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            app.jenisMutasi === 'MUTASI_MASUK' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {app.jenisMutasi === 'MUTASI_MASUK' ? 'Mutasi Masuk' : 'Mutasi Keluar'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Tanggal Diajukan: {new Date(app.tanggalPengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {app.statusPengajuan === 'MENUNGGU_VERIFIKASI' && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>Menunggu Verifikasi TU</span>
                          </div>
                        )}
                        {app.statusPengajuan === 'DIPROSES' && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-extrabold">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span>Sedang Diproses Tata Usaha</span>
                          </div>
                        )}
                        {app.statusPengajuan === 'DISETUJUI' && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Disetujui & Diterbitkan</span>
                          </div>
                        )}
                        {app.statusPengajuan === 'DITOLAK' && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-extrabold">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Berkas Ditolak</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Student & School Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Identitas Siswa:</span>
                        <div className="text-sm font-extrabold text-slate-900">{app.namaSiswa}</div>
                        <div className="text-slate-500 font-mono">NISN: {app.nisn} {app.nis && `| NIS: ${app.nis}`}</div>
                        <div className="text-slate-600">Kelas: <strong>{app.kelasAsal}</strong> &bull; Gender: {app.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sekolah Asal & Tujuan:</span>
                        <div className="text-slate-700">Asal: <strong className="text-slate-900">{app.sekolahAsal}</strong></div>
                        <div className="text-indigo-700 font-bold">Tujuan: <strong>{app.sekolahTujuan}</strong></div>
                        <div className="text-[11px] text-slate-500 italic mt-1">&ldquo;{app.alasanMutasi}&rdquo;</div>
                      </div>
                    </div>

                    {/* 5-Stage Visual Workflow Pipeline */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Alur & Progres Tahapan Mutasi Siswa:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                        
                        {/* Step 1: Registrasi */}
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex flex-col items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>1. Registrasi Permohonan</span>
                        </div>

                        {/* Step 2: Berkas Fisik */}
                        <div className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 ${
                          app.statusPengajuan !== 'MENUNGGU_VERIFIKASI'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                          {app.statusPengajuan !== 'MENUNGGU_VERIFIKASI' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          )}
                          <span>2. Verifikasi Berkas TU</span>
                        </div>

                        {/* Step 3: Bebas Administrasi 4 Pos */}
                        {(() => {
                          const allClear = app.bebasAdministrasi && 
                            app.bebasAdministrasi.perpustakaan && 
                            app.bebasAdministrasi.keuanganKomite && 
                            app.bebasAdministrasi.kesiswaanBK && 
                            app.bebasAdministrasi.kurikulum;
                          const someClear = app.bebasAdministrasi && (
                            app.bebasAdministrasi.perpustakaan || 
                            app.bebasAdministrasi.keuanganKomite || 
                            app.bebasAdministrasi.kesiswaanBK || 
                            app.bebasAdministrasi.kurikulum
                          );
                          return (
                            <div className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 ${
                              allClear 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : someClear || app.statusPengajuan === 'DIPROSES'
                                ? 'bg-blue-50 border-blue-200 text-blue-800'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                              {allClear ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <ShieldCheck className="w-4 h-4" />
                              )}
                              <span>3. Bebas 4 Pos Administrasi</span>
                            </div>
                          );
                        })()}

                        {/* Step 4: SK Resmi */}
                        <div className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 ${
                          app.statusPengajuan === 'DISETUJUI'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : app.statusPengajuan === 'DITOLAK'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {app.statusPengajuan === 'DISETUJUI' ? (
                            <FileSignature className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          <span>4. Penerbitan SK Kepala Sekolah</span>
                        </div>

                        {/* Step 5: Dapodik */}
                        <div className={`col-span-2 sm:col-span-1 p-2 rounded-xl border font-bold flex flex-col items-center gap-1 ${
                          app.statusDapodik?.terdaftarDapodik
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                          <span>5. Sinkronisasi Dapodik</span>
                        </div>

                      </div>
                    </div>

                    {/* Clearance 4 Meja Status */}
                    {app.bebasAdministrasi && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Status Rekomendasi Bebas Tanggungan Sekolah:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                            app.bebasAdministrasi.perpustakaan ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'
                          }`}>
                            {app.bebasAdministrasi.perpustakaan ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                            <span className="text-[11px] font-semibold">Perpustakaan</span>
                          </div>

                          <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                            app.bebasAdministrasi.keuanganKomite ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'
                          }`}>
                            {app.bebasAdministrasi.keuanganKomite ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                            <span className="text-[11px] font-semibold">Keuangan / Komite</span>
                          </div>

                          <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                            app.bebasAdministrasi.kesiswaanBK ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'
                          }`}>
                            {app.bebasAdministrasi.kesiswaanBK ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                            <span className="text-[11px] font-semibold">BK / Konseling</span>
                          </div>

                          <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                            app.bebasAdministrasi.kurikulum ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'
                          }`}>
                            {app.bebasAdministrasi.kurikulum ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                            <span className="text-[11px] font-semibold">Kurikulum & Rapor</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Official Notes & Letter Number */}
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Catatan & Rekomendasi Petugas Tata Usaha</span>
                        </span>
                        {app.tanggalDiproses && (
                          <span className="text-[10px] text-indigo-600 font-mono">
                            Diproses: {app.tanggalDiproses}
                          </span>
                        )}
                      </div>

                      {app.noSuratResmi && (
                        <div className="text-slate-800 flex items-center gap-2">
                          <span>No. Surat Keputusan Resmi:</span>
                          <strong className="font-mono text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                            {app.noSuratResmi}
                          </strong>
                        </div>
                      )}

                      <p className="text-slate-600 leading-relaxed">
                        {app.catatanVerifikasi || 'Permohonan sedang menunggu kelengkapan berkas fisik di meja Tata Usaha.'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => exportStudentMutationApplicationPDF(app, settings)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Printer className="w-4 h-4 text-slate-600" />
                          <span>Cetak Tanda Terima Pengajuan</span>
                        </button>

                        {/* Official Document Downloads if APPROVED */}
                        {app.statusPengajuan === 'DISETUJUI' && app.jenisMutasi === 'MUTASI_KELUAR' && (
                          <button
                            onClick={() => {
                              const foundStudent = students.find(s => s.id === app.studentId || s.nisn === app.nisn);
                              const targetStudent: Student = foundStudent || {
                                id: app.studentId || 'temp-' + app.id,
                                namaLengkap: app.namaSiswa,
                                namaPanggilan: app.namaSiswa.split(' ')[0] || '',
                                nis: app.nis || '',
                                nisn: app.nisn,
                                jenisKelamin: app.jenisKelamin,
                                tempatLahir: app.tempatLahir || 'Kediri',
                                tanggalLahir: app.tanggalLahir || '2011-01-01',
                                agama: app.agama || 'Islam',
                                kewarganegaraan: 'WNI',
                                alamat: app.alamatPemohon,
                                telepon: app.kontakPemohon || '-',
                                email: app.emailPemohon || '-',
                                kelasSaatIni: app.kelasAsal,
                                tahunMasuk: '2023',
                                statusSiswa: 'Pindah',
                                foto: '',
                                namaAyah: app.namaPemohon,
                                pekerjaanAyah: app.pekerjaanPemohon || '-',
                                namaIbu: '-',
                                pekerjaanIbu: '-',
                                alamatOrangTua: app.alamatPemohon,
                                teleponOrangTua: app.kontakPemohon,
                                sekolahTujuan: app.sekolahTujuan,
                                alasanMutasi: app.alasanMutasi,
                                tanggalMutasiKeluar: app.tanggalEfektifMutasi || app.tanggalPengajuan,
                                noSuratMutasiKeluar: app.noSuratResmi,
                                riwayatAkademik: {}
                              };
                              exportOfficialSuratMutasiKeluarPDF(targetStudent, app, settings);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20 transition-all"
                          >
                            <FileSignature className="w-4 h-4" />
                            <span>Unduh Surat Keterangan Pindah Resmi (PDF)</span>
                          </button>
                        )}

                        {app.statusPengajuan === 'DISETUJUI' && app.jenisMutasi === 'MUTASI_MASUK' && (
                          <button
                            onClick={() => exportOfficialSuratMutasiMasukPDF(app, settings)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-600/20 transition-all"
                          >
                            <FileSignature className="w-4 h-4" />
                            <span>Unduh Surat Keterangan Bersedia Menerima (PDF)</span>
                          </button>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Petugas: <strong>{app.verifikator || 'Tata Usaha'}</strong>
                      </span>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
