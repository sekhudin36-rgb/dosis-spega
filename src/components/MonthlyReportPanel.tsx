/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student, Teacher, Staff, SchoolSettings } from '../types';
import { 
  BarChart3, 
  Printer, 
  FileSpreadsheet, 
  Download, 
  Users, 
  GraduationCap, 
  Building2, 
  Calendar, 
  Compass, 
  HeartHandshake, 
  Briefcase, 
  PieChart,
  CheckCircle2,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface MonthlyReportPanelProps {
  students: Student[];
  teachers: Teacher[];
  staffList: Staff[];
  settings: SchoolSettings;
  userRole?: 'admin' | 'guru';
}

export default function MonthlyReportPanel({
  students,
  teachers,
  staffList,
  settings,
  userRole = 'admin'
}: MonthlyReportPanelProps) {
  // Current active month & year
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Semua');

  // Filter students
  const activeStudents = useMemo(() => {
    return students.filter(s => s.statusSiswa === 'Aktif');
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (selectedClassFilter === 'Semua') return activeStudents;
    return activeStudents.filter(s => s.kelasSaatIni === selectedClassFilter);
  }, [activeStudents, selectedClassFilter]);

  // Distinct classes
  const classesList = useMemo(() => {
    const list: string[] = Array.from(new Set(activeStudents.map(s => s.kelasSaatIni))).filter(Boolean) as string[];
    return list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [activeStudents]);

  // 1. Rombel distribution (Standar F-1 Dinas)
  const classBreakdown = useMemo(() => {
    return classesList.map(cls => {
      const clsStudents = activeStudents.filter(s => s.kelasSaatIni === cls);
      const male = clsStudents.filter(s => s.jenisKelamin === 'L').length;
      const female = clsStudents.filter(s => s.jenisKelamin === 'P').length;
      const islam = clsStudents.filter(s => (s.agama || '').toLowerCase().includes('islam')).length;
      const kristen = clsStudents.filter(s => (s.agama || '').toLowerCase().includes('kristen')).length;
      const katolik = clsStudents.filter(s => (s.agama || '').toLowerCase().includes('katolik')).length;
      const hindu = clsStudents.filter(s => (s.agama || '').toLowerCase().includes('hindu')).length;
      const buddha = clsStudents.filter(s => (s.agama || '').toLowerCase().includes('buddha')).length;
      const lainnya = clsStudents.length - (islam + kristen + katolik + hindu + buddha);

      return {
        kelas: cls,
        male,
        female,
        total: clsStudents.length,
        islam,
        kristen,
        katolik,
        hindu,
        buddha,
        lainnya: lainnya > 0 ? lainnya : 0
      };
    });
  }, [classesList, activeStudents]);

  // Overall totals
  const totalMale = useMemo(() => activeStudents.filter(s => s.jenisKelamin === 'L').length, [activeStudents]);
  const totalFemale = useMemo(() => activeStudents.filter(s => s.jenisKelamin === 'P').length, [activeStudents]);
  const totalIslam = useMemo(() => activeStudents.filter(s => (s.agama || '').toLowerCase().includes('islam')).length, [activeStudents]);
  const totalKristen = useMemo(() => activeStudents.filter(s => (s.agama || '').toLowerCase().includes('kristen')).length, [activeStudents]);
  const totalKatolik = useMemo(() => activeStudents.filter(s => (s.agama || '').toLowerCase().includes('katolik')).length, [activeStudents]);
  const totalHindu = useMemo(() => activeStudents.filter(s => (s.agama || '').toLowerCase().includes('hindu')).length, [activeStudents]);
  const totalBuddha = useMemo(() => activeStudents.filter(s => (s.agama || '').toLowerCase().includes('buddha')).length, [activeStudents]);

  // 2. Age Demographics
  const ageDistribution = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let under12 = 0;
    let age12 = 0;
    let age13 = 0;
    let age14 = 0;
    let age15 = 0;
    let over15 = 0;

    activeStudents.forEach(s => {
      if (!s.tanggalLahir) {
        age13++;
        return;
      }
      const birthYear = new Date(s.tanggalLahir).getFullYear();
      if (isNaN(birthYear)) {
        age13++;
        return;
      }
      const age = currentYear - birthYear;
      if (age < 12) under12++;
      else if (age === 12) age12++;
      else if (age === 13) age13++;
      else if (age === 14) age14++;
      else if (age === 15) age15++;
      else over15++;
    });

    return [
      { label: '< 12 Tahun (Di bawah umur standar)', count: under12, color: 'bg-sky-500' },
      { label: '12 Tahun (Kelas 7 Awal)', count: age12, color: 'bg-emerald-500' },
      { label: '13 Tahun (Kelas 7-8 Standar)', count: age13, color: 'bg-indigo-500' },
      { label: '14 Tahun (Kelas 8-9 Standar)', count: age14, color: 'bg-blue-500' },
      { label: '15 Tahun (Kelas 9 Akhir)', count: age15, color: 'bg-purple-500' },
      { label: '> 15 Tahun (Di atas usia reguler)', count: over15, color: 'bg-amber-500' }
    ];
  }, [activeStudents]);

  // 3. Parent Occupation Demographics
  const parentJobStats = useMemo(() => {
    const map: Record<string, number> = {
      'PNS / TNI / Polri': 0,
      'Karyawan Swasta / BUMN': 0,
      'Wiraswasta / Pedagang': 0,
      'Petani / Peternak': 0,
      'Buruh / Pekerja Lepas': 0,
      'Lainnya / Tidak Bekerja': 0
    };

    activeStudents.forEach(s => {
      const job = (s.pekerjaanAyah || s.pekerjaanIbu || '').toLowerCase();
      if (job.includes('pns') || job.includes('tni') || job.includes('polri') || job.includes('guru') || job.includes('pegawai negeri')) {
        map['PNS / TNI / Polri']++;
      } else if (job.includes('swasta') || job.includes('karyawan') || job.includes('bumn')) {
        map['Karyawan Swasta / BUMN']++;
      } else if (job.includes('wiraswasta') || job.includes('dagang') || job.includes('usaha') || job.includes('toko') || job.includes('bisnis')) {
        map['Wiraswasta / Pedagang']++;
      } else if (job.includes('tani') || job.includes('petani') || job.includes('ternak') || job.includes('kebun') || job.includes('nelayan')) {
        map['Petani / Peternak']++;
      } else if (job.includes('buruh') || job.includes('kuli') || job.includes('sopir') || job.includes('ojek')) {
        map['Buruh / Pekerja Lepas']++;
      } else {
        map['Lainnya / Tidak Bekerja']++;
      }
    });

    return Object.entries(map).map(([job, count]) => ({
      job,
      count,
      pct: activeStudents.length > 0 ? Math.round((count / activeStudents.length) * 100) : 0
    }));
  }, [activeStudents]);

  // 4. Transport & Distance Demographics
  const transportStats = useMemo(() => {
    let sepeda = 0;
    let motor = 0;
    let jalanKaki = 0;
    let angkutan = 0;

    activeStudents.forEach(s => {
      const trans = (s.alatTransportasi || '').toLowerCase();
      const dist = parseFloat(s.jarakSekolah || '1.5');
      if (trans.includes('jalan') || trans.includes('kaki') || (!trans && dist <= 0.8)) {
        jalanKaki++;
      } else if (trans.includes('sepeda') && !trans.includes('motor')) {
        sepeda++;
      } else if (trans.includes('motor') || trans.includes('kendaraan')) {
        motor++;
      } else {
        angkutan++;
      }
    });

    return [
      { mode: 'Sepeda Motor / Antar Jemput', count: motor },
      { mode: 'Sepeda Kayuh', count: sepeda },
      { mode: 'Jalan Kaki', count: jalanKaki },
      { mode: 'Angkutan Umum / Mobil', count: angkutan }
    ];
  }, [activeStudents]);

  // 5. PIP / KIP Count
  const pipStudents = useMemo(() => {
    return activeStudents.filter(s => s.penerimaKipPip || (s.noKipPip && s.noKipPip.length > 2));
  }, [activeStudents]);

  // Export to Excel handler
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Rekapitulasi Rombel & Agama (Standar F-1)
    const rekapRows = classBreakdown.map((row, idx) => ({
      'No': idx + 1,
      'Rombel / Kelas': row.kelas,
      'Laki-laki (L)': row.male,
      'Perempuan (P)': row.female,
      'Total Siswa': row.total,
      'Islam': row.islam,
      'Kristen': row.kristen,
      'Katolik': row.katolik,
      'Hindu': row.hindu,
      'Buddha': row.buddha,
      'Lainnya': row.lainnya
    }));

    // Add total row
    rekapRows.push({
      'No': '' as any,
      'Rombel / Kelas': 'JUMLAH TOTAL',
      'Laki-laki (L)': totalMale,
      'Perempuan (P)': totalFemale,
      'Total Siswa': activeStudents.length,
      'Islam': totalIslam,
      'Kristen': totalKristen,
      'Katolik': totalKatolik,
      'Hindu': totalHindu,
      'Buddha': totalBuddha,
      'Lainnya': 0
    });

    const ws1 = XLSX.utils.json_to_sheet(rekapRows);
    XLSX.utils.book_append_sheet(wb, ws1, 'Rekapitulasi Rombel');

    // Sheet 2: Rekapitulasi Demografi Usia
    const ws2 = XLSX.utils.json_to_sheet(ageDistribution.map(a => ({
      'Kategori Usia': a.label,
      'Jumlah Peserta Didik': a.count,
      'Persentase (%)': `${activeStudents.length > 0 ? Math.round((a.count / activeStudents.length) * 100) : 0}%`
    })));
    XLSX.utils.book_append_sheet(wb, ws2, 'Distribusi Usia');

    // Sheet 3: Rekapitulasi Pekerjaan Orang Tua
    const ws3 = XLSX.utils.json_to_sheet(parentJobStats.map(p => ({
      'Kelompok Pekerjaan': p.job,
      'Jumlah Siswa': p.count,
      'Persentase': `${p.pct}%`
    })));
    XLSX.utils.book_append_sheet(wb, ws3, 'Pekerjaan Orang Tua');

    // Sheet 4: Daftar Siswa PIP/KIP
    const ws4 = XLSX.utils.json_to_sheet(pipStudents.map((s, idx) => ({
      'No': idx + 1,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama Siswa': s.namaLengkap,
      'Kelas': s.kelasSaatIni,
      'Jenis Kelamin': s.jenisKelamin,
      'No KIP/PIP': s.noKipPip || 'Terdaftar KIP',
      'Nama Orang Tua': s.namaAyah || s.namaIbu,
      'Pekerjaan Orang Tua': s.pekerjaanAyah || s.pekerjaanIbu,
      'Alamat': s.alamat
    })));
    XLSX.utils.book_append_sheet(wb, ws4, 'Daftar Siswa KIP-PIP');

    const fileName = `Laporan_Bulanan_TU_${settings.namaSekolah.replace(/\s+/g, '_')}_${selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  // Month label
  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${monthNames[mIdx] || ''} ${year}`;
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner (no-print) */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800">Rekapitulasi Demografi & Laporan Bulanan Tata Usaha (TU)</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Rekapitulasi berkala kondisi siswa per rombongan belajar, distribusi demografis, dan bantuan pendidikan untuk laporan Dinas Pendidikan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar Laporan</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (no-print) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Peserta Didik</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-slate-800">{activeStudents.length}</span>
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><GraduationCap className="w-5 h-5" /></span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {totalMale} Laki-laki • {totalFemale} Perempuan
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rombongan Belajar (Rombel)</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-slate-800">{classesList.length}</span>
            <span className="p-2.5 bg-sky-50 text-sky-600 rounded-xl"><Building2 className="w-5 h-5" /></span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Rata-rata {classesList.length > 0 ? Math.round(activeStudents.length / classesList.length) : 0} siswa per kelas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Penerima Bantuan KIP / PIP</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600">{pipStudents.length}</span>
            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><HeartHandshake className="w-5 h-5" /></span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {activeStudents.length > 0 ? Math.round((pipStudents.length / activeStudents.length) * 100) : 0}% dari seluruh siswa
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pendidik & Tenaga Kependidikan</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-purple-600">{teachers.length + staffList.length}</span>
            <span className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-5 h-5" /></span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {teachers.length} Guru • {staffList.length} Pegawai TU
          </span>
        </div>
      </div>

      {/* MAIN TABLE: REKAPITULASI ROMBEL & AGAMA (F-1 FORMAT STANDAR DINAS) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-indigo-600" />
              <span>Rekapitulasi Keadaan Siswa Menurut Rombongan Belajar (Bulan {monthLabel})</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Format baku laporan berkala statistik kesiswaan tingkat Sekolah Menengah Pertama (SMP).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 font-bold text-slate-700 border-b border-slate-200">
                <th className="p-3 text-center w-12 border-r border-slate-200" rowSpan={2}>No</th>
                <th className="p-3 border-r border-slate-200" rowSpan={2}>Tingkat / Rombel</th>
                <th className="p-2.5 text-center border-r border-slate-200 bg-slate-100/50" colSpan={3}>Jenis Kelamin</th>
                <th className="p-2.5 text-center bg-slate-100/50" colSpan={6}>Agama Peserta Didik</th>
              </tr>
              <tr className="bg-slate-50/80 font-bold text-slate-600 border-b border-slate-200 text-[11px]">
                <th className="p-2 text-center w-16">L</th>
                <th className="p-2 text-center w-16">P</th>
                <th className="p-2 text-center w-16 border-r border-slate-200 bg-indigo-50/40 text-indigo-900 font-black">Jml</th>
                <th className="p-2 text-center w-14">Islam</th>
                <th className="p-2 text-center w-14">Kristen</th>
                <th className="p-2 text-center w-14">Katolik</th>
                <th className="p-2 text-center w-14">Hindu</th>
                <th className="p-2 text-center w-14">Buddha</th>
                <th className="p-2 text-center w-14">Lain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {classBreakdown.map((row, idx) => (
                <tr key={row.kelas} className="hover:bg-slate-50/50">
                  <td className="p-3 text-center font-mono font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-800 border-r border-slate-100">Kelas {row.kelas}</td>
                  <td className="p-3 text-center font-mono">{row.male}</td>
                  <td className="p-3 text-center font-mono">{row.female}</td>
                  <td className="p-3 text-center font-mono font-bold text-indigo-700 bg-indigo-50/30 border-r border-slate-100">{row.total}</td>
                  <td className="p-3 text-center font-mono">{row.islam}</td>
                  <td className="p-3 text-center font-mono">{row.kristen}</td>
                  <td className="p-3 text-center font-mono">{row.katolik}</td>
                  <td className="p-3 text-center font-mono">{row.hindu}</td>
                  <td className="p-3 text-center font-mono">{row.buddha}</td>
                  <td className="p-3 text-center font-mono">{row.lainnya}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                <td className="p-3 text-center" colSpan={2}>JUMLAH KESELURUHAN</td>
                <td className="p-3 text-center font-mono">{totalMale}</td>
                <td className="p-3 text-center font-mono">{totalFemale}</td>
                <td className="p-3 text-center font-mono text-indigo-800 bg-indigo-100/50 border-r border-slate-300 text-sm">{activeStudents.length}</td>
                <td className="p-3 text-center font-mono">{totalIslam}</td>
                <td className="p-3 text-center font-mono">{totalKristen}</td>
                <td className="p-3 text-center font-mono">{totalKatolik}</td>
                <td className="p-3 text-center font-mono">{totalHindu}</td>
                <td className="p-3 text-center font-mono">{totalBuddha}</td>
                <td className="p-3 text-center font-mono">0</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* DEMOGRAPHIC ANALYSIS CARDS (no-print) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Distribusi Usia */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <span>Distribusi Kelompok Usia Peserta Didik</span>
          </h3>

          <div className="space-y-3">
            {ageDistribution.map(item => {
              const pct = activeStudents.length > 0 ? Math.round((item.count / activeStudents.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="font-bold text-slate-800 font-mono">{item.count} Siswa ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Pekerjaan Orang Tua */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span>Latar Belakang Pekerjaan Orang Tua / Wali</span>
          </h3>

          <div className="space-y-3">
            {parentJobStats.map(item => (
              <div key={item.job} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">{item.job}</span>
                  <span className="font-bold text-slate-800 font-mono">{item.count} Siswa ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Transportasi & Jarak */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Alat Transportasi ke Sekolah</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {transportStats.map(item => {
              const pct = activeStudents.length > 0 ? Math.round((item.count / activeStudents.length) * 100) : 0;
              return (
                <div key={item.mode} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] text-slate-500 block truncate">{item.mode}</span>
                  <span className="text-lg font-black text-slate-800 mt-1 block font-mono">{item.count} Siswa</span>
                  <span className="text-[10px] text-indigo-600 font-bold">{pct}% dari total</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 4: Siswa Penerima KIP / PIP */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-500" />
              <span>Daftar Siswa Penerima Bantuan PIP/KIP</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {pipStudents.length} Penerima
            </span>
          </h3>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
            {pipStudents.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Belum ada data siswa berstatus penerima bantuan PIP/KIP.
              </div>
            ) : (
              pipStudents.slice(0, 10).map(s => (
                <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{s.namaLengkap}</span>
                    <span className="text-[10px] text-slate-400 font-mono">NIS: {s.nis} • Kelas {s.kelasSaatIni}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-100">
                    {s.noKipPip || 'Penerima PIP'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* PRINT-ONLY SECTION (A4 Landscape Form for Dinas Pendidikan) */}
      <div className="print-only hidden font-serif text-[10pt] leading-relaxed text-black p-2">
        {/* KOP */}
        <div className="border-b-2 border-black pb-2 text-center relative mb-4">
          <h4 className="font-sans font-bold text-[10pt] uppercase">
            {settings.kopDinasAtas || 'PEMERINTAH KABUPATEN KEDIRI\nDINAS PENDIDIKAN'}
          </h4>
          <h2 className="font-sans font-black text-[14pt] uppercase">
            {settings.namaSekolah || 'SMP NEGERI 3 KRAS'}
          </h2>
          <p className="font-sans text-[8pt]">
            {settings.alamat}, Kec. {settings.kecamatan}, Kab. {settings.kabupatenKota} • Telp: {settings.telepon} • NPSN: {settings.npsn}
          </p>
        </div>

        {/* TITLE */}
        <div className="text-center mb-3">
          <h3 className="font-bold text-[12pt] uppercase underline">
            LAPORAN BULANAN KEADAAN SISWA (FORMAT F-1)
          </h3>
          <p className="font-sans text-[9pt]">
            Bulan Pelaporan: <strong>{monthLabel}</strong> • Tahun Ajaran: <strong>{settings.tahunAjaranAktif}</strong>
          </p>
        </div>

        {/* PRINT TABLE */}
        <table className="w-full text-[9pt] border border-black border-collapse mb-6">
          <thead>
            <tr className="bg-slate-100 font-bold text-center border-b border-black">
              <th className="p-1.5 border-r border-black w-8" rowSpan={2}>No</th>
              <th className="p-1.5 border-r border-black" rowSpan={2}>Rombel</th>
              <th className="p-1 border-r border-black" colSpan={3}>Jenis Kelamin</th>
              <th className="p-1" colSpan={6}>Agama</th>
            </tr>
            <tr className="bg-slate-100 font-bold text-center border-b border-black text-[8pt]">
              <th className="p-1 border-r border-black w-10">L</th>
              <th className="p-1 border-r border-black w-10">P</th>
              <th className="p-1 border-r border-black w-12">Total</th>
              <th className="p-1 border-r border-black w-10">Isl</th>
              <th className="p-1 border-r border-black w-10">Kri</th>
              <th className="p-1 border-r border-black w-10">Kat</th>
              <th className="p-1 border-r border-black w-10">Hin</th>
              <th className="p-1 border-r border-black w-10">Bud</th>
              <th className="p-1 w-10">Lain</th>
            </tr>
          </thead>
          <tbody>
            {classBreakdown.map((row, idx) => (
              <tr key={row.kelas} className="border-b border-black">
                <td className="p-1 text-center border-r border-black">{idx + 1}</td>
                <td className="p-1 border-r border-black font-semibold">Kelas {row.kelas}</td>
                <td className="p-1 text-center border-r border-black">{row.male}</td>
                <td className="p-1 text-center border-r border-black">{row.female}</td>
                <td className="p-1 text-center border-r border-black font-bold">{row.total}</td>
                <td className="p-1 text-center border-r border-black">{row.islam}</td>
                <td className="p-1 text-center border-r border-black">{row.kristen}</td>
                <td className="p-1 text-center border-r border-black">{row.katolik}</td>
                <td className="p-1 text-center border-r border-black">{row.hindu}</td>
                <td className="p-1 text-center border-r border-black">{row.buddha}</td>
                <td className="p-1 text-center">{row.lainnya}</td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-100 border-t-2 border-black">
              <td className="p-1 text-center border-r border-black" colSpan={2}>TOTAL</td>
              <td className="p-1 text-center border-r border-black">{totalMale}</td>
              <td className="p-1 text-center border-r border-black">{totalFemale}</td>
              <td className="p-1 text-center border-r border-black text-[10pt]">{activeStudents.length}</td>
              <td className="p-1 text-center border-r border-black">{totalIslam}</td>
              <td className="p-1 text-center border-r border-black">{totalKristen}</td>
              <td className="p-1 text-center border-r border-black">{totalKatolik}</td>
              <td className="p-1 text-center border-r border-black">{totalHindu}</td>
              <td className="p-1 text-center border-r border-black">{totalBuddha}</td>
              <td className="p-1 text-center">0</td>
            </tr>
          </tbody>
        </table>

        {/* PRINT SIGNATURE */}
        <div className="flex justify-between text-[9pt] pt-4">
          <div className="w-56 text-center">
            <p>Mengetahui,</p>
            <p className="font-bold pb-16">Pengelola Tata Usaha,</p>
            <p className="font-bold underline">SUGIANTO, S.Sos.</p>
            <p>NIP. 19780415 200801 1 008</p>
          </div>
          <div className="w-56 text-center">
            <p>{settings.kecamatan || 'Kras'}, Akhir Bulan {monthLabel}</p>
            <p className="font-bold pb-16">Kepala Sekolah,</p>
            <p className="font-bold underline">{settings.kepalaSekolah}</p>
            <p>NIP. {settings.nipKepalaSekolah}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
