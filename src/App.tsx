/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Student, SemesterRecord, Teacher, Staff, SchoolSettings } from './types';
import { mockStudents } from './data/mockStudents';
import { mockTeachers, mockStaff, defaultSchoolSettings } from './data/mockStaffAndSettings';
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
import MainDashboard from './components/MainDashboard';
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
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  // Core navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'siswa' | 'guru' | 'staff' | 'promotion' | 'mutasi' | 'alumni' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core application database states
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>(defaultSchoolSettings);

  // Student list view states
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  // Semester academic grade editor popup state
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);

  // Load initial data from localStorage or mock data
  useEffect(() => {
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
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        setSettings(defaultSchoolSettings);
      }
    } else {
      setSettings(defaultSchoolSettings);
      localStorage.setItem('school_settings', JSON.stringify(defaultSchoolSettings));
    }
  }, []);

  // Sync helpers
  const saveAndSyncStudents = (updatedList: Student[]) => {
    setStudents(updatedList);
    localStorage.setItem('buku_induk_students', JSON.stringify(updatedList));
  };

  const saveAndSyncTeachers = (updatedList: Teacher[]) => {
    setTeachers(updatedList);
    localStorage.setItem('buku_induk_teachers', JSON.stringify(updatedList));
  };

  const saveAndSyncStaff = (updatedList: Staff[]) => {
    setStaffList(updatedList);
    localStorage.setItem('buku_induk_staff', JSON.stringify(updatedList));
  };

  const saveAndSyncSettings = (updatedSettings: SchoolSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('school_settings', JSON.stringify(updatedSettings));
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

    localStorage.setItem('buku_induk_students', JSON.stringify(mockStudents));
    localStorage.setItem('buku_induk_teachers', JSON.stringify(mockTeachers));
    localStorage.setItem('buku_induk_staff', JSON.stringify(mockStaff));
    localStorage.setItem('school_settings', JSON.stringify(defaultSchoolSettings));
    
    setActiveTab('siswa');
    setCurrentView('list');
    setSelectedStudent(null);
  };

  const handleRestoreDatabase = (
    restoredStudents: Student[],
    restoredTeachers: Teacher[],
    restoredStaff: Staff[],
    restoredSettings: SchoolSettings
  ) => {
    saveAndSyncStudents(restoredStudents);
    saveAndSyncTeachers(restoredTeachers);
    saveAndSyncStaff(restoredStaff);
    saveAndSyncSettings(restoredSettings);
  };

  // Student specific handlers
  const handleSaveStudent = (savedStudent: Student) => {
    let updatedList: Student[] = [];
    if (formMode === 'add') {
      updatedList = [savedStudent, ...students];
    } else {
      updatedList = students.map(s => s.id === savedStudent.id ? savedStudent : s);
      if (selectedStudent?.id === savedStudent.id) {
        setSelectedStudent(savedStudent);
      }
    }

    saveAndSyncStudents(updatedList);
    setCurrentView(formMode === 'add' ? 'list' : 'detail');
  };

  const handleDeleteStudent = (id: string) => {
    const updatedList = students.filter(s => s.id !== id);
    saveAndSyncStudents(updatedList);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      
      {/* LEFT SIDEBAR - Responsive */}
      <aside className={`bg-slate-900 text-slate-200 w-64 fixed inset-y-0 left-0 z-50 transform lg:translate-x-0 lg:static lg:flex lg:flex-col transition-transform duration-300 ease-in-out shrink-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } no-print`}>
        {/* Sidebar Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-slate-900 flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight leading-tight text-white">Buku Induk</h2>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Sistem Akademik</span>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-7 overflow-y-auto">
          {/* DASHBOARD SECTION */}
          <div className="space-y-2">
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Menu Utama</span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard Analitik</span>
              </button>
            </div>
          </div>

          {/* MASTER DATA SECTION */}
          <div className="space-y-2">
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Master Data</span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('siswa');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'siswa' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Data Siswa</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('guru');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'guru' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Data Guru</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('staff');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'staff' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <BriefcaseBusiness className="w-4 h-4 shrink-0" />
                <span>Tenaga Kependidikan</span>
              </button>
            </div>
          </div>

          {/* AKADEMIK SECTION */}
          <div className="space-y-2">
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Proses Akademik</span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('promotion');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'promotion' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Kenaikan Kelas</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('mutasi');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'mutasi' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 shrink-0" />
                <span>Mutasi Siswa</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('alumni');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'alumni' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Direktori Alumni</span>
              </button>
            </div>
          </div>

          {/* CONFIGURATION SECTION */}
          <div className="space-y-2">
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Konfigurasi</span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Pengaturan Sekolah</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          SMP Negeri Indonesia Jaya
        </div>
      </aside>

      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 no-print"
        />
      )}

      {/* RIGHT SIDE WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Professional Header Bar */}
        <header className="bg-white border-b border-slate-100 shadow-2xs sticky top-0 z-30 px-6 py-4.5 no-print">
          <div className="flex items-center justify-between gap-4">
            
            {/* Hamburger Button + School Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <div className="shrink-0">
                <h1 className="text-md font-bold tracking-tight text-slate-800 leading-tight">
                  Buku Induk Siswa Digital
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  {settings.namaSekolah}
                </p>
              </div>
            </div>

            {/* Quick metadata and log session info */}
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Operator: <strong className="text-slate-700">sekhudin36@guru.smp.belajar.id</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>T.A {settings.tahunAjaranAktif} (Aktif)</span>
              </div>
            </div>
            
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto">
          
          {/* TAB 0: MAIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <MainDashboard 
              students={students}
              teachers={teachers}
              staffList={staffList}
              settings={settings}
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
                onPromoteStudents={saveAndSyncStudents}
              />
            </div>
          )}

          {/* TAB: MUTASI SISWA */}
          {activeTab === 'mutasi' && (
            <div className="animate-fade-in">
              <StudentMutationManagement 
                students={students}
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

          {/* TAB 4: PENGATURAN SEKOLAH */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <SchoolSettingsPanel 
                settings={settings}
                students={students}
                teachers={teachers}
                staffList={staffList}
                onSaveSettings={saveAndSyncSettings}
                onResetDatabase={handleResetDatabase}
                onRestoreDatabase={handleRestoreDatabase}
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

      </div>
    </div>
  );
}
