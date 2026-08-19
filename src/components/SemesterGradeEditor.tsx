/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, SemesterRecord, SubjectScore, LIST_MAPEL_DEFAULT } from '../types';
import { createEmptySemester } from '../data/mockStudents';
import { X, Save, Clipboard, Award, Clock, FileText } from 'lucide-react';

interface SemesterGradeEditorProps {
  student: Student;
  semesterId: string; // e.g. "1" | "2" | "3" | "4" | "5" | "6"
  onSave: (updatedRecord: SemesterRecord) => void;
  onCancel: () => void;
}

export default function SemesterGradeEditor({
  student,
  semesterId,
  onSave,
  onCancel
}: SemesterGradeEditorProps) {
  
  // Set default semester title based on key
  const defaultNamaSemester = semesterId === "1" ? "Semester I (Ganjil)" :
                             semesterId === "2" ? "Semester II (Genap)" :
                             semesterId === "3" ? "Semester III (Ganjil)" :
                             semesterId === "4" ? "Semester IV (Genap)" :
                             semesterId === "5" ? "Semester V (Ganjil)" :
                             "Semester VI (Genap)";

  // Load existing semester data, or initialize empty semester structures
  const existingRecord = student.riwayatAkademik[semesterId];
  
  const [kelas, setKelas] = useState(existingRecord?.kelas || student.kelasSaatIni || '7-A');
  const [tahunAjaran, setTahunAjaran] = useState(existingRecord?.tahunAjaran || '2024/2025');
  const [scores, setScores] = useState<SubjectScore[]>(() => {
    if (existingRecord?.scores && existingRecord.scores.length > 0) {
      return [...existingRecord.scores];
    }
    // Initialize standard Indonesian subjects list
    return LIST_MAPEL_DEFAULT.map(mapel => ({
      mapelId: mapel.id,
      namaMapel: mapel.nama,
      nilaiPengetahuan: 80, // healthy defaults
      nilaiKeterampilan: 80,
      deskripsi: `Sangat baik dalam memahami konsep serta pengerjaan tugas ${mapel.nama}.`
    }));
  });

  const [ekskul, setEkskul] = useState(() => {
    if (existingRecord?.ekstrakurikuler && existingRecord.ekstrakurikuler.length > 0) {
      return [...existingRecord.ekstrakurikuler];
    }
    return [
      { kegiatan: 'Pramuka', nilai: 'A' as const, keterangan: 'Aktif, rajin, dan disiplin dalam kepramukaan.' },
      { kegiatan: 'UKS', nilai: 'B' as const, keterangan: 'Cukup aktif membantu kegiatan medis sekolah.' }
    ];
  });

  const [absensi, setAbsensi] = useState({
    sakit: existingRecord?.absensi?.sakit || 0,
    izin: existingRecord?.absensi?.izin || 0,
    alpa: existingRecord?.absensi?.alpa || 0
  });

  const [catatanWali, setCatatanWali] = useState(
    existingRecord?.catatanWali || 
    'Siswa menunjukkan kemajuan yang stabil dan kepribadian yang luhur. Pertahankan motivasi belajarmu.'
  );

  const handleScoreChange = (index: number, field: 'nilaiPengetahuan' | 'nilaiKeterampilan' | 'deskripsi', value: any) => {
    setScores(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === 'deskripsi' ? value : Math.min(100, Math.max(0, Number(value) || 0))
      };
      return copy;
    });
  };

  const handleEkskulChange = (index: number, field: 'kegiatan' | 'nilai' | 'keterangan', value: any) => {
    setEkskul(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      return copy;
    });
  };

  const handleAbsensiChange = (field: 'sakit' | 'izin' | 'alpa', value: number) => {
    setAbsensi(prev => ({
      ...prev,
      [field]: Math.max(0, value)
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalRecord: SemesterRecord = {
      semesterId,
      namaSemester: defaultNamaSemester,
      kelas,
      tahunAjaran,
      scores,
      ekstrakurikuler: ekskul.filter(item => item.kegiatan.trim() !== ''),
      absensi,
      catatanWali
    };

    onSave(finalRecord);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-indigo-500" />
              <span>Kelola Nilai Akademik - {defaultNamaSemester}</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Siswa: <strong className="text-slate-700">{student.namaLengkap}</strong> (NIS: {student.nis})
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Section 1: Semester Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Rombongan Belajar (Kelas) saat Semester ini</label>
              <input 
                type="text" 
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="cth: 7-A"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-400 outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tahun Ajaran</label>
              <input 
                type="text" 
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                placeholder="cth: 2024/2025"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-400 outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Section 2: Subject Grades */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Input Nilai Mata Pelajaran (Kognitif & Psikomotor)</span>
            </h4>
            
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 font-bold text-slate-700 border-b border-slate-100 text-[11px]">
                    <th className="p-3 w-1/3">Nama Mata Pelajaran</th>
                    <th className="p-3 text-center w-20">Pengetahuan (0-100)</th>
                    <th className="p-3 text-center w-20">Keterampilan (0-100)</th>
                    <th className="p-3 w-1/2">Deskripsi Kemajuan Belajar (Opsional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scores.map((score, idx) => (
                    <tr key={score.mapelId} className="hover:bg-slate-50/20">
                      <td className="p-3 font-semibold text-slate-800">{score.namaMapel}</td>
                      <td className="p-3 text-center">
                        <input 
                          type="number" 
                          min={0}
                          max={100}
                          value={score.nilaiPengetahuan}
                          onChange={(e) => handleScoreChange(idx, 'nilaiPengetahuan', e.target.value)}
                          className="w-16 px-1.5 py-1 bg-slate-50 text-center font-mono border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-indigo-400 outline-none font-bold"
                          required
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="number" 
                          min={0}
                          max={100}
                          value={score.nilaiKeterampilan}
                          onChange={(e) => handleScoreChange(idx, 'nilaiKeterampilan', e.target.value)}
                          className="w-16 px-1.5 py-1 bg-slate-50 text-center font-mono border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-indigo-400 outline-none font-bold"
                          required
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={score.deskripsi}
                          onChange={(e) => handleScoreChange(idx, 'deskripsi', e.target.value)}
                          placeholder="Deskripsi otomatis..."
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:bg-white outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Extra and Attendance (2 Columns Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Extracurriculars */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Kegiatan Ekstrakurikuler</span>
              </h4>
              
              {ekskul.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-slate-400 font-medium block">Kegiatan</label>
                      <input 
                        type="text" 
                        value={item.kegiatan}
                        onChange={(e) => handleEkskulChange(idx, 'kegiatan', e.target.value)}
                        placeholder="cth: Pramuka / PMR"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-medium block">Nilai</label>
                      <select 
                        value={item.nilai}
                        onChange={(e) => handleEkskulChange(idx, 'nilai', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded-md outline-none font-bold text-indigo-700"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-medium block">Keterangan</label>
                    <input 
                      type="text" 
                      value={item.keterangan}
                      onChange={(e) => handleEkskulChange(idx, 'keterangan', e.target.value)}
                      placeholder="cth: Sangat rajin dan aktif"
                      className="w-full px-2 py-1 border border-slate-200 rounded-md outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Absensi */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Ketidakhadiran (Absensi)</span>
              </h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-100 text-center space-y-1">
                  <span className="text-slate-500 font-medium block">Sakit (S)</span>
                  <input 
                    type="number" 
                    min={0}
                    value={absensi.sakit}
                    onChange={(e) => handleAbsensiChange('sakit', Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 text-center font-bold font-mono border border-slate-200 rounded-md py-1"
                  />
                  <span className="text-[10px] text-slate-400">Hari</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100 text-center space-y-1">
                  <span className="text-slate-500 font-medium block">Izin (I)</span>
                  <input 
                    type="number" 
                    min={0}
                    value={absensi.izin}
                    onChange={(e) => handleAbsensiChange('izin', Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 text-center font-bold font-mono border border-slate-200 rounded-md py-1"
                  />
                  <span className="text-[10px] text-slate-400">Hari</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100 text-center space-y-1">
                  <span className="text-slate-500 font-medium block">Alpa (A)</span>
                  <input 
                    type="number" 
                    min={0}
                    value={absensi.alpa}
                    onChange={(e) => handleAbsensiChange('alpa', Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 text-center font-bold font-mono border border-slate-200 rounded-md py-1"
                  />
                  <span className="text-[10px] text-slate-400">Hari</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Teacher's Comment */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs block">Catatan Wali Kelas</label>
            <textarea 
              value={catatanWali}
              onChange={(e) => setCatatanWali(e.target.value)}
              rows={3}
              placeholder="Berikan saran perkembangan hasil belajar murid..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white outline-none resize-none leading-relaxed"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all border border-slate-200 cursor-pointer"
          >
            Batalkan
          </button>
          <button
            onClick={handleFormSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Nilai Semester</span>
          </button>
        </div>

      </div>
    </div>
  );
}
