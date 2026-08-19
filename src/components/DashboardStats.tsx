/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from '../types';
import { Users, UserCheck, GraduationCap, ArrowUpRight, TrendingUp, UserMinus } from 'lucide-react';

interface DashboardStatsProps {
  students: Student[];
}

export default function DashboardStats({ students }: DashboardStatsProps) {
  const total = students.length;
  const activeCount = students.filter(s => s.statusSiswa === 'Aktif').length;
  const maleCount = students.filter(s => s.jenisKelamin === 'L').length;
  const femaleCount = students.filter(s => s.jenisKelamin === 'P').length;
  const graduatedCount = students.filter(s => s.statusSiswa === 'Lulus').length;
  const leftCount = students.filter(s => s.statusSiswa === 'Pindah' || s.statusSiswa === 'Keluar').length;

  // Extract all unique classes
  const classes = Array.from(new Set(students.map(s => s.kelasSaatIni).filter(Boolean)));
  const totalClasses = classes.length || 0;

  // Calculate Average Academic Score
  let totalScoreSum = 0;
  let totalSubjectsCount = 0;
  students.forEach(s => {
    Object.values(s.riwayatAkademik).forEach(sem => {
      sem.scores.forEach(score => {
        const avg = (score.nilaiPengetahuan + score.nilaiKeterampilan) / 2;
        if (avg > 0) {
          totalScoreSum += avg;
          totalSubjectsCount += 1;
        }
      });
    });
  });
  const avgAcademicScore = totalSubjectsCount > 0 ? (totalScoreSum / totalSubjectsCount).toFixed(1) : '0';

  // Calculate percentages
  const malePercent = total > 0 ? Math.round((maleCount / total) * 100) : 0;
  const femalePercent = total > 0 ? Math.round((femaleCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Metric Card 1: Total Student */}
      <div id="stat-total" className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <span className="text-sm font-medium text-slate-500">Total Siswa Terdaftar</span>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{total}</h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-sky-600 font-medium">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{activeCount} Siswa Aktif</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Metric Card 2: Average Score */}
      <div id="stat-avg-score" className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <span className="text-sm font-medium text-slate-500">Rata-rata Nilai Akademik</span>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{avgAcademicScore}</h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Skala Penilaian 0-100</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <ArrowUpRight className="w-6 h-6" />
        </div>
      </div>

      {/* Metric Card 3: Class statistics */}
      <div id="stat-classes" className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <span className="text-sm font-medium text-slate-500">Rombongan Belajar (Kelas)</span>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalClasses}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium overflow-hidden whitespace-nowrap text-ellipsis max-w-[170px]">
            {classes.slice(0, 3).map((cls, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded-sm text-slate-600 font-mono text-[10px]">
                {cls}
              </span>
            ))}
            {classes.length > 3 && <span className="text-slate-400">+{classes.length - 3}</span>}
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
          <GraduationCap className="w-6 h-6" />
        </div>
      </div>

      {/* Metric Card 4: Gender Balance */}
      <div id="stat-gender" className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-medium text-slate-500">Rasio Jenis Kelamin</span>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-medium">{malePercent}% L</span>
            <span className="text-xs bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded font-mono font-medium">{femalePercent}% P</span>
          </div>
        </div>
        
        {/* Progress Bar representation */}
        <div className="w-full bg-pink-200 rounded-full h-3 overflow-hidden flex">
          <div style={{ width: `${malePercent}%` }} className="bg-sky-500 h-full transition-all duration-500" />
          <div style={{ width: `${femalePercent}%` }} className="bg-pink-500 h-full transition-all duration-500" />
        </div>
        
        <div className="flex justify-between items-center mt-2.5 text-[11px] text-slate-400">
          <span>{maleCount} Laki-laki</span>
          <span>{femaleCount} Perempuan</span>
        </div>
      </div>
    </div>
  );
}
