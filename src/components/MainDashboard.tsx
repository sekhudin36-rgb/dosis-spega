/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Student, Teacher, Staff, SchoolSettings, LIST_MAPEL_DEFAULT } from '../types';
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  School, 
  UserPlus, 
  ArrowUpRight, 
  Settings, 
  Activity, 
  Award, 
  CheckCircle2, 
  Briefcase,
  Layers,
  ArrowLeftRight,
  ClipboardList
} from 'lucide-react';

interface MainDashboardProps {
  students: Student[];
  teachers: Teacher[];
  staffList: Staff[];
  settings: SchoolSettings;
  userRole?: 'admin' | 'guru';
  onNavigate: (tab: 'siswa' | 'guru' | 'staff' | 'promotion' | 'mutasi' | 'alumni' | 'settings') => void;
}

export default function MainDashboard({ students, teachers, staffList, settings, userRole = 'admin', onNavigate }: MainDashboardProps) {
  // States
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredScoreBar, setHoveredScoreBar] = useState<string | null>(null);

  // 1. Core KPIs
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.statusSiswa === 'Aktif').length;
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.statusAktif === 'Aktif').length;
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(s => s.statusAktif === 'Aktif').length;
  const totalEducators = totalTeachers + totalStaff;

  const graduatedCount = students.filter(s => s.statusSiswa === 'Lulus').length;
  const mutatedCount = students.filter(s => s.statusSiswa === 'Pindah').length;

  // 2. Class Distribution
  const classCounts: { [key: string]: number } = {};
  students.forEach(s => {
    if (s.statusSiswa === 'Aktif' && s.kelasSaatIni) {
      classCounts[s.kelasSaatIni] = (classCounts[s.kelasSaatIni] || 0) + 1;
    }
  });

  // Sort classes alphabetically
  const sortedClasses = Object.keys(classCounts).sort();
  const maxClassCount = Math.max(...Object.values(classCounts), 1);

  // 3. Gender Ratio (Active students only)
  const activeStudentsList = students.filter(s => s.statusSiswa === 'Aktif');
  const maleCount = activeStudentsList.filter(s => s.jenisKelamin === 'L').length;
  const femaleCount = activeStudentsList.filter(s => s.jenisKelamin === 'P').length;
  const activeTotal = activeStudentsList.length || 1;
  const malePercent = Math.round((maleCount / activeTotal) * 100);
  const femalePercent = Math.round((femaleCount / activeTotal) * 100);

  // 4. Academic Performance analysis
  // Get averages per subject
  const subjectAverages: { [key: string]: { sum: number; count: number } } = {};
  LIST_MAPEL_DEFAULT.forEach(m => {
    subjectAverages[m.id] = { sum: 0, count: 0 };
  });

  students.forEach(s => {
    Object.values(s.riwayatAkademik).forEach(record => {
      if (record.scores) {
        record.scores.forEach(score => {
          if (subjectAverages[score.mapelId]) {
            const avg = (score.nilaiPengetahuan + score.nilaiKeterampilan) / 2;
            if (avg > 0) {
              subjectAverages[score.mapelId].sum += avg;
              subjectAverages[score.mapelId].count += 1;
            }
          }
        });
      }
    });
  });

  const subjectData = LIST_MAPEL_DEFAULT.map(m => {
    const data = subjectAverages[m.id];
    const avg = data && data.count > 0 ? Math.round(data.sum / data.count) : 0;
    return {
      id: m.id,
      nama: m.nama,
      singkatan: m.id.toUpperCase().substring(0, 4),
      avg
    };
  });

  // Find overall GPA
  let totalScoreSum = 0;
  let totalSubjectsCount = 0;
  subjectData.forEach(d => {
    if (d.avg > 0) {
      totalScoreSum += d.avg;
      totalSubjectsCount += 1;
    }
  });
  const overallAvg = totalSubjectsCount > 0 ? (totalScoreSum / totalSubjectsCount).toFixed(1) : '80.0';

  // 5. Recent 5 Students added
  const recentStudents = [...students]
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-radial from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-750">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-purple-200 tracking-wider">
              <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>DASHBOARD ANALITIK AKADEMIK</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Selamat Datang di Portal Buku Induk</h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl font-medium">
              Sistem pengarsipan digital SMP Negeri Indonesia Jaya. Kelola biodata siswa, guru, rekapitulasi nilai rapor, hingga riwayat kependidikan dengan presisi tinggi.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('siswa')}
              className="px-4.5 py-2.5 bg-white text-slate-900 font-bold rounded-2xl text-xs hover:bg-slate-100 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Kelola Siswa</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => onNavigate('settings')}
                className="px-4.5 py-2.5 bg-white/10 text-white font-bold rounded-2xl text-xs hover:bg-white/15 transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-300" />
                <span>Pengaturan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Core Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Total Siswa */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Siswa Aktif</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-slate-800">{activeStudents}</h3>
              <span className="text-xs text-slate-400 font-medium">/ {totalStudents} terdaftar</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{graduatedCount} Alumni Lulus</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Pendidik & TK */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pendidik & Staff</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-slate-800">{totalEducators}</h3>
              <span className="text-xs text-slate-400 font-medium">aktif</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500 font-medium font-mono">
              <span className="text-blue-600">{activeTeachers} Guru</span>
              <span className="text-violet-600">{activeStaff} TU</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: GPA Averages */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Rata-rata Akademik</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-slate-800">{overallAvg}</h3>
              <span className="text-xs text-slate-400 font-medium">GPA</span>
            </div>
            <div className="flex items-center gap-1 mt-3 text-[11px] text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Evaluasi K-13 & Merdeka</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: School accreditation */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Rombongan Belajar</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-slate-800">{sortedClasses.length}</h3>
              <span className="text-xs text-slate-400 font-medium">Kelas</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-purple-600 font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>Aktif Rombel 7, 8, 9</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <School className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Graphical Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Student Class Distribution Bar Chart (8 Columns) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Distribusi Siswa per Kelas</span>
              </h4>
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-bold uppercase">Siswa Aktif</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">Peta kepadatan rombongan belajar (rombel) di SMP Negeri Indonesia Jaya.</p>

            {/* Simulated Horizontal Bar Chart */}
            <div className="space-y-4">
              {sortedClasses.length > 0 ? (
                sortedClasses.map(cls => {
                  const count = classCounts[cls];
                  const percent = Math.round((count / maxClassCount) * 100);
                  const isHovered = hoveredBar === cls;

                  return (
                    <div 
                      key={cls} 
                      className="group"
                      onMouseEnter={() => setHoveredBar(cls)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div className="flex items-center justify-between text-xs mb-1 font-medium text-slate-600">
                        <span className="font-bold text-slate-700 font-mono">Kelas {cls}</span>
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {count} Siswa
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative shadow-3xs cursor-pointer">
                        <div 
                          style={{ width: `${percent}%` }} 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            isHovered 
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600' 
                              : 'bg-gradient-to-r from-purple-400 to-purple-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">Tidak ada data siswa aktif yang terdaftar.</div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rata-rata kapasitas rombel ideal: <strong className="text-slate-600">32 siswa</strong></span>
            <button 
              onClick={() => onNavigate('siswa')}
              className="text-purple-600 hover:text-purple-800 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Kelola Rombel</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Gender & Status Analysis (5 Columns) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Analisis Komposisi Siswa</span>
            </h4>
            <p className="text-xs text-slate-400 mb-6">Visualisasi rasio jenis kelamin dan rangkuman status kependidikan saat ini.</p>

            {/* Gender Pie/Donut Visualization */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                  <span>Rasio Laki-Laki vs Perempuan</span>
                  <span className="font-mono">{malePercent}% : {femalePercent}%</span>
                </div>
                {/* Visual Bar representasi */}
                <div className="w-full bg-pink-100 h-4.5 rounded-full overflow-hidden flex shadow-3xs border border-slate-150">
                  <div 
                    style={{ width: `${malePercent}%` }} 
                    className="bg-gradient-to-r from-sky-400 to-sky-500 h-full flex items-center justify-center text-[10px] text-white font-extrabold font-mono transition-all"
                  >
                    {malePercent > 15 && `${malePercent}%`}
                  </div>
                  <div 
                    style={{ width: `${femalePercent}%` }} 
                    className="bg-gradient-to-r from-pink-400 to-pink-500 h-full flex items-center justify-center text-[10px] text-white font-extrabold font-mono transition-all"
                  >
                    {femalePercent > 15 && `${femalePercent}%`}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-sky-400" /> {maleCount} Laki-laki</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-pink-400" /> {femaleCount} Perempuan</span>
                </div>
              </div>

              {/* Status Breakdown Box */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Buku Induk (Total)</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs font-medium">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-3xs">
                    <span className="text-slate-400 text-[10px] block">Aktif Belajar</span>
                    <strong className="text-emerald-600 text-lg block mt-0.5">{activeStudents}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-3xs">
                    <span className="text-slate-400 text-[10px] block">Lulus / Alumni</span>
                    <strong className="text-slate-700 text-lg block mt-0.5">{graduatedCount}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-3xs">
                    <span className="text-slate-400 text-[10px] block">Mutasi Keluar</span>
                    <strong className="text-amber-600 text-lg block mt-0.5">{mutatedCount}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-3xs">
                    <span className="text-slate-400 text-[10px] block">Total Arsip</span>
                    <strong className="text-indigo-600 text-lg block mt-0.5">{totalStudents}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pemutakhiran terakhir: <strong className="text-slate-600">Real-time</strong></span>
            <button 
              onClick={() => onNavigate('alumni')}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Lihat Alumni</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Subject Grades Average Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Rata-Rata Nilai Akademik per Mata Pelajaran</span>
          </h4>
          <span className="text-[11px] font-medium text-slate-400">Akumulasi seluruh nilai rapor semester 1 s.d 6</span>
        </div>
        <p className="text-xs text-slate-400 mb-6">Peta pencapaian kompetensi mata pelajaran untuk mengidentifikasi kekuatan dan area bimbingan belajar khusus.</p>

        {/* Custom SVG Column Bar Chart with responsive layout */}
        <div className="h-64 flex items-end justify-between gap-2.5 pt-6 border-b border-slate-150 px-2 select-none">
          {subjectData.map(d => {
            const percent = d.avg; // Since scale is 0-100
            const isHovered = hoveredScoreBar === d.id;

            return (
              <div 
                key={d.id} 
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredScoreBar(d.id)}
                onMouseLeave={() => setHoveredScoreBar(null)}
              >
                {/* Value tooltip */}
                <div className={`absolute top-0 transform -translate-y-6 bg-slate-800 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-sm shadow-md transition-opacity duration-250 z-10 font-bold ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}>
                  {d.avg}
                </div>

                {/* Vertical Column Bar */}
                <div 
                  style={{ height: `${percent}%` }} 
                  className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 ${
                    isHovered 
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-md' 
                      : 'bg-gradient-to-t from-emerald-400/80 to-emerald-400/90'
                  }`}
                />
                
                {/* Labels */}
                <span className="text-[9px] font-bold text-slate-500 mt-2 font-mono" title={d.nama}>
                  {d.singkatan}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend of Subject Abbreviations */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 text-[10px] text-slate-500 bg-slate-50 rounded-2xl p-4 border border-slate-150">
          {subjectData.map(d => (
            <div key={d.id} className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 rounded-sm w-8 text-center">{d.singkatan}</span>
              <span className="truncate text-slate-600" title={d.nama}>{d.nama}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Bento Info & Recent Log Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Lembaga Box (7 Cols) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 lg:col-span-7 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
              <School className="w-4 h-4 text-purple-600" />
              <span>Profil Satuan Pendidikan</span>
            </h4>

            <div className="divide-y divide-slate-100 text-xs text-slate-600">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Nama Lembaga</span>
                <strong className="text-slate-800 font-bold">{settings.namaSekolah}</strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Nomor Pokok Sekolah Nasional (NPSN)</span>
                <strong className="text-slate-800 font-mono font-bold">{settings.npsn || '20501234'}</strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Kepala Sekolah</span>
                <div className="text-right">
                  <strong className="text-slate-800 block font-bold">{settings.kepalaSekolah}</strong>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">NIP. {settings.nipKepalaSekolah || '-'}</span>
                </div>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Alamat Lembaga</span>
                <strong className="text-slate-700 text-right font-medium max-w-[250px] truncate" title={settings.alamat}>
                  {settings.alamat}, Kec. {settings.kecamatan}
                </strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Kontak Sekolah</span>
                <span className="font-semibold text-slate-700">{settings.telepon || '-'} / {settings.email}</span>
              </div>
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button 
                onClick={() => onNavigate('settings')}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-150 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Profil Lembaga</span>
              </button>
            </div>
          )}
        </div>

        {/* Recent Added Students Log (5 Cols) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Siswa Baru Terdaftar</span>
            </h4>

            <div className="space-y-3">
              {recentStudents.length > 0 ? (
                recentStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs ${
                      s.jenisKelamin === 'L' 
                        ? 'bg-sky-50 text-sky-700 border border-sky-100' 
                        : 'bg-pink-50 text-pink-700 border border-pink-100'
                    }`}>
                      {s.namaLengkap.charAt(0)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-800 text-xs truncate" title={s.namaLengkap}>{s.namaLengkap}</h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                        <span>NIS: {s.nis}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-bold">Kls {s.kelasSaatIni}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      s.statusSiswa === 'Aktif' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : s.statusSiswa === 'Lulus'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {s.statusSiswa}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">Belum ada siswa terdaftar.</div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Menampilkan 5 pendaftaran terbaru</span>
            <button 
              onClick={() => onNavigate('siswa')}
              className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
            >
              Lihat Semua Siswa →
            </button>
          </div>
        </div>

      </div>

      {/* 6. Professional Quick Navigation Shortcuts */}
      <div className="space-y-3.5">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Pintas Akses Cepat</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <button 
            onClick={() => onNavigate('siswa')}
            className="p-4 bg-white hover:bg-purple-50/50 border border-slate-100 hover:border-purple-200 rounded-2xl shadow-3xs hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-purple-100">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 text-xs">Arsip Siswa</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Kelola data induk detail</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('guru')}
            className="p-4 bg-white hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-2xl shadow-3xs hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 text-xs">Data Pendidik</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Daftar guru & pengampu</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('promotion')}
            className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 rounded-2xl shadow-3xs hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 text-xs">Kenaikan Kelas</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Proses tahunan masal</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('mutasi')}
            className="p-4 bg-white hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 rounded-2xl shadow-3xs hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-100">
              <ArrowLeftRight className="w-4.5 h-4.5" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 text-xs">Mutasi Siswa</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Siswa pindah & masuk</p>
            </div>
          </button>

          {userRole === 'admin' && (
            <button 
              onClick={() => onNavigate('settings')}
              className="p-4 bg-white hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200 rounded-2xl shadow-3xs hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group cursor-pointer col-span-2 md:col-span-1"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-rose-100">
                <Settings className="w-4.5 h-4.5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-xs">Konfigurasi</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Tahun ajaran & profil</p>
              </div>
            </button>
          )}

        </div>
      </div>

    </div>
  );
}
