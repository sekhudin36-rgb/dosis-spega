/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { exportStudentMasterBookPDF } from '../utils/pdfUtils';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Award, 
  TrendingUp, 
  Building, 
  Edit2, 
  Save, 
  X,
  FileText,
  PieChart,
  CheckCircle2,
  Calendar,
  Eye,
  Printer,
  Trash2
} from 'lucide-react';

interface AlumniManagementProps {
  students: Student[];
  userRole?: 'admin' | 'guru';
  onSaveStudent: (student: Student) => void;
  onDeleteStudent?: (id: string) => void;
  onViewStudent?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
}

export default function AlumniManagement({
  students,
  userRole = 'admin',
  onSaveStudent,
  onDeleteStudent,
  onViewStudent,
  onEditStudent
}: AlumniManagementProps) {
  // Filter for Lulus students only
  const alumni = useMemo(() => {
    return students.filter(s => s.statusSiswa === 'Lulus');
  }, [students]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('Semua');
  const [selectedDestination, setSelectedDestination] = useState('Semua');

  // Edit State
  const [editingAlumni, setEditingAlumni] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState({
    tanggalLulus: '',
    alumniLanjutKe: '',
    alumniCatatan: ''
  });

  // Success message
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Extract unique years of graduation
  const graduationYears = useMemo(() => {
    const years = alumni
      .map(s => {
        if (s.tanggalLulus) {
          return s.tanggalLulus.substring(0, 4);
        }
        return s.tahunMasuk ? (parseInt(s.tahunMasuk) + 3).toString() : null;
      })
      .filter(Boolean) as string[];
    return ['Semua', ...Array.from(new Set(years))].sort((a, b) => b.localeCompare(a));
  }, [alumni]);

  // Extract unique continuing destinations (Sektor Lanjutan)
  const popularDestinations = useMemo(() => {
    const list = alumni
      .map(s => s.alumniLanjutKe?.trim())
      .filter(Boolean) as string[];
    
    // Count frequencies
    const counts: Record<string, number> = {};
    list.forEach(dest => {
      counts[dest] = (counts[dest] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [alumni]);

  // Filtered Alumni list
  const filteredAlumni = useMemo(() => {
    return alumni.filter(s => {
      // 1. Search Query
      const query = searchTerm.toLowerCase();
      const matchSearch = 
        s.namaLengkap.toLowerCase().includes(query) ||
        s.nis.includes(query) ||
        s.nisn.includes(query) ||
        (s.alumniLanjutKe || '').toLowerCase().includes(query);

      // 2. Year Filter
      const studentYear = s.tanggalLulus 
        ? s.tanggalLulus.substring(0, 4) 
        : s.tahunMasuk ? (parseInt(s.tahunMasuk) + 3).toString() : '';
      const matchYear = selectedYear === 'Semua' || studentYear === selectedYear;

      // 3. Destination Filter
      const matchDest = selectedDestination === 'Semua' || 
        (selectedDestination === 'Sudah Melacak' && s.alumniLanjutKe) ||
        (selectedDestination === 'Belum Melacak' && !s.alumniLanjutKe);

      return matchSearch && matchYear && matchDest;
    });
  }, [alumni, searchTerm, selectedYear, selectedDestination]);

  // Statistics for top cards
  const stats = useMemo(() => {
    const total = alumni.length;
    const tracked = alumni.filter(s => s.alumniLanjutKe && s.alumniLanjutKe.trim() !== '').length;
    const untracked = total - tracked;
    const percentTracked = total > 0 ? Math.round((tracked / total) * 100) : 0;

    // Count SMAs vs SMKs
    let countSMA = 0;
    let countSMK = 0;
    let countMAN = 0;
    let countOthers = 0;

    alumni.forEach(s => {
      const dest = (s.alumniLanjutKe || '').toUpperCase();
      if (!dest) return;
      if (dest.includes('SMA')) countSMA++;
      else if (dest.includes('SMK')) countSMK++;
      else if (dest.includes('MA') || dest.includes('MAN')) countMAN++;
      else countOthers++;
    });

    return { total, tracked, untracked, percentTracked, countSMA, countSMK, countMAN, countOthers };
  }, [alumni]);

  const handleOpenEdit = (student: Student) => {
    setEditingAlumni(student);
    setEditFormData({
      tanggalLulus: student.tanggalLulus || new Date().toISOString().split('T')[0],
      alumniLanjutKe: student.alumniLanjutKe || '',
      alumniCatatan: student.alumniCatatan || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlumni) return;

    const updated: Student = {
      ...editingAlumni,
      tanggalLulus: editFormData.tanggalLulus,
      alumniLanjutKe: editFormData.alumniLanjutKe,
      alumniCatatan: editFormData.alumniCatatan
    };

    onSaveStudent(updated);
    setSuccessMsg(`Data penelusuran alumni ${editingAlumni.namaLengkap} berhasil diperbarui!`);
    setEditingAlumni(null);
    
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800">Direktori Alumni & Penelusuran (Tracing)</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Lacak data kelulusan siswa dan instansi kelanjutan sekolah (SMA/SMK/MA) untuk penjaminan mutu mutu sekolah.
            </p>
          </div>
        </div>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 text-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Pembaruan Berhasil</span>
            <p className="mt-0.5 leading-relaxed">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Alumni</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5 font-mono">{stats.total} <span className="text-xs font-normal text-slate-400">siswa</span></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sudah Dilacak</span>
            <span className="text-xl font-black text-emerald-700 block mt-0.5 font-mono">
              {stats.tracked} 
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded ml-2 font-sans">
                {stats.percentTracked}%
              </span>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Melanjutkan SMA/SMK</span>
            <span className="text-xs font-bold text-slate-700 block mt-0.5 leading-relaxed">
              SMA: <strong className="font-mono text-slate-800">{stats.countSMA}</strong> • 
              SMK: <strong className="font-mono text-slate-800">{stats.countSMK}</strong> • 
              MA: <strong className="font-mono text-slate-800">{stats.countMAN}</strong>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <X className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Belum Dilacak (Unresolved)</span>
            <span className="text-xl font-black text-slate-500 block mt-0.5 font-mono">{stats.untracked} <span className="text-xs font-normal text-slate-400">siswa</span></span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Quick Destination Stats & Filters */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Filters Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter Data Alumni</span>
            </h3>

            {/* Filter 1: Angkatan / Tahun Lulus */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Kelulusan</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-700"
              >
                {graduationYears.map(yr => (
                  <option key={yr} value={yr}>{yr === 'Semua' ? 'Semua Tahun' : `Lulusan ${yr}`}</option>
                ))}
              </select>
            </div>

            {/* Filter 2: Status Tracing */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Penelusuran</label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-700"
              >
                <option value="Semua">Semua Status</option>
                <option value="Sudah Melacak">Sudah Melacak Sekolah Lanjutan</option>
                <option value="Belum Melacak">Belum Dilacak</option>
              </select>
            </div>
          </div>

          {/* Popular Destination Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <PieChart className="w-4 h-4 text-slate-400" />
              <span>Sekolah Favorit Lanjutan</span>
            </h3>

            {popularDestinations.length === 0 ? (
              <p className="text-slate-400 italic text-[11px] text-center py-4">Belum ada data lanjutan sekolah yang dicatat.</p>
            ) : (
              <div className="space-y-2">
                {popularDestinations.slice(0, 5).map((dest, idx) => {
                  const pct = Math.round((dest.count / stats.tracked) * 100);
                  return (
                    <div key={dest.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700 truncate max-w-[130px]">{idx + 1}. {dest.name}</span>
                        <span className="text-slate-500 font-mono text-[10px]">{dest.count} Siswa ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Alumni Table */}
        <div className="lg:col-span-3 space-y-5">
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
            
            {/* Table Search Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daftar Induk Alumni ({filteredAlumni.length} Siswa)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Menampilkan seluruh siswa dengan status lulus terdaftar di buku induk.</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS atau SMA/SMK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredAlumni.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-500 text-xs">Tidak Ada Data Alumni Cocok</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sesuaikan filter atau kata kunci pencarian Anda.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 font-bold text-slate-700 border-b border-slate-100">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4">Identitas Alumni</th>
                      <th className="p-4 text-center">Tahun Masuk / Lulus</th>
                      <th className="p-4">Meneruskan Ke (Sekolah Lanjutan)</th>
                      <th className="p-4">Catatan Penelusuran</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredAlumni.map((student, idx) => {
                      const yrLulus = student.tanggalLulus 
                        ? student.tanggalLulus.substring(0, 4) 
                        : student.tahunMasuk ? (parseInt(student.tahunMasuk) + 3).toString() : '-';

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/10">
                          <td className="p-4 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={student.foto} 
                                alt="" 
                                className="w-7 h-7 rounded-md object-cover bg-slate-100 shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{student.namaLengkap}</span>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">NIS: {student.nis} • NISN: {student.nisn}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-semibold text-slate-700 font-mono">
                              {student.tahunMasuk} / {yrLulus}
                            </span>
                          </td>
                          <td className="p-4">
                            {student.alumniLanjutKe ? (
                              <div className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="font-bold text-slate-800">{student.alumniLanjutKe}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                                Belum Terlacak
                              </span>
                            )}
                          </td>
                          <td className="p-4 max-w-xs truncate text-slate-500 italic">
                            {student.alumniCatatan || '-'}
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
                                    onClick={() => handleOpenEdit(student)}
                                    className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                                    title="Lacak Kelanjutan Sekolah"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Apakah Anda yakin ingin menghapus data alumni ${student.namaLengkap}?`)) {
                                        onDeleteStudent && onDeleteStudent(student.id);
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
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* EDIT MODAL DIALOG */}
      {editingAlumni && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleSaveEdit} 
            className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-lg p-6 space-y-5 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-indigo-500" />
                <span>Input Penelusuran Alumni</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingAlumni(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Alumni header summary */}
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/40">
                <h4 className="font-extrabold text-slate-800">{editingAlumni.namaLengkap}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">NIS: {editingAlumni.nis} • Tahun Masuk: {editingAlumni.tahunMasuk}</p>
              </div>

              {/* Input: Tanggal Kelulusan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal Kelulusan / Ijazah</span>
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.tanggalLulus}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, tanggalLulus: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Input: Lanjut Sekolah Ke */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Meneruskan Ke (Nama SMA/SMK/MA) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMAN 1 Semarang, SMKN 2, dll"
                  value={editFormData.alumniLanjutKe}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, alumniLanjutKe: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-bold text-slate-700"
                />
              </div>

              {/* Input: Catatan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Catatan Khusus (Jurusan, Jalur Masuk, dll)</span>
                </label>
                <textarea
                  placeholder="Contoh: Diterima di jurusan RPL melalui jalur prestasi sepak bola."
                  rows={3}
                  value={editFormData.alumniCatatan}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, alumniCatatan: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingAlumni(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Tracing</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
