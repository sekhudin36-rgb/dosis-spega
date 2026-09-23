/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student, SchoolSettings, MutationApplication } from '../types';
import { exportStudentMasterBookPDF } from '../utils/pdfUtils';
import { defaultMutationApplications } from '../data/mockMutationApplications';
import MutationApplicationManagement from './MutationApplicationManagement';
import { 
  ArrowLeftRight, 
  UserPlus, 
  UserMinus, 
  Search, 
  Calendar, 
  FileText, 
  Building2, 
  HelpCircle,
  Plus,
  CheckCircle2,
  Trash2,
  Users,
  Edit2,
  Save,
  ArrowRight,
  Eye,
  Printer,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface StudentMutationManagementProps {
  students: Student[];
  userRole?: 'admin' | 'guru';
  settings?: SchoolSettings;
  mutationApplications?: MutationApplication[];
  onSaveMutationApplications?: (apps: MutationApplication[]) => void;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewStudent?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  onAddActivityLog?: (action: any, desc: string) => void;
}

export default function StudentMutationManagement({
  students,
  userRole = 'admin',
  settings,
  mutationApplications,
  onSaveMutationApplications,
  onSaveStudent,
  onDeleteStudent,
  onViewStudent,
  onEditStudent,
  onAddActivityLog
}: StudentMutationManagementProps) {
  const [activeTab, setActiveTab] = useState<'pengajuan' | 'masuk' | 'keluar'>('pengajuan');

  // Internal mutation application state if not passed from parent
  const [internalApps, setInternalApps] = useState<MutationApplication[]>(() => {
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

  const currentApps = mutationApplications || internalApps;

  const handleSaveApplications = (updated: MutationApplication[]) => {
    if (onSaveMutationApplications) {
      onSaveMutationApplications(updated);
    } else {
      setInternalApps(updated);
      localStorage.setItem('buku_induk_mutation_applications', JSON.stringify(updated));
    }
  };
  
  // Search state
  const [searchTermMasuk, setSearchTermMasuk] = useState('');
  const [searchTermKeluar, setSearchTermKeluar] = useState('');

  // Form states
  const [showAddMasukForm, setShowAddMasukForm] = useState(false);
  const [showProcessKeluarForm, setShowProcessKeluarForm] = useState(false);
  const [selectedStudentForKeluar, setSelectedStudentForKeluar] = useState<Student | null>(null);

  // Success notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Default initial values for incoming transfer student
  const [newMasuk, setNewMasuk] = useState({
    nis: '',
    nisn: '',
    namaLengkap: '',
    namaPanggilan: '',
    jenisKelamin: 'L' as 'L' | 'P',
    tempatLahir: '',
    tanggalLahir: '',
    agama: 'Islam',
    kewarganegaraan: 'WNI',
    alamat: '',
    telepon: '',
    email: '',
    kelasSaatIni: '7-A',
    tahunMasuk: new Date().getFullYear().toString(),
    namaAyah: '',
    pekerjaanAyah: '',
    namaIbu: '',
    pekerjaanIbu: '',
    teleponOrangTua: '',
    alamatOrangTua: '',
    // incoming specific
    sekolahAsal: '',
    tanggalMutasiMasuk: new Date().toISOString().split('T')[0],
    noSuratMutasiMasuk: ''
  });

  // Outgoing transfer fields
  const [keluarData, setKeluarData] = useState({
    sekolahTujuan: '',
    tanggalMutasiKeluar: new Date().toISOString().split('T')[0],
    noSuratMutasiKeluar: '',
    alasanMutasi: ''
  });

  // Filter incoming transfers
  const listMutasiMasuk = useMemo(() => {
    return students.filter(s => s.isMutasiMasuk === true)
      .filter(s => 
        s.namaLengkap.toLowerCase().includes(searchTermMasuk.toLowerCase()) ||
        s.nis.includes(searchTermMasuk) ||
        s.sekolahAsal?.toLowerCase().includes(searchTermMasuk.toLowerCase())
      );
  }, [students, searchTermMasuk]);

  // Filter outgoing transfers (Pindah / Keluar status)
  const listMutasiKeluar = useMemo(() => {
    return students.filter(s => s.statusSiswa === 'Pindah' || s.statusSiswa === 'Keluar')
      .filter(s => 
        s.namaLengkap.toLowerCase().includes(searchTermKeluar.toLowerCase()) ||
        s.nis.includes(searchTermKeluar) ||
        s.sekolahTujuan?.toLowerCase().includes(searchTermKeluar.toLowerCase())
      );
  }, [students, searchTermKeluar]);

  // Active students pool for Outgoing Transfer selection
  const activeStudents = useMemo(() => {
    return students.filter(s => s.statusSiswa === 'Aktif');
  }, [students]);

  const triggerAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  const handleSaveMutasiMasuk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasuk.nis || !newMasuk.namaLengkap || !newMasuk.sekolahAsal) {
      triggerAlert('NIS, Nama Lengkap, dan Sekolah Asal wajib diisi!', 'error');
      return;
    }

    // Check duplicate NIS
    const duplicate = students.find(s => s.nis === newMasuk.nis);
    if (duplicate) {
      triggerAlert(`Siswa dengan NIS ${newMasuk.nis} sudah terdaftar (${duplicate.namaLengkap})!`, 'error');
      return;
    }

    const studentToSave: Student = {
      ...newMasuk,
      id: 'siswa-masuk-' + Date.now(),
      statusSiswa: 'Aktif',
      foto: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="${newMasuk.jenisKelamin === 'L' ? '%23E0F2FE' : '%23FCE7F3'}"/><circle cx="50" cy="40" r="22" fill="${newMasuk.jenisKelamin === 'L' ? '%230284C7' : '%23DB2777'}"/><path d="M15 88C15 72 30 60 50 60C70 60 85 72 85 88H15Z" fill="${newMasuk.jenisKelamin === 'L' ? '%230369A1' : '%23BE185D'}"/></svg>`,
      isMutasiMasuk: true,
      riwayatAkademik: {}
    };

    onSaveStudent(studentToSave);
    triggerAlert(`Siswa mutasi masuk atas nama ${newMasuk.namaLengkap} berhasil ditambahkan!`);
    
    // Reset state & form
    setShowAddMasukForm(false);
    setNewMasuk({
      nis: '',
      nisn: '',
      namaLengkap: '',
      namaPanggilan: '',
      jenisKelamin: 'L',
      tempatLahir: '',
      tanggalLahir: '',
      agama: 'Islam',
      kewarganegaraan: 'WNI',
      alamat: '',
      telepon: '',
      email: '',
      kelasSaatIni: '7-A',
      tahunMasuk: new Date().getFullYear().toString(),
      namaAyah: '',
      pekerjaanAyah: '',
      namaIbu: '',
      pekerjaanIbu: '',
      teleponOrangTua: '',
      alamatOrangTua: '',
      sekolahAsal: '',
      tanggalMutasiMasuk: new Date().toISOString().split('T')[0],
      noSuratMutasiMasuk: ''
    });
  };

  const handleProcessMutasiKeluarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForKeluar) return;
    if (!keluarData.sekolahTujuan) {
      triggerAlert('Sekolah Tujuan wajib diisi!', 'error');
      return;
    }

    const updatedStudent: Student = {
      ...selectedStudentForKeluar,
      statusSiswa: 'Pindah',
      sekolahTujuan: keluarData.sekolahTujuan,
      tanggalMutasiKeluar: keluarData.tanggalMutasiKeluar,
      noSuratMutasiKeluar: keluarData.noSuratMutasiKeluar,
      alasanMutasi: keluarData.alasanMutasi
    };

    onSaveStudent(updatedStudent);
    triggerAlert(`Siswa ${selectedStudentForKeluar.namaLengkap} berhasil dimutasikan keluar ke ${keluarData.sekolahTujuan}!`);
    
    setShowProcessKeluarForm(false);
    setSelectedStudentForKeluar(null);
    setKeluarData({
      sekolahTujuan: '',
      tanggalMutasiKeluar: new Date().toISOString().split('T')[0],
      noSuratMutasiKeluar: '',
      alasanMutasi: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800">Manajemen Mutasi Siswa</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Kelola pencatatan siswa pindahan masuk (Mutasi Masuk) dan siswa keluar (Mutasi Keluar) dengan tertib administrasi.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs animate-fade-in ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${alertMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
          <div>
            <span className="font-bold block">{alertMsg.type === 'success' ? 'Berhasil' : 'Kesalahan'}</span>
            <p className="mt-0.5 leading-relaxed">{alertMsg.text}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('pengajuan');
            setShowAddMasukForm(false);
            setShowProcessKeluarForm(false);
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'pengajuan' 
              ? 'border-indigo-600 text-indigo-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pengajuan Mutasi Siswa</span>
          <span className="bg-indigo-50 text-indigo-700 font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-indigo-200">
            {currentApps.length}
          </span>
          {currentApps.some(a => a.statusPengajuan === 'MENUNGGU_VERIFIKASI') && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Ada pengajuan menunggu verifikasi" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('masuk');
            setShowAddMasukForm(false);
            setShowProcessKeluarForm(false);
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'masuk' 
              ? 'border-amber-500 text-amber-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Buku Induk Mutasi Masuk</span>
          <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200">
            {students.filter(s => s.isMutasiMasuk === true).length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('keluar');
            setShowAddMasukForm(false);
            setShowProcessKeluarForm(false);
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'keluar' 
              ? 'border-rose-500 text-rose-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserMinus className="w-4 h-4" />
          <span>Buku Induk Mutasi Keluar</span>
          <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200">
            {students.filter(s => s.statusSiswa === 'Pindah' || s.statusSiswa === 'Keluar').length}
          </span>
        </button>
      </div>

      {/* TAB 0: PENGAJUAN MUTASI SISWA (WORKFLOW & VERIFIKASI) */}
      {activeTab === 'pengajuan' && (
        <div className="animate-fade-in">
          <MutationApplicationManagement
            applications={currentApps}
            onSaveApplications={handleSaveApplications}
            activeStudents={activeStudents}
            userRole={userRole}
            settings={settings || {
              namaSekolah: 'SMP NEGERI 3 KRAS',
              npsn: '20511869',
              alamat: 'Jalan Doko, Kecamatan Kras Kode Pos : 64172',
              desaKelurahan: 'Doko',
              kecamatan: 'Kras',
              kabupatenKota: 'Kabupaten Kediri',
              provinsi: 'Jawa Timur',
              telepon: '0354-123456',
              email: 'smpn3kras@gmail.com',
              website: 'smpntigakras.blogspot.co.id',
              kepalaSekolah: 'Dr. H. Ahmad Sunaryo, M.Pd.',
              nipKepalaSekolah: '197005121995121002',
              tahunAjaranAktif: '2025/2026'
            }}
            onExecuteOutgoingMutation={(student, keluarInfo) => {
              const updatedStudent: Student = {
                ...student,
                statusSiswa: 'Pindah',
                sekolahTujuan: keluarInfo.sekolahTujuan,
                tanggalMutasiKeluar: keluarInfo.tanggalMutasiKeluar,
                noSuratMutasiKeluar: keluarInfo.noSuratMutasiKeluar,
                alasanMutasi: keluarInfo.alasanMutasi
              };
              onSaveStudent(updatedStudent);
            }}
            onExecuteIncomingMutation={(incomingStudent) => {
              const studentToSave: Student = {
                id: 'siswa-masuk-' + Date.now(),
                nis: incomingStudent.nis || `${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
                nisn: incomingStudent.nisn || '',
                namaLengkap: incomingStudent.namaLengkap || '',
                namaPanggilan: incomingStudent.namaPanggilan || '',
                jenisKelamin: incomingStudent.jenisKelamin || 'L',
                tempatLahir: incomingStudent.tempatLahir || 'Kediri',
                tanggalLahir: incomingStudent.tanggalLahir || '2011-01-01',
                agama: incomingStudent.agama || 'Islam',
                kewarganegaraan: incomingStudent.kewarganegaraan || 'WNI',
                alamat: incomingStudent.alamat || '',
                telepon: incomingStudent.telepon || '',
                email: incomingStudent.email || '',
                kelasSaatIni: incomingStudent.kelasSaatIni || '7-A',
                tahunMasuk: new Date().getFullYear().toString(),
                namaAyah: incomingStudent.namaAyah || '',
                pekerjaanAyah: incomingStudent.pekerjaanAyah || '',
                namaIbu: incomingStudent.namaIbu || '',
                pekerjaanIbu: incomingStudent.pekerjaanIbu || '',
                teleponOrangTua: incomingStudent.teleponOrangTua || '',
                alamatOrangTua: incomingStudent.alamatOrangTua || '',
                sekolahAsal: incomingStudent.sekolahAsal || '',
                tanggalMutasiMasuk: incomingStudent.tanggalMutasiMasuk || new Date().toISOString().split('T')[0],
                noSuratMutasiMasuk: incomingStudent.noSuratMutasiMasuk || '',
                isMutasiMasuk: true,
                statusSiswa: 'Aktif',
                foto: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="${incomingStudent.jenisKelamin === 'L' ? '%23E0F2FE' : '%23FCE7F3'}"/><circle cx="50" cy="40" r="22" fill="${incomingStudent.jenisKelamin === 'L' ? '%230284C7' : '%23DB2777'}"/><path d="M15 88C15 72 30 60 50 60C70 60 85 72 85 88H15Z" fill="${incomingStudent.jenisKelamin === 'L' ? '%230369A1' : '%23BE185D'}"/></svg>`,
                riwayatAkademik: {}
              };
              onSaveStudent(studentToSave);
            }}
            onAddActivityLog={onAddActivityLog}
            triggerAlert={triggerAlert}
          />
        </div>
      )}

      {/* TAB 1: MUTASI MASUK (INCOMING) */}
      {activeTab === 'masuk' && (
        <div className="space-y-6">
          
          {/* Incoming transfer register list & buttons */}
          {!showAddMasukForm ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Daftar Siswa Mutasi Masuk</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Daftar siswa yang masuk pertengahan semester/tahun ajaran.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari siswa masuk..."
                      value={searchTermMasuk}
                      onChange={(e) => setSearchTermMasuk(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 w-56"
                    />
                  </div>

                  {userRole === 'admin' && (
                    <button
                      onClick={() => setShowAddMasukForm(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Input Mutasi Masuk</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {listMutasiMasuk.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="font-bold text-slate-500 text-xs">Belum Ada Siswa Mutasi Masuk</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Silakan tambahkan siswa pindahan baru dengan menekan tombol input.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 font-bold text-slate-700 border-b border-slate-100">
                        <th className="p-4 w-12 text-center">No</th>
                        <th className="p-4">Nama & Identitas</th>
                        <th className="p-4">Sekolah Asal</th>
                        <th className="p-4 text-center">Tanggal Masuk</th>
                        <th className="p-4">No. Surat Pindah</th>
                        <th className="p-4 text-center">Kelas Sekarang</th>
                        <th className="p-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {listMutasiMasuk.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-slate-50/10">
                          <td className="p-4 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{student.namaLengkap}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIS: {student.nis} | NISN: {student.nisn}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{student.sekolahAsal || '-'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center font-mono">
                            {student.tanggalMutasiMasuk ? new Date(student.tanggalMutasiMasuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="p-4 font-mono text-slate-500">
                            {student.noSuratMutasiMasuk || '-'}
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-100 text-[10px]">
                              Kelas {student.kelasSaatIni}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => onViewStudent && onViewStudent(student)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                                title="Lihat Profil & Nilai"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => exportStudentMasterBookPDF(student)}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                title="Cetak Buku Induk (PDF)"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              {userRole === 'admin' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onEditStudent && onEditStudent(student)}
                                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                                    title="Edit Biodata"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Apakah Anda yakin ingin menghapus data mutasi masuk siswa ${student.namaLengkap}?`)) {
                                        onDeleteStudent(student.id);
                                        triggerAlert(`Siswa ${student.namaLengkap} berhasil dihapus.`);
                                      }
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            // INPUT FORM FOR INCOMING TRANSFER
            <form onSubmit={handleSaveMutasiMasuk} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-4.5 h-4.5 text-amber-500" />
                  <span>Formulir Input Siswa Mutasi Masuk</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddMasukForm(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
              </div>

              {/* Grid 1: Specific Mutation Information */}
              <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100/60 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Sekolah Asal *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP Negeri 2 Demak"
                    value={newMasuk.sekolahAsal}
                    onChange={(e) => setNewMasuk(prev => ({ ...prev, sekolahAsal: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tanggal Masuk Mutasi *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newMasuk.tanggalMutasiMasuk}
                    onChange={(e) => setNewMasuk(prev => ({ ...prev, tanggalMutasiMasuk: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Nomor Surat Mutasi Masuk</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 421.3/099/2026"
                    value={newMasuk.noSuratMutasiMasuk}
                    onChange={(e) => setNewMasuk(prev => ({ ...prev, noSuratMutasiMasuk: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Grid 2: Core Personal Data */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100">Biodata Pribadi Siswa</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">NIS (Nomor Induk Siswa) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 26051"
                      value={newMasuk.nis}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, nis: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">NISN (Nomor Induk Siswa Nasional)</label>
                    <input
                      type="text"
                      placeholder="10 digit nomor NISN"
                      maxLength={10}
                      value={newMasuk.nisn}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, nisn: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sesuai Akta Kelahiran atau Ijazah SD"
                      value={newMasuk.namaLengkap}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, namaLengkap: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Nama Panggilan</label>
                    <input
                      type="text"
                      value={newMasuk.namaPanggilan}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, namaPanggilan: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Jenis Kelamin</label>
                    <select
                      value={newMasuk.jenisKelamin}
                      onChange={(e: any) => setNewMasuk(prev => ({ ...prev, jenisKelamin: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-semibold"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Ditempatkan di Kelas *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 8-A"
                      value={newMasuk.kelasSaatIni}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, kelasSaatIni: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Tahun Masuk Sekolah *</label>
                    <input
                      type="text"
                      required
                      value={newMasuk.tahunMasuk}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, tahunMasuk: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Tempat Lahir</label>
                    <input
                      type="text"
                      value={newMasuk.tempatLahir}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, tempatLahir: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={newMasuk.tanggalLahir}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Agama</label>
                    <input
                      type="text"
                      value={newMasuk.agama}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, agama: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Kewarganegaraan</label>
                    <input
                      type="text"
                      value={newMasuk.kewarganegaraan}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, kewarganegaraan: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Alamat Tempat Tinggal</label>
                    <input
                      type="text"
                      value={newMasuk.alamat}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, alamat: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">No. HP Siswa</label>
                    <input
                      type="text"
                      value={newMasuk.telepon}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, telepon: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 3: Parents Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100">Data Orang Tua</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Nama Ayah Kandung</label>
                    <input
                      type="text"
                      value={newMasuk.namaAyah}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, namaAyah: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Pekerjaan Ayah</label>
                    <input
                      type="text"
                      value={newMasuk.pekerjaanAyah}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, pekerjaanAyah: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Nama Ibu Kandung</label>
                    <input
                      type="text"
                      value={newMasuk.namaIbu}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, namaIbu: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Pekerjaan Ibu</label>
                    <input
                      type="text"
                      value={newMasuk.pekerjaanIbu}
                      onChange={(e) => setNewMasuk(prev => ({ ...prev, pekerjaanIbu: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMasukForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Simpan & Tambah Siswa
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: MUTASI KELUAR (OUTGOING) */}
      {activeTab === 'keluar' && (
        <div className="space-y-6">
          
          {/* Main workspace to choose an active student to transfer out */}
          {!showProcessKeluarForm ? (
            <div className="space-y-6">
              
              {/* Box to prompt outgoing transfer */}
              {userRole === 'admin' && (
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Bagaimana cara memproses Mutasi Keluar?</h4>
                      <p className="text-[11px] text-amber-800/80 mt-0.5 leading-relaxed">
                        Pilih salah satu siswa aktif pada dropdown pencarian di bawah ini untuk mengisikan sekolah tujuan, tanggal keluar, dan surat keputusan pindah tugas.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Pilih Siswa Aktif:</span>
                    <select
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;
                        const found = students.find(s => s.id === id);
                        if (found) {
                          setSelectedStudentForKeluar(found);
                          setShowProcessKeluarForm(true);
                        }
                        e.target.value = ''; // Reset select
                      }}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                      defaultValue=""
                    >
                      <option value="" disabled>-- Pilih Siswa Untuk Pindah --</option>
                      {activeStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.namaLengkap} (NIS: {s.nis} - Kelas {s.kelasSaatIni})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* History list of Mutated out students */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Daftar Siswa Mutasi Keluar</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Daftar siswa yang telah pindah sekolah atau keluar dari rombel aktif.</p>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari siswa mutasi keluar..."
                      value={searchTermKeluar}
                      onChange={(e) => setSearchTermKeluar(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 w-56"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  {listMutasiKeluar.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <UserMinus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="font-bold text-slate-500 text-xs">Belum Ada Siswa Mutasi Keluar</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pilih siswa aktif di panel atas jika ada siswa yang mengajukan mutasi keluar.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 font-bold text-slate-700 border-b border-slate-100">
                          <th className="p-4 w-12 text-center">No</th>
                          <th className="p-4">Identitas Siswa</th>
                          <th className="p-4">Sekolah Tujuan</th>
                          <th className="p-4 text-center">Tanggal Keluar</th>
                          <th className="p-4">No. Surat Pindah</th>
                          <th className="p-4">Alasan Mutasi</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {listMutasiKeluar.map((student, idx) => (
                          <tr key={student.id} className="hover:bg-slate-50/10">
                            <td className="p-4 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{student.namaLengkap}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIS: {student.nis} | Kelas Asal: {student.kelasSaatIni || '-'}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{student.sekolahTujuan || '-'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center font-mono">
                              {student.tanggalMutasiKeluar ? new Date(student.tanggalMutasiKeluar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="p-4 font-mono text-slate-500">
                              {student.noSuratMutasiKeluar || '-'}
                            </td>
                            <td className="p-4 italic text-slate-500 max-w-xs truncate">
                              {student.alasanMutasi || '-'}
                            </td>
                            <td className="p-4 text-center">
                              <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md border border-rose-100 text-[10px]">
                                {student.statusSiswa}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onViewStudent && onViewStudent(student)}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                                  title="Lihat Profil & Nilai"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => exportStudentMasterBookPDF(student)}
                                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                  title="Cetak Buku Induk (PDF)"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                {userRole === 'admin' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onEditStudent && onEditStudent(student)}
                                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                                      title="Edit Biodata"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${student.namaLengkap}?`)) {
                                          onDeleteStudent(student.id);
                                          triggerAlert(`Siswa ${student.namaLengkap} berhasil dihapus.`);
                                        }
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                      title="Hapus"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Apakah Anda yakin ingin membatalkan status mutasi keluar untuk ${student.namaLengkap} dan mengaktifkannya kembali?`)) {
                                          const reverted: Student = {
                                            ...student,
                                            statusSiswa: 'Aktif',
                                            sekolahTujuan: undefined,
                                            tanggalMutasiKeluar: undefined,
                                            noSuratMutasiKeluar: undefined,
                                            alasanMutasi: undefined
                                          };
                                          onSaveStudent(reverted);
                                          triggerAlert(`Siswa ${student.namaLengkap} berhasil diaktifkan kembali.`);
                                        }
                                      }}
                                      className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                                      title="Aktifkan Kembali"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          ) : (
            // PROCESS OUTGOING FORM
            selectedStudentForKeluar && (
              <form onSubmit={handleProcessMutasiKeluarSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6 animate-fade-in">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <UserMinus className="w-4.5 h-4.5 text-rose-500" />
                    <span>Proses Mutasi Keluar Siswa</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProcessKeluarForm(false);
                      setSelectedStudentForKeluar(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {/* Selected Student Profile Preview */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <img 
                    src={selectedStudentForKeluar.foto} 
                    alt="" 
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-white shadow-xs" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Siswa Yang Akan Dipindahkan:</span>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight mt-0.5">{selectedStudentForKeluar.namaLengkap}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Kelas: <strong className="text-slate-700">{selectedStudentForKeluar.kelasSaatIni}</strong> | NIS: <strong className="text-slate-700">{selectedStudentForKeluar.nis}</strong> | NISN: <strong className="text-slate-700">{selectedStudentForKeluar.nisn}</strong>
                    </p>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sekolah Tujuan Pindahan *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SMP Negeri 10 Bandung"
                      value={keluarData.sekolahTujuan}
                      onChange={(e) => setKeluarData(prev => ({ ...prev, sekolahTujuan: e.target.value }))}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-rose-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tanggal Keluar Efektif *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={keluarData.tanggalMutasiKeluar}
                      onChange={(e) => setKeluarData(prev => ({ ...prev, tanggalMutasiKeluar: e.target.value }))}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nomor Surat Pengantar / Mutasi Keluar</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 421.3/281/SMP-IJ/2026"
                      value={keluarData.noSuratMutasiKeluar}
                      onChange={(e) => setKeluarData(prev => ({ ...prev, noSuratMutasiKeluar: e.target.value }))}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                      <span>Alasan Mutasi Keluar</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Mengikuti perpindahan domisili orang tua"
                      value={keluarData.alasanMutasi}
                      onChange={(e) => setKeluarData(prev => ({ ...prev, alasanMutasi: e.target.value }))}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Outgoing actions buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProcessKeluarForm(false);
                      setSelectedStudentForKeluar(null);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Keluarkan & Catat Mutasi
                  </button>
                </div>

              </form>
            )
          )}

        </div>
      )}

    </div>
  );
}
