/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Staff } from '../types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  X,
  FileSpreadsheet,
  BriefcaseBusiness
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StaffManagementProps {
  staffList: Staff[];
  onSaveStaff: (staff: Staff) => void;
  onDeleteStaff: (id: string) => void;
}

export default function StaffManagement({ staffList, onSaveStaff, onDeleteStaff }: StaffManagementProps) {
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKepegawaian, setFilterKepegawaian] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterGender, setFilterGender] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form Field States
  const [formNuptk, setFormNuptk] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formJK, setFormJK] = useState<'L' | 'P'>('L');
  const [formJabatan, setFormJabatan] = useState('');
  const [formTelepon, setFormTelepon] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formKepegawaian, setFormKepegawaian] = useState<'PNS' | 'PPPK' | 'PTT' | 'Honor'>('PTT');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Cuti' | 'Pensiun' | 'Pindah'>('Aktif');

  // Error validations
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Helper stats
  const totalStaff = staffList.length;
  const totalASN = staffList.filter(s => s.statusKepegawaian === 'PNS' || s.statusKepegawaian === 'PPPK').length;
  const totalHonorPTT = staffList.filter(s => s.statusKepegawaian === 'PTT' || s.statusKepegawaian === 'Honor').length;
  const totalLaki = staffList.filter(s => s.jenisKelamin === 'L').length;
  const totalPerempuan = staffList.filter(s => s.jenisKelamin === 'P').length;

  // List of typical administrative roles for quick-select help
  const JABATAN_SUGGESTIONS = [
    'Kepala Tata Usaha',
    'Bendahara Sekolah',
    'Bendahara BOS',
    'Staf Tata Usaha',
    'Pustakawan / Kepala Perpustakaan',
    'Laboran IPA / Komputer',
    'Penjaga Sekolah / Keamanan',
    'Petugas Kebersihan'
  ];

  // Filter logic
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nuptk.includes(searchQuery) ||
                          s.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesKepegawaian = filterKepegawaian === 'ALL' || s.statusKepegawaian === filterKepegawaian;
    const matchesStatus = filterStatus === 'ALL' || s.statusAktif === filterStatus;
    const matchesGender = filterGender === 'ALL' || s.jenisKelamin === filterGender;

    return matchesSearch && matchesKepegawaian && matchesStatus && matchesGender;
  });

  // Modal handlers
  const openAddModal = () => {
    setEditingStaff(null);
    setFormNuptk('');
    setFormNama('');
    setFormJK('L');
    setFormJabatan('');
    setFormTelepon('');
    setFormEmail('');
    setFormKepegawaian('PTT');
    setFormStatus('Aktif');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormNuptk(staff.nuptk);
    setFormNama(staff.nama);
    setFormJK(staff.jenisKelamin);
    setFormJabatan(staff.jabatan);
    setFormTelepon(staff.telepon);
    setFormEmail(staff.email);
    setFormKepegawaian(staff.statusKepegawaian);
    setFormStatus(staff.statusAktif);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formNama.trim()) errors.nama = 'Nama lengkap wajib diisi';
    if (!formNuptk.trim()) errors.nuptk = 'NUPTK / ID wajib diisi (isi - jika tidak ada)';
    if (!formJabatan.trim()) errors.jabatan = 'Jabatan / Tugas wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const savedStaff: Staff = {
      id: editingStaff ? editingStaff.id : `staff-${Date.now()}`,
      nuptk: formNuptk.trim(),
      nama: formNama.trim(),
      jenisKelamin: formJK,
      jabatan: formJabatan.trim(),
      telepon: formTelepon.trim(),
      email: formEmail.trim(),
      statusKepegawaian: formKepegawaian,
      statusAktif: formStatus
    };

    onSaveStaff(savedStaff);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data Tenaga Kependidikan "${name}"?`)) {
      onDeleteStaff(id);
    }
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    const data = filteredStaff.map(s => ({
      'NUPTK / ID Pegawai': s.nuptk,
      'Nama Lengkap': s.nama,
      'Jenis Kelamin (L/P)': s.jenisKelamin,
      'Jabatan': s.jabatan,
      'Status Kepegawaian': s.statusKepegawaian,
      'Status Keaktifan': s.statusAktif,
      'Telepon': s.telepon,
      'Email': s.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Tendik');
    
    // Auto-fit column widths
    const max_widths = [
      { wch: 22 }, // NUPTK
      { wch: 30 }, // Nama
      { wch: 10 }, // JK
      { wch: 25 }, // Jabatan
      { wch: 15 }, // Status Kep
      { wch: 15 }, // Status Aktif
      { wch: 15 }, // Telepon
      { wch: 25 }, // Email
    ];
    worksheet['!cols'] = max_widths;

    XLSX.writeFile(workbook, `Buku_Induk_Tenaga_Kependidikan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Add Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <BriefcaseBusiness className="w-5 h-5 text-slate-700" />
            Data Tenaga Kependidikan (Tendik)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola informasi tenaga kependidikan, tata usaha, perpustakaan, keamanan, dan staf sekolah.</p>
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
            <span>Tambah Data Tendik</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:shadow-2xs transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tendik</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalStaff}</span>
            <span className="text-xs text-slate-500">orang</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:shadow-2xs transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ASN (PNS/PPPK)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalASN}</span>
            <span className="text-xs text-slate-500">Tendik ASN</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:shadow-2xs transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Honorer & PTT</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalHonorPTT}</span>
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
              placeholder="Cari berdasarkan nama, NUPTK, jabatan, atau tugas..."
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
                <option value="PTT">PTT (Pegawai Tidak Tetap)</option>
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
                <option value="Aktif">Aktif</option>
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
        {filteredStaff.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Data Staf Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Nama & NUPTK</th>
                  <th className="px-6 py-3.5">Gender</th>
                  <th className="px-6 py-3.5">Jabatan / Tugas</th>
                  <th className="px-6 py-3.5">Kepegawaian</th>
                  <th className="px-6 py-3.5">Kontak</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right no-print">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shrink-0 font-bold">
                          {staff.nama.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{staff.nama}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">NUPTK/ID: {staff.nuptk || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        staff.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {staff.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{staff.jabatan}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        staff.statusKepegawaian === 'PNS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        staff.statusKepegawaian === 'PPPK' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {staff.statusKepegawaian}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{staff.telepon || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{staff.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        staff.statusAktif === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        staff.statusAktif === 'Cuti' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {staff.statusAktif === 'Aktif' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {staff.statusAktif}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(staff)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-md border border-slate-200 transition-all cursor-pointer"
                          title="Ubah Data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(staff.id, staff.nama)}
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

      {/* POPUP MODAL: Add / Edit Staff */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {editingStaff ? 'Ubah Data Tenaga Kependidikan' : 'Tambah Data Tenaga Kependidikan Baru'}
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
              {/* Nama Lengkap & NUPTK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap & Gelar *</label>
                  <input 
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Endang Lestari, S.Sos."
                    className={`w-full px-3 py-2 bg-slate-50 border ${formErrors.nama ? 'border-rose-400' : 'border-slate-200'} rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800`}
                  />
                  {formErrors.nama && <p className="text-[10px] text-rose-500 font-medium">{formErrors.nama}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NUPTK / ID Pegawai *</label>
                  <input 
                    type="text"
                    required
                    value={formNuptk}
                    onChange={(e) => setFormNuptk(e.target.value)}
                    placeholder="Isi '-' jika tidak ada NUPTK"
                    className={`w-full px-3 py-2 bg-slate-50 border ${formErrors.nuptk ? 'border-rose-400' : 'border-slate-200'} rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800`}
                  />
                  {formErrors.nuptk && <p className="text-[10px] text-rose-500 font-medium">{formErrors.nuptk}</p>}
                </div>
              </div>

              {/* Jabatan / Tugas dan Quick-Select */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jabatan / Tugas *</label>
                  <input 
                    type="text"
                    required
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    placeholder="Contoh: Kepala Tata Usaha, Bendahara BOS, Pustakawan"
                    className={`w-full px-3 py-2 bg-slate-50 border ${formErrors.jabatan ? 'border-rose-400' : 'border-slate-200'} rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800`}
                  />
                  {formErrors.jabatan && <p className="text-[10px] text-rose-500 font-medium">{formErrors.jabatan}</p>}
                </div>
                {/* Suggestions chips */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rekomendasi Jabatan Cepat:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {JABATAN_SUGGESTIONS.map((jab, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormJabatan(jab)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm text-[10px] font-medium border border-slate-200 transition-colors cursor-pointer"
                      >
                        {jab}
                      </button>
                    ))}
                  </div>
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
                    <option value="PTT">PTT (Pegawai Tidak Tetap)</option>
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK (Pemerintah Perjanjian Kerja)</option>
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
                    placeholder="Contoh: 081234568xxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email</label>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status Keaktifan Kerja</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-slate-800 text-slate-800"
                >
                  <option value="Aktif">Aktif Bekerja</option>
                  <option value="Cuti">Sedang Cuti</option>
                  <option value="Pensiun">Pensiun</option>
                  <option value="Pindah">Pindah Tugas</option>
                </select>
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
                  {editingStaff ? 'Simpan Perubahan' : 'Tambah Tendik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
