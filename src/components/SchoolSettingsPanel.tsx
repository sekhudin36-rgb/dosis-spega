/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { SchoolSettings, Student, Teacher, Staff } from '../types';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Award, 
  Calendar, 
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Database
} from 'lucide-react';

interface SchoolSettingsPanelProps {
  settings: SchoolSettings;
  students: Student[];
  teachers: Teacher[];
  staffList: Staff[];
  onSaveSettings: (settings: SchoolSettings) => void;
  onResetDatabase: () => void;
  onRestoreDatabase: (
    students: Student[],
    teachers: Teacher[],
    staff: Staff[],
    settings: SchoolSettings
  ) => void;
}

export default function SchoolSettingsPanel({ 
  settings, 
  students, 
  teachers, 
  staffList, 
  onSaveSettings, 
  onResetDatabase,
  onRestoreDatabase 
}: SchoolSettingsPanelProps) {
  const [formSettings, setFormSettings] = useState<SchoolSettings>({ ...settings });
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<{ students: Student[], teachers: Teacher[], staff: Staff[], settings: SchoolSettings } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof SchoolSettings, value: string) => {
    setFormSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formSettings);
    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 3000);
  };

  const handleReset = () => {
    onResetDatabase();
    setShowResetConfirm(false);
    // Reload components with fresh settings
    const fresh = localStorage.getItem('school_settings');
    if (fresh) {
      setFormSettings(JSON.parse(fresh));
    }
  };

  const handleBackup = () => {
    try {
      const backupPayload = {
        version: '1.0',
        appName: 'Buku Induk Digital',
        backupDate: new Date().toISOString(),
        data: {
          students,
          teachers,
          staff: staffList,
          settings
        }
      };
      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      link.download = `backup_buku_induk_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setBackupStatus({ type: 'success', message: 'Cadangan data (backup) berhasil diunduh!' });
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (error) {
      setBackupStatus({ type: 'error', message: 'Gagal membuat file backup.' });
      setTimeout(() => setBackupStatus(null), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.appName !== 'Buku Induk Digital' || !json.data) {
          throw new Error('Format file backup tidak valid atau bukan untuk aplikasi ini.');
        }

        const data = json.data;
        if (!Array.isArray(data.students) || !Array.isArray(data.teachers) || !Array.isArray(data.staff) || !data.settings) {
          throw new Error('Data di dalam file backup tidak lengkap atau rusak.');
        }

        setPendingRestore(data);
        setShowRestoreConfirm(true);
      } catch (err: any) {
        setBackupStatus({ type: 'error', message: err.message || 'Gagal membaca file backup.' });
        setTimeout(() => setBackupStatus(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmRestore = () => {
    if (!pendingRestore) return;
    onRestoreDatabase(
      pendingRestore.students,
      pendingRestore.teachers,
      pendingRestore.staff,
      pendingRestore.settings
    );
    setBackupStatus({ type: 'success', message: 'Data berhasil dipulihkan (restore) sepenuhnya!' });
    setShowRestoreConfirm(false);
    setPendingRestore(null);
    // Refresh local form settings in case the restored settings changed
    setTimeout(() => {
      const fresh = localStorage.getItem('school_settings');
      if (fresh) {
        setFormSettings(JSON.parse(fresh));
      }
    }, 100);
    setTimeout(() => setBackupStatus(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-700" />
          Pengaturan Lembaga Sekolah
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Atur identitas resmi sekolah, alamat, pimpinan kepala sekolah, tahun ajaran aktif, dan administrasi database.</p>
      </div>

      {isSavedSuccessfully && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-3 rounded-lg border border-emerald-200 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan sekolah berhasil disimpan dan disinkronkan dengan dokumen PDF!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Form Settings */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-3xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Identitas Sekolah */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                I. Profil & Identitas Sekolah
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Resmi Sekolah</label>
                  <input 
                    type="text"
                    required
                    value={formSettings.namaSekolah}
                    onChange={(e) => handleChange('namaSekolah', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NPSN (Nomor Pokok Sekolah Nasional)</label>
                  <input 
                    type="text"
                    required
                    value={formSettings.npsn}
                    onChange={(e) => handleChange('npsn', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Alamat Sekolah */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                II. Alamat Lembaga
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Alamat Jalan</label>
                <input 
                  type="text"
                  required
                  value={formSettings.alamat}
                  onChange={(e) => handleChange('alamat', e.target.value)}
                  placeholder="Contoh: Jl. Pendidikan No. 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Desa / Kelurahan</label>
                  <input 
                    type="text"
                    value={formSettings.desaKelurahan}
                    onChange={(e) => handleChange('desaKelurahan', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kecamatan</label>
                  <input 
                    type="text"
                    value={formSettings.kecamatan}
                    onChange={(e) => handleChange('kecamatan', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kabupaten / Kota</label>
                  <input 
                    type="text"
                    value={formSettings.kabupatenKota}
                    onChange={(e) => handleChange('kabupatenKota', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Provinsi</label>
                  <input 
                    type="text"
                    value={formSettings.provinsi}
                    onChange={(e) => handleChange('provinsi', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Kontak & Informasi Digital */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" />
                III. Kontak & Portal Informasi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={formSettings.telepon}
                      onChange={(e) => handleChange('telepon', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Sekolah</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="email"
                      value={formSettings.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Situs Resmi (Website)</label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={formSettings.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Administrasi Kurikulum & Pimpinan */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-slate-400" />
                IV. Pejabat Penandatangan & Tahun Pelajaran
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Kepala Sekolah</label>
                  <input 
                    type="text"
                    required
                    value={formSettings.kepalaSekolah}
                    onChange={(e) => handleChange('kepalaSekolah', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NIP Kepala Sekolah</label>
                  <input 
                    type="text"
                    required
                    value={formSettings.nipKepalaSekolah}
                    onChange={(e) => handleChange('nipKepalaSekolah', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tahun Pelajaran Terpilih (Aktif)</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text"
                      required
                      value={formSettings.tahunAjaranAktif}
                      onChange={(e) => handleChange('tahunAjaranAktif', e.target.value)}
                      placeholder="Contoh: 2025/2026"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4.5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Pengaturan</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Side: Database Utilities */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-3xs space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              Alat Pemeliharaan Sistem
            </h3>
            
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Semua data buku induk (Siswa, Guru, Tendik, dan Pengaturan) disimpan secara aman di <strong>LocalStorage</strong> browser Anda untuk operasi offline penuh dan kinerja sangat cepat.
            </p>

            {/* Backup & Restore Section */}
            <div className="mt-4 border border-slate-100 bg-slate-50 p-4 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <Database className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Pencadangan & Pemulihan</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Unduh salinan cadangan semua data sekolah ke file komputer Anda, atau pulihkan data dari file JSON hasil unduhan sebelumnya.
                  </p>
                </div>
              </div>

              {backupStatus && (
                <div className={`p-2.5 rounded-lg border text-[10px] font-semibold animate-fade-in ${
                  backupStatus.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {backupStatus.message}
                </div>
              )}

              {/* Hidden file input for restore */}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleBackup}
                  className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50 border border-indigo-200 py-2 rounded-lg transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-700 hover:text-white hover:bg-slate-700 bg-slate-50 border border-slate-200 py-2 rounded-lg transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore Data</span>
                </button>
              </div>

              {showRestoreConfirm && pendingRestore && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg space-y-2 mt-2 animate-fade-in">
                  <div className="text-[10px] font-bold text-indigo-800">
                    Konfirmasi Pemulihan Data
                  </div>
                  <p className="text-[9.5px] text-indigo-700 leading-relaxed">
                    Apakah Anda yakin ingin memulihkan data? Tindakan ini akan <strong>menimpa seluruh data saat ini</strong> dengan:
                    <span className="block mt-1 font-semibold">
                      • {pendingRestore.students.length} Siswa <br />
                      • {pendingRestore.teachers.length} Guru <br />
                      • {pendingRestore.staff.length} Tenaga Pendidik <br />
                      • Pengaturan Sekolah: "{pendingRestore.settings.namaSekolah}"
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRestoreConfirm(false);
                        setPendingRestore(null);
                      }}
                      className="text-center text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 py-1.5 rounded-md cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={confirmRestore}
                      className="text-center text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded-md cursor-pointer"
                    >
                      Ya, Pulihkan!
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Setel Ulang Database section */}
            <div className="mt-4 border border-slate-100 bg-slate-50 p-4 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Setel Ulang Aplikasi</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Menghapus seluruh modifikasi data lokal Anda saat ini (Siswa, Nilai Akademik, Guru, Staf) dan mengembalikannya ke pengaturan demonstrasi awal (bawaan pabrik).
                  </p>
                </div>
              </div>
              
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full text-center text-xs font-bold text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 py-2 rounded-lg transition-all cursor-pointer mt-2"
                >
                  Setel Ulang Ke Database Default
                </button>
              ) : (
                <div className="space-y-2 mt-2 animate-fade-in">
                  <div className="text-[10px] font-semibold text-rose-600 bg-rose-50/50 p-2 rounded-md border border-rose-100">
                    ⚠️ Peringatan: Seluruh data baru Anda akan hilang permanen!
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="text-center text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 py-2 rounded-lg cursor-pointer"
                    >
                      Batalkan
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-center text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 py-2 rounded-lg cursor-pointer"
                    >
                      Ya, Reset Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center border-t border-slate-100 pt-4 mt-6">
            System Ingress Node • Port 3000
          </div>
        </div>

      </div>

    </div>
  );
}
