/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Student, SemesterRecord, Teacher, Staff, SchoolSettings, UserAccount, ActivityLog, MutationApplication } from './types';
import { mockStudents } from './data/mockStudents';
import { mockTeachers, mockStaff, defaultSchoolSettings } from './data/mockStaffAndSettings';
import { defaultMutationApplications } from './data/mockMutationApplications';
import DashboardStats from './components/DashboardStats';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import StudentForm from './components/StudentForm';
import SemesterGradeEditor from './components/SemesterGradeEditor';
import TeacherManagement from './components/TeacherManagement';
import StaffManagement from './components/StaffManagement';
import SchoolSettingsPanel from './components/SchoolSettingsPanel';
import ClassPromotionManagement from './components/ClassPromotionManagement';
import StudentMutationManagement from './components/StudentMutationManagement';
import AlumniManagement from './components/AlumniManagement';
import ActivityLogPanel from './components/ActivityLogPanel';
import MainDashboard from './components/MainDashboard';
import OfficialLetterGenerator from './components/OfficialLetterGenerator';
import MonthlyReportPanel from './components/MonthlyReportPanel';
import Login from './components/Login';
import PublicPortal from './components/PublicPortal';
import GoogleDriveSyncPanel from './components/GoogleDriveSyncPanel';
import { 
  GraduationCap, 
  Clock, 
  User, 
  Menu, 
  X, 
  Settings, 
  Users, 
  BriefcaseBusiness,
  TrendingUp,
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  Search,
  Sparkles,
  ShieldCheck,
  History,
  FileText,
  BarChart3,
  Stamp,
  LayoutGrid,
  Plus,
  Check,
  Cloud
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>([
    { id: '1', username: 'admin', password: '123456', role: 'admin' },
    { id: '2', username: 'guru', password: '123456', role: 'guru' }
  ]);

  // Top-level View Mode: 'portal' (Default primary landing page) | 'login' | 'dashboard'
  const [currentViewMode, setCurrentViewMode] = useState<'portal' | 'login' | 'dashboard'>('portal');
  const [portalActiveTab, setPortalActiveTab] = useState<'cek-siswa' | 'daftar-alumni' | 'verifikasi-qr' | 'pengajuan-mutasi'>('cek-siswa');

  // Core navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'siswa' | 'guru' | 'staff' | 'promotion' | 'mutasi' | 'alumni' | 'surat' | 'laporan' | 'settings' | 'logs' | 'drive'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [letterStudentId, setLetterStudentId] = useState<string | undefined>(undefined);

  // Core application database states
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>(defaultSchoolSettings);
  const [mutationApplications, setMutationApplications] = useState<MutationApplication[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Student list view states
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  // Semester academic grade editor popup state
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);

  // Helper for audit trail logging
  const addActivityLog = (
    action: ActivityLog['action'],
    description: string,
    targetId?: string,
    targetName?: string
  ) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId: currentUser ? currentUser.id : 'publik',
      username: currentUser ? currentUser.username : 'Petugas / Publik',
      userRole: currentUser ? currentUser.role : 'publik',
      action,
      description,
      targetId,
      targetName
    };

    setActivityLogs(prev => {
      const updated = [newLog, ...prev.slice(0, 499)];
      localStorage.setItem('buku_induk_activity_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogin = (account: UserAccount) => {
    setCurrentUser(account);
    localStorage.setItem('buku_induk_session', JSON.stringify(account));
    setCurrentViewMode('dashboard');
    addActivityLog('AUTH_SESSION', `Operator ${account.username} (${account.role}) berhasil masuk ke sistem.`);
  };

  const handleLogout = () => {
    const actorName = currentUser?.username || 'Operator';
    setCurrentUser(null);
    localStorage.removeItem('buku_induk_session');
    setCurrentViewMode('portal');
    addActivityLog('AUTH_SESSION', `Sesi pengguna ${actorName} telah diakhiri secara aman.`);
  };

  // Load initial data from localStorage or mock data
  useEffect(() => {
    // 0. Accounts
    const savedAccounts = localStorage.getItem('buku_induk_accounts');
    if (savedAccounts) {
      try {
        setAccounts(JSON.parse(savedAccounts));
      } catch (e) {
        // use default
      }
    }

    // 0.1 Current User Session
    const savedSession = localStorage.getItem('buku_induk_session');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        // use default
      }
    }

    // 0.2 Activity Logs
    const savedLogs = localStorage.getItem('buku_induk_activity_logs');
    if (savedLogs) {
      try {
        setActivityLogs(JSON.parse(savedLogs));
      } catch (e) {
        setActivityLogs([]);
      }
    } else {
      const initialLogs: ActivityLog[] = [
        {
          id: 'log-init-1',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          userId: 'sys-01',
          username: 'Sistem',
          userRole: 'admin',
          action: 'SYSTEM',
          description: 'Basis data Buku Induk Digital SMP Negeri 3 Kras aktif dengan mode persisten.'
        }
      ];
      setActivityLogs(initialLogs);
      localStorage.setItem('buku_induk_activity_logs', JSON.stringify(initialLogs));
    }

    // 1. Students
    const savedStudents = localStorage.getItem('buku_induk_students');
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents));
      } catch (e) {
        setStudents(mockStudents);
      }
    } else {
      setStudents(mockStudents);
      localStorage.setItem('buku_induk_students', JSON.stringify(mockStudents));
    }

    // 2. Teachers
    const savedTeachers = localStorage.getItem('buku_induk_teachers');
    if (savedTeachers) {
      try {
        setTeachers(JSON.parse(savedTeachers));
      } catch (e) {
        setTeachers(mockTeachers);
      }
    } else {
      setTeachers(mockTeachers);
      localStorage.setItem('buku_induk_teachers', JSON.stringify(mockTeachers));
    }

    // 3. Staff
    const savedStaff = localStorage.getItem('buku_induk_staff');
    if (savedStaff) {
      try {
        setStaffList(JSON.parse(savedStaff));
      } catch (e) {
        setStaffList(mockStaff);
      }
    } else {
      setStaffList(mockStaff);
      localStorage.setItem('buku_induk_staff', JSON.stringify(mockStaff));
    }

    // 4. Settings
    const savedSettings = localStorage.getItem('school_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.namaSekolah !== 'SMP NEGERI 3 KRAS') {
          parsed.namaSekolah = 'SMP NEGERI 3 KRAS';
          localStorage.setItem('school_settings', JSON.stringify(parsed));
        }
        setSettings(parsed);
      } catch (e) {
        setSettings(defaultSchoolSettings);
      }
    } else {
      setSettings(defaultSchoolSettings);
      localStorage.setItem('school_settings', JSON.stringify(defaultSchoolSettings));
    }

    // 5. Mutation Applications
    const savedMutationApps = localStorage.getItem('buku_induk_mutation_applications');
    if (savedMutationApps) {
      try {
        setMutationApplications(JSON.parse(savedMutationApps));
      } catch (e) {
        setMutationApplications(defaultMutationApplications);
      }
    } else {
      setMutationApplications(defaultMutationApplications);
      localStorage.setItem('buku_induk_mutation_applications', JSON.stringify(defaultMutationApplications));
    }

    // Secret Operator Access: Hash listener (#login, #admin, #operator)
    const handleHashCheck = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login' || hash === '#admin' || hash === '#operator') {
        setCurrentViewMode('login');
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);

    // Secret Operator Access: Global Keyboard Shortcut (Ctrl+Shift+L or Alt+L)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') || (e.altKey && e.key.toLowerCase() === 'l')) {
        e.preventDefault();
        setCurrentViewMode((prev) => (prev === 'login' ? 'portal' : 'login'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashCheck);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync helpers
  const saveAndSyncStudents = (updatedList: Student[]) => {
    setStudents(updatedList);
    localStorage.setItem('buku_induk_students', JSON.stringify(updatedList));
  };

  const saveAndSyncMutationApplications = (updatedList: MutationApplication[]) => {
    setMutationApplications(updatedList);
    localStorage.setItem('buku_induk_mutation_applications', JSON.stringify(updatedList));
  };

  const saveAndSyncTeachers = (updatedList: Teacher[]) => {
    setTeachers(updatedList);
    localStorage.setItem('buku_induk_teachers', JSON.stringify(updatedList));
    addActivityLog('PENGATURAN', `Total ${updatedList.length} data pendidik tersinkronisasi.`);
  };

  const saveAndSyncStaff = (updatedList: Staff[]) => {
    setStaffList(updatedList);
    localStorage.setItem('buku_induk_staff', JSON.stringify(updatedList));
    addActivityLog('PENGATURAN', `Total ${updatedList.length} data tenaga kependidikan tersinkronisasi.`);
  };

  const saveAndSyncSettings = (updatedSettings: SchoolSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('school_settings', JSON.stringify(updatedSettings));
    addActivityLog('PENGATURAN', 'Profil sekolah & konfigurasi tahun ajaran diperbarui.');
  };

  const handleResetDatabase = () => {
    localStorage.removeItem('buku_induk_students');
    localStorage.removeItem('buku_induk_teachers');
    localStorage.removeItem('buku_induk_staff');
    localStorage.removeItem('school_settings');

    setStudents(mockStudents);
    setTeachers(mockTeachers);
    setStaffList(mockStaff);
    setSettings(defaultSchoolSettings);
    setMutationApplications(defaultMutationApplications);

    localStorage.setItem('buku_induk_students', JSON.stringify(mockStudents));
    localStorage.setItem('buku_induk_teachers', JSON.stringify(mockTeachers));
    localStorage.setItem('buku_induk_staff', JSON.stringify(mockStaff));
    localStorage.setItem('school_settings', JSON.stringify(defaultSchoolSettings));
    localStorage.setItem('buku_induk_mutation_applications', JSON.stringify(defaultMutationApplications));
    
    addActivityLog('SYSTEM', 'Administrator melakukan penyetelan ulang basis data ke bawaan.');
    setActiveTab('siswa');
    setCurrentView('list');
    setSelectedStudent(null);
  };

  const handleRestoreDatabase = (
    restoredStudents: Student[],
    restoredTeachers: Teacher[],
    restoredStaff: Staff[],
    restoredSettings: SchoolSettings,
    restoredMutationApplications?: MutationApplication[]
  ) => {
    saveAndSyncStudents(restoredStudents);
    saveAndSyncTeachers(restoredTeachers);
    saveAndSyncStaff(restoredStaff);
    saveAndSyncSettings(restoredSettings);
    if (restoredMutationApplications) {
      saveAndSyncMutationApplications(restoredMutationApplications);
    }
    addActivityLog('CADANGAN_DATA', `Pemulihan cadangan data: ${restoredStudents.length} siswa, ${restoredTeachers.length} guru, ${restoredStaff.length} staf.`);
  };

  // Student specific handlers
  const handleSaveStudent = (savedStudent: Student) => {
    let updatedList: Student[] = [];
    if (formMode === 'add') {
      updatedList = [savedStudent, ...students];
      addActivityLog('TAMBAH_SISWA', `Menambahkan siswa baru: ${savedStudent.namaLengkap} (NIS: ${savedStudent.nis})`, savedStudent.id, savedStudent.namaLengkap);
    } else {
      updatedList = students.map(s => s.id === savedStudent.id ? savedStudent : s);
      if (selectedStudent?.id === savedStudent.id) {
        setSelectedStudent(savedStudent);
      }
      addActivityLog('EDIT_SISWA', `Memperbarui data siswa: ${savedStudent.namaLengkap} (NIS: ${savedStudent.nis})`, savedStudent.id, savedStudent.namaLengkap);
    }

    saveAndSyncStudents(updatedList);
    setCurrentView(formMode === 'add' ? 'list' : 'detail');
  };

  const handleDeleteStudent = (id: string) => {
    const studentToDelete = students.find(s => s.id === id);
    const updatedList = students.filter(s => s.id !== id);
    saveAndSyncStudents(updatedList);
    addActivityLog('HAPUS_SISWA', `Menghapus arsip siswa ${studentToDelete?.namaLengkap || id} (ID: ${id})`, id, studentToDelete?.namaLengkap);
    if (selectedStudent?.id === id) {
      setSelectedStudent(null);
      setCurrentView('list');
    }
  };

  const handleUpdateSingleStudent = (updatedStudent: Student) => {
    const exists = students.some(s => s.id === updatedStudent.id);
    let updatedList: Student[] = [];
    if (exists) {
      updatedList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    } else {
      updatedList = [updatedStudent, ...students];
    }
    saveAndSyncStudents(updatedList);
    if (selectedStudent?.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
  };

  const handleImportStudents = (importedList: Partial<Student>[]) => {
    const updatedList = [...students];

    importedList.forEach(imported => {
      const duplicateIndex = updatedList.findIndex(
        s => s.nis === imported.nis || s.nisn === imported.nisn
      );

      const completeStudent: Student = {
        id: imported.id || `siswa-${Date.now()}-${Math.random()}`,
        nis: imported.nis || '',
        nisn: imported.nisn || '',
        namaLengkap: imported.namaLengkap || '',
        namaPanggilan: imported.namaPanggilan || '',
        jenisKelamin: imported.jenisKelamin || 'L',
        tempatLahir: imported.tempatLahir || '',
        tanggalLahir: imported.tanggalLahir || '2011-01-01',
        agama: imported.agama || 'Islam',
        kewarganegaraan: imported.kewarganegaraan || 'WNI',
        alamat: imported.alamat || '',
        telepon: imported.telepon || '',
        email: imported.email || '',
        kelasSaatIni: imported.kelasSaatIni || '7-A',
        tahunMasuk: imported.tahunMasuk || String(new Date().getFullYear()),
        statusSiswa: imported.statusSiswa || 'Aktif',
        foto: imported.foto || '',
        namaAyah: imported.namaAyah || '',
        pekerjaanAyah: imported.pekerjaanAyah || '',
        namaIbu: imported.namaIbu || '',
        pekerjaanIbu: imported.pekerjaanIbu || '',
        teleponOrangTua: imported.teleponOrangTua || '',
        alamatOrangTua: imported.alamatOrangTua || '',
        riwayatAkademik: imported.riwayatAkademik || {}
      };

      if (duplicateIndex !== -1) {
        const existing = updatedList[duplicateIndex];
        updatedList[duplicateIndex] = {
          ...completeStudent,
          id: existing.id,
          riwayatAkademik: existing.riwayatAkademik
        };
      } else {
        updatedList.unshift(completeStudent);
      }
    });

    saveAndSyncStudents(updatedList);
  };

  const handleImportGrades = (importedGrades: any[], semesterId: string) => {
    const updatedList = students.map(s => {
      const studentGrades = importedGrades.filter(g => String(g.nis).trim() === String(s.nis).trim());
      if (studentGrades.length === 0) return s;

      const newRiwayat = { ...s.riwayatAkademik };
      studentGrades.forEach(g => {
        const targetSemesterId = g.semesterId || semesterId;
        newRiwayat[targetSemesterId] = {
          semesterId: targetSemesterId,
          namaSemester: targetSemesterId === "1" ? "Semester I (Ganjil)" :
                        targetSemesterId === "2" ? "Semester II (Genap)" :
                        targetSemesterId === "3" ? "Semester III (Ganjil)" :
                        targetSemesterId === "4" ? "Semester IV (Genap)" :
                        targetSemesterId === "5" ? "Semester V (Ganjil)" :
                        "Semester VI (Genap)",
          kelas: g.kelas || s.kelasSaatIni || '7-A',
          tahunAjaran: g.tahunAjaran || settings?.tahunAjaranAktif || '2024/2025',
          scores: g.scores,
          ekstrakurikuler: g.ekstrakurikuler && g.ekstrakurikuler.length > 0 
            ? g.ekstrakurikuler 
            : (s.riwayatAkademik[targetSemesterId]?.ekstrakurikuler || [
                { kegiatan: 'Pramuka', nilai: 'B', keterangan: 'Aktif mengikuti kegiatan pramuka.' }
              ]),
          absensi: g.absensi || { sakit: 0, izin: 0, alpa: 0 },
          catatanWali: g.catatanWali || s.riwayatAkademik[targetSemesterId]?.catatanWali || 'Pertahankan motivasi belajar.'
        };
      });

      return {
        ...s,
        riwayatAkademik: newRiwayat
      };
    });

    saveAndSyncStudents(updatedList);
  };

  const handleSaveSemesterRecord = (record: SemesterRecord) => {
    if (!selectedStudent) return;

    const updatedStudent: Student = {
      ...selectedStudent,
      riwayatAkademik: {
        ...selectedStudent.riwayatAkademik,
        [record.semesterId]: record
      }
    };

    const updatedList = students.map(s => s.id === selectedStudent.id ? updatedStudent : s);
    
    setSelectedStudent(updatedStudent);
    saveAndSyncStudents(updatedList);
    addActivityLog('NILAI_RAPOR', `Input nilai semester ${record.namaSemester || record.semesterId} untuk ${selectedStudent.namaLengkap} (NIS: ${selectedStudent.nis})`, selectedStudent.id, selectedStudent.namaLengkap);
    setEditingSemesterId(null);
  };

  // Teacher specific handlers
  const handleSaveTeacher = (savedTeacher: Teacher) => {
    const exists = teachers.some(t => t.id === savedTeacher.id);
    let updated: Teacher[] = [];
    if (exists) {
      updated = teachers.map(t => t.id === savedTeacher.id ? savedTeacher : t);
    } else {
      updated = [savedTeacher, ...teachers];
    }
    saveAndSyncTeachers(updated);
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    saveAndSyncTeachers(updated);
  };

  // Staff specific handlers
  const handleSaveStaff = (savedStaff: Staff) => {
    const exists = staffList.some(s => s.id === savedStaff.id);
    let updated: Staff[] = [];
    if (exists) {
      updated = staffList.map(s => s.id === savedStaff.id ? savedStaff : s);
    } else {
      updated = [savedStaff, ...staffList];
    }
    saveAndSyncStaff(updated);
  };

  const handleDeleteStaff = (id: string) => {
    const updated = staffList.filter(s => s.id !== id);
    saveAndSyncStaff(updated);
  };

  // Handler for public alumni registration (Tracer study & digital alumni directory)
  const handleRegisterAlumni = (alumniData: {
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
  }) => {
    // Check if matching NIS, NISN or exact name exists in students
    const existingIndex = students.findIndex(s => 
      (alumniData.nis && s.nis && s.nis.trim() === alumniData.nis.trim()) ||
      (alumniData.nisn && s.nisn && s.nisn.trim() === alumniData.nisn.trim()) ||
      (s.namaLengkap.toLowerCase().trim() === alumniData.namaLengkap.toLowerCase().trim())
    );

    let resultStudent: Student;
    let updatedList = [...students];

    if (existingIndex >= 0) {
      const existing = students[existingIndex];
      resultStudent = {
        ...existing,
        namaLengkap: alumniData.namaLengkap || existing.namaLengkap,
        jenisKelamin: alumniData.jenisKelamin || existing.jenisKelamin,
        statusSiswa: 'Lulus',
        tanggalLulus: `${alumniData.tahunLulus}-06-15`,
        alumniLanjutKe: alumniData.alumniLanjutKe,
        alumniCatatan: alumniData.alumniCatatan || existing.alumniCatatan || '',
        telepon: alumniData.telepon || existing.telepon,
        email: alumniData.email || existing.email || '',
        alamat: alumniData.alamat || existing.alamat,
        foto: alumniData.foto || existing.foto || ''
      };
      updatedList[existingIndex] = resultStudent;
    } else {
      // Create new alumnus student record
      const newId = `alumni-${Date.now()}`;
      resultStudent = {
        id: newId,
        nis: alumniData.nis || `ALM-${Math.floor(1000 + Math.random() * 9000)}`,
        nisn: alumniData.nisn || '',
        namaLengkap: alumniData.namaLengkap,
        namaPanggilan: alumniData.namaLengkap.split(' ')[0],
        jenisKelamin: alumniData.jenisKelamin,
        tempatLahir: 'Kediri',
        tanggalLahir: `${parseInt(alumniData.tahunLulus) - 15}-01-01`,
        agama: 'Islam',
        kewarganegaraan: 'WNI',
        alamat: alumniData.alamat || 'Kras, Kediri',
        telepon: alumniData.telepon,
        email: alumniData.email || '',
        kelasSaatIni: 'Alumni',
        tahunMasuk: (parseInt(alumniData.tahunLulus) - 3).toString(),
        statusSiswa: 'Lulus',
        foto: alumniData.foto || '',
        tanggalLulus: `${alumniData.tahunLulus}-06-15`,
        alumniLanjutKe: alumniData.alumniLanjutKe,
        alumniCatatan: alumniData.alumniCatatan || '',
        namaAyah: '-',
        pekerjaanAyah: '-',
        namaIbu: '-',
        pekerjaanIbu: '-',
        teleponOrangTua: alumniData.telepon,
        alamatOrangTua: alumniData.alamat || '',
        riwayatAkademik: {}
      };
      updatedList = [resultStudent, ...updatedList];
    }

    saveAndSyncStudents(updatedList);
    return {
      success: true,
      message: existingIndex >= 0 
        ? 'Data Anda berhasil diverifikasi dan disinkronkan dengan Buku Induk Alumni!'
        : 'Pendaftaran alumni baru berhasil dicatat dalam Buku Induk Digital!',
      student: resultStudent
    };
  };

  // 1. PRIMARY VIEW: PORTAL UTAMA (Default main landing page for student checks & alumni tracer)
  if (currentViewMode === 'portal') {
    return (
      <PublicPortal
        students={students}
        settings={settings}
        initialTab={portalActiveTab}
        currentUser={currentUser}
        mutationApplications={mutationApplications}
        onSubmitMutationApplication={(newApp) => {
          const updated = [newApp, ...mutationApplications];
          saveAndSyncMutationApplications(updated);
          addActivityLog('MUTASI_SISWA', `Pengajuan mutasi online masuk: ${newApp.namaSiswa} (${newApp.nomorRegistrasi})`);
        }}
        onOpenLogin={() => setCurrentViewMode('login')}
        onGoToDashboard={() => setCurrentViewMode('dashboard')}
        onLogout={handleLogout}
        onRegisterAlumni={handleRegisterAlumni}
      />
    );
  }

  // 2. LOGIN VIEW: When operator clicks "Login Operator / Guru"
  if (currentViewMode === 'login' || (!currentUser && currentViewMode === 'dashboard')) {
    return (
      <Login 
        onLogin={handleLogin} 
        accounts={accounts} 
        onBackToPortal={() => setCurrentViewMode('portal')}
        onOpenPortal={(tab) => {
          setPortalActiveTab(tab);
          setCurrentViewMode('portal');
        }} 
      />
    );
  }

  // Determine sidebar theme
  const getThemeClasses = () => {
    switch(settings.temaAplikasi) {
      case 'terang': return {
        sidebar: 'bg-white text-slate-800 border-r border-slate-200',
        sidebarText: 'text-slate-500',
        activeMenu: 'bg-slate-100 text-slate-900 shadow-xs border border-slate-200',
        inactiveMenu: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
        border: 'border-slate-200',
        developerText: 'text-slate-800',
        titleText: 'text-slate-900',
        logoBg: 'bg-indigo-600 text-white'
      };
      case 'biru': return {
        sidebar: 'bg-blue-900 text-blue-100',
        sidebarText: 'text-blue-300',
        activeMenu: 'bg-blue-800 text-white shadow-xs',
        inactiveMenu: 'text-blue-300 hover:text-white hover:bg-blue-800/50',
        border: 'border-blue-800/50',
        developerText: 'text-white',
        titleText: 'text-white',
        logoBg: 'bg-white text-blue-900'
      };
      case 'indigo': return {
        sidebar: 'bg-indigo-950 text-indigo-100',
        sidebarText: 'text-indigo-300',
        activeMenu: 'bg-indigo-900 text-white shadow-xs',
        inactiveMenu: 'text-indigo-300 hover:text-white hover:bg-indigo-900/50',
        border: 'border-indigo-800/50',
        developerText: 'text-white',
        titleText: 'text-white',
        logoBg: 'bg-white text-indigo-900'
      };
      case 'hijau': return {
        sidebar: 'bg-emerald-950 text-emerald-100',
        sidebarText: 'text-emerald-300',
        activeMenu: 'bg-emerald-900 text-white shadow-xs',
        inactiveMenu: 'text-emerald-300 hover:text-white hover:bg-emerald-900/50',
        border: 'border-emerald-800/50',
        developerText: 'text-white',
        titleText: 'text-white',
        logoBg: 'bg-white text-emerald-900'
      };
      case 'gelap':
      default: return {
        sidebar: 'bg-slate-900 text-slate-200',
        sidebarText: 'text-slate-400',
        activeMenu: 'bg-slate-800 text-white shadow-xs',
        inactiveMenu: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
        border: 'border-slate-800',
        developerText: 'text-white',
        titleText: 'text-white',
        logoBg: 'bg-white text-slate-900'
      };
    }
  };
  
  const theme = getThemeClasses();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      
      {/* LEFT SIDEBAR - Desktop only */}
      <aside className={`relative ${theme.sidebar} ${isSidebarMinimized ? 'w-20' : 'w-64'} shrink-0 hidden lg:flex lg:flex-col transition-all duration-300 ease-in-out no-print`}>
        {/* Toggle Button for Desktop */}
        <button
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          className={`hidden lg:flex absolute -right-3 top-6 w-6 h-6 rounded-full border ${theme.border} bg-white text-slate-500 hover:text-slate-800 items-center justify-center shadow-sm cursor-pointer z-50`}
        >
          {isSidebarMinimized ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Header */}
        <div className={`${isSidebarMinimized ? 'px-4 justify-center' : 'px-6 justify-between'} py-5 border-b ${theme.border} flex items-center transition-all duration-300`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 shrink-0 rounded-lg ${theme.logoBg} flex items-center justify-center font-bold shadow-xs`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isSidebarMinimized && (
              <div className="min-w-0 transition-opacity duration-300">
                <h2 className={`text-sm font-bold tracking-tight leading-tight truncate ${theme.titleText}`}>Buku Induk</h2>
                <span className={`text-[9px] ${theme.sidebarText} font-bold uppercase tracking-wider block mt-0.5 truncate`}>Sistem Akademik</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className={`flex-1 ${isSidebarMinimized ? 'px-2' : 'px-4'} py-6 space-y-7 overflow-y-auto transition-all duration-300`}>
          {/* DASHBOARD SECTION */}
          <div className="space-y-2">
            {!isSidebarMinimized && <span className={`px-3 text-[10px] font-bold ${theme.sidebarText} uppercase tracking-widest block truncate`}>Menu Utama</span>}
            <div className="space-y-1">
              <button
                title="Dashboard Analitik"
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'dashboard' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isSidebarMinimized && <span className="truncate">Dashboard Analitik</span>}
              </button>
            </div>
          </div>

          {/* MASTER DATA SECTION */}
          <div className="space-y-2">
            {!isSidebarMinimized && <span className={`px-3 text-[10px] font-bold ${theme.sidebarText} uppercase tracking-widest block truncate`}>Master Data</span>}
            <div className="space-y-1">
              <button
                title="Data Siswa"
                onClick={() => {
                  setActiveTab('siswa');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'siswa' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                {!isSidebarMinimized && <span className="truncate">Data Siswa</span>}
              </button>
              <button
                title="Data Guru"
                onClick={() => {
                  setActiveTab('guru');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'guru' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                {!isSidebarMinimized && <span className="truncate">Data Guru</span>}
              </button>
              <button
                title="Tenaga Kependidikan"
                onClick={() => {
                  setActiveTab('staff');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'staff' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <BriefcaseBusiness className="w-4 h-4 shrink-0" />
                {!isSidebarMinimized && <span className="truncate">Tenaga Kependidikan</span>}
              </button>
            </div>
          </div>

          {/* AKADEMIK SECTION */}
          <div className="space-y-2">
            {!isSidebarMinimized && <span className={`px-3 text-[10px] font-bold ${theme.sidebarText} uppercase tracking-widest block truncate`}>Proses Akademik</span>}
            <div className="space-y-1">
              <button
                title="Kenaikan Kelas"
                onClick={() => {
                  setActiveTab('promotion');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'promotion' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                {!isSidebarMinimized && <span className="truncate">Kenaikan Kelas</span>}
              </button>
              
              <button
                title="Mutasi Siswa"
                onClick={() => {
                  setActiveTab('mutasi');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'mutasi' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 shrink-0" />
                {!isSidebarMinimized && <span className="truncate">Mutasi Siswa</span>}
              </button>

              <button
                title="Direktori Alumni"
                onClick={() => {
                  setActiveTab('alumni');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'alumni' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                {!isSidebarMinimized && <span className="truncate">Direktori Alumni</span>}
              </button>
            </div>
          </div>

          {/* LAYANAN ADMINISTRASI & TATA USAHA SECTION */}
          <div className="space-y-2">
            {!isSidebarMinimized && <span className={`px-3 text-[10px] font-bold ${theme.sidebarText} uppercase tracking-widest block truncate`}>Layanan Tata Usaha</span>}
            <div className="space-y-1">
              <button
                title="Cetak Surat Keterangan Resmi"
                onClick={() => {
                  setActiveTab('surat');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'surat' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 text-amber-400" />
                {!isSidebarMinimized && <span className="truncate">Surat Keterangan</span>}
              </button>

              <button
                title="Rekapitulasi & Laporan Bulanan TU"
                onClick={() => {
                  setActiveTab('laporan');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'laporan' ? theme.activeMenu : theme.inactiveMenu
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isSidebarMinimized && <span className="truncate">Laporan Bulanan TU</span>}
              </button>
            </div>
          </div>

          {/* LAYANAN PORTAL UTAMA SECTION */}
          <div className="space-y-2">
            {!isSidebarMinimized && <span className={`px-3 text-[10px] font-bold ${theme.sidebarText} uppercase tracking-widest block truncate`}>Portal Utama (Publik)</span>}
            <div className="space-y-1">
              <button
                title="Cek Data Siswa (Portal Utama)"
                onClick={() => {
                  setPortalActiveTab('cek-siswa');
                  setCurrentViewMode('portal');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${theme.inactiveMenu}`}
              >
                <Search className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isSidebarMinimized && <span className="truncate">Cek Data Siswa</span>}
              </button>

              <button
                title="Pendaftaran Alumni (Portal Utama)"
                onClick={() => {
                  setPortalActiveTab('daftar-alumni');
                  setCurrentViewMode('portal');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${theme.inactiveMenu}`}
              >
                <GraduationCap className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isSidebarMinimized && <span className="truncate">Portal Daftar Alumni</span>}
              </button>
            </div>
          </div>

          {/* CONFIGURATION SECTION */}
          {currentUser.role === 'admin' && (
            <div className="space-y-2">
              {!isSidebarMinimized && <span className={`px-3 text-[10px] font-bold ${theme.sidebarText} uppercase tracking-widest block truncate`}>Keamanan & Konfigurasi</span>}
              <div className="space-y-1">
                <button
                  title="Google Drive Cloud Database"
                  onClick={() => {
                    setActiveTab('drive');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'drive' ? theme.activeMenu : theme.inactiveMenu
                  }`}
                >
                  <Cloud className="w-4 h-4 shrink-0 text-cyan-400" />
                  {!isSidebarMinimized && (
                    <div className="flex items-center justify-between w-full min-w-0">
                      <span className="truncate">Google Drive Sync</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1" />
                    </div>
                  )}
                </button>

                <button
                  title="Pengaturan Sekolah"
                  onClick={() => {
                    setActiveTab('settings');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'settings' ? theme.activeMenu : theme.inactiveMenu
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {!isSidebarMinimized && <span className="truncate">Pengaturan Sekolah</span>}
                </button>

                <button
                  title="Audit Trail & Rekam Jejak Aktivitas"
                  onClick={() => {
                    setActiveTab('logs');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'logs' ? theme.activeMenu : theme.inactiveMenu
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                  {!isSidebarMinimized && <span className="truncate">Audit Trail & Log</span>}
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${theme.border} text-center space-y-2 transition-all duration-300`}>
          {!isSidebarMinimized && (
            <>
              <div className={`text-[10px] ${theme.sidebarText} font-mono truncate`}>
                {settings.namaSekolah}
              </div>
              <div className={`text-[10px] ${theme.sidebarText} font-medium truncate`}>
                Dev: <span className={`font-bold ${theme.developerText}`}>Khabibu Rohman</span>
              </div>
            </>
          )}
          <button
            title="Keluar Sistem"
            onClick={handleLogout}
            className={`w-full mt-2 flex items-center justify-center gap-2 ${isSidebarMinimized ? 'px-0' : 'px-3'} py-2 rounded-lg text-xs font-semibold text-rose-500 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer border ${theme.border}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarMinimized && <span className="truncate">Keluar Sistem</span>}
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Professional Header Bar */}
        <header className="bg-white border-b border-slate-100 shadow-2xs sticky top-0 z-30 px-3.5 sm:px-6 py-2.5 sm:py-4.5 no-print">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* School Branding & Title (No Hamburger Menu) */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs lg:hidden">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-800 leading-tight truncate">
                  Buku Induk Siswa Digital
                </h1>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5 truncate">
                  {settings.namaSekolah}
                </p>
              </div>
            </div>

            {/* Quick metadata and log session info */}
            <div className="flex items-center gap-1.5 sm:gap-3 text-xs text-slate-500 font-medium shrink-0">
              <button
                onClick={() => setActiveTab('drive')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 ${
                  activeTab === 'drive' 
                    ? 'bg-indigo-600 text-white border-indigo-700' 
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                }`}
                title="Penyimpanan Basis Data Google Drive"
              >
                <Cloud className={`w-3.5 h-3.5 ${activeTab === 'drive' ? 'text-white' : 'text-sky-600'}`} />
                <span className="hidden sm:inline">Google Drive</span>
              </button>

              <button
                onClick={() => {
                  setPortalActiveTab('cek-siswa');
                  setCurrentViewMode('portal');
                }}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-indigo-200 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
                title="Buka Portal Utama Siswa & Alumni"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden xs:inline">Portal Publik</span>
              </button>
              <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50 shrink-0">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Operator: <strong className="text-indigo-900 uppercase tracking-wide">{currentUser.username}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200 font-mono text-[10px] sm:text-[11px] shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400 hidden xs:inline" />
                <span>T.A {settings.tahunAjaranAktif}</span>
              </div>
            </div>
            
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-3 sm:px-6 py-4 sm:py-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          
          {/* TAB 0: MAIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <MainDashboard 
              students={students}
              teachers={teachers}
              staffList={staffList}
              settings={settings}
              userRole={currentUser.role}
              onOpenPortal={(tab) => {
                setPortalActiveTab(tab);
                setCurrentViewMode('portal');
              }}
              onNavigate={(tab) => {
                setActiveTab(tab);
                if (tab === 'siswa') {
                  setCurrentView('list');
                  setSelectedStudent(null);
                }
              }}
            />
          )}

          {/* TAB 1: DATA SISWA (Original Pipeline) */}
          {activeTab === 'siswa' && (
            <div className="space-y-6">
              {currentView === 'list' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Dashboard metrics statistics */}
                  <DashboardStats students={students} />

                  {/* Core student table / cards listing */}
                  <StudentList 
                    students={students}
                    userRole={currentUser.role}
                    onSelectStudent={(student) => {
                      setSelectedStudent(student);
                      setCurrentView('detail');
                    }}
                    onAddStudent={() => {
                      setSelectedStudent(null);
                      setFormMode('add');
                      setCurrentView('form');
                    }}
                    onDeleteStudent={handleDeleteStudent}
                    onImportStudents={handleImportStudents}
                    onImportGrades={handleImportGrades}
                    onUpdateStudent={(updated) => {
                      const updatedList = students.map(s => s.id === updated.id ? updated : s);
                      saveAndSyncStudents(updatedList);
                    }}
                  />
                </div>
              )}

              {currentView === 'detail' && selectedStudent && (
                <div className="animate-fade-in">
                  <StudentDetail 
                    student={selectedStudent}
                    userRole={currentUser.role}
                    onBack={() => {
                      setSelectedStudent(null);
                      setCurrentView('list');
                    }}
                    onEdit={() => {
                      setFormMode('edit');
                      setCurrentView('form');
                    }}
                    onUpdateStudent={(updated) => {
                      setSelectedStudent(updated);
                      const updatedList = students.map(s => s.id === updated.id ? updated : s);
                      saveAndSyncStudents(updatedList);
                    }}
                    onOpenGradeEditor={(semId) => {
                      setEditingSemesterId(semId);
                    }}
                    onGenerateLetter={(studentId) => {
                      setLetterStudentId(studentId);
                      setActiveTab('surat');
                    }}
                  />
                </div>
              )}

              {currentView === 'form' && (
                <div className="animate-fade-in">
                  <div className="mb-6">
                    <button 
                      onClick={() => setCurrentView(formMode === 'add' ? 'list' : 'detail')}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-all bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                    >
                      ← Batalkan & Kembali
                    </button>
                  </div>
                  
                  <StudentForm 
                    student={selectedStudent || undefined}
                    onSave={handleSaveStudent}
                    onCancel={() => {
                      setCurrentView(formMode === 'add' ? 'list' : 'detail');
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DATA GURU */}
          {activeTab === 'guru' && (
            <div className="animate-fade-in">
              <TeacherManagement 
                teachers={teachers}
                userRole={currentUser.role}
                onSaveTeacher={handleSaveTeacher}
                onDeleteTeacher={handleDeleteTeacher}
              />
            </div>
          )}

          {/* TAB 3: DATA TENAGA KEPENDIDIKAN */}
          {activeTab === 'staff' && (
            <div className="animate-fade-in">
              <StaffManagement 
                staffList={staffList}
                userRole={currentUser.role}
                onSaveStaff={handleSaveStaff}
                onDeleteStaff={handleDeleteStaff}
              />
            </div>
          )}

          {/* TAB: KENAIKAN KELAS */}
          {activeTab === 'promotion' && (
            <div className="animate-fade-in">
              <ClassPromotionManagement 
                students={students}
                userRole={currentUser.role}
                onPromoteStudents={(updated) => {
                  saveAndSyncStudents(updated);
                  addActivityLog('KENAIKAN_KELAS', `Memproses kenaikan dan penataan kelas untuk ${updated.length} siswa.`);
                }}
              />
            </div>
          )}

          {/* TAB: MUTASI SISWA */}
          {activeTab === 'mutasi' && (
            <div className="animate-fade-in">
              <StudentMutationManagement 
                students={students}
                userRole={currentUser.role}
                settings={settings}
                mutationApplications={mutationApplications}
                onSaveMutationApplications={saveAndSyncMutationApplications}
                onAddActivityLog={(action, desc) => addActivityLog(action, desc)}
                onSaveStudent={handleUpdateSingleStudent}
                onDeleteStudent={handleDeleteStudent}
                onViewStudent={(student) => {
                  setSelectedStudent(student);
                  setCurrentView('detail');
                  setActiveTab('siswa');
                }}
                onEditStudent={(student) => {
                  setSelectedStudent(student);
                  setFormMode('edit');
                  setCurrentView('form');
                  setActiveTab('siswa');
                }}
              />
            </div>
          )}

          {/* TAB: DIREKTORI ALUMNI */}
          {activeTab === 'alumni' && (
            <div className="animate-fade-in">
              <AlumniManagement 
                students={students}
                userRole={currentUser.role}
                onSaveStudent={handleUpdateSingleStudent}
                onDeleteStudent={handleDeleteStudent}
                onViewStudent={(student) => {
                  setSelectedStudent(student);
                  setCurrentView('detail');
                  setActiveTab('siswa');
                }}
                onEditStudent={(student) => {
                  setSelectedStudent(student);
                  setFormMode('edit');
                  setCurrentView('form');
                  setActiveTab('siswa');
                }}
                onOpenRegisterPortal={() => {
                  setPortalActiveTab('daftar-alumni');
                  setCurrentViewMode('portal');
                }}
              />
            </div>
          )}

          {/* TAB: CETAK SURAT KETERANGAN RESMI */}
          {activeTab === 'surat' && (
            <div className="animate-fade-in">
              <OfficialLetterGenerator 
                students={students}
                settings={settings}
                userRole={currentUser.role}
                initialStudentId={letterStudentId}
                onBack={() => {
                  setActiveTab('siswa');
                  setLetterStudentId(undefined);
                }}
                onLogPrint={(letterType, studentName) => {
                  addActivityLog('CETAK_SURAT', `Menerbitkan dan mencetak ${letterType} untuk siswa: ${studentName}.`, undefined, studentName);
                }}
              />
            </div>
          )}

          {/* TAB: REKAPITULASI DEMOGRAFI & LAPORAN BULANAN TU */}
          {activeTab === 'laporan' && (
            <div className="animate-fade-in">
              <MonthlyReportPanel 
                students={students}
                teachers={teachers}
                staffList={staffList}
                settings={settings}
                userRole={currentUser.role}
              />
            </div>
          )}

          {/* TAB 4: PENGATURAN SEKOLAH */}
          {activeTab === 'settings' && currentUser?.role === 'admin' && (
            <div className="animate-fade-in">
              <SchoolSettingsPanel 
                settings={settings}
                students={students}
                teachers={teachers}
                staffList={staffList}
                mutationApplications={mutationApplications}
                onSaveSettings={saveAndSyncSettings}
                onResetDatabase={handleResetDatabase}
                onRestoreDatabase={handleRestoreDatabase}
                onOpenGoogleDrive={() => setActiveTab('drive')}
              />
            </div>
          )}

          {/* TAB: GOOGLE DRIVE CLOUD DATABASE */}
          {activeTab === 'drive' && (
            <div className="animate-fade-in">
              <GoogleDriveSyncPanel 
                students={students}
                teachers={teachers}
                staffList={staffList}
                settings={settings}
                activityLogs={activityLogs}
                mutationApplications={mutationApplications}
                onRestoreData={(restored) => {
                  saveAndSyncStudents(restored.students);
                  saveAndSyncTeachers(restored.teachers);
                  saveAndSyncStaff(restored.staff);
                  saveAndSyncSettings(restored.settings);
                  if (restored.mutationApplications) {
                    saveAndSyncMutationApplications(restored.mutationApplications);
                  }
                  if (restored.activityLogs) {
                    setActivityLogs(restored.activityLogs);
                    localStorage.setItem('buku_induk_activity_logs', JSON.stringify(restored.activityLogs));
                  }
                  addActivityLog('CADANGAN_DATA', `Memulihkan pangkalan data dari Google Drive (${restored.students.length} siswa).`);
                }}
                onLogActivity={(action, desc) => addActivityLog(action, desc)}
              />
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL & LOG AKTIVITAS */}
          {activeTab === 'logs' && currentUser?.role === 'admin' && (
            <div className="animate-fade-in">
              <ActivityLogPanel 
                logs={activityLogs}
                onClearLogs={() => {
                  setActivityLogs([]);
                  localStorage.removeItem('buku_induk_activity_logs');
                  addActivityLog('SYSTEM', 'Seluruh riwayat audit trail log telah dibersihkan oleh Administrator.');
                }}
              />
            </div>
          )}

        </main>

        {/* MODAL OVERLAY: Semester Academic Grade Entry Form */}
        {editingSemesterId && selectedStudent && (
          <SemesterGradeEditor 
            student={selectedStudent}
            semesterId={editingSemesterId}
            onSave={handleSaveSemesterRecord}
            onCancel={() => setEditingSemesterId(null)}
          />
        )}

        {/* Aesthetic Footer */}
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-medium mt-16 no-print">
          <p>© 2026 {settings.namaSekolah}. Sistem Buku Induk Digital & Hasil Belajar Rapor PDF Otomatis.</p>
          <p className="mt-1 text-[10px] text-slate-300 font-mono">Platform Ingress Port: 3000 • In-Sync LocalStorage engine</p>
        </footer>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav 
          aria-label="Navigasi Bawah Mobile"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] no-print flex items-center justify-around gap-1"
        >
          {/* 1. Beranda */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard' && !isMobileMenuOpen
                ? 'bg-indigo-50 text-indigo-700 font-bold scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Beranda</span>
          </button>

          {/* 2. Siswa */}
          <button
            onClick={() => {
              setActiveTab('siswa');
              setCurrentView('list');
              setSelectedStudent(null);
              setIsMobileMenuOpen(false);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'siswa' && !isMobileMenuOpen
                ? 'bg-indigo-50 text-indigo-700 font-bold scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Siswa</span>
          </button>

          {/* 3. Surat TU */}
          <button
            onClick={() => {
              setActiveTab('surat');
              setIsMobileMenuOpen(false);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'surat' && !isMobileMenuOpen
                ? 'bg-amber-50 text-amber-700 font-bold scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Surat TU</span>
          </button>

          {/* 4. Laporan */}
          <button
            onClick={() => {
              setActiveTab('laporan');
              setIsMobileMenuOpen(false);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'laporan' && !isMobileMenuOpen
                ? 'bg-emerald-50 text-emerald-700 font-bold scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Laporan</span>
          </button>

          {/* 5. Menu Utama (Bottom Sheet Trigger) */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              isMobileMenuOpen 
                ? 'bg-indigo-600 text-white font-bold shadow-xs scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Buka Menu Lengkap"
          >
            <div className="relative">
              <LayoutGrid className="w-5 h-5" />
              {!isMobileMenuOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">Menu</span>
          </button>
        </nav>

        {/* MOBILE BOTTOM MENU SHEET */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end no-print">
            {/* Backdrop */}
            <div 
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            />

            {/* Sheet Container */}
            <div className="relative bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 max-h-[88vh] flex flex-col z-10 animate-slide-up overflow-hidden">
              
              {/* Sheet Drag Handle & Header */}
              <div className="pt-3 pb-3 px-5 border-b border-slate-100 flex flex-col shrink-0 bg-slate-50/50">
                <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
                
                <div className="w-full flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">Menu Sistem Buku Induk</h3>
                      <p className="text-[10px] text-slate-500 truncate">
                        {settings.namaSekolah} • <span className="text-indigo-600 font-semibold">{currentUser.username}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick Add Student Action */}
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setActiveTab('siswa');
                          setSelectedStudent(null);
                          setFormMode('add');
                          setCurrentView('form');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                        title="Tambah Siswa Baru"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Siswa</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                      title="Tutup Menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sheet Scrollable Menu Grid */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(88vh-85px)] pb-12">
                
                {/* Section 1: Akademik & Kesiswaan */}
                <div>
                  <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Akademik & Siswa
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                      {students.length} Siswa Terdaftar
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'dashboard' 
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Dashboard</div>
                          <div className="text-[9px] text-slate-400">Statistik Utama</div>
                        </div>
                      </div>
                      {activeTab === 'dashboard' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('siswa');
                        setCurrentView('list');
                        setSelectedStudent(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'siswa' 
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Buku Induk</div>
                          <div className="text-[9px] text-slate-400">Data Pokok Siswa</div>
                        </div>
                      </div>
                      {activeTab === 'siswa' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('kenaikan');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'kenaikan' 
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Kenaikan Kelas</div>
                          <div className="text-[9px] text-slate-400">Naik & Lulus Massal</div>
                        </div>
                      </div>
                      {activeTab === 'kenaikan' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('mutasi');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'mutasi' 
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <ArrowLeftRight className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Mutasi Siswa</div>
                          <div className="text-[9px] text-slate-400">Masuk & Keluar</div>
                        </div>
                      </div>
                      {activeTab === 'mutasi' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('alumni');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`col-span-2 p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'alumni' 
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Database Alumni & Penelusuran Tamatan</div>
                          <div className="text-[9px] text-slate-400">Pangkalan data alumni dan rekap pelacakan kerja/kuliah</div>
                        </div>
                      </div>
                      {activeTab === 'alumni' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  </div>
                </div>

                {/* Section 2: Administrasi & TU */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                    Tata Usaha & GTK
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <button
                      onClick={() => {
                        setActiveTab('surat');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'surat' 
                          ? 'bg-amber-50/80 border-amber-300 text-amber-900 ring-1 ring-amber-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Surat Resmi TU</div>
                          <div className="text-[9px] text-slate-400">Kop & TTD Otomatis</div>
                        </div>
                      </div>
                      {activeTab === 'surat' && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('laporan');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'laporan' 
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 ring-1 ring-emerald-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Laporan Bulanan</div>
                          <div className="text-[9px] text-slate-400">Rekap Mutasi & Siswa</div>
                        </div>
                      </div>
                      {activeTab === 'laporan' && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('teachers');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'teachers' 
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Data Guru</div>
                          <div className="text-[9px] text-slate-400">{teachers.length} Tenaga Pendidik</div>
                        </div>
                      </div>
                      {activeTab === 'teachers' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('staff');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'staff' 
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                          <BriefcaseBusiness className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Tenaga Kependidikan</div>
                          <div className="text-[9px] text-slate-400">{staffList.length} Staf & TU</div>
                        </div>
                      </div>
                      {activeTab === 'staff' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  </div>
                </div>

                {/* Section 3: Layanan Publik & Konfigurasi */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                    Layanan Publik & Konfigurasi
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setPortalActiveTab('cek-siswa');
                        setCurrentViewMode('portal');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full p-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl flex items-center justify-between shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
                          <Globe className="w-4.5 h-4.5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold">Buka Portal Publik Siswa</div>
                          <div className="text-[10px] text-indigo-100">Cek Siswa, Validasi Dokumen & Alumni</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-indigo-200" />
                    </button>

                    {currentUser.role === 'admin' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            activeTab === 'settings' 
                              ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                              : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 text-left">
                            <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                              <Settings className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">Pengaturan</div>
                              <div className="text-[9px] text-slate-400">Kop & T.A Sekolah</div>
                            </div>
                          </div>
                          {activeTab === 'settings' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('logs');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            activeTab === 'logs' 
                              ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-200 shadow-2xs font-semibold' 
                              : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 text-left">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">Audit Trail</div>
                              <div className="text-[9px] text-slate-400">Log Rekam Jejak</div>
                            </div>
                          </div>
                          {activeTab === 'logs' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('drive');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`col-span-2 p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            activeTab === 'drive' 
                              ? 'bg-sky-50/90 border-sky-300 text-sky-900 ring-1 ring-sky-200 shadow-2xs font-semibold' 
                              : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 text-left">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                              <Cloud className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">Penyimpanan Google Drive</div>
                              <div className="text-[9px] text-slate-400">Pangkalan data awan & multi-perangkat</div>
                            </div>
                          </div>
                          {activeTab === 'drive' && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Akun & Keluar */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Akun Operator</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
