/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Teacher, LIST_MAPEL_DEFAULT } from '../types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  BookOpen, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  X,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface TeacherManagementProps {
  teachers: Teacher[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export default function TeacherManagement({ teachers, onSaveTeacher, onDeleteTeacher }: TeacherManagementProps) {
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKepegawaian, setFilterKepegawaian] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterGender, setFilterGender] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form Field States
  const [formNip, setFormNip] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formJK, setFormJK] = useState<'L' | 'P'>('L');
  const [formMapel, setFormMapel] = useState<string[]>([]);
  const [formTelepon, setFormTelepon] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formKepegawaian, setFormKepegawaian] = useState<'PNS' | 'PPPK' | 'GTT' | 'Honor'>('PNS');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Cuti' | 'Pensiun' | 'Pindah'>('Aktif');

  // Error validations
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Helper stats
  const totalGuru = teachers.length;
  const totalPNS = teachers.filter(t => t.statusKepegawaian === 'PNS').length;
  const totalPPPK = teachers.filter(t => t.statusKepegawaian === 'PPPK').length;
  const totalHonorGTT = teachers.filter(t => t.statusKepegawaian === 'GTT' || t.statusKepegawaian === 'Honor').length;
  const totalLaki = teachers.filter(t => t.jenisKelamin === 'L').length;
  const totalPerempuan = teachers.filter(t => t.jenisKelamin === 'P').length;

  // Filter logic
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.nip.includes(searchQuery) ||
                          t.mataPelajaran.some(mp => mp.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesKepegawaian = filterKepegawaian === 'ALL' || t.statusKepegawaian === filterKepegawaian;
    const matchesStatus = filterStatus === 'ALL' || t.statusAktif === filterStatus;
    const matchesGender = filterGender === 'ALL' || t.jenisKelamin === filterGender;

    return matchesSearch && matchesKepegawaian && matchesStatus && matchesGender;
  });

  // Modal handlers
  const openAddModal = () => {
    setEditingTeacher(null);
    setFormNip('');
    setFormNama('');
    setFormJK('L');
    setFormMapel([]);
    setFormTelepon('');
    setFormEmail('');
    setFormKepegawaian('PNS');
    setFormStatus('Aktif');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormNip(teacher.nip);
    setFormNama(teacher.nama);
    setFormJK(teacher.jenisKelamin);
    setFormMapel(teacher.mataPelajaran);
    setFormTelepon(teacher.telepon);
    setFormEmail(teacher.email);
    setFormKepegawaian(teacher.statusKepegawaian);
    setFormStatus(teacher.statusAktif);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleToggleMapel = (mapelNama: string) => {
    if (formMapel.includes(mapelNama)) {
      setFormMapel(formMapel.filter(item => item !== mapelNama));
    } else {
      setFormMapel([...formMapel, mapelNama]);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formNama.trim()) errors.nama = 'Nama lengkap wajib diisi';
    if (!formNip.trim()) errors.nip = 'NIP wajib diisi (isi - jika tidak ada)';
    if (formMapel.length === 0) errors.mapel = 'Pilih minimal satu mata pelajaran';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const savedTeacher: Teacher = {
      id: editingTeacher ? editingTeacher.id : `guru-${Date.now()}`,
      nip: formNip.trim(),
      nama: formNama.trim(),
      jenisKelamin: formJK,
      mataPelajaran: formMapel,
      telepon: formTelepon.trim(),
      email: formEmail.trim(),
      statusKepegawaian: formKepegawaian,
      statusAktif: formStatus
    };

    onSaveTeacher(savedTeacher);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data Guru "${name}"?`)) {
      onDeleteTeacher(id);
    }
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    const data = filteredTeachers.map(t => ({
      'NIP': t.nip,
      'Nama Lengkap': t.nama,
      'Jenis Kelamin (L/P)': t.jenisKelamin,
      'Status Kepegawaian': t.statusKepegawaian,
      'Status Keaktifan': t.statusAktif,
      'Mata Pelajaran diampu': t.mataPelajaran.join(', '),
      'Telepon': t.telepon,
      'Email': t.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');
    
    // Auto-fit column widths
    const max_widths = [
      { wch: 22 }, // NIP
      { wch: 30 }, // Nama
      { wch: 10 }, // JK
      { wch: 15 }, // Status Kep
      { wch: 15 }, // Status Aktif
      { wch: 40 }, // Mapel
      { wch: 15 }, // Telepon
      { wch: 25 }, // Email
    ];
    worksheet['!cols'] = max_widths;

    XLSX.writeFile(workbook, `Buku_Induk_Guru_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Add Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            Data Guru (Pendidik)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola informasi guru mata pelajaran dan profil kepegawaian pendidik.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Guru</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:shadow-2xs transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Guru</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalGuru}</span>
            <span className="text-xs text-slate-500">orang</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:shadow-2xs transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PNS / PPPK</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalPNS + totalPPPK}</span>
            <span className="text-xs text-slate-500">Pendidik ASN</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:shadow-2xs transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GTT & Honor</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalHonorGTT}</span>
            <span className="text-xs text-slate-500">Non-ASN</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:shadow-2xs transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender (L/P)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalLaki}/{totalPerempuan}</span>
            <span className="text-xs text-slate-500">Laki/Perempuan</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-3xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Cari Guru berdasarkan nama, NIP, atau mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-hidden transition-all text-slate-800"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <div className="space-y-1">
              <select
                value={filterKepegawaian}
                onChange={(e) => setFilterKepegawaian(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 outline-hidden focus:border-slate-800"
              >
                <option value="ALL">Semua Kepegawaian</option>
                <option value="PNS">PNS (ASN)</option>
                <option value="PPPK">PPPK (ASN)</option>
                <option value="GTT">GTT (Guru Tidak Tetap)</option>
                <option value="Honor">Honor Sekolah</option>
              </select>
            </div>

            <div className="space-y-1">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 outline-hidden focus:border-slate-800"
              >
                <option value="ALL">Semua Keaktifan</option>
                <option value="Aktif">Aktif Mengajar</option>
                <option value="Cuti">Sedang Cuti</option>
                <option value="Pensiun">Pensiun</option>
                <option value="Pindah">Pindah Tugas</option>
              </select>
            </div>

            <div className="space-y-1">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 outline-hidden focus:border-slate-800"
              >
                <option value="ALL">Semua Gender</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-3xs overflow-hidden">
        {filteredTeachers.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Data Guru Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Nama & NIP</th>
                  <th className="px-6 py-3.5">Gender</th>
                  <th className="px-6 py-3.5">Kepegawaian</th>
                  <th className="px-6 py-3.5">Mata Pelajaran Diampu</th>
                  <th className="px-6 py-3.5">Kontak</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right no-print">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shrink-0 font-bold">
                          {teacher.nama.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{teacher.nama}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">NIP: {teacher.nip || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        teacher.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {teacher.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        teacher.statusKepegawaian === 'PNS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        teacher.statusKepegawaian === 'PPPK' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {teacher.statusKepegawaian}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 max-w-[240px]">
                      <div className="flex flex-wrap gap-1">
                        {teacher.mataPelajaran.map((mp, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm text-[10px] font-medium border border-slate-200/50">
                            {mp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{teacher.telepon || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{teacher.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        teacher.statusAktif === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        teacher.statusAktif === 'Cuti' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {teacher.statusAktif === 'Aktif' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {teacher.statusAktif}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(teacher)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-md border border-slate-200 transition-all cursor-pointer"
                          title="Ubah Data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(teacher.id, teacher.nama)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-md border border-rose-200 transition-all cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL: Add / Edit Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {editingTeacher ? 'Ubah Data Pendidik (Guru)' : 'Tambah Data Pendidik (Guru) Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
              {/* Nama Lengkap & NIP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap & Gelar *</label>
                  <input 
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Drs. Ahmad, M.Pd."
                    className={`w-full px-3 py-2 bg-slate-50 border ${formErrors.nama ? 'border-rose-400' : 'border-slate-200'} rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800`}
                  />
                  {formErrors.nama && <p className="text-[10px] text-rose-500 font-medium">{formErrors.nama}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NIP (Nomor Induk Pegawai) *</label>
                  <input 
                    type="text"
                    required
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="Isi '-' jika belum PNS/ASN"
                    className={`w-full px-3 py-2 bg-slate-50 border ${formErrors.nip ? 'border-rose-400' : 'border-slate-200'} rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800`}
                  />
                  {formErrors.nip && <p className="text-[10px] text-rose-500 font-medium">{formErrors.nip}</p>}
                </div>
              </div>

              {/* JK & Kepegawaian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jenis Kelamin</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                      <input 
                        type="radio" 
                        name="gender" 
                        checked={formJK === 'L'}
                        onChange={() => setFormJK('L')}
                        className="accent-slate-900"
                      />
                      <span>Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                      <input 
                        type="radio" 
                        name="gender" 
                        checked={formJK === 'P'}
                        onChange={() => setFormJK('P')}
                        className="accent-slate-900"
                      />
                      <span>Perempuan</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status Kepegawaian</label>
                  <select
                    value={formKepegawaian}
                    onChange={(e) => setFormKepegawaian(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK (Pemerintah Perjanjian Kerja)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="Honor">Honor Sekolah</option>
                  </select>
                </div>
              </div>

              {/* Telepon & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Telepon Kontak</label>
                  <input 
                    type="text"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    placeholder="Contoh: 081234567xxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Sekolah / Pribadi</label>
                  <input 
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Contoh: nama@smp.belajar.id"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>
              </div>

              {/* Status Aktif */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status Keaktifan Mengajar</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                >
                  <option value="Aktif">Aktif Mengajar</option>
                  <option value="Cuti">Sedang Cuti</option>
                  <option value="Pensiun">Pensiun</option>
                  <option value="Pindah">Pindah Tugas</option>
                </select>
              </div>

              {/* Mata Pelajaran Diampu */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mata Pelajaran diampu *</label>
                <div className="grid grid-cols-2 gap-2 border border-slate-200 p-3 rounded-lg max-h-[140px] overflow-y-auto bg-slate-50">
                  {LIST_MAPEL_DEFAULT.map(mapel => (
                    <label key={mapel.id} className="flex items-start gap-2 text-[11px] font-semibold text-slate-600 hover:text-slate-800 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={formMapel.includes(mapel.nama)}
                        onChange={() => handleToggleMapel(mapel.nama)}
                        className="mt-0.5 rounded-sm accent-slate-900 cursor-pointer"
                      />
                      <span>{mapel.nama}</span>
                    </label>
                  ))}
                </div>
                {formErrors.mapel && <p className="text-[10px] text-rose-500 font-medium">{formErrors.mapel}</p>}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4.5 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  {editingTeacher ? 'Simpan Perubahan' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
