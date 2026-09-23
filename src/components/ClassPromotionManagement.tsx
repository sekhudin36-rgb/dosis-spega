/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  HelpCircle,
  Search,
  Filter,
  Layers,
  GraduationCap,
  Save,
  Check,
  RefreshCw,
  Building2,
  CheckSquare,
  Square,
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';

interface ClassPromotionManagementProps {
  students: Student[];
  userRole?: 'admin' | 'guru';
  onPromoteStudents: (updatedStudents: Student[]) => void;
}

interface PromotionRowState {
  studentId: string;
  action: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah/Keluar';
  targetClass: string;
}

interface SchoolWideClassRule {
  sourceClass: string;
  count: number;
  action: 'Naik Kelas' | 'Lulus';
  targetClass: string;
}

export default function ClassPromotionManagement({
  students,
  userRole = 'admin',
  onPromoteStudents
}: ClassPromotionManagementProps) {
  // Top-level tab: 'per-kelas' | 'serentak-sekolah'
  const [viewMode, setViewMode] = useState<'per-kelas' | 'serentak-sekolah'>('per-kelas');

  // 1. Get list of unique active classes
  const activeClasses = useMemo(() => {
    const classes = students
      .filter(s => s.statusSiswa === 'Aktif')
      .map(s => s.kelasSaatIni)
      .filter(Boolean);
    return Array.from(new Set(classes)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  // Selected source class
  const [selectedClass, setSelectedClass] = useState<string>(activeClasses[0] || '');

  // Keep selectedClass synchronized with available activeClasses
  React.useEffect(() => {
    if (activeClasses.length > 0 && (!selectedClass || !activeClasses.includes(selectedClass))) {
      setSelectedClass(activeClasses[0]);
    }
  }, [activeClasses, selectedClass]);
  
  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk parameters
  const [bulkAction, setBulkAction] = useState<'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah/Keluar'>('Naik Kelas');
  const [bulkTargetClass, setBulkTargetClass] = useState('');

  // Multi-select state for individual student checkboxes
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Helper to suggest next class automatically (e.g. "7-A" -> "8-A", "VIII-B" -> "IX-B")
  const suggestNextClass = (currentClass: string): string => {
    if (!currentClass) return '';
    // Look for numbers like 7, 8, 9 or VII, VIII, IX
    const match = currentClass.match(/^(\d+)(.*)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num < 12) {
        return `${num + 1}${match[2]}`;
      }
    }
    
    // Roman numerals conversion check
    if (currentClass.startsWith('VII-')) return currentClass.replace('VII-', 'VIII-');
    if (currentClass.startsWith('VIII-')) return currentClass.replace('VIII-', 'IX-');
    if (currentClass.startsWith('IX-')) return 'Lulus'; // Graduated placeholder

    // Default return current
    return currentClass;
  };

  // School-wide class mapping rules state
  const [schoolRules, setSchoolRules] = useState<SchoolWideClassRule[]>([]);
  const [showSchoolWideConfirmModal, setShowSchoolWideConfirmModal] = useState(false);

  // Initialize schoolRules whenever activeClasses or students change
  React.useEffect(() => {
    const initialRules: SchoolWideClassRule[] = activeClasses.map(cls => {
      const count = students.filter(s => s.kelasSaatIni === cls && s.statusSiswa === 'Aktif').length;
      const isGrade9 = cls.startsWith('9') || cls.startsWith('IX');
      return {
        sourceClass: cls,
        count,
        action: isGrade9 ? 'Lulus' : 'Naik Kelas',
        targetClass: isGrade9 ? '' : suggestNextClass(cls)
      };
    });
    setSchoolRules(initialRules);
  }, [activeClasses, students]);

  const updateSchoolRule = (sourceClass: string, updates: Partial<SchoolWideClassRule>) => {
    setSchoolRules(prev => prev.map(r => r.sourceClass === sourceClass ? { ...r, ...updates } : r));
  };

  const handleResetSchoolRulesToDefault = () => {
    const initialRules: SchoolWideClassRule[] = activeClasses.map(cls => {
      const count = students.filter(s => s.kelasSaatIni === cls && s.statusSiswa === 'Aktif').length;
      const isGrade9 = cls.startsWith('9') || cls.startsWith('IX');
      return {
        sourceClass: cls,
        count,
        action: isGrade9 ? 'Lulus' : 'Naik Kelas',
        targetClass: isGrade9 ? '' : suggestNextClass(cls)
      };
    });
    setSchoolRules(initialRules);
  };

  // 2. Filter students in the selected class
  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.kelasSaatIni === selectedClass && s.statusSiswa === 'Aktif');
  }, [students, selectedClass]);

  // Search filtered students
  const filteredStudents = useMemo(() => {
    return studentsInClass.filter(s => 
      s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.includes(searchTerm) ||
      s.nisn.includes(searchTerm)
    );
  }, [studentsInClass, searchTerm]);

  // Clear selected students when class changes
  React.useEffect(() => {
    setSelectedStudentIds(new Set());
  }, [selectedClass]);

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  // State for rows (key is studentId)
  const [rowStates, setRowStates] = useState<Record<string, PromotionRowState>>({});

  // When class changes, synchronize states for those students incrementally
  React.useEffect(() => {
    setRowStates(prev => {
      const nextStates = { ...prev };
      let changed = false;

      // 1. Remove states for students no longer in this class
      const currentStudentIds = new Set(studentsInClass.map(s => s.id));
      Object.keys(nextStates).forEach(id => {
        if (!currentStudentIds.has(id)) {
          delete nextStates[id];
          changed = true;
        }
      });

      // 2. Add states for new students in this class
      studentsInClass.forEach(s => {
        if (!nextStates[s.id]) {
          const isGrade9 = s.kelasSaatIni.startsWith('9') || s.kelasSaatIni.startsWith('IX');
          const actionValue = isGrade9 ? 'Lulus' : 'Naik Kelas';
          const defaultTarget = isGrade9 ? '' : suggestNextClass(s.kelasSaatIni);

          nextStates[s.id] = {
            studentId: s.id,
            action: actionValue,
            targetClass: defaultTarget
          };
          changed = true;
        }
      });

      return changed ? nextStates : prev;
    });
  }, [studentsInClass]);

  // Calculate average academic score
  const getStudentAverageScore = (student: Student) => {
    const records = Object.values(student.riwayatAkademik);
    if (records.length === 0) return null;
    let totalSum = 0;
    let totalCount = 0;
    records.forEach(rec => {
      if (rec.scores && rec.scores.length > 0) {
        rec.scores.forEach(score => {
          const avg = ((score.nilaiPengetahuan || 0) + (score.nilaiKeterampilan || 0)) / 2;
          totalSum += avg;
          totalCount++;
        });
      }
    });
    return totalCount > 0 ? Math.round(totalSum / totalCount) : null;
  };

  // Set default bulk target class based on current class
  React.useEffect(() => {
    if (selectedClass) {
      setBulkTargetClass(suggestNextClass(selectedClass));
    }
  }, [selectedClass]);

  // Handle individual row updates
  const updateRowAction = (studentId: string, action: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah/Keluar') => {
    setRowStates(prev => {
      const current = prev[studentId] || { studentId, action: 'Naik Kelas', targetClass: '' };
      let newTargetClass = current.targetClass;
      
      if (action === 'Tinggal Kelas') {
        newTargetClass = selectedClass;
      } else if (action === 'Lulus' || action === 'Pindah/Keluar') {
        newTargetClass = '';
      } else if (action === 'Naik Kelas' && (!newTargetClass || newTargetClass === selectedClass)) {
        newTargetClass = suggestNextClass(selectedClass);
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          action,
          targetClass: newTargetClass
        }
      };
    });
  };

  const updateRowTargetClass = (studentId: string, targetClass: string) => {
    setRowStates(prev => {
      const current = prev[studentId] || { studentId, action: 'Naik Kelas', targetClass: '' };
      return {
        ...prev,
        [studentId]: {
          ...current,
          targetClass
        }
      };
    });
  };

  // Apply Bulk Action to either selected students or all filtered rows
  const handleApplyBulk = () => {
    const targetStudents = selectedStudentIds.size > 0
      ? filteredStudents.filter(s => selectedStudentIds.has(s.id))
      : filteredStudents;

    if (targetStudents.length === 0) return;
    
    setRowStates(prev => {
      const updated = { ...prev };
      targetStudents.forEach(s => {
        let target = '';
        if (bulkAction === 'Naik Kelas') {
          target = bulkTargetClass || suggestNextClass(s.kelasSaatIni);
        } else if (bulkAction === 'Tinggal Kelas') {
          target = s.kelasSaatIni;
        }
        
        updated[s.id] = {
          studentId: s.id,
          action: bulkAction,
          targetClass: target
        };
      });
      return updated;
    });
  };

  // Perform school-wide collective promotion
  const handleProcessSchoolWidePromotion = () => {
    const ruleMap = new Map<string, SchoolWideClassRule>();
    schoolRules.forEach(r => ruleMap.set(r.sourceClass, r));

    let totalPromoted = 0;
    let totalGraduated = 0;

    const updatedStudentsList = students.map(originalStudent => {
      if (originalStudent.statusSiswa !== 'Aktif') return originalStudent;
      const rule = ruleMap.get(originalStudent.kelasSaatIni);
      if (!rule) return originalStudent;

      const updated = { ...originalStudent };
      if (rule.action === 'Lulus') {
        updated.statusSiswa = 'Lulus';
        totalGraduated++;
      } else if (rule.action === 'Naik Kelas') {
        updated.kelasSaatIni = rule.targetClass || suggestNextClass(originalStudent.kelasSaatIni);
        updated.statusSiswa = 'Aktif';
        totalPromoted++;
      }
      return updated;
    });

    onPromoteStudents(updatedStudentsList);
    setShowSchoolWideConfirmModal(false);
    setSummaryText(`Transisi Serentak Seluruh Sekolah Berhasil! Sebanyak ${totalPromoted} siswa naik tingkat kelas dan ${totalGraduated} siswa lulus/alumni.`);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 6000);
  };

  // Perform per-class promotion processing
  const [isSuccess, setIsSuccess] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  const handleProcessPromotion = () => {
    if (studentsInClass.length === 0) return;

    // Build the list of updated students
    const updatedStudentsList = students.map(originalStudent => {
      // Check if this student is in the current processed class
      const state = rowStates[originalStudent.id];
      if (!state) return originalStudent; // keep unchanged

      const updated = { ...originalStudent };

      if (state.action === 'Naik Kelas') {
        updated.kelasSaatIni = state.targetClass || suggestNextClass(originalStudent.kelasSaatIni);
        updated.statusSiswa = 'Aktif';
      } else if (state.action === 'Tinggal Kelas') {
        updated.kelasSaatIni = originalStudent.kelasSaatIni; // stays same
        updated.statusSiswa = 'Aktif';
      } else if (state.action === 'Lulus') {
        updated.statusSiswa = 'Lulus';
      } else if (state.action === 'Pindah/Keluar') {
        updated.statusSiswa = 'Pindah';
      }

      return updated;
    });

    // Count summary
    const total = studentsInClass.length;
    let naik = 0;
    let tinggal = 0;
    let lulus = 0;
    let pindah = 0;

    studentsInClass.forEach(s => {
      const state = rowStates[s.id];
      if (!state) return;
      if (state.action === 'Naik Kelas') naik++;
      else if (state.action === 'Tinggal Kelas') tinggal++;
      else if (state.action === 'Lulus') lulus++;
      else if (state.action === 'Pindah/Keluar') pindah++;
    });

    onPromoteStudents(updatedStudentsList);
    
    setSummaryText(`Berhasil memproses kelas ${selectedClass}: ${naik} siswa Naik Kelas, ${tinggal} Tinggal Kelas, ${lulus} Lulus, dan ${pindah} Pindah/Keluar.`);
    setIsSuccess(true);

    // Reset search & selected class after 5 seconds (or let user view)
    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
  };

  // Count summaries for preview in per-class
  const previewCounts = useMemo(() => {
    let naik = 0;
    let tinggal = 0;
    let lulus = 0;
    let pindah = 0;

    filteredStudents.forEach(s => {
      const state = rowStates[s.id];
      if (!state) return;
      if (state.action === 'Naik Kelas') naik++;
      else if (state.action === 'Tinggal Kelas') tinggal++;
      else if (state.action === 'Lulus') lulus++;
      else if (state.action === 'Pindah/Keluar') pindah++;
    });

    return { naik, tinggal, lulus, pindah };
  }, [filteredStudents, rowStates]);

  // Count summaries for school-wide
  const schoolWideCounts = useMemo(() => {
    let totalActive = 0;
    let totalPromoting = 0;
    let totalGraduating = 0;

    schoolRules.forEach(rule => {
      totalActive += rule.count;
      if (rule.action === 'Naik Kelas') totalPromoting += rule.count;
      else if (rule.action === 'Lulus') totalGraduating += rule.count;
    });

    return { totalActive, totalPromoting, totalGraduating };
  }, [schoolRules]);

  return (
    <div className="space-y-6">
      
      {/* Title block with view mode switcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800">Kenaikan dan Kelulusan Kelas</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Proses kenaikan jenjang kelas secara kolektif untuk memelihara riwayat buku induk siswa secara akurat.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('per-kelas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'per-kelas'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Per Rombel</span>
          </button>
          {userRole === 'admin' && (
            <button
              type="button"
              onClick={() => setViewMode('serentak-sekolah')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'serentak-sekolah'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Transisi Serentak Sekolah</span>
            </button>
          )}
        </div>
      </div>

      {/* Success alert */}
      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-800 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs block">Proses Kenaikan Berhasil</span>
            <p className="text-xs mt-0.5 leading-relaxed">{summaryText}</p>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: TRANSISI SERENTAK SELURUH SEKOLAH */}
      {viewMode === 'serentak-sekolah' && (
        <div className="space-y-6">
          {/* Summary metrics banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Rombel Aktif</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black text-slate-800">{activeClasses.length}</span>
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Layers className="w-4 h-4" /></span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Siswa Aktif</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black text-slate-800">{schoolWideCounts.totalActive}</span>
                <span className="p-2 bg-sky-50 text-sky-600 rounded-lg"><Users className="w-4 h-4" /></span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimasi Naik Kelas</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black text-emerald-600">{schoolWideCounts.totalPromoting}</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-4 h-4" /></span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimasi Kelulusan Alumni</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black text-purple-600">{schoolWideCounts.totalGraduating}</span>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><GraduationCap className="w-4 h-4" /></span>
              </div>
            </div>
          </div>

          {/* School-wide mapping panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4.5 h-4.5 text-indigo-600" />
                  <span>Matriks Pemetaan Kenaikan Rombel Serentak</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tinjau dan sesuaikan tujuan rombel untuk setiap jenjang kelas secara serentak sebelum mengeksekusi penutupan tahun ajaran.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSchoolRulesToDefault}
                  className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Kembalikan pemetaan ke rekomendasi standar"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Rekomendasi</span>
                </button>

                {userRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setShowSchoolWideConfirmModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer hover:shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Jalankan Transisi Serentak</span>
                  </button>
                )}
              </div>
            </div>

            {/* School Rules Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 font-bold text-slate-700 border-b border-slate-100">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">Rombel Saat Ini</th>
                    <th className="p-4 text-center">Jumlah Siswa</th>
                    <th className="p-4">Tindakan Kolektif</th>
                    <th className="p-4">Rombel Tujuan</th>
                    <th className="p-4">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {schoolRules.map((rule, idx) => (
                    <tr key={rule.sourceClass} className="hover:bg-slate-50/40">
                      <td className="p-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Kelas {rule.sourceClass}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {rule.count} Siswa
                        </span>
                      </td>
                      <td className="p-4">
                        {userRole === 'admin' ? (
                          <select
                            value={rule.action}
                            onChange={(e: any) => updateSchoolRule(rule.sourceClass, { 
                              action: e.target.value,
                              targetClass: e.target.value === 'Lulus' ? '' : rule.targetClass || suggestNextClass(rule.sourceClass)
                            })}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-hidden ${
                              rule.action === 'Naik Kelas'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                : 'bg-purple-50 text-purple-800 border-purple-100'
                            }`}
                          >
                            <option value="Naik Kelas">Naik Kelas</option>
                            <option value="Lulus">Lulus / Kelulusan Alumni</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                            rule.action === 'Naik Kelas'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : 'bg-purple-50 text-purple-800 border-purple-100'
                          }`}>
                            {rule.action}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {rule.action === 'Naik Kelas' ? (
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            {userRole === 'admin' ? (
                              <input
                                type="text"
                                value={rule.targetClass}
                                onChange={(e) => updateSchoolRule(rule.sourceClass, { targetClass: e.target.value })}
                                placeholder="Kelas tujuan"
                                className="w-24 px-2.5 py-1 border border-slate-200 rounded-lg text-center font-bold text-indigo-700 bg-indigo-50/20"
                              />
                            ) : (
                              <span className="font-bold text-indigo-700">{rule.targetClass}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                            <span>Status Lulus (Alumni)</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[11px] text-slate-400">
                        {rule.action === 'Naik Kelas' ? (
                          <span>Seluruh siswa akan dipindahkan ke rombel {rule.targetClass || '-'}</span>
                        ) : (
                          <span>Siswa akan diarsipkan sebagai alumni sekolah</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* School wide help note */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-start gap-3 text-slate-500 text-[11px]">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                <strong>Catatan Transisi Kolektif:</strong> Siswa yang memiliki kebutuhan khusus (seperti tinggal kelas perorangan atau mutasi keluar) dapat disesuaikan terlebih dahulu di tab <strong>"Per Rombel"</strong> sebelum atau sesudah menjalankan proses serentak ini.
              </p>
            </div>
          </div>

          {/* School-Wide Confirmation Modal */}
          {showSchoolWideConfirmModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-scale-up space-y-5">
                <div className="flex items-center gap-3 text-amber-600">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Konfirmasi Transisi Serentak Seluruh Sekolah</h3>
                    <p className="text-[11px] text-slate-500">Periksa ringkasan sebelum mengeksekusi kenaikan kelas massal.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Rombel Diproses:</span>
                    <span className="font-bold text-slate-800">{activeClasses.length} Rombel</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Siswa Naik Tingkat:</span>
                    <span className="font-bold text-emerald-600">{schoolWideCounts.totalPromoting} Siswa</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Siswa Lulus (Alumni):</span>
                    <span className="font-bold text-purple-600">{schoolWideCounts.totalGraduating} Siswa</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                    <span>Total Siswa Terpengaruh:</span>
                    <span>{schoolWideCounts.totalActive} Siswa</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tindakan ini akan langsung memperbarui kelas siswa aktif dan status kelulusan di Buku Induk. Data riwayat akademik sebelumnya akan tetap tersimpan secara aman.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSchoolWideConfirmModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessSchoolWidePromotion}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Ya, Jalankan Transisi Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: PER-KELAS / PER-ROMBEL (Original detailed view with multi-select) */}
      {viewMode === 'per-kelas' && (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Sidebar Filters */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Class Selection Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Pilih Kelas Asal</span>
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 block">Kelas Saat Ini</label>
              {activeClasses.length === 0 ? (
                <p className="text-slate-400 italic text-xs">Tidak ada data siswa aktif.</p>
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  {activeClasses.map((cls) => {
                    const count = students.filter(s => s.kelasSaatIni === cls && s.statusSiswa === 'Aktif').length;
                    return (
                      <button
                        key={cls}
                        onClick={() => setSelectedClass(cls)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          selectedClass === cls 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>Kelas {cls}</span>
                        </span>
                        <span className="bg-white text-slate-500 font-bold px-2 py-0.5 rounded-md border border-slate-100 text-[10px]">
                          {count} Siswa
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Guidelines / Help Card */}
          <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100/40 p-5 space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Panduan Kenaikan</span>
            </h4>
            <div className="text-[11px] text-indigo-800/80 space-y-2 leading-relaxed">
              <p>
                <strong>1. Pilih Kelas Asal</strong> pada panel filter di atas untuk menampilkan siswa.
              </p>
              <p>
                <strong>2. Gunakan Aksi Massal</strong> untuk mempercepat pengisian status kenaikan (misal: semua naik ke kelas 8-A).
              </p>
              <p>
                <strong>3. Sesuaikan Individu</strong> jika ada siswa tertentu yang tinggal kelas atau mutasi pindah.
              </p>
              <p>
                <strong>4. Tekan Simpan</strong> di kanan bawah untuk memperbarui database Buku Induk.
              </p>
              <p className="text-[10px] text-indigo-600 font-medium pt-1">
                *Siswa kelas 9 akan otomatis disarankan status "Lulus".
              </p>
            </div>
          </div>

        </div>

        {/* Right column: Students Table & Actions */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Main workspace container */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
            
            {/* Header / Search & Bulk Actions Bar */}
            <div className="p-5 border-b border-slate-100 space-y-4 bg-slate-50/50">
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Class badge & title */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Daftar Siswa Kelas {selectedClass || '-'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Menampilkan {filteredStudents.length} siswa aktif dari rombongan belajar ini.
                  </p>
                </div>

                {/* Search bar */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari NIS atau Nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Bulk operations panel */}
              {userRole === 'admin' && filteredStudents.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Aksi Massal:</span>
                    <p className="text-slate-400 text-[11px]">Terapkan status keputusan serentak untuk mempercepat input.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action Select */}
                    <select
                      value={bulkAction}
                      onChange={(e: any) => setBulkAction(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-700"
                    >
                      <option value="Naik Kelas">Naik Kelas</option>
                      <option value="Tinggal Kelas">Tinggal Kelas</option>
                      <option value="Lulus">Lulus (Graduated)</option>
                      <option value="Pindah/Keluar">Pindah/Keluar</option>
                    </select>

                    {/* Target Class input (only if Naik Kelas) */}
                    {bulkAction === 'Naik Kelas' && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[11px]">ke kelas</span>
                        <input
                          type="text"
                          value={bulkTargetClass}
                          onChange={(e) => setBulkTargetClass(e.target.value)}
                          placeholder="Contoh: 8-A"
                          className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-center text-indigo-700 bg-indigo-50/20"
                        />
                      </div>
                    )}

                    {/* Apply Button */}
                    <button
                      onClick={handleApplyBulk}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      {selectedStudentIds.size > 0 
                        ? `Terapkan (${selectedStudentIds.size} Terpilih)` 
                        : 'Terapkan Ke Semua'}
                    </button>
                    {selectedStudentIds.size > 0 && (
                      <button
                        onClick={() => setSelectedStudentIds(new Set())}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        Batal Pilihan
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              {filteredStudents.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-500 text-xs">Tidak Ada Data Siswa</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pilih kelas asal terlebih dahulu atau periksa filter pencarian Anda.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 font-bold text-slate-700 border-b border-slate-100">
                      <th className="p-4 w-10 text-center">
                        {userRole === 'admin' ? (
                          <input
                            type="checkbox"
                            checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length}
                            onChange={toggleSelectAll}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                            title="Pilih Semua Siswa"
                          />
                        ) : (
                          <span>No</span>
                        )}
                      </th>
                      <th className="p-4">Identitas Siswa</th>
                      <th className="p-4 text-center">Akademik</th>
                      <th className="p-4">Keputusan Kenaikan</th>
                      <th className="p-4">Tujuan / Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredStudents.map((student, idx) => {
                      const state = rowStates[student.id] || { studentId: student.id, action: 'Naik Kelas', targetClass: '' };
                      const avgScore = getStudentAverageScore(student);
                      
                      // Format performance badge
                      let perfColor = 'bg-slate-100 text-slate-600';
                      let perfText = 'Belum Diinput';
                      if (avgScore !== null) {
                        if (avgScore >= 85) {
                          perfColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                          perfText = `${avgScore} (Sangat Baik)`;
                        } else if (avgScore >= 75) {
                          perfColor = 'bg-sky-50 text-sky-700 border border-sky-100';
                          perfText = `${avgScore} (Baik)`;
                        } else if (avgScore >= 65) {
                          perfColor = 'bg-amber-50 text-amber-700 border border-amber-100';
                          perfText = `${avgScore} (Cukup)`;
                        } else {
                          perfColor = 'bg-rose-50 text-rose-700 border border-rose-100';
                          perfText = `${avgScore} (Kurang)`;
                        }
                      }

                      return (
                        <tr key={student.id} className={`hover:bg-slate-50/40 transition-colors ${selectedStudentIds.has(student.id) ? 'bg-indigo-50/25' : ''}`}>
                          <td className="p-4 text-center">
                            {userRole === 'admin' ? (
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.has(student.id)}
                                onChange={() => toggleSelectStudent(student.id)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                              />
                            ) : (
                              <span className="font-mono font-bold text-slate-400">{idx + 1}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono font-bold text-slate-400 w-4 text-right shrink-0">{idx + 1}.</span>
                              {/* Small thumb */}
                              <img 
                                src={student.foto} 
                                alt="" 
                                className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="font-bold text-slate-800 text-xs block leading-tight">{student.namaLengkap}</span>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">NIS: {student.nis} • NISN: {student.nisn}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${perfColor}`}>
                              {perfText}
                            </span>
                          </td>
                          <td className="p-4">
                            {userRole === 'admin' ? (
                              <select
                                value={state.action}
                                onChange={(e: any) => updateRowAction(student.id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-hidden ${
                                  state.action === 'Naik Kelas' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                                  state.action === 'Tinggal Kelas' ? 'bg-rose-50 text-rose-800 border-rose-100' :
                                  state.action === 'Lulus' ? 'bg-indigo-50 text-indigo-800 border-indigo-100' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <option value="Naik Kelas">Naik Kelas</option>
                                <option value="Tinggal Kelas">Tinggal Kelas</option>
                                <option value="Lulus">Lulus</option>
                                <option value="Pindah/Keluar">Pindah/Keluar</option>
                              </select>
                            ) : (
                              <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                                  state.action === 'Naik Kelas' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                                  state.action === 'Tinggal Kelas' ? 'bg-rose-50 text-rose-800 border-rose-100' :
                                  state.action === 'Lulus' ? 'bg-indigo-50 text-indigo-800 border-indigo-100' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                {state.action}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {state.action === 'Naik Kelas' ? (
                              <div className="flex items-center gap-1.5">
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                {userRole === 'admin' ? (
                                  <input
                                    type="text"
                                    value={state.targetClass}
                                    onChange={(e) => updateRowTargetClass(student.id, e.target.value)}
                                    placeholder="Kelas baru"
                                    className="w-16 px-2 py-1 border border-slate-200 rounded-md text-center font-bold text-indigo-700 bg-indigo-50/20"
                                  />
                                ) : (
                                  <span className="w-16 px-2 py-1 text-center font-bold text-indigo-700">{state.targetClass}</span>
                                )}
                              </div>
                            ) : state.action === 'Tinggal Kelas' ? (
                              <span className="text-[10px] text-rose-600 font-semibold italic">Tetap di kelas {selectedClass}</span>
                            ) : state.action === 'Lulus' ? (
                              <span className="text-[10px] text-indigo-600 font-bold tracking-wide flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Alumni / Lulus</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Dihapus dari daftar aktif</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Bottom Actions Bar */}
            {filteredStudents.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Summary counts preview */}
                <div className="text-[11px] text-slate-500 font-medium space-x-3 flex flex-wrap gap-y-1">
                  <span>Preview Hasil:</span>
                  {previewCounts.naik > 0 && (
                    <span className="text-emerald-700 font-bold">● {previewCounts.naik} Naik Kelas</span>
                  )}
                  {previewCounts.tinggal > 0 && (
                    <span className="text-rose-700 font-bold">● {previewCounts.tinggal} Tinggal Kelas</span>
                  )}
                  {previewCounts.lulus > 0 && (
                    <span className="text-indigo-700 font-bold">● {previewCounts.lulus} Lulus</span>
                  )}
                  {previewCounts.pindah > 0 && (
                    <span className="text-slate-500 font-bold">● {previewCounts.pindah} Mutasi</span>
                  )}
                </div>

                {/* Submit button */}
                {userRole === 'admin' && (
                  <button
                    type="button"
                    onClick={handleProcessPromotion}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Proses Kenaikan Kelas ({filteredStudents.length} Siswa)</span>
                  </button>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
      )}

    </div>
  );
}
