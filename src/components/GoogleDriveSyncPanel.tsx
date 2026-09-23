/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Lock, 
  ShieldCheck, 
  Database, 
  HardDrive,
  Users,
  Building2,
  FileCheck,
  Info,
  LogOut,
  Sparkles,
  Check,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Student, Teacher, Staff, SchoolSettings, ActivityLog, MutationApplication } from '../types';
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  logoutGoogle,
  setAccessToken
} from '../utils/firebaseAuth';
import { 
  findDatabaseFile, 
  loadDatabaseFromDrive, 
  saveDatabaseToDrive, 
  DriveFileInfo, 
  DATABASE_FILENAME 
} from '../utils/googleDriveSync';

interface GoogleDriveSyncPanelProps {
  students: Student[];
  teachers: Teacher[];
  staffList: Staff[];
  settings: SchoolSettings;
  activityLogs: ActivityLog[];
  mutationApplications?: MutationApplication[];
  onRestoreData: (data: {
    students: Student[];
    teachers: Teacher[];
    staff: Staff[];
    settings: SchoolSettings;
    activityLogs?: ActivityLog[];
    mutationApplications?: MutationApplication[];
  }) => void;
  onLogActivity?: (action: any, desc: string) => void;
}

export default function GoogleDriveSyncPanel({
  students,
  teachers,
  staffList,
  settings,
  activityLogs,
  mutationApplications,
  onRestoreData,
  onLogActivity
}: GoogleDriveSyncPanelProps) {
  // Auth state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [hasAccessToken, setHasAccessToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Sync state
  const [driveFileInfo, setDriveFileInfo] = useState<DriveFileInfo | null>(null);
  const [isCheckingDrive, setIsCheckingDrive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Auto-sync setting (saved in localStorage)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('buku_induk_drive_autosync');
    return saved !== null ? saved === 'true' : true;
  });

  // Last sync timestamp
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('buku_induk_drive_last_sync');
  });

  // Confirmation modal for destructive restore
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Initialize Auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        if (token) {
          setHasAccessToken(true);
          checkForExistingDriveFile(token);
        } else {
          // Firebase session exists, check if memory token is present
          const currentTok = getAccessToken();
          if (currentTok) {
            setHasAccessToken(true);
            checkForExistingDriveFile(currentTok);
          } else {
            setHasAccessToken(false);
          }
        }
      },
      () => {
        setGoogleUser(null);
        setHasAccessToken(false);
        setDriveFileInfo(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save autoSync setting
  const toggleAutoSync = () => {
    const newVal = !autoSyncEnabled;
    setAutoSyncEnabled(newVal);
    localStorage.setItem('buku_induk_drive_autosync', String(newVal));
    if (newVal && hasAccessToken) {
      handleSaveToDrive();
    }
  };

  // Check if database file exists on Google Drive
  const checkForExistingDriveFile = async (token: string) => {
    setIsCheckingDrive(true);
    try {
      const file = await findDatabaseFile(token);
      setDriveFileInfo(file);
      if (file && file.modifiedTime) {
        setLastSyncTime(file.modifiedTime);
        localStorage.setItem('buku_induk_drive_last_sync', file.modifiedTime);
      }
    } catch (err: any) {
      console.warn('Check drive error:', err.message);
      if (err.message.includes('Sesi Google Drive telah berakhir')) {
        setHasAccessToken(false);
      }
    } finally {
      setIsCheckingDrive(false);
    }
  };

  // Handle Google Sign In
  const handleConnectGoogle = async () => {
    setIsAuthenticating(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setHasAccessToken(true);
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung ke akun Google: ${result.user.email}`
        });
        if (onLogActivity) {
          onLogActivity('AUTH_SESSION', `Akun Google ${result.user.email} dihubungkan untuk sinkronisasi Google Drive.`);
        }
        await checkForExistingDriveFile(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google connect error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menghubungkan akun Google. Pastikan izin akses Google Drive disetujui.'
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Disconnect
  const handleDisconnectGoogle = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memutuskan sambungan akun Google Drive ini? Data lokal di browser tetap tersimpan.')) {
      return;
    }
    await logoutGoogle();
    setGoogleUser(null);
    setHasAccessToken(false);
    setDriveFileInfo(null);
    setStatusMessage({
      type: 'info',
      text: 'Akun Google telah diputuskan dari aplikasi.'
    });
    if (onLogActivity) {
      onLogActivity('AUTH_SESSION', 'Koneksi Google Drive diputuskan.');
    }
  };

  // Save/Upload local data to Google Drive
  const handleSaveToDrive = async () => {
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({
        type: 'error',
        text: 'Sesi Google Drive belum aktif. Silakan klik tombol "Hubungkan Akun Google" terlebih dahulu.'
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage(null);

    try {
      const payload = {
        version: '1.0',
        appName: 'Buku Induk Digital',
        updatedAt: new Date().toISOString(),
        updatedBy: googleUser?.email || 'Operator',
        data: {
          students,
          teachers,
          staff: staffList,
          settings,
          activityLogs,
          mutationApplications: mutationApplications || []
        }
      };

      const result = await saveDatabaseToDrive(token, payload, driveFileInfo?.id);
      setDriveFileInfo(result);
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('buku_induk_drive_last_sync', now);

      setStatusMessage({
        type: 'success',
        text: `Basis data berhasil disimpan ke Google Drive pada ${new Date().toLocaleTimeString('id-ID')} WIB.`
      });

      if (onLogActivity) {
        onLogActivity('PENGATURAN', `Menyinkronkan ${students.length} data siswa & data sekolah ke Google Drive (${DATABASE_FILENAME}).`);
      }
    } catch (err: any) {
      console.error('Save to Drive error:', err);
      setStatusMessage({
        type: 'error',
        text: `Gagal menyimpan ke Google Drive: ${err.message}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Load/Restore data from Google Drive (Requires explicit confirmation)
  const handleRestoreFromDrive = async () => {
    setShowRestoreModal(false);
    const token = getAccessToken();
    if (!token || !driveFileInfo?.id) {
      setStatusMessage({
        type: 'error',
        text: 'Berkas basis data belum ditemukan di Google Drive.'
      });
      return;
    }

    setIsRestoring(true);
    setStatusMessage(null);

    try {
      const payload = await loadDatabaseFromDrive(token, driveFileInfo.id);
      onRestoreData({
        students: payload.data.students || [],
        teachers: payload.data.teachers || [],
        staff: payload.data.staff || [],
        settings: payload.data.settings || settings,
        activityLogs: payload.data.activityLogs || activityLogs,
        mutationApplications: payload.data.mutationApplications || []
      });

      setStatusMessage({
        type: 'success',
        text: `Berhasil memulihkan ${payload.data.students?.length || 0} siswa dan data sekolah dari Google Drive!`
      });

      if (onLogActivity) {
        onLogActivity('RESTORE', `Memulihkan basis data dari Google Drive (${payload.data.students?.length || 0} siswa).`);
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      setStatusMessage({
        type: 'error',
        text: `Gagal memulihkan dari Google Drive: ${err.message}`
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const formatTimeAgo = (isoString?: string | null) => {
    if (!isoString) return 'Belum pernah disinkronkan';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-xs border border-indigo-400/20">
              <Cloud className="w-3.5 h-3.5" />
              <span>Google Workspace for Education Cloud Storage</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Penyimpanan Basis Data Google Drive</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Integrasikan basis data Buku Induk Siswa Digital dengan Google Drive pribadi atau akun <strong>@belajar.id</strong> sekolah. Data tersimpan aman di server awan resmi Google, dapat diakses multi-perangkat, dan terlindungi dari risiko hilang saat cache browser dibersihkan.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {googleUser ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pl-3 rounded-2xl border border-white/10">
                <img 
                  src={googleUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'} 
                  alt={googleUser.displayName || 'Google User'} 
                  className="w-10 h-10 rounded-xl object-cover border border-white/20"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left pr-2">
                  <span className="block text-xs font-bold text-white truncate max-w-[160px]">
                    {googleUser.displayName || 'Akun Google'}
                  </span>
                  <span className="block text-[10px] text-indigo-200 truncate max-w-[160px]">
                    {googleUser.email}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={isAuthenticating}
                className="gsi-material-button px-5 py-3 rounded-2xl bg-white text-slate-800 text-xs font-bold flex items-center gap-3 shadow-lg hover:bg-slate-50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Menghubungkan...' : 'Hubungkan Google Drive'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : statusMessage.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-indigo-50 border-indigo-200 text-indigo-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Status, Actions, & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Storage Status & Actions */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card: Connection & Cloud Sync Status */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  googleUser ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Status Pangkalan Data Google Drive</h3>
                  <p className="text-[11px] text-slate-400">Penyimpanan file terpusat: <span className="font-mono text-slate-600">{DATABASE_FILENAME}</span></p>
                </div>
              </div>

              {googleUser ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Aktif Tersambung</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  <span>Belum Terhubung</span>
                </span>
              )}
            </div>

            {/* Sync Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Terakhir Disinkronkan</span>
                <span className="text-xs font-bold text-slate-800 block">
                  {formatTimeAgo(lastSyncTime)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {driveFileInfo ? 'Tersimpan di Google Drive' : 'Belum ada data di cloud'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Akun Google Aktif</span>
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {googleUser ? googleUser.email : 'Tidak ada'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {googleUser ? 'Izin Google Drive aktif' : 'Masuk untuk sinkronisasi'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {googleUser ? (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Push to Drive Button */}
                  <button
                    type="button"
                    onClick={handleSaveToDrive}
                    disabled={isSyncing || isRestoring}
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
                  >
                    <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                    <span>{isSyncing ? 'Menyimpan ke Drive...' : 'Simpan / Sinkron ke Google Drive'}</span>
                  </button>

                  {/* Pull/Restore from Drive Button */}
                  <button
                    type="button"
                    onClick={() => setShowRestoreModal(true)}
                    disabled={isSyncing || isRestoring || !driveFileInfo}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    title="Muat data dari file yang tersimpan di Google Drive"
                  >
                    <CloudDownload className="w-4 h-4 text-slate-500" />
                    <span>{isRestoring ? 'Memulihkan...' : 'Muat dari Drive'}</span>
                  </button>
                </div>

                {/* Direct Link to View File on Google Drive */}
                {driveFileInfo?.webViewLink && (
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                    <span className="text-[11px]">Berkas pangkalan data dapat dibuka langsung di Google Drive:</span>
                    <a
                      href={driveFileInfo.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                    >
                      <span>Buka di Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-indigo-900 block">Hubungkan Akun Google untuk Memulai</span>
                  <span className="text-[11px] text-indigo-700 block">
                    Gunakan akun sekolah Anda (seperti sekhudin36@guru.smp.belajar.id) agar data buku induk tersimpan aman secara otomatis di Google Drive.
                  </span>
                </div>
                <button
                  onClick={handleConnectGoogle}
                  disabled={isAuthenticating}
                  className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Hubungkan Sekarang</span>
                </button>
              </div>
            )}

            {/* Auto-Sync Toggle */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Sinkronisasi Otomatis Cloud</span>
                <span className="text-[11px] text-slate-400 block">
                  Simpan cadangan ke Google Drive secara otomatis saat ada perubahan data penting
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoSyncEnabled} 
                  onChange={toggleAutoSync}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Disconnect Option */}
            {googleUser && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Putuskan Sambungan Akun Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Card: Sync Scope & Data Summary */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Data yang Tersinkronisasi ke Google Drive</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-lg font-black text-indigo-600 block">{students.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Siswa Terdaftar</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-lg font-black text-slate-800 block">{teachers.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Tenaga Pendidik</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-lg font-black text-slate-800 block">{staffList.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Tenaga Kependidikan</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-lg font-black text-emerald-600 block">{activityLogs.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Log Audit Sistem</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              File pangkalan data juga memuat seluruh pengaturan identitas sekolah, kop surat, stempel dinas, tanda tangan kepala sekolah, dan riwayat kenaikan serta mutasi siswa.
            </p>
          </div>

        </div>

        {/* Right Column: Keunggulan & Petunjuk Multi-Perangkat */}
        <div className="space-y-6">
          
          {/* Card: Keamanan & Multi-Device */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Keunggulan Google Drive Storage</span>
            </h3>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Aman & Anti-Hilang:</strong> Data tidak akan terhapus meskipun cache browser dibersihkan atau ganti laptop.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Multi-Device:</strong> Buka aplikasi di komputer TU lain, cukup masuk dengan akun Google yang sama lalu klik "Muat dari Drive".</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Optimasi Kompresi:</strong> Seluruh foto telah dikompresi otomatis sehingga ukuran file sangat hemat dan proses sinkronisasi kilat.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Privasi Terjamin:</strong> File tersimpan secara privat di Google Drive akun Anda sendiri, hanya dapat diakses dengan izin pengguna.</span>
              </li>
            </ul>
          </div>

          {/* Card: Panduan Operator */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50 rounded-3xl border border-indigo-100 p-6 space-y-3">
            <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Tips Kolaborasi Petugas / Guru</span>
            </h3>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              Setelah selesai menginput nilai semester atau menambah data siswa baru di komputer sekolah, selalu pastikan tombol <strong>Simpan / Sinkron ke Google Drive</strong> telah ditekan (atau biarkan Sinkronisasi Otomatis aktif).
            </p>
            <div className="pt-1 text-[11px] text-indigo-800 font-medium">
              Format Berkas: JSON Standar Buku Induk Kemdikbud.
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal for Destructive Restore Operation */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-800">
                Konfirmasi Pemulihan Data dari Google Drive
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan <strong>memperbarui seluruh data lokal saat ini</strong> (siswa, guru, staf, nilai, dan pengaturan) dengan versi pangkalan data yang tersimpan di Google Drive Anda.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Nama Berkas:</span>
                <span className="font-mono font-bold text-slate-800">{DATABASE_FILENAME}</span>
              </div>
              <div className="flex justify-between">
                <span>Penyimpanan:</span>
                <span className="text-slate-800 font-medium">Google Drive ({googleUser?.email})</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRestoreFromDrive}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Ya, Pulihkan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
