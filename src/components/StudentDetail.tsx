/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, LIST_MAPEL_DEFAULT } from '../types';
import { 
  ArrowLeft, 
  User, 
  Heart, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  BookOpen, 
  Printer, 
  Plus, 
  Edit, 
  UserCheck, 
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Award,
  AlertCircle,
  Clock,
  Briefcase,
  Camera
} from 'lucide-react';
import { exportStudentMasterBookPDF, exportStudentReportPDF } from '../utils/pdfUtils';

interface StudentDetailProps {
  student: Student;
  userRole?: 'admin' | 'guru';
  onBack: () => void;
  onEdit: () => void;
  onUpdateStudent: (updated: Student) => void;
  onOpenGradeEditor: (semesterId: string) => void;
}

export default function StudentDetail({
  student,
  userRole = 'admin',
  onBack,
  onEdit,
  onUpdateStudent,
  onOpenGradeEditor
}: StudentDetailProps) {
  const [activeTab, setActiveTab] = useState<'pribadi' | 'pendidikan' | 'keluarga' | 'akademik'>('pribadi');
  const [expandedSemester, setExpandedSemester] = useState<string | null>("1");

  // Handle Photo upload / drag-and-drop
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userRole !== 'admin') return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        onUpdateStudent({
          ...student,
          foto: base64
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSemester = (semId: string) => {
    if (expandedSemester === semId) {
      setExpandedSemester(null);
    } else {
      setExpandedSemester(semId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back navigation & Edit actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Print Master Book PDF */}
          <button 
            onClick={() => exportStudentMasterBookPDF(student)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Buku Induk (PDF)</span>
          </button>

          {/* Edit Student profile */}
          {userRole === 'admin' && (
            <button 
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Ubah Profil</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Student Photo & Profile Summary on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-xs">
            {/* Visual Photo Container with absolute overlay upload trigger */}
            <div className="relative w-36 h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm group">
              <img 
                src={student.foto} 
                alt={student.namaLengkap} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
              
              {/* Overlay upload camera icon */}
              {userRole === 'admin' && (
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer duration-300">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">Ganti Foto</span>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    onChange={handlePhotoChange} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-4 leading-tight">{student.namaLengkap}</h3>
            <p className="text-slate-400 text-xs font-semibold mt-1 font-mono">NIS {student.nis} • NISN {student.nisn}</p>

            <div className="flex items-center gap-1.5 mt-3">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                student.statusSiswa === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                student.statusSiswa === 'Lulus' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {student.statusSiswa}
              </span>
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 text-xs font-bold">
                Kelas {student.kelasSaatIni || '-'}
              </span>
            </div>

            {/* Quick side stats */}
            <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-left text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Tahun Masuk</span>
                <span className="font-bold text-slate-700 block mt-0.5">{student.tahunMasuk || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Jenis Kelamin</span>
                <span className="font-bold text-slate-700 block mt-0.5">{student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
            </div>
          </div>

          {/* Quick info list card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Kontak Penting</h4>
            
            <div className="flex items-start gap-3 text-xs">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block">Surel (Email)</span>
                <span className="font-semibold text-slate-700 block mt-0.5 break-all">{student.email || '-'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block">Telepon HP</span>
                <span className="font-semibold text-slate-700 block mt-0.5">{student.telepon || '-'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block">Alamat Tinggal</span>
                <span className="font-semibold text-slate-700 block mt-0.5 leading-relaxed">{student.alamat || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Student Profiling Tabs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            
            {/* Tabs Selector */}
            <div className="flex flex-wrap border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
              <button
                onClick={() => setActiveTab('pribadi')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pribadi' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                1. Diri & Kesehatan
              </button>
              <button
                onClick={() => setActiveTab('pendidikan')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pendidikan' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                2. Riwayat Pendidikan
              </button>
              <button
                onClick={() => setActiveTab('keluarga')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'keluarga' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                3. Orang Tua & Wali
              </button>
              <button
                onClick={() => setActiveTab('akademik')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'akademik' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                4. Nilai & Akademik ({Object.keys(student.riwayatAkademik).length} Sem)
              </button>
            </div>

            {/* Tab 1: Identitas Pribadi Content */}
            {activeTab === 'pribadi' && (
              <div className="p-6 space-y-6 animate-fade-in text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    A. Keterangan Tentang Diri Siswa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Nama Lengkap</span>
                      <p className="font-bold text-slate-800 text-sm">{student.namaLengkap || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Nama Panggilan</span>
                      <p className="font-semibold text-slate-800 text-sm">{student.namaPanggilan || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Jenis Kelamin</span>
                      <p className="font-semibold text-slate-800">{student.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</p>
                    </div>
                    <div className="space-y-1 font-mono">
                      <span className="text-slate-400 font-sans font-medium block">Nomor Induk Siswa (NIS)</span>
                      <p className="font-bold text-slate-800">{student.nis || '-'}</p>
                    </div>
                    <div className="space-y-1 font-mono">
                      <span className="text-slate-400 font-sans font-medium block">NISN</span>
                      <p className="font-bold text-slate-800">{student.nisn || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Tempat, Tanggal Lahir</span>
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{student.tempatLahir ? `${student.tempatLahir}, ${student.tanggalLahir}` : '-'}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Agama</span>
                      <p className="font-semibold text-slate-800">{student.agama || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Kewarganegaraan</span>
                      <p className="font-semibold text-slate-800">{student.kewarganegaraan || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Bahasa di Rumah</span>
                      <p className="font-semibold text-slate-800">{student.bahasaRumah || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Anak Ke</span>
                      <p className="font-semibold text-slate-800">{student.anakKe || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Jumlah Saudara (Kandung/Tiri/Angkat)</span>
                      <p className="font-semibold text-slate-800">
                        {student.jumlahSaudaraKandung || '0'} / {student.jumlahSaudaraTiri || '0'} / {student.jumlahSaudaraAngkat || '0'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Status Yatim Piatu</span>
                      <p className="font-semibold text-slate-800">{student.statusYatimPiatu || '-'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    B. Keterangan Tempat Tinggal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-slate-400 font-medium block">Alamat Tinggal</span>
                      <p className="font-semibold text-slate-800 leading-relaxed">{student.alamat || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Nomor Telepon</span>
                      <p className="font-semibold text-slate-800">{student.telepon || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Alamat Email</span>
                      <p className="font-semibold text-slate-800">{student.email || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Tinggal Dengan</span>
                      <p className="font-semibold text-slate-800">{student.tinggalDengan || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Jarak ke Sekolah</span>
                      <p className="font-semibold text-slate-800">{student.jarakSekolah ? `${student.jarakSekolah} Km` : '-'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    C. Keterangan Kesehatan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Golongan Darah</span>
                      <p className="font-bold text-slate-800">{student.golonganDarah || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Tinggi / Berat Badan</span>
                      <p className="font-semibold text-slate-800">
                        {student.tinggiBadan ? `${student.tinggiBadan} Cm` : '-'} / {student.beratBadan ? `${student.beratBadan} Kg` : '-'}
                      </p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-slate-400 font-medium block">Penyakit Pernah Diderita</span>
                      <p className="font-semibold text-slate-800">{student.penyakitDerita || '-'}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-slate-400 font-medium block">Kelainan Jasmani</span>
                      <p className="font-semibold text-slate-800">{student.kelainanJasmani || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Riwayat Pendidikan */}
            {activeTab === 'pendidikan' && (
              <div className="p-6 space-y-6 animate-fade-in text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    D. Keterangan Pendidikan Sebelumnya
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Lulusan Dari</span>
                      <p className="font-bold text-slate-800">{student.sttbLulusanDari || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Tanggal & No STTB (Ijazah)</span>
                      <p className="font-semibold text-slate-800">{student.sttbNo || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Lama Belajar</span>
                      <p className="font-semibold text-slate-800">{student.sttbLamaBelajar || '-'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    Siswa Pindahan (Jika Ada)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Asal Sekolah</span>
                      <p className="font-semibold text-slate-800">{student.pindahanDariSekolah || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Alasan Pindah</span>
                      <p className="font-semibold text-slate-800">{student.pindahanAlasan || '-'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    Diterima Di Sekolah Ini
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Tingkat</span>
                      <p className="font-bold text-slate-800">{student.diterimaTingkat || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Kelompok / Rombel</span>
                      <p className="font-bold text-slate-800">{student.diterimaKelompok || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Jurusan</span>
                      <p className="font-semibold text-slate-800">{student.diterimaJurusan || 'Umum'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Tanggal Diterima</span>
                      <p className="font-semibold text-slate-800">{student.diterimaTanggal || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Keluarga Content */}
            {activeTab === 'keluarga' && (
              <div className="p-6 space-y-6 animate-fade-in text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    E. Keterangan Tentang Ayah Kandung
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Nama Ayah</span>
                      <p className="font-bold text-slate-800">{student.namaAyah || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Tempat & Tahun Lahir</span>
                      <p className="font-semibold text-slate-800">
                        {student.ayahTempatLahir ? `${student.ayahTempatLahir}, ${student.ayahTanggalLahir || ''}` : student.ayahTanggalLahir || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Agama & Kewarganegaraan</span>
                      <p className="font-semibold text-slate-800">
                        {student.ayahAgama || 'Islam'} / {student.ayahKewarganegaraan || 'WNI'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Pendidikan Ayah</span>
                      <p className="font-semibold text-slate-800">{student.ayahPendidikan || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Pekerjaan Ayah</span>
                      <p className="font-semibold text-slate-800">{student.pekerjaanAyah || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Penghasilan per Bulan</span>
                      <p className="font-semibold text-slate-800">{student.ayahPenghasilan || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Status Hidup Ayah</span>
                      <p className="font-semibold text-slate-800">{student.ayahStatusHidup || 'Masih Hidup'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    F. Keterangan Tentang Ibu Kandung
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Nama Ibu</span>
                      <p className="font-bold text-slate-800">{student.namaIbu || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Tempat & Tahun Lahir</span>
                      <p className="font-semibold text-slate-800">
                        {student.ibuTempatLahir ? `${student.ibuTempatLahir}, ${student.ibuTanggalLahir || ''}` : student.ibuTanggalLahir || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Agama & Kewarganegaraan</span>
                      <p className="font-semibold text-slate-800">
                        {student.ibuAgama || 'Islam'} / {student.ibuKewarganegaraan || 'WNI'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Pendidikan Ibu</span>
                      <p className="font-semibold text-slate-800">{student.ibuPendidikan || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Pekerjaan Ibu</span>
                      <p className="font-semibold text-slate-800">{student.pekerjaanIbu || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Penghasilan per Bulan</span>
                      <p className="font-semibold text-slate-800">{student.ibuPenghasilan || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Status Hidup Ibu</span>
                      <p className="font-semibold text-slate-800">{student.ibuStatusHidup || 'Masih Hidup'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                      Kontak Orang Tua
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 font-medium block">No. Telepon Orang Tua</span>
                        <p className="font-semibold text-slate-800">{student.teleponOrangTua || '-'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Alamat Orang Tua</span>
                        <p className="font-semibold text-slate-800 leading-relaxed">{student.alamatOrangTua || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                      G. Keterangan Tentang Wali
                    </h4>
                    {student.waliNama ? (
                      <div className="space-y-2 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 font-medium block">Nama Wali</span>
                          <p className="font-bold text-slate-800">{student.waliNama}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Pekerjaan Wali</span>
                          <p className="font-semibold text-slate-800">{student.waliPekerjaan || '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Pendidikan Wali</span>
                          <p className="font-semibold text-slate-800">{student.waliPendidikan || '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Kontak/Alamat Wali</span>
                          <p className="font-semibold text-slate-800">{student.waliAlamatTelepon || '-'}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Siswa ini tidak didaftarkan memiliki wali (tinggal bersama orang tua kandung).</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    H. Kegemaran Siswa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-400 font-medium block">Kesenian</span>
                      <p className="font-semibold text-slate-800">{student.gemarKesenian || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Olahraga</span>
                      <p className="font-semibold text-slate-800">{student.gemarOlahraga || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Organisasi</span>
                      <p className="font-semibold text-slate-800">{student.gemarOrganisasi || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Lain-lain</span>
                      <p className="font-semibold text-slate-800">{student.gemarLainnya || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Riwayat Akademik Content */}
            {activeTab === 'akademik' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm">Transkrip Nilai Semester (1-6)</h4>
                  <div className="flex gap-2">
                    {userRole === 'admin' && (
                      <button 
                        onClick={() => onOpenGradeEditor("1")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kelola Semua Nilai</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Listing standard SMP Semesters 1 to 6 */}
                {["1", "2", "3", "4", "5", "6"].map((semKey) => {
                  const record = student.riwayatAkademik[semKey];
                  const isExpanded = expandedSemester === semKey;

                  return (
                    <div key={semKey} className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                      {/* Accordion Header */}
                      <div 
                        onClick={() => toggleSemester(semKey)}
                        className={`flex items-center justify-between p-4 cursor-pointer select-none transition-all ${
                          isExpanded ? 'bg-slate-50/80 border-b border-slate-100' : 'bg-white hover:bg-slate-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm ${
                            record ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {semKey}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-sm">
                              Semester {semKey} {semKey === "1" || semKey === "3" || semKey === "5" ? "(Ganjil)" : "(Genap)"}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {record ? `Kelas ${record.kelas} • T.A ${record.tahunAjaran}` : 'Data Nilai Belum Diisi'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          {record && (
                            <button 
                              onClick={() => exportStudentReportPDF(student, semKey)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-bold border border-sky-100 transition-all cursor-pointer"
                              title="Cetak Rapor PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Cetak Rapor</span>
                            </button>
                          )}
                          {userRole === 'admin' && (
                            <button 
                              onClick={() => onOpenGradeEditor(semKey)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                              title="Edit Nilai"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div onClick={() => toggleSemester(semKey)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-4 bg-white space-y-4 animate-fade-in text-xs">
                          {record ? (
                            <>
                              {/* Subject scores table */}
                              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 font-bold text-slate-700 border-b border-slate-100">
                                      <th className="p-2.5">Mata Pelajaran</th>
                                      <th className="p-2.5 text-center">Pengetahuan</th>
                                      <th className="p-2.5 text-center">Keterampilan</th>
                                      <th className="p-2.5 text-center">Rata-rata</th>
                                      <th className="p-2.5 text-center">Predikat</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {record.scores.map((score, i) => {
                                      const kog = score.nilaiPengetahuan || 0;
                                      const ket = score.nilaiKeterampilan || 0;
                                      const rtr = Math.round((kog + ket) / 2);
                                      let predikat = 'D';
                                      if (rtr >= 90) predikat = 'A';
                                      else if (rtr >= 80) predikat = 'B';
                                      else if (rtr >= 70) predikat = 'C';

                                      return (
                                        <tr key={i} className="hover:bg-slate-50/20">
                                          <td className="p-2.5 font-semibold text-slate-800">{score.namaMapel}</td>
                                          <td className="p-2.5 text-center font-medium font-mono">{kog}</td>
                                          <td className="p-2.5 text-center font-medium font-mono">{ket}</td>
                                          <td className="p-2.5 text-center font-bold text-slate-700 font-mono">{rtr}</td>
                                          <td className="p-2.5 text-center">
                                            <span className={`px-1.5 py-0.5 rounded-sm font-bold font-mono text-[10px] ${
                                              predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                                              predikat === 'B' ? 'bg-sky-100 text-sky-800' :
                                              predikat === 'C' ? 'bg-amber-100 text-amber-800' :
                                              'bg-rose-100 text-rose-800'
                                            }`}>
                                              {predikat}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Bottom row layout: Extracurricular and Attendance summaries */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Extracurricular activities block */}
                                <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/30">
                                  <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-indigo-500" />
                                    <span>Ekstrakurikuler</span>
                                  </h5>
                                  {record.ekstrakurikuler.length === 0 ? (
                                    <p className="text-slate-400 italic">Tidak ada kegiatan ekstra yang terdaftar.</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {record.ekstrakurikuler.map((item, idx) => (
                                        <div key={idx} className="bg-white p-2 rounded border border-slate-100">
                                          <div className="flex justify-between items-center font-bold">
                                            <span className="text-slate-800">{item.kegiatan}</span>
                                            <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">Nilai: {item.nilai}</span>
                                          </div>
                                          <p className="text-slate-400 text-[10px] mt-1 leading-normal">{item.keterangan || '-'}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Attendance block */}
                                <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/30">
                                  <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    <span>Kehadiran (Absensi)</span>
                                  </h5>
                                  <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-white p-2 rounded border border-slate-100">
                                      <span className="text-slate-400 text-[10px] block">Sakit (S)</span>
                                      <span className="text-sm font-bold text-slate-800 font-mono">{record.absensi.sakit}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-slate-100">
                                      <span className="text-slate-400 text-[10px] block">Izin (I)</span>
                                      <span className="text-sm font-bold text-slate-800 font-mono">{record.absensi.izin}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-slate-100">
                                      <span className="text-slate-400 text-[10px] block">Alpa (A)</span>
                                      <span className="text-sm font-bold text-slate-800 font-mono">{record.absensi.alpa}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Teacher Notes */}
                              <div className="border border-slate-100 rounded-lg p-3 bg-indigo-50/20">
                                <h5 className="font-bold text-indigo-800 mb-1 flex items-center gap-1.5">
                                  <BookOpen className="w-4 h-4" />
                                  <span>Catatan Wali Kelas</span>
                                </h5>
                                <p className="text-slate-600 italic leading-relaxed">
                                  "{record.catatanWali || 'Siswa mempertahankan prestasi akademik yang sangat membanggakan. Teruskan motivasi belajarmu.'}"
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 bg-slate-50/30 rounded-lg">
                              <AlertCircle className="w-8 h-8 text-slate-300 mb-1.5" />
                              <p className="font-semibold text-xs text-slate-500">Nilai Semester Belum Diinput</p>
                              {userRole === 'admin' && (
                                <>
                                  <p className="text-[10px] text-slate-400 max-w-xs mt-0.5 mb-3.5">
                                    Masukkan riwayat akademik semester ini untuk dapat mencetak lembar rapor PDF secara otomatis.
                                  </p>
                                  <button 
                                    onClick={() => onOpenGradeEditor(semKey)}
                                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Input Nilai Sekarang
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
