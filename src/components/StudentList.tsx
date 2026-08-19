/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Student, PrestasiSiswa, RaporFileRecord } from '../types';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  User, 
  CheckCircle,
  FileText,
  X,
  Award,
  ArrowLeftRight,
  Eye,
  Calendar,
  Save,
  Check,
  ChevronDown,
  Camera,
  Image,
  Printer,
  CreditCard
} from 'lucide-react';
import { 
  downloadExcelTemplate, 
  exportStudentsToExcel, 
  parseExcelImport, 
  parseEdosisImport,
  downloadGradesTemplate,
  exportGradesToExcel,
  parseGradesImport
} from '../utils/excelUtils';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddStudent: () => void;
  onDeleteStudent: (id: string) => void;
  onImportStudents: (imported: Partial<Student>[]) => void;
  onImportGrades?: (records: any[], semesterId: string) => void;
  onUpdateStudent?: (updated: Student) => void;
}

export default function StudentList({
  students,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
  onImportStudents,
  onImportGrades,
  onUpdateStudent
}: StudentListProps) {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Mutation state
  const [selectedStudentForMutasi, setSelectedStudentForMutasi] = useState<Student | null>(null);
  const [mutasiData, setMutasiData] = useState({
    sekolahTujuan: '',
    tanggalMutasiKeluar: new Date().toISOString().split('T')[0],
    noSuratMutasiKeluar: '',
    alasanMutasi: ''
  });

  // Achievement state
  const [selectedStudentForPrestasi, setSelectedStudentForPrestasi] = useState<Student | null>(null);
  const [newPrestasi, setNewPrestasi] = useState({
    namaPrestasi: '',
    tanggal: new Date().toISOString().split('T')[0],
    tingkat: 'Sekolah',
    kategori: 'Akademik',
    keterangan: ''
  });

  // Individual Report Card state
  const [selectedStudentForRapor, setSelectedStudentForRapor] = useState<Student | null>(null);

  // Bulk Class Report Card state
  const [isBulkRaporModalOpen, setIsBulkRaporModalOpen] = useState(false);
  const [bulkClass, setBulkClass] = useState('');
  const [bulkSemester, setBulkSemester] = useState('1');

  // File Viewer state
  const [viewingFile, setViewingFile] = useState<{ fileName: string; fileContent: string; fileType: string } | null>(null);

  // Dropdown tracker
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // States for Edosis Import module
  const edosisFileInputRef = useRef<HTMLInputElement>(null);
  const [isEdosisModalOpen, setIsEdosisModalOpen] = useState(false);
  const [edosisParsedStudents, setEdosisParsedStudents] = useState<Partial<Student>[]>([]);
  const [edosisImportFile, setEdosisImportFile] = useState<File | null>(null);
  const [edosisError, setEdosisError] = useState<string | null>(null);

  // States for Grades Import/Export module
  const gradesFileInputRef = useRef<HTMLInputElement>(null);
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [selectedGradesSemester, setSelectedGradesSemester] = useState('1');
  const [gradesParsedRecords, setGradesParsedRecords] = useState<any[]>([]);
  const [gradesImportFile, setGradesImportFile] = useState<File | null>(null);
  const [gradesError, setGradesError] = useState<string | null>(null);

  // Photo states
  const [selectedStudentForPhoto, setSelectedStudentForPhoto] = useState<Student | null>(null);
  const [isBulkPhotoModalOpen, setIsBulkPhotoModalOpen] = useState(false);
  const [bulkPhotoUploads, setBulkPhotoUploads] = useState<{
    id: string;
    fileName: string;
    fileContent: string;
    matchedStudentId: string | null;
  }[]>([]);
  const [isBulkPhotoProcessing, setIsBulkPhotoProcessing] = useState(false);

  // Student Card Printer States
  const [isCardPrinterOpen, setIsCardPrinterOpen] = useState(false);
  const [cardPrinterStudents, setCardPrinterStudents] = useState<Student[]>([]);
  const [cardSchoolName, setCardSchoolName] = useState('SMP NEGERI INDONESIA');
  const [cardColor, setCardColor] = useState<'blue' | 'indigo' | 'emerald' | 'crimson' | 'slate'>('indigo');
  const [cardPrintWithBack, setCardPrintWithBack] = useState(true);
  const [cardHeadmasterName, setCardHeadmasterName] = useState('Drs. H. Mulyono, M.Pd.');
  const [cardHeadmasterNip, setCardHeadmasterNip] = useState('19750812 200003 1 002');
  const [cardRules, setCardRules] = useState<string[]>([
    'Kartu ini wajib dibawa setiap hari sebagai kartu identitas resmi di sekolah.',
    'Kartu digunakan untuk presensi/absen scan barcode masuk dan pulang sekolah.',
    'Dilarang mencoret-coret, merusak, atau meminjamkan kartu ini kepada orang lain.',
    'Jika kartu hilang atau rusak, harap segera melapor ke staf Tata Usaha.'
  ]);
  const [cardFilterClass, setCardFilterClass] = useState('Semua');
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [cardSelectedIds, setCardSelectedIds] = useState<string[]>([]);

  // Get list of all unique classes for filtering
  const classes = ['Semua', ...Array.from(new Set(students.map(s => s.kelasSaatIni).filter(Boolean)))];
  const statuses = ['Semua', 'Aktif', 'Lulus', 'Pindah', 'Keluar'];

  // Mutasi Save Handler
  const handleSaveMutasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForMutasi) return;
    if (!mutasiData.sekolahTujuan) {
      alert('Sekolah Tujuan wajib diisi!');
      return;
    }

    const updatedStudent: Student = {
      ...selectedStudentForMutasi,
      statusSiswa: 'Pindah',
      sekolahTujuan: mutasiData.sekolahTujuan,
      tanggalMutasiKeluar: mutasiData.tanggalMutasiKeluar,
      noSuratMutasiKeluar: mutasiData.noSuratMutasiKeluar,
      alasanMutasi: mutasiData.alasanMutasi
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setImportStatus({
      success: true,
      message: `Berhasil mencatat mutasi keluar untuk ${selectedStudentForMutasi.namaLengkap} ke ${mutasiData.sekolahTujuan}.`
    });

    // Close and Reset
    setSelectedStudentForMutasi(null);
    setMutasiData({
      sekolahTujuan: '',
      tanggalMutasiKeluar: new Date().toISOString().split('T')[0],
      noSuratMutasiKeluar: '',
      alasanMutasi: ''
    });
  };

  // Achievement Save Handler
  const handleAddPrestasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPrestasi) return;
    if (!newPrestasi.namaPrestasi) {
      alert('Nama Prestasi wajib diisi!');
      return;
    }

    const newAchievement: PrestasiSiswa = {
      id: 'prestasi-' + Date.now(),
      tanggal: newPrestasi.tanggal,
      namaPrestasi: newPrestasi.namaPrestasi,
      tingkat: newPrestasi.tingkat,
      kategori: newPrestasi.kategori,
      keterangan: newPrestasi.keterangan
    };

    const updatedStudent: Student = {
      ...selectedStudentForPrestasi,
      prestasi: [...(selectedStudentForPrestasi.prestasi || []), newAchievement]
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setSelectedStudentForPrestasi(updatedStudent);
    setNewPrestasi(prev => ({
      ...prev,
      namaPrestasi: '',
      keterangan: ''
    }));
  };

  // Achievement Delete Handler
  const handleDeletePrestasi = (prestasiId: string) => {
    if (!selectedStudentForPrestasi) return;
    if (!confirm('Apakah Anda yakin ingin menghapus data prestasi ini?')) return;

    const updatedStudent: Student = {
      ...selectedStudentForPrestasi,
      prestasi: (selectedStudentForPrestasi.prestasi || []).filter(p => p.id !== prestasiId)
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setSelectedStudentForPrestasi(updatedStudent);
  };

  // Report Card File Upload Handler
  const handleRaporUpload = (e: React.ChangeEvent<HTMLInputElement>, student: Student, semesterId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const fileRecord: RaporFileRecord = {
          fileName: file.name,
          fileContent: base64,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        };

        const updatedStudent: Student = {
          ...student,
          raporFiles: {
            ...(student.raporFiles || {}),
            [semesterId]: fileRecord
          }
        };

        if (onUpdateStudent) {
          onUpdateStudent(updatedStudent);
        }

        // Keep modal display in sync
        if (selectedStudentForRapor && selectedStudentForRapor.id === student.id) {
          setSelectedStudentForRapor(updatedStudent);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Report Card Delete Handler
  const handleDeleteRapor = (student: Student, semesterId: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus file rapor Semester ${semesterId}?`)) return;

    const nextRaporFiles = { ...(student.raporFiles || {}) };
    delete nextRaporFiles[semesterId];

    const updatedStudent: Student = {
      ...student,
      raporFiles: nextRaporFiles
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    if (selectedStudentForRapor && selectedStudentForRapor.id === student.id) {
      setSelectedStudentForRapor(updatedStudent);
    }
  };

  // Individual Student Photo Handlers
  const handleIndividualPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, student: Student) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const updatedStudent: Student = {
          ...student,
          foto: base64
        };

        if (onUpdateStudent) {
          onUpdateStudent(updatedStudent);
        }

        if (selectedStudentForPhoto && selectedStudentForPhoto.id === student.id) {
          setSelectedStudentForPhoto(updatedStudent);
        }

        setImportStatus({
          success: true,
          message: `Berhasil mengunggah foto untuk ${student.namaLengkap}.`
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleIndividualPhotoDelete = (student: Student) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus foto untuk ${student.namaLengkap}?`)) return;

    const updatedStudent: Student = {
      ...student,
      foto: ''
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    if (selectedStudentForPhoto && selectedStudentForPhoto.id === student.id) {
      setSelectedStudentForPhoto(updatedStudent);
    }

    setImportStatus({
      success: true,
      message: `Berhasil menghapus foto untuk ${student.namaLengkap}.`
    });
  };

  // Bulk Student Photo Handlers
  const matchPhotoToStudent = (fileName: string, allStudents: Student[]): string | null => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "").trim().toLowerCase();
    if (!nameWithoutExt) return null;

    // 1. Exact NIS
    const matchNIS = allStudents.find(s => s.nis && s.nis.trim().toLowerCase() === nameWithoutExt);
    if (matchNIS) return matchNIS.id;

    // 2. Exact NISN
    const matchNISN = allStudents.find(s => s.nisn && s.nisn.trim().toLowerCase() === nameWithoutExt);
    if (matchNISN) return matchNISN.id;

    // 3. Exact full name
    const matchFullName = allStudents.find(s => s.namaLengkap && s.namaLengkap.trim().toLowerCase() === nameWithoutExt);
    if (matchFullName) return matchFullName.id;

    // 4. Loose match
    const candidates = allStudents.filter(s => {
      const sName = (s.namaLengkap || '').trim().toLowerCase();
      return sName.includes(nameWithoutExt) || nameWithoutExt.includes(sName);
    });

    if (candidates.length === 1) {
      return candidates[0].id;
    }

    return null;
  };

  const handleBulkPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBulkPhotoProcessing(true);
    const loadedUploads: typeof bulkPhotoUploads = [];

    // Helper to read file as DataURL inside a Promise
    const readFileAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error("Gagal membaca file"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const base64 = await readFileAsDataURL(file);
        const matchedId = matchPhotoToStudent(file.name, students);
        
        loadedUploads.push({
          id: 'bulk-photo-' + Date.now() + '-' + i,
          fileName: file.name,
          fileContent: base64,
          matchedStudentId: matchedId
        });
      } catch (err) {
        console.error(err);
      }
    }

    setBulkPhotoUploads(prev => [...prev, ...loadedUploads]);
    setIsBulkPhotoProcessing(false);
  };

  const handleSaveBulkPhotos = () => {
    const validUploads = bulkPhotoUploads.filter(item => item.matchedStudentId !== null);
    
    if (validUploads.length === 0) {
      alert("Tidak ada foto yang dihubungkan dengan siswa. Hubungkan setidaknya satu foto ke siswa.");
      return;
    }

    let updatedCount = 0;
    validUploads.forEach(item => {
      const student = students.find(s => s.id === item.matchedStudentId);
      if (student && onUpdateStudent) {
        const updatedStudent: Student = {
          ...student,
          foto: item.fileContent
        };
        onUpdateStudent(updatedStudent);
        updatedCount++;
      }
    });

    setImportStatus({
      success: true,
      message: `Berhasil mengunggah dan memperbarui foto untuk ${updatedCount} siswa.`
    });

    setIsBulkPhotoModalOpen(false);
    setBulkPhotoUploads([]);
  };

  // Filter students based on state
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      student.nis.includes(search) ||
      student.nisn.includes(search);
    
    const matchesClass = selectedClass === 'Semua' || student.kelasSaatIni === selectedClass;
    const matchesStatus = selectedStatus === 'Semua' || student.statusSiswa === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus({ message: 'Sedang memproses file Excel...' });
      const parsed = await parseExcelImport(file);
      if (parsed.length === 0) {
        setImportStatus({ success: false, message: 'Tidak ada data siswa valid ditemukan dalam file Excel ini.' });
        return;
      }

      onImportStudents(parsed);
      setImportStatus({ 
        success: true, 
        message: `Berhasil mengimpor ${parsed.length} data siswa secara massal.` 
      });

      // Clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setImportStatus({ 
        success: false, 
        message: `Gagal mengimpor file: ${err.message || 'Format tidak sesuai.'}` 
      });
    }

    // Auto clear status after 4 seconds
    setTimeout(() => setImportStatus(null), 5000);
  };

  const triggerImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleEdosisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEdosisImportFile(file);
    setEdosisError(null);
    try {
      const parsed = await parseEdosisImport(file);
      if (parsed.length === 0) {
        setEdosisError('Tidak ada data siswa EDOSIS yang valid ditemukan.');
        setEdosisParsedStudents([]);
      } else {
        setEdosisParsedStudents(parsed);
      }
    } catch (err: any) {
      setEdosisError(err.message || 'Gagal memproses file EDOSIS. Pastikan format kolom sesuai.');
      setEdosisParsedStudents([]);
    }
  };

  const handleConfirmEdosisImport = () => {
    if (edosisParsedStudents.length === 0) return;
    onImportStudents(edosisParsedStudents);
    setImportStatus({
      success: true,
      message: `Berhasil mengimpor ${edosisParsedStudents.length} data siswa dari aplikasi EDOSIS.`
    });
    setTimeout(() => setImportStatus(null), 5000);
    resetEdosisModalState();
  };

  const resetEdosisModalState = () => {
    setIsEdosisModalOpen(false);
    setEdosisParsedStudents([]);
    setEdosisImportFile(null);
    setEdosisError(null);
    if (edosisFileInputRef.current) edosisFileInputRef.current.value = '';
  };

  const handleGradesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGradesImportFile(file);
    setGradesError(null);
    try {
      const parsed = await parseGradesImport(file);
      if (parsed.length === 0) {
        setGradesError('Tidak ada data nilai siswa yang valid ditemukan.');
        setGradesParsedRecords([]);
      } else {
        setGradesParsedRecords(parsed);
      }
    } catch (err: any) {
      setGradesError(err.message || 'Gagal memproses file nilai. Pastikan format kolom sesuai.');
      setGradesParsedRecords([]);
    }
  };

  const handleConfirmGradesImport = () => {
    if (gradesParsedRecords.length === 0) return;
    if (onImportGrades) {
      onImportGrades(gradesParsedRecords, selectedGradesSemester);
    }
    setImportStatus({
      success: true,
      message: `Berhasil mengimpor ${gradesParsedRecords.length} data nilai siswa ke Semester ${selectedGradesSemester}.`
    });
    setTimeout(() => setImportStatus(null), 5000);
    resetGradesModalState();
  };

  const resetGradesModalState = () => {
    setIsGradesModalOpen(false);
    setGradesParsedRecords([]);
    setGradesImportFile(null);
    setGradesError(null);
    if (gradesFileInputRef.current) gradesFileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
      {/* Header Panel with search, tools, and actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daftar Buku Induk Siswa</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data induk digital, cetak laporan akademik siswa, dan migrasi massal.</p>
        </div>
        
        {/* Buttons Action Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Template Excel */}
          <button 
            onClick={downloadExcelTemplate}
            title="Download Template Pengisian Excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition-all border border-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Template</span>
          </button>

          {/* Import Excel */}
          <button 
            onClick={triggerImportClick}
            title="Impor Data Siswa secara Massal dari Excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-all border border-emerald-200"
          >
            <Upload className="w-4 h-4" />
            <span>Impor Excel</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleExcelImport} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />

          {/* Import Edosis */}
          <button 
            onClick={() => setIsEdosisModalOpen(true)}
            title="Fitur Khusus: Impor Data Siswa dari Aplikasi EDOSIS"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-all border border-indigo-200 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Impor EDOSIS</span>
          </button>

          {/* Export Excel */}
          <button 
            onClick={() => exportStudentsToExcel(filteredStudents)}
            title="Ekspor Seluruh Siswa ke File Excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-semibold transition-all border border-sky-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          {/* Impor/Ekspor Nilai */}
          <button 
            onClick={() => setIsGradesModalOpen(true)}
            title="Kelola Impor dan Ekspor Nilai/Rapor Siswa secara Massal"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-all border border-purple-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Impor/Ekspor Nilai</span>
          </button>

          {/* Unggah Rapor Kelas */}
          <button 
            onClick={() => {
              setIsBulkRaporModalOpen(true);
              const validClasses = classes.filter(c => c !== 'Semua');
              setBulkClass(validClasses[0] || '');
              setBulkSemester('1');
            }}
            title="Unggah Rapor Kelas Sekaligus"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Rapor Kelas</span>
          </button>

          {/* Unggah Foto Massal */}
          <button 
            onClick={() => {
              setIsBulkPhotoModalOpen(true);
              setBulkPhotoUploads([]);
            }}
            title="Unggah Foto Banyak Siswa Sekaligus"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Unggah Foto Massal</span>
          </button>

          {/* Cetak Kartu Siswa */}
          <button 
            onClick={() => {
              setCardPrinterStudents(students);
              setCardSelectedIds(students.map(s => s.id));
              setCardFilterClass('Semua');
              setCardSearchQuery('');
              setIsCardPrinterOpen(true);
            }}
            title="Cetak Kartu Siswa Beserta Barcode Absen"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Cetak Kartu Siswa</span>
          </button>

          {/* Tambah Siswa */}
          <button 
            onClick={onAddStudent}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Import Toast / Status notification */}
      {importStatus && (
        <div className={`p-4 mb-6 rounded-xl border text-sm flex items-center justify-between transition-all ${
          importStatus.success === true 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : importStatus.success === false 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            {importStatus.success === true && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
            <span>{importStatus.message}</span>
          </div>
          <button onClick={() => setImportStatus(null)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold">Tutup</button>
        </div>
      )}

      {/* Filter and layout selection section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-6 mb-6 border-b border-slate-100">
        {/* Search */}
        <div className="relative md:col-span-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari nama siswa, NIS, atau NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-400 outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>

        {/* Filter Class */}
        <div className="flex items-center gap-2 md:col-span-3">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none text-slate-700"
          >
            {classes.map((cls, idx) => (
              <option key={idx} value={cls}>{cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}</option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2 md:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none text-slate-700"
          >
            {statuses.map((st, idx) => (
              <option key={idx} value={st}>{st === 'Semua' ? 'Semua Status' : `Status: ${st}`}</option>
            ))}
          </select>
        </div>

        {/* Layout toggle buttons */}
        <div className="flex items-center justify-end gap-1.5 md:col-span-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50'}`}
            title="Tampilan Grid"
          >
            <Grid className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50'}`}
            title="Tampilan Tabel"
          >
            <List className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Siswa Tidak Ditemukan</h3>
          <p className="text-slate-400 text-sm max-w-md mt-1.5">
            Coba sesuaikan kata kunci pencarian atau bersihkan filter kelas dan status yang terpilih saat ini.
          </p>
        </div>
      )}

      {/* Grid View */}
      {filteredStudents.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const hasGrades = Object.keys(student.riwayatAkademik).length > 0;
            return (
              <div 
                key={student.id} 
                id={`card-${student.id}`}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all overflow-hidden flex flex-col group"
              >
                {/* Header background pattern */}
                <div className="h-2 bg-gradient-to-r from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300 transition-all" />
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start gap-4">
                    {/* Photo Container */}
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-50 shrink-0">
                      <img 
                        src={student.foto} 
                        alt={student.namaLengkap} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Basic identity text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm font-mono font-medium">
                          NIS {student.nis}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold ${
                          student.statusSiswa === 'Aktif' ? 'bg-emerald-50 text-emerald-700' :
                          student.statusSiswa === 'Lulus' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {student.statusSiswa}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 text-sm mt-1.5 leading-snug group-hover:text-slate-900 line-clamp-1">
                        {student.namaLengkap}
                      </h4>
                      <p className="text-slate-400 text-xs font-medium mt-0.5 font-mono">NISN: {student.nisn}</p>
                      
                      {/* Class */}
                      <p className="text-slate-600 text-xs font-semibold mt-2.5 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md w-fit">
                        Kelas <span className="font-bold text-slate-800">{student.kelasSaatIni || '-'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 my-4.5" />

                  {/* Bottom Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-5 flex-1">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">Orang Tua / Wali</span>
                      <span className="font-medium text-slate-700 truncate block mt-0.5">{student.namaAyah || student.namaIbu || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">Akademik</span>
                      <span className="font-semibold text-slate-700 block mt-0.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {hasGrades ? `${Object.keys(student.riwayatAkademik).length} Semester` : 'Belum Ada'}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 mt-auto relative">
                    <button 
                      onClick={() => onSelectStudent(student)}
                      className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer text-center"
                    >
                      Buka Profil
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === student.id ? null : student.id);
                        }}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1"
                        title="Pilihan Aksi"
                      >
                        <span className="text-xs font-semibold px-0.5">Aksi</span>
                        <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                      </button>

                      {openDropdownId === student.id && (
                        <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl border border-slate-150 shadow-xl z-40 py-1 text-left animate-fade-in">
                          <button
                            onClick={() => {
                              onSelectStudent(student);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span>Buka Profil Detail</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedStudentForMutasi(student);
                              setMutasiData({
                                sekolahTujuan: student.sekolahTujuan || '',
                                tanggalMutasiKeluar: student.tanggalMutasiKeluar || new Date().toISOString().split('T')[0],
                                noSuratMutasiKeluar: student.noSuratMutasiKeluar || '',
                                alasanMutasi: student.alasanMutasi || ''
                              });
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                            <span>Tambah Mutasi</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStudentForPrestasi(student);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Award className="w-4 h-4 text-emerald-500" />
                            <span>Tambah Prestasi</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStudentForRapor(student);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-pink-500" />
                            <span>Unggah/Buka Rapor</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStudentForPhoto(student);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4 text-amber-500" />
                            <span>Unggah/Kelola Foto</span>
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button
                            onClick={() => {
                              setOpenDropdownId(null);
                              if (confirm(`Apakah Anda yakin ingin menghapus data buku induk ${student.namaLengkap}?`)) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus Data Siswa</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {filteredStudents.length > 0 && viewMode === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-4">Foto / Nama Siswa</th>
                <th scope="col" className="px-4 py-4">NIS / NISN</th>
                <th scope="col" className="px-4 py-4">L/P</th>
                <th scope="col" className="px-4 py-4">Kelas</th>
                <th scope="col" className="px-4 py-4">Orang Tua</th>
                <th scope="col" className="px-4 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-11 rounded-md border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                        <img src={student.foto} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{student.namaLengkap}</span>
                        <span className="text-slate-400 text-xs mt-0.5 font-medium">{student.namaPanggilan}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs font-medium text-slate-700">
                    <div>{student.nis}</div>
                    <div className="text-slate-400 mt-0.5">{student.nisn}</div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {student.jenisKelamin}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-800">
                    {student.kelasSaatIni || '-'}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <div className="font-medium text-slate-700">{student.namaAyah || '-'}</div>
                    <div className="text-slate-400 mt-0.5">{student.pekerjaanAyah || '-'}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                      student.statusSiswa === 'Aktif' ? 'bg-emerald-50 text-emerald-700' :
                      student.statusSiswa === 'Lulus' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {student.statusSiswa}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right overflow-visible">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={() => onSelectStudent(student)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Detail
                      </button>

                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === student.id ? null : student.id);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          title="Pilihan Aksi"
                        >
                          <span>Aksi</span>
                          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        {openDropdownId === student.id && (
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-150 shadow-xl z-50 py-1 text-left animate-fade-in">
                            <button
                              onClick={() => {
                                onSelectStudent(student);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4 text-slate-400" />
                              <span>Buka Profil Detail</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedStudentForMutasi(student);
                                setMutasiData({
                                  sekolahTujuan: student.sekolahTujuan || '',
                                  tanggalMutasiKeluar: student.tanggalMutasiKeluar || new Date().toISOString().split('T')[0],
                                  noSuratMutasiKeluar: student.noSuratMutasiKeluar || '',
                                  alasanMutasi: student.alasanMutasi || ''
                                });
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                              <span>Tambah Mutasi</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedStudentForPrestasi(student);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Award className="w-4 h-4 text-emerald-500" />
                              <span>Tambah Prestasi</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedStudentForRapor(student);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-pink-500" />
                              <span>Unggah/Buka Rapor</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedStudentForPhoto(student);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Camera className="w-4 h-4 text-amber-500" />
                              <span>Unggah/Kelola Foto</span>
                            </button>

                            <button
                              onClick={() => {
                                setCardPrinterStudents([student]);
                                setCardSelectedIds([student.id]);
                                setCardFilterClass('Semua');
                                setCardSearchQuery('');
                                setIsCardPrinterOpen(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <CreditCard className="w-4 h-4 text-indigo-500" />
                              <span>Cetak Kartu Siswa</span>
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                if (confirm(`Apakah Anda yakin ingin menghapus data buku induk ${student.namaLengkap}?`)) {
                                  onDeleteStudent(student.id);
                                }
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Hapus Data Siswa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Impor EDOSIS */}
      {isEdosisModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/40">
              <div className="flex items-center gap-2">
                <FileText className="w-5.5 h-5.5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Impor Buku Induk via EDOSIS Excel</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Modul migrasi khusus data ekspor aplikasi EDOSIS (82 kolom)</p>
                </div>
              </div>
              <button 
                onClick={resetEdosisModalState}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {edosisError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <span className="font-bold">Error:</span> {edosisError}
                </div>
              )}

              {edosisParsedStudents.length === 0 ? (
                <>
                  {/* Step 1: Upload and Guide */}
                  <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                    <p>
                      Fitur ini didesain khusus untuk melakukan sinkronisasi data dari aplikasi <strong>EDOSIS</strong>. 
                      Sistem akan membaca <strong>82 kolom berurutan</strong> hasil ekspor EDOSIS dan memetakan datanya secara otomatis ke Buku Induk Siswa.
                    </p>
                    
                    {/* Key Columns Mapping Summary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                      <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Peta Otomatisasi Kolom EDOSIS:
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 list-disc pl-4 text-slate-500">
                        <li><strong>NIPD</strong> dipetakan otomatis ke <strong>NIS</strong> Sekolah</li>
                        <li><strong>JK (L/P)</strong> dikonversi otomatis ke Laki-laki / Perempuan</li>
                        <li><strong>Alamat, RT, RW, Dusun, Desa</strong> digabung menjadi alamat lengkap</li>
                        <li><strong>Data Ayah, Ibu & Wali</strong> (Tgl Lahir, Agama, Alamat, Pekerjaan)</li>
                        <li><strong>Ukuran Fisik</strong> (Tinggi, Berat Badan, Jml Saudara, Jarak Sekolah)</li>
                        <li><strong>Rombel Saat Ini</strong> disesuaikan ke kelas aktif</li>
                      </ul>
                    </div>
                  </div>

                  {/* Drag and drop upload zone */}
                  <div 
                    onClick={() => edosisFileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all rounded-2xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-all border border-indigo-100">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">Pilih file Excel EDOSIS Anda</p>
                      <p className="text-slate-400 text-xs mt-1">Mendukung format file .xlsx, .xls</p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={edosisFileInputRef} 
                    onChange={handleEdosisFileChange}
                    accept=".xlsx, .xls" 
                    className="hidden" 
                  />
                </>
              ) : (
                <>
                  {/* Step 2: Preview of students */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-indigo-50 text-indigo-800 border border-indigo-100 px-3 py-1.5 rounded-lg font-semibold">
                      ✓ Berhasil Membaca <strong>{edosisParsedStudents.length}</strong> Siswa
                    </span>
                    <button 
                      onClick={() => {
                        setEdosisParsedStudents([]);
                        setEdosisImportFile(null);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Ganti file Excel
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Silakan periksa pratinjau data di bawah ini sebelum menekan tombol konfirmasi impor.
                  </p>

                  {/* Scrollable table preview */}
                  <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[300px]">
                    <table className="w-full text-left text-xs text-slate-500">
                      <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2.5">No</th>
                          <th className="px-4 py-2.5">Nama Lengkap</th>
                          <th className="px-4 py-2.5">NIPD / NIS</th>
                          <th className="px-4 py-2.5">JK</th>
                          <th className="px-4 py-2.5">NISN</th>
                          <th className="px-4 py-2.5">Kelas / Rombel</th>
                          <th className="px-4 py-2.5">Orang Tua</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {edosisParsedStudents.map((stud, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-mono font-medium text-slate-400">{index + 1}</td>
                            <td className="px-4 py-2 font-bold text-slate-800">{stud.namaLengkap}</td>
                            <td className="px-4 py-2 font-mono font-medium text-slate-600">{stud.nis}</td>
                            <td className="px-4 py-2 font-semibold text-slate-700">{stud.jenisKelamin}</td>
                            <td className="px-4 py-2 font-mono text-slate-500">{stud.nisn || '-'}</td>
                            <td className="px-4 py-2 font-bold text-indigo-700">{stud.kelasSaatIni}</td>
                            <td className="px-4 py-2 text-slate-500">{stud.namaAyah || stud.namaIbu || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50">
              <button 
                onClick={resetEdosisModalState}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              
              {edosisParsedStudents.length > 0 && (
                <button 
                  onClick={handleConfirmEdosisImport}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Konfirmasi Impor ({edosisParsedStudents.length} Siswa)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Grades Modal */}
      {isGradesModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2.5 text-purple-800">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Impor / Ekspor Nilai Siswa</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Kelola massal nilai akademik, kehadiran, dan catatan wali kelas.</p>
                </div>
              </div>
              <button 
                onClick={resetGradesModalState}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Selector Semester */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Semester Tujuan / Aktif</label>
                  <p className="text-slate-600 text-xs mt-0.5">Operasi ekspor dan pengunduhan template akan mengacu pada semester ini.</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedGradesSemester}
                    onChange={(e) => setSelectedGradesSemester(e.target.value)}
                    className="bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-purple-500 shadow-3xs cursor-pointer"
                  >
                    <option value="1">Semester 1 (7-Ganjil)</option>
                    <option value="2">Semester 2 (7-Genap)</option>
                    <option value="3">Semester 3 (8-Ganjil)</option>
                    <option value="4">Semester 4 (8-Genap)</option>
                    <option value="5">Semester 5 (9-Ganjil)</option>
                    <option value="6">Semester 6 (9-Genap)</option>
                  </select>
                </div>
              </div>

              {gradesError && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 rounded-xl text-xs font-medium">
                  ⚠️ {gradesError}
                </div>
              )}

              {gradesParsedRecords.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left panel: Download & Export */}
                  <div className="border border-slate-150 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-xs transition-all bg-white">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                        <Download className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Unduh & Ekspor Nilai</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Anda dapat mengunduh template Excel yang sudah <strong>terisi otomatis</strong> nama & NIS seluruh siswa aktif, atau mengekspor nilai tersimpan untuk semester ini.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => downloadGradesTemplate(filteredStudents)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-3xs cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh Template (Pre-populate Siswa)</span>
                      </button>

                      <button
                        onClick={() => exportGradesToExcel(filteredStudents, selectedGradesSemester)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-250 transition-all cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                        <span>Ekspor Nilai Semester {selectedGradesSemester}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right panel: Upload zone */}
                  <div className="border border-slate-150 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-xs transition-all bg-white">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                        <Upload className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Impor Nilai Baru</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Unggah kembali template pengisian nilai Excel yang sudah Anda isi. Nilai akan otomatis disinkronkan ke database berdasarkan NIS masing-masing siswa.
                      </p>
                    </div>

                    <div 
                      onClick={() => gradesFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50/10 transition-all rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
                    >
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                      <div>
                        <p className="font-bold text-slate-700 text-[11px]">Unggah File Nilai Excel</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">Format .xlsx, .xls</p>
                      </div>
                    </div>

                    <input 
                      type="file" 
                      ref={gradesFileInputRef} 
                      onChange={handleGradesFileChange}
                      accept=".xlsx, .xls" 
                      className="hidden" 
                    />
                  </div>

                </div>
              ) : (
                <>
                  {/* Step 2: Preview of grades */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-50 text-purple-800 border border-purple-100 px-3 py-1.5 rounded-lg font-semibold">
                      ✓ Berhasil Membaca <strong>{gradesParsedRecords.length}</strong> Rekaman Nilai Siswa
                    </span>
                    <button 
                      onClick={() => {
                        setGradesParsedRecords([]);
                        setGradesImportFile(null);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Ganti file Excel
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Silakan periksa pratinjau nilai siswa di bawah ini sebelum menyimpannya secara massal ke database rapor.
                  </p>

                  {/* Scrollable table preview */}
                  <div className="overflow-x-auto rounded-xl border border-slate-150 max-h-[350px]">
                    <table className="w-full text-left text-[10px] text-slate-500">
                      <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-150 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Siswa / NIS</th>
                          <th className="px-3 py-2">Sem.</th>
                          <th className="px-3 py-2 text-purple-700">PAIBP</th>
                          <th className="px-3 py-2 text-purple-700">PPKn</th>
                          <th className="px-3 py-2 text-purple-700">BI</th>
                          <th className="px-3 py-2 text-purple-700">MAT</th>
                          <th className="px-3 py-2 text-purple-700">IPA</th>
                          <th className="px-3 py-2 text-purple-700">IPS</th>
                          <th className="px-3 py-2 text-purple-700">BIG</th>
                          <th className="px-3 py-2 text-purple-700">SB</th>
                          <th className="px-3 py-2 text-purple-700">PJOK</th>
                          <th className="px-3 py-2 text-purple-700">PRK</th>
                          <th className="px-3 py-2 text-purple-700">BJ</th>
                          <th className="px-3 py-2 text-purple-700">INF</th>
                          <th className="px-3 py-2 text-blue-700">Absensi (S/I/A)</th>
                          <th className="px-3 py-2 text-emerald-700">Ekstrakurikuler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {gradesParsedRecords.map((rec, index) => {
                          const getScoreVal = (mapelId: string) => {
                            const sc = rec.scores.find((s: any) => s.mapelId === mapelId);
                            return sc ? sc.nilaiPengetahuan : '-';
                          };
                          const student = students.find(s => String(s.nis).trim() === String(rec.nis).trim());
                          const eksString = rec.ekstrakurikuler?.map((e: any) => `${e.kegiatan}:${e.nilai}`).join(', ') || '-';
                          
                          return (
                            <tr key={index} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-bold text-slate-800">
                                <div className="truncate max-w-[120px]" title={student?.namaLengkap || 'Tidak terdaftar'}>
                                  {student ? student.namaLengkap : <span className="text-rose-500">NIS tak terdaftar</span>}
                                </div>
                                <span className="block text-[9px] font-mono font-normal text-slate-400">{rec.nis}</span>
                              </td>
                              <td className="px-3 py-1.5 font-semibold text-slate-600">{selectedGradesSemester}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700 bg-slate-50/30">{getScoreVal('agama')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700">{getScoreVal('pancasila')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700 bg-slate-50/30">{getScoreVal('indonesia')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700">{getScoreVal('matematika')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700 bg-slate-50/30">{getScoreVal('ipa')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700">{getScoreVal('ips')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700 bg-slate-50/30">{getScoreVal('inggris')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700">{getScoreVal('seni')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700 bg-slate-50/30">{getScoreVal('pjok')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700">{getScoreVal('prakarya')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700 bg-slate-50/30">{getScoreVal('jawa')}</td>
                              <td className="px-3 py-1.5 font-mono text-center font-bold text-slate-700">{getScoreVal('informatika')}</td>
                              <td className="px-3 py-1.5 text-center font-mono font-semibold text-blue-600 bg-blue-50/20">
                                {rec.absensi?.sakit}/{rec.absensi?.izin}/{rec.absensi?.alpa}
                              </td>
                              <td className="px-3 py-1.5 text-emerald-600 truncate max-w-[120px]" title={eksString}>
                                {eksString}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-slate-150 flex items-center justify-end gap-2.5 bg-slate-50">
              <button 
                onClick={resetGradesModalState}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              
              {gradesParsedRecords.length > 0 && (
                <button 
                  onClick={handleConfirmGradesImport}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Konfirmasi Impor ({gradesParsedRecords.length} Nilai Siswa)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL MUTASI KELUAR */}
      {selectedStudentForMutasi && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5.5 h-5.5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Tambah Mutasi Keluar</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Siswa: {selectedStudentForMutasi.namaLengkap}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentForMutasi(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMutasi}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Sekolah Tujuan Mutasi <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. SMP Negeri 1 Surabaya"
                      value={mutasiData.sekolahTujuan}
                      onChange={(e) => setMutasiData({ ...mutasiData, sekolahTujuan: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-400 transition-all text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nomor Surat Mutasi
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. 421/123/2026"
                        value={mutasiData.noSuratMutasiKeluar}
                        onChange={(e) => setMutasiData({ ...mutasiData, noSuratMutasiKeluar: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-400 transition-all text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tanggal Mutasi <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="date"
                        required
                        value={mutasiData.tanggalMutasiKeluar}
                        onChange={(e) => setMutasiData({ ...mutasiData, tanggalMutasiKeluar: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-400 transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Alasan Mutasi
                    </label>
                    <textarea 
                      placeholder="Alasan kepindahan siswa (e.g. Mengikuti orang tua pindah domisili)"
                      value={mutasiData.alasanMutasi}
                      onChange={(e) => setMutasiData({ ...mutasiData, alasanMutasi: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-400 transition-all text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
                <button 
                  type="button"
                  onClick={() => setSelectedStudentForMutasi(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Mutasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRESTASI */}
      {selectedStudentForPrestasi && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40 shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5.5 h-5.5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Kelola Prestasi Siswa</h3>
                  <p className="text-[10px] text-slate-500 font-medium font-mono">Siswa: {selectedStudentForPrestasi.namaLengkap}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentForPrestasi(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Form Tambah Prestasi */}
              <form onSubmit={handleAddPrestasi} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tambah Prestasi Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nama / Jenis Prestasi <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Juara 1 Olimpiade Matematika"
                      value={newPrestasi.namaPrestasi}
                      onChange={(e) => setNewPrestasi({ ...newPrestasi, namaPrestasi: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tingkat Prestasi
                    </label>
                    <select
                      value={newPrestasi.tingkat}
                      onChange={(e) => setNewPrestasi({ ...newPrestasi, tingkat: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-slate-800"
                    >
                      <option value="Sekolah">Sekolah</option>
                      <option value="Kecamatan">Kecamatan</option>
                      <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kategori
                    </label>
                    <select
                      value={newPrestasi.kategori}
                      onChange={(e) => setNewPrestasi({ ...newPrestasi, kategori: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-slate-800"
                    >
                      <option value="Akademik">Akademik</option>
                      <option value="Non-Akademik">Non-Akademik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tanggal Perolehan
                    </label>
                    <input 
                      type="date"
                      required
                      value={newPrestasi.tanggal}
                      onChange={(e) => setNewPrestasi({ ...newPrestasi, tanggal: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Keterangan / Penyelenggara
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Kementerian Pendidikan dan Kebudayaan"
                      value={newPrestasi.keterangan}
                      onChange={(e) => setNewPrestasi({ ...newPrestasi, keterangan: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan Prestasi</span>
                  </button>
                </div>
              </form>

              {/* Daftar Prestasi Saat Ini */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daftar Prestasi ({selectedStudentForPrestasi.prestasi?.length || 0})</h4>
                {(!selectedStudentForPrestasi.prestasi || selectedStudentForPrestasi.prestasi.length === 0) ? (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                    Belum ada data prestasi tercatat untuk siswa ini.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white">
                    {selectedStudentForPrestasi.prestasi.map((p) => (
                      <div key={p.id} className="p-3.5 hover:bg-slate-50/50 flex items-start justify-between gap-4 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 text-xs">{p.namaPrestasi}</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm font-semibold">
                              {p.tingkat}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-semibold">
                              {p.kategori}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">{p.keterangan || '-'}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{p.tanggal}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeletePrestasi(p.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Hapus Prestasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50 shrink-0">
              <button 
                type="button"
                onClick={() => setSelectedStudentForPrestasi(null)}
                className="px-4 py-2 bg-slate-850 text-white hover:bg-slate-900 text-xs font-bold transition-all rounded-xl cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RAPOR INDIVIDU (1-7) */}
      {selectedStudentForRapor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-pink-50/40 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5.5 h-5.5 text-pink-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Kelola Berkas Rapor</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Siswa: {selectedStudentForRapor.namaLengkap}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentForRapor(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-150 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2">
                <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Panduan Pengarsipan Rapor:</span>
                  Anda dapat mengunggah salinan rapor digital siswa (format PDF atau gambar PNG/JPG) untuk Semester 1 s/d 7. File yang diunggah dapat langsung dibuka dan dilihat di aplikasi ini.
                </div>
              </div>

              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5, 6, 7].map((sem) => {
                  const semId = sem.toString();
                  const fileRec = selectedStudentForRapor.raporFiles?.[semId];
                  return (
                    <div key={sem} className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shadow-2xs font-mono">
                          S{sem}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">Rapor Semester {sem}</span>
                          {fileRec ? (
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5 truncate max-w-xs" title={fileRec.fileName}>
                              <Check className="w-3.5 h-3.5" />
                              {fileRec.fileName}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Belum diarsipkan</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {fileRec ? (
                          <>
                            <button 
                              onClick={() => setViewingFile(fileRec)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold transition-all border border-sky-150 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Buka Berkas</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteRapor(selectedStudentForRapor, semId)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100"
                              title="Hapus File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="relative">
                            <input 
                              type="file"
                              accept=".pdf, image/*"
                              id={`rapor-input-${sem}`}
                              onChange={(e) => handleRaporUpload(e, selectedStudentForRapor, semId)}
                              className="hidden"
                            />
                            <label 
                              htmlFor={`rapor-input-${sem}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-400" />
                              <span>Unggah File</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50 shrink-0">
              <button 
                type="button"
                onClick={() => setSelectedStudentForRapor(null)}
                className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 text-xs font-bold transition-all rounded-xl cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UNGGAH RAPOR MASSAL PER KELAS */}
      {isBulkRaporModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-4xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-pink-50/40 shrink-0">
              <div className="flex items-center gap-2">
                <Upload className="w-5.5 h-5.5 text-pink-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Unggah Berkas Rapor Kelas Sekaligus</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Modul pengisian cepat file rapor digital per semester kelas aktif</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBulkRaporModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter class & semester in header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Pilih Kelas Aktif
                </label>
                <select
                  value={bulkClass}
                  onChange={(e) => setBulkClass(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-pink-400 font-semibold text-slate-700"
                >
                  {classes.filter(c => c !== 'Semua').map((cls, idx) => (
                    <option key={idx} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Pilih Target Semester Rapor
                </label>
                <select
                  value={bulkSemester}
                  onChange={(e) => setBulkSemester(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-pink-400 font-semibold text-slate-700 font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {/* Students listing for class */}
              {(() => {
                const studentsInBulkClass = students.filter(s => s.kelasSaatIni === bulkClass && s.statusSiswa === 'Aktif');
                
                if (studentsInBulkClass.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                      Tidak ada siswa aktif terdaftar di Kelas {bulkClass || '-'}.
                    </div>
                  );
                }

                return (
                  <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                    <table className="w-full border-collapse text-left text-xs text-slate-500">
                      <thead className="bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th scope="col" className="px-4 py-3">Nama Lengkap</th>
                          <th scope="col" className="px-3 py-3">NIS/NISN</th>
                          <th scope="col" className="px-4 py-3 text-right">Status / Berkas Rapor Semester {bulkSemester}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentsInBulkClass.map((student) => {
                          const fileRec = student.raporFiles?.[bulkSemester];
                          return (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition-all">
                              <td className="px-4 py-3 font-bold text-slate-850 text-sm">
                                {student.namaLengkap}
                              </td>
                              <td className="px-3 py-3 font-mono text-slate-400 text-[10px]">
                                {student.nis} / {student.nisn}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {fileRec ? (
                                    <>
                                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1 max-w-[150px] truncate" title={fileRec.fileName}>
                                        <Check className="w-3.5 h-3.5 shrink-0" />
                                        {fileRec.fileName}
                                      </span>
                                      <button 
                                        onClick={() => setViewingFile(fileRec)}
                                        className="p-1.5 bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-sky-700 border border-slate-200 rounded-lg transition-all cursor-pointer"
                                        title="Buka Berkas"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteRapor(student, bulkSemester)}
                                        className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg transition-all cursor-pointer"
                                        title="Hapus Berkas"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="relative inline-block font-sans">
                                      <input 
                                        type="file"
                                        accept=".pdf, image/*"
                                        id={`bulk-rapor-input-${student.id}`}
                                        onChange={(e) => handleRaporUpload(e, student, bulkSemester)}
                                        className="hidden"
                                      />
                                      <label 
                                        htmlFor={`bulk-rapor-input-${student.id}`}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-3xs"
                                      >
                                        <Upload className="w-3 h-3 text-slate-400" />
                                        <span>Unggah Berkas</span>
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50 shrink-0">
              <button 
                type="button"
                onClick={() => setIsBulkRaporModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 text-xs font-bold transition-all rounded-xl cursor-pointer"
              >
                Tutup Modul Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW BERKAS RAPOR */}
      {viewingFile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-2xl max-w-4xl w-full h-[85vh] overflow-hidden flex flex-col animate-scale-up">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5.5 h-5.5 text-slate-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Pratinjau File Rapor</h3>
                  <p className="text-[10px] text-slate-500 font-medium">{viewingFile.fileName}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingFile(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">
              {viewingFile.fileType.startsWith('image/') ? (
                <img 
                  src={viewingFile.fileContent} 
                  alt={viewingFile.fileName}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain shadow-md rounded-lg"
                />
              ) : viewingFile.fileType === 'application/pdf' ? (
                <iframe 
                  src={viewingFile.fileContent} 
                  title={viewingFile.fileName}
                  className="w-full h-full border-0 rounded-lg shadow-sm"
                />
              ) : (
                <div className="text-center p-8 bg-white border border-slate-200 rounded-xl max-w-sm">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 text-sm">Pratinjau Tidak Tersedia</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Tipe file ini ({viewingFile.fileType}) tidak mendukung pratinjau langsung. Anda dapat mengunduhnya secara manual.
                  </p>
                  <a 
                    href={viewingFile.fileContent}
                    download={viewingFile.fileName}
                    className="inline-flex px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold transition-all hover:bg-slate-900"
                  >
                    Unduh File Rapor
                  </a>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <span className="text-[10px] font-mono text-slate-400">
                Diunggah: {viewingFile.uploadedAt ? new Date(viewingFile.uploadedAt).toLocaleString('id-ID') : '-'}
              </span>
              <div className="flex gap-2">
                <a 
                  href={viewingFile.fileContent}
                  download={viewingFile.fileName}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all rounded-xl cursor-pointer"
                >
                  Unduh File
                </a>
                <button 
                  onClick={() => setViewingFile(null)}
                  className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 text-xs font-bold transition-all rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA FOTO SISWA */}
      {selectedStudentForPhoto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-amber-50/40">
              <div className="flex items-center gap-2">
                <Camera className="w-5.5 h-5.5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Kelola Foto Siswa</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Unggah atau hapus foto profil buku induk siswa</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentForPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              {/* Current Student Details */}
              <div className="text-center mb-6">
                <h4 className="font-bold text-slate-800 text-base">{selectedStudentForPhoto.namaLengkap}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">NIS/NISN: {selectedStudentForPhoto.nis} / {selectedStudentForPhoto.nisn}</p>
                <span className="inline-block mt-2 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                  Kelas {selectedStudentForPhoto.kelasSaatIni}
                </span>
              </div>

              {/* Photo Display Frame */}
              <div className="relative w-48 h-48 rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden mb-6 shadow-inner group">
                {selectedStudentForPhoto.foto ? (
                  <>
                    <img 
                      src={selectedStudentForPhoto.foto} 
                      alt={selectedStudentForPhoto.namaLengkap} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleIndividualPhotoDelete(selectedStudentForPhoto)}
                        className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl shadow-md transition-all cursor-pointer"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <User className="w-16 h-16 mx-auto stroke-1 mb-2 text-slate-300" />
                    <p className="text-[10px] font-medium">Belum ada foto profil</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="w-full space-y-3">
                <div className="relative w-full">
                  <input 
                    type="file"
                    accept="image/*"
                    id="individual-photo-input"
                    onChange={(e) => handleIndividualPhotoUpload(e, selectedStudentForPhoto)}
                    className="hidden"
                  />
                  <label 
                    htmlFor="individual-photo-input"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{selectedStudentForPhoto.foto ? 'Unggah Foto Baru' : 'Unggah Foto Profil'}</span>
                  </label>
                </div>

                {selectedStudentForPhoto.foto && (
                  <button 
                    onClick={() => handleIndividualPhotoDelete(selectedStudentForPhoto)}
                    className="w-full py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Hapus Foto Saat Ini
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50">
              <button 
                onClick={() => setSelectedStudentForPhoto(null)}
                className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 text-xs font-bold transition-all rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UNGGAH FOTO MASSAL */}
      {isBulkPhotoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-4xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-amber-50/40 shrink-0">
              <div className="flex items-center gap-2">
                <Camera className="w-5.5 h-5.5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Unggah Foto Siswa Secara Massal</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Unggah banyak foto sekaligus. Sistem akan otomatis mencocokkan foto berdasarkan nama file (NIS, NISN, atau Nama Siswa)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBulkPhotoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="px-6 py-3.5 bg-amber-50 border-b border-amber-100 text-[11px] text-amber-800 flex items-start gap-2 shrink-0">
              <div className="font-bold shrink-0 mt-0.5">Petunjuk Penamaan File:</div>
              <div>
                Beri nama file foto Anda dengan <strong className="font-bold text-amber-950">NIS</strong> (cth: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">241001.jpg</code>), <strong className="font-bold text-amber-950">NISN</strong> (cth: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">0081234567.png</code>), atau <strong className="font-bold text-amber-950">Nama Lengkap</strong> siswa (cth: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">Andi Wijaya.jpg</code>). Sistem akan mencocokkan secara otomatis. Anda juga dapat memilih siswa secara manual jika tidak cocok.
              </div>
            </div>

            {/* File Drop & Choose Zone */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center shrink-0">
              <input 
                type="file"
                accept="image/*"
                multiple
                id="bulk-photo-files-input"
                onChange={handleBulkPhotoSelect}
                className="hidden"
                disabled={isBulkPhotoProcessing}
              />
              <label 
                htmlFor="bulk-photo-files-input"
                className={`w-full max-w-md p-6 border-2 border-dashed border-slate-300 hover:border-amber-400 bg-white rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-inner transition-all ${
                  isBulkPhotoProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Pilih / Seret Beberapa Foto</span>
                <span className="text-[10px] text-slate-400 mt-1">Dukung file format PNG, JPG, JPEG</span>
              </label>
              
              {isBulkPhotoProcessing && (
                <div className="mt-3 text-xs text-amber-600 font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-ping" />
                  Sedang membaca dan mencocokkan foto...
                </div>
              )}
            </div>

            {/* File List for review */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
                <span>Daftar Foto Terpilih ({bulkPhotoUploads.length} File)</span>
                {bulkPhotoUploads.length > 0 && (
                  <button 
                    onClick={() => setBulkPhotoUploads([])}
                    className="text-[10px] text-rose-600 hover:underline font-semibold"
                  >
                    Hapus Semua
                  </button>
                )}
              </h4>

              {bulkPhotoUploads.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                  Belum ada foto yang dipilih. Silakan klik tombol di atas untuk memilih foto.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bulkPhotoUploads.map((item) => {
                    const matchedStudent = students.find(s => s.id === item.matchedStudentId);
                    
                    return (
                      <div key={item.id} className="p-3 border border-slate-150 rounded-xl flex items-center gap-3 bg-slate-50/50 animate-fade-in">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          <img 
                            src={item.fileContent} 
                            alt={item.fileName} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* File Details & Matching Selection */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-mono font-bold text-slate-600 truncate block max-w-[150px]" title={item.fileName}>
                              {item.fileName}
                            </span>
                            {matchedStudent ? (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 shrink-0">
                                <Check className="w-2.5 h-2.5" />
                                Terhubung
                              </span>
                            ) : (
                              <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                                Belum Terhubung
                              </span>
                            )}
                          </div>

                          {/* Matching dropdown */}
                          <div>
                            <select
                              value={item.matchedStudentId || ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? null : e.target.value;
                                setBulkPhotoUploads(prev => prev.map(up => 
                                  up.id === item.id ? { ...up, matchedStudentId: val } : up
                                ));
                              }}
                              className={`w-full px-2 py-1 border rounded-lg text-xs outline-none focus:ring-1 bg-white ${
                                matchedStudent 
                                  ? 'border-emerald-200 focus:ring-emerald-400 text-slate-800 font-medium' 
                                  : 'border-slate-200 focus:ring-amber-400 text-slate-400'
                              }`}
                            >
                              <option value="">-- Pilih Siswa Penerima Foto --</option>
                              {students.map(s => (
                                <option key={s.id} value={s.id} className="text-slate-800">
                                  [{s.kelasSaatIni}] {s.namaLengkap} - NIS: {s.nis}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Remove Action */}
                        <button 
                          onClick={() => setBulkPhotoUploads(prev => prev.filter(up => up.id !== item.id))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Hapus File Ini"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <span className="text-[10px] font-medium text-slate-400">
                Total siap disimpan: <strong className="font-bold text-slate-600">{bulkPhotoUploads.filter(u => u.matchedStudentId !== null).length} / {bulkPhotoUploads.length} foto</strong>
              </span>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setIsBulkPhotoModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={handleSaveBulkPhotos}
                  disabled={bulkPhotoUploads.filter(u => u.matchedStudentId !== null).length === 0}
                  className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-xs font-bold transition-all rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Semua Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK KARTU SISWA (DENGAN BARCODE ABSENSI) */}
      {isCardPrinterOpen && (() => {
        const formatBirthDate = (dateStr?: string) => {
          if (!dateStr) return '';
          try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          } catch (e) {
            return dateStr;
          }
        };

        const cardColors = {
          indigo: {
            bg: 'bg-indigo-600',
            border: 'border-indigo-200',
            banner: 'bg-indigo-600',
            text: 'text-indigo-700',
            badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            hover: 'hover:bg-indigo-100',
            ring: 'focus:ring-indigo-500',
            accent: 'indigo'
          },
          blue: {
            bg: 'bg-blue-600',
            border: 'border-blue-200',
            banner: 'bg-blue-600',
            text: 'text-blue-700',
            badge: 'bg-blue-50 text-blue-700 border-blue-100',
            hover: 'hover:bg-blue-100',
            ring: 'focus:ring-blue-500',
            accent: 'blue'
          },
          emerald: {
            bg: 'bg-emerald-600',
            border: 'border-emerald-200',
            banner: 'bg-emerald-600',
            text: 'text-emerald-700',
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            hover: 'hover:bg-emerald-100',
            ring: 'focus:ring-emerald-500',
            accent: 'emerald'
          },
          crimson: {
            bg: 'bg-rose-600',
            border: 'border-rose-200',
            banner: 'bg-rose-600',
            text: 'text-rose-700',
            badge: 'bg-rose-50 text-rose-700 border-rose-100',
            hover: 'hover:bg-rose-100',
            ring: 'focus:ring-rose-500',
            accent: 'rose'
          },
          slate: {
            bg: 'bg-slate-700',
            border: 'border-slate-300',
            banner: 'bg-slate-700',
            text: 'text-slate-800',
            badge: 'bg-slate-100 text-slate-800 border-slate-200',
            hover: 'hover:bg-slate-200',
            ring: 'focus:ring-slate-500',
            accent: 'slate'
          }
        };

        const renderCode39 = (text: string) => {
          const sanitized = (text || '').toUpperCase().replace(/[^0-9A-Z\-.\s$/+%]/g, '');
          if (!sanitized) return null;
          const fullText = `*${sanitized}*`;
          
          const patterns: Record<string, string> = {
            '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
            '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
            '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
            'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
            'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
            'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
            'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
            'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
            'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
            '-': '000110010', '.': '110000100', ' ': '011000100', '$': '010101000',
            '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
          };

          const narrowWidth = 1.3;
          const wideWidth = 3.2;
          const barHeight = 40;
          let currentX = 0;
          let pathD = '';

          for (let i = 0; i < fullText.length; i++) {
            const char = fullText[i];
            const pattern = patterns[char] || patterns[' '];
            
            for (let j = 0; j < 9; j++) {
              const isBar = j % 2 === 0;
              const isWide = pattern[j] === '1';
              const width = isWide ? wideWidth : narrowWidth;

              if (isBar) {
                pathD += `M ${currentX.toFixed(1)} 0 h ${width.toFixed(1)} v ${barHeight} h -${width.toFixed(1)} Z `;
              }
              currentX += width;
            }
            currentX += narrowWidth;
          }

          return (
            <div className="flex flex-col items-center">
              <svg viewBox={`0 0 ${currentX} 48`} className="w-[145px] h-[34px]" xmlns="http://www.w3.org/2000/svg">
                <path d={pathD} fill="#000000" />
              </svg>
              <span className="text-[7.5px] font-mono tracking-[0.2em] font-extrabold text-slate-700 leading-none mt-0.5">
                *{sanitized}*
              </span>
            </div>
          );
        };

        // Filter and search students for listing in left pane
        const filteredList = cardPrinterStudents.filter(s => {
          const matchesClass = cardFilterClass === 'Semua' || s.kelasSaatIni === cardFilterClass;
          const matchesSearch = !cardSearchQuery || 
            (s.namaLengkap || '').toLowerCase().includes(cardSearchQuery.toLowerCase()) ||
            (s.nis || '').toLowerCase().includes(cardSearchQuery.toLowerCase()) ||
            (s.nisn || '').toLowerCase().includes(cardSearchQuery.toLowerCase());
          return matchesClass && matchesSearch;
        });

        const selectedToPrint = cardPrinterStudents.filter(s => cardSelectedIds.includes(s.id));

        const handleToggleSelectAll = () => {
          const visibleIds = filteredList.map(s => s.id);
          const allVisibleSelected = visibleIds.every(id => cardSelectedIds.includes(id));
          
          if (allVisibleSelected) {
            // Uncheck all visible
            setCardSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
          } else {
            // Check all visible
            setCardSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
          }
        };

        const handlePrint = () => {
          if (selectedToPrint.length === 0) {
            alert('Silakan pilih minimal 1 siswa untuk dicetak kartunya.');
            return;
          }
          window.print();
        };

        // Get class choices for printer dropdown
        const printerClasses = ['Semua', ...Array.from(new Set(cardPrinterStudents.map(s => s.kelasSaatIni).filter(Boolean)))];

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in no-print">
            <style>{`
              @media print {
                /* Hide everything in the page */
                body * {
                  visibility: hidden;
                }
                /* Only show the print container and its contents */
                #print-cards-container-wrapper, #print-cards-container-wrapper * {
                  visibility: visible;
                }
                #print-cards-container-wrapper {
                  display: block !important;
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 210mm; /* A4 width */
                  background: white !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .print-card-unit {
                  break-inside: avoid;
                  page-break-inside: avoid;
                  margin-bottom: 8mm;
                }
                @page {
                  size: A4 portrait;
                  margin: 12mm 10mm 12mm 10mm;
                }
              }
            `}</style>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-6xl w-full overflow-hidden animate-scale-up flex flex-col h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/40 shrink-0">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5.5 h-5.5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Cetak Kartu Siswa & Barcode Absen</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Buat kartu identitas siswa scannable otomatis untuk sistem absensi harian</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCardPrinterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (2 Columns Layout) */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                
                {/* Left Column: Configuration & Student Select */}
                <div className="lg:col-span-5 border-r border-slate-100 flex flex-col h-full overflow-y-auto p-6 space-y-5 bg-slate-50/50">
                  
                  {/* Card Customizer Section */}
                  <div className="space-y-4 bg-white p-4.5 rounded-2xl border border-slate-150 shadow-2xs">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-3">
                      <span>1. Desain & Atribut Kartu</span>
                    </h4>

                    {/* School Name Input */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Nama Instansi / Sekolah</label>
                      <input 
                        type="text" 
                        value={cardSchoolName}
                        onChange={(e) => setCardSchoolName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Contoh: SMP NEGERI INDONESIA"
                      />
                    </div>

                    {/* Accent Colors */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">Warna Aksen Tema Kartu</label>
                      <div className="flex gap-2">
                        {Object.keys(cardColors).map((colorKey) => {
                          const item = cardColors[colorKey as keyof typeof cardColors];
                          const isActive = cardColor === colorKey;
                          return (
                            <button
                              key={colorKey}
                              onClick={() => setCardColor(colorKey as any)}
                              type="button"
                              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${item.bg} ${
                                isActive ? 'scale-110 ring-2 ring-indigo-500 ring-offset-1 border-white' : 'opacity-80 border-transparent hover:opacity-100'
                              }`}
                              title={colorKey}
                            >
                              {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Print with back side toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="block text-xs font-bold text-slate-700">Cetak Sisi Belakang (Tata Tertib)</span>
                        <span className="text-[10px] text-slate-400">Menyertakan tata tertib dan tanda tangan kepala sekolah</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={cardPrintWithBack}
                        onChange={(e) => setCardPrintWithBack(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Headmaster Credentials */}
                    {cardPrintWithBack && (
                      <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 animate-fade-in">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 mb-1">Nama Kepala Sekolah</label>
                          <input 
                            type="text" 
                            value={cardHeadmasterName}
                            onChange={(e) => setCardHeadmasterName(e.target.value)}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 mb-1">NIP Kepala Sekolah</label>
                          <input 
                            type="text" 
                            value={cardHeadmasterNip}
                            onChange={(e) => setCardHeadmasterNip(e.target.value)}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rules Customizer */}
                  {cardPrintWithBack && (
                    <div className="space-y-3 bg-white p-4.5 rounded-2xl border border-slate-150 shadow-2xs animate-fade-in">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span>2. Edit Tata Tertib (Sisi Belakang)</span>
                      </h4>
                      {cardRules.map((rule, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 mt-1.5 shrink-0">{idx + 1}</span>
                          <textarea 
                            value={rule}
                            rows={1}
                            onChange={(e) => {
                              const updated = [...cardRules];
                              updated[idx] = e.target.value;
                              setCardRules(updated);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 resize-none font-medium focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Student Filter & Checkbox List Section */}
                  <div className="space-y-3 bg-white p-4.5 rounded-2xl border border-slate-150 shadow-2xs flex-1 flex flex-col min-h-[300px]">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-2">
                      <span>3. Pilih Siswa ({cardSelectedIds.length} Terpilih)</span>
                    </h4>

                    {/* Quick filter row */}
                    <div className="grid grid-cols-2 gap-2 shrink-0">
                      <div>
                        <select
                          value={cardFilterClass}
                          onChange={(e) => setCardFilterClass(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {printerClasses.map(c => (
                            <option key={c} value={c}>Kelas {c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input 
                          type="text"
                          placeholder="Cari Nama/NIS..."
                          value={cardSearchQuery}
                          onChange={(e) => setCardSearchQuery(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Bulk select visible toggle */}
                    <div className="flex items-center justify-between px-2.5 py-2 bg-slate-50 rounded-xl shrink-0">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={filteredList.length > 0 && filteredList.every(s => cardSelectedIds.includes(s.id))}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-slate-700">Pilih Semua ({filteredList.length} Siswa Terfilter)</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setCardSelectedIds([])}
                        className="text-[10px] text-rose-600 font-bold hover:underline"
                      >
                        Hapus Semua
                      </button>
                    </div>

                    {/* Scrollable Students check list */}
                    <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-[220px]">
                      {filteredList.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 italic">
                          Tidak ada siswa yang cocok dengan filter
                        </div>
                      ) : (
                        filteredList.map((student) => {
                          const isChecked = cardSelectedIds.includes(student.id);
                          return (
                            <div 
                              key={student.id} 
                              onClick={() => {
                                setCardSelectedIds(prev => 
                                  prev.includes(student.id) 
                                    ? prev.filter(id => id !== student.id)
                                    : [...prev, student.id]
                                );
                              }}
                              className={`p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50/20' : ''}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                                />
                                <div className="w-7 h-7 rounded-full bg-slate-100 border overflow-hidden shrink-0 flex items-center justify-center">
                                  {student.foto ? (
                                    <img src={student.foto} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-800 block truncate leading-tight">{student.namaLengkap}</span>
                                  <span className="text-[9px] text-slate-400 font-mono block">Kelas {student.kelasSaatIni} • NIS: {student.nis || '-'}</span>
                                </div>
                              </div>
                              <div className="shrink-0">
                                {student.foto ? (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">Foto</span>
                                ) : (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full">No Foto</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column: Interactive Card Preview */}
                <div className="lg:col-span-7 bg-slate-100 p-6 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span>Pratinjau Hasil Kartu ({selectedToPrint.length} Kartu Siap Cetak)</span>
                    </h4>
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">A4 Grid Layout</span>
                  </div>

                  {/* Preview Cards Screen */}
                  <div className="flex-1 overflow-y-auto bg-slate-200/50 p-6 rounded-2xl border border-slate-250 flex items-start justify-center">
                    {selectedToPrint.length === 0 ? (
                      <div className="m-auto text-center p-8 max-w-sm text-slate-400">
                        <CreditCard className="w-16 h-16 mx-auto text-slate-300 stroke-1 mb-3 animate-pulse" />
                        <h5 className="font-bold text-slate-700 text-sm mb-1">Belum Ada Siswa Dipilih</h5>
                        <p className="text-xs leading-relaxed">Silakan cari dan centang siswa pada panel kiri untuk melihat pratinjau kartu mereka di sini.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 w-full max-w-lg">
                        {selectedToPrint.slice(0, 3).map((student) => (
                          <div key={student.id} className="p-4 bg-white/75 backdrop-blur-md rounded-2xl border border-slate-150 shadow-xs space-y-4">
                            <div className="text-[10px] text-slate-400 font-bold flex justify-between border-b border-slate-100 pb-1.5">
                              <span>PREVIEW SISWA: {student.namaLengkap}</span>
                              <span className="font-mono text-indigo-600 uppercase">Sisi Depan</span>
                            </div>
                            
                            {/* Card Front Component */}
                            <div className="flex justify-center">
                              <div className={`w-[342px] h-[216px] rounded-xl border relative overflow-hidden bg-white shadow-md flex flex-col justify-between p-3 select-none ${cardColors[cardColor].border}`}>
                                {/* Header banner */}
                                <div className={`absolute top-0 left-0 right-0 h-[44px] ${cardColors[cardColor].banner} text-white p-2 flex items-center gap-2 border-b border-black/5 shadow-xs`}>
                                  {/* Elegant School Emblem */}
                                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                                    <Award className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider truncate text-white leading-tight">
                                      {cardSchoolName}
                                    </h5>
                                    <p className="text-[7px] text-white/90 font-medium tracking-widest leading-none mt-0.5">
                                      KARTU IDENTITAS SISWA
                                    </p>
                                  </div>
                                </div>

                                {/* Card Body */}
                                <div className="mt-[38px] flex-1 flex gap-3 pt-2 items-center">
                                  {/* Photo Frame */}
                                  <div className="w-[84px] h-[105px] rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative shadow-sm">
                                    {student.foto ? (
                                      <img 
                                        src={student.foto} 
                                        alt={student.namaLengkap} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="text-center p-1 text-slate-300">
                                        <User className="w-9 h-9 mx-auto stroke-1 mb-1 text-slate-350" />
                                        <p className="text-[6px] font-semibold text-slate-400">PAS FOTO</p>
                                      </div>
                                    )}
                                    {/* Decorative colored bar below photo */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${cardColors[cardColor].bg}`} />
                                  </div>

                                  {/* Details */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between h-[105px]">
                                    <div className="space-y-0.5">
                                      <div>
                                        <span className="text-[6px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">Nama Lengkap</span>
                                        <span className="text-[10px] font-extrabold text-slate-800 leading-tight block truncate" title={student.namaLengkap}>
                                          {student.namaLengkap}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                                        <div>
                                          <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">NIS / NISN</span>
                                          <span className="text-[8px] font-mono font-bold text-slate-700 block truncate">
                                            {student.nis || '-'} / {student.nisn || '-'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Kelas</span>
                                          <span className="text-[8px] font-bold text-slate-800 block truncate">
                                            {student.kelasSaatIni || '-'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">TTL</span>
                                          <span className="text-[7.5px] font-semibold text-slate-800 block truncate" title={`${student.tempatLahir || ''}, ${formatBirthDate(student.tanggalLahir)}`}>
                                            {student.tempatLahir || '-'}{student.tanggalLahir ? `, ${formatBirthDate(student.tanggalLahir)}` : ''}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Gender & Gol. Darah</span>
                                          <span className="text-[7.5px] font-semibold text-slate-800 block truncate">
                                            {student.jenisKelamin === 'L' ? 'Laki-laki' : student.jenisKelamin === 'P' ? 'Perempuan' : '-'}{student.golonganDarah ? ` [${student.golonganDarah}]` : ''}
                                          </span>
                                        </div>
                                        <div className="col-span-2">
                                          <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Alamat</span>
                                          <span className="text-[7.5px] font-medium text-slate-700 block truncate" title={student.alamat}>
                                            {student.alamat || '-'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Barcode Frame */}
                                    <div className="mt-0.5 pt-0.5 border-t border-slate-100 flex items-center justify-center shrink-0">
                                      {student.nis ? (
                                        renderCode39(student.nis)
                                      ) : (
                                        <div className="text-[8px] text-rose-500 font-semibold italic">NIS kosong - Barcode gagal dibuat</div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Footer decoration line */}
                                <div className={`h-1.5 rounded-full w-2/3 mx-auto mb-0.5 ${cardColors[cardColor].bg} opacity-80 shrink-0`} />
                              </div>
                            </div>

                            {/* Card Back Component */}
                            {cardPrintWithBack && (
                              <div className="space-y-4 pt-4 border-t border-dashed border-slate-200">
                                <div className="text-[10px] text-slate-400 font-bold flex justify-between">
                                  <span />
                                  <span className="font-mono text-indigo-600 uppercase">Sisi Belakang</span>
                                </div>
                                <div className="flex justify-center animate-fade-in">
                                  <div className={`w-[342px] h-[216px] rounded-xl border relative overflow-hidden bg-white shadow-md flex flex-col justify-between p-3 select-none ${cardColors[cardColor].border}`}>
                                    {/* Back Header Banner */}
                                    <div className={`absolute top-0 left-0 right-0 h-[34px] ${cardColors[cardColor].banner} text-white p-2 flex items-center justify-center border-b border-black/5 shadow-xs`}>
                                      <h5 className="text-[8.5px] font-bold uppercase tracking-widest text-white leading-none">
                                        TATA TERTIB & KETENTUAN
                                      </h5>
                                    </div>

                                    {/* Rules list */}
                                    <div className="mt-[28px] flex-1 py-1.5">
                                      <ol className="list-decimal pl-3 space-y-0.5">
                                        {cardRules.map((rule, idx) => (
                                          <li key={idx} className="text-[7px] text-slate-600 leading-snug font-medium">
                                            {rule}
                                          </li>
                                        ))}
                                      </ol>
                                    </div>

                                    {/* Stamp & Sign footer */}
                                    <div className="border-t border-slate-100 pt-1 flex items-end justify-between shrink-0">
                                      <div className="text-left shrink-0">
                                        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">SMP BUKU INDUK</p>
                                        <p className="text-[5.5px] text-slate-500 leading-none">Sistem Administrasi Elektronik</p>
                                      </div>
                                      <div className="text-right shrink-0 pr-2">
                                        <p className="text-[5.5px] text-slate-500 font-medium leading-none">Kepala Sekolah,</p>
                                        <div className="h-4.5 relative flex items-center justify-end">
                                          {/* Decorative Stamp Badge */}
                                          <div className={`absolute right-3 w-5 h-5 rounded-full border border-dashed ${cardColors[cardColor].border} opacity-20`} />
                                          <span className="text-[7px] font-serif italic text-slate-400 mr-2 leading-none">ttd</span>
                                        </div>
                                        <p className="text-[7.5px] font-bold text-slate-800 leading-none">{cardHeadmasterName}</p>
                                        <p className="text-[6px] text-slate-400 font-mono mt-0.5 leading-none">NIP. {cardHeadmasterNip}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {selectedToPrint.length > 3 && (
                          <div className="p-3 bg-indigo-50 text-indigo-700 text-center text-xs font-semibold rounded-xl border border-indigo-100">
                            Dan {selectedToPrint.length - 3} kartu lainnya telah dipersiapkan dalam layout cetak.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Print Action Buttons */}
                  <div className="px-1 py-3 mt-4 flex items-center justify-between border-t border-slate-200 shrink-0">
                    <span className="text-xs font-medium text-slate-500">
                      Format Cetak: <strong className="font-bold text-slate-700">A4 Portrait (2 Kolom Kartu)</strong>
                    </span>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setIsCardPrinterOpen(false)}
                        className="px-4.5 py-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all rounded-xl cursor-pointer"
                      >
                        Tutup
                      </button>
                      <button 
                        type="button"
                        onClick={handlePrint}
                        disabled={selectedToPrint.length === 0}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-xs font-bold transition-all rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Sekarang (Print PDF)</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* HIGH FIDELITY LAYOUT AREA UNTUK CETAK (ONLY VISIBLE ON PRINT) */}
            <div id="print-cards-container-wrapper" className="hidden absolute top-0 left-0 bg-white text-black w-[210mm] p-0 m-0">
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 p-[12mm]">
                {selectedToPrint.map((student) => (
                  <div key={student.id} className="print-card-unit flex flex-col items-center justify-center">
                    
                    {/* Front Card */}
                    <div className={`w-[342px] h-[216px] rounded-xl border relative overflow-hidden bg-white shadow-none flex flex-col justify-between p-3 select-none ${cardColors[cardColor].border} mb-3`}>
                      {/* Header banner */}
                      <div className={`absolute top-0 left-0 right-0 h-[44px] ${cardColors[cardColor].banner} text-white p-2 flex items-center gap-2 border-b border-black/5 shadow-none`}>
                        {/* School Logo */}
                        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[10px] font-extrabold uppercase tracking-wider truncate text-white leading-tight">
                            {cardSchoolName}
                          </h5>
                          <p className="text-[7px] text-white/90 font-medium tracking-widest leading-none mt-0.5">
                            KARTU IDENTITAS SISWA
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="mt-[38px] flex-1 flex gap-3 pt-2 items-center">
                        {/* Photo Frame */}
                        <div className="w-[84px] h-[105px] rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative shadow-none">
                          {student.foto ? (
                            <img 
                              src={student.foto} 
                              alt={student.namaLengkap} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover animate-none"
                            />
                          ) : (
                            <div className="text-center p-1 text-slate-300">
                              <User className="w-9 h-9 mx-auto stroke-1 mb-1 text-slate-350" />
                              <p className="text-[6px] font-semibold text-slate-400">PAS FOTO</p>
                            </div>
                          )}
                          {/* Decorative colored bar below photo */}
                          <div className={`absolute bottom-0 left-0 right-0 h-1 ${cardColors[cardColor].bg}`} />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-[105px]">
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-[6px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">Nama Lengkap</span>
                              <span className="text-[10px] font-extrabold text-slate-800 leading-tight block truncate">
                                {student.namaLengkap}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                              <div>
                                <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">NIS / NISN</span>
                                <span className="text-[8px] font-mono font-bold text-slate-700 block truncate">
                                  {student.nis || '-'} / {student.nisn || '-'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Kelas</span>
                                <span className="text-[8px] font-bold text-slate-800 block truncate">
                                  {student.kelasSaatIni || '-'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">TTL</span>
                                <span className="text-[7.5px] font-semibold text-slate-800 block truncate">
                                  {student.tempatLahir || '-'}{student.tanggalLahir ? `, ${formatBirthDate(student.tanggalLahir)}` : ''}
                                </span>
                              </div>
                              <div>
                                <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Gender & Gol. Darah</span>
                                <span className="text-[7.5px] font-semibold text-slate-800 block truncate">
                                  {student.jenisKelamin === 'L' ? 'Laki-laki' : student.jenisKelamin === 'P' ? 'Perempuan' : '-'}{student.golonganDarah ? ` [${student.golonganDarah}]` : ''}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Alamat</span>
                                <span className="text-[7.5px] font-medium text-slate-700 block truncate">
                                  {student.alamat || '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Barcode Frame */}
                          <div className="mt-0.5 pt-0.5 border-t border-slate-100 flex items-center justify-center shrink-0">
                            {student.nis ? (
                              renderCode39(student.nis)
                            ) : (
                              <div className="text-[8px] text-rose-500 font-semibold italic">NIS kosong - Barcode gagal dibuat</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer decoration line */}
                      <div className={`h-1.5 rounded-full w-2/3 mx-auto mb-0.5 ${cardColors[cardColor].bg} opacity-80 shrink-0`} />
                    </div>

                    {/* Back Card (Printed together on sheet) */}
                    {cardPrintWithBack && (
                      <div className={`w-[342px] h-[216px] rounded-xl border relative overflow-hidden bg-white shadow-none flex flex-col justify-between p-3 select-none ${cardColors[cardColor].border}`}>
                        {/* Back Header Banner */}
                        <div className={`absolute top-0 left-0 right-0 h-[34px] ${cardColors[cardColor].banner} text-white p-2 flex items-center justify-center border-b border-black/5 shadow-none`}>
                          <h5 className="text-[8.5px] font-bold uppercase tracking-widest text-white leading-none">
                            TATA TERTIB & KETENTUAN
                          </h5>
                        </div>

                        {/* Rules list */}
                        <div className="mt-[28px] flex-1 py-1.5">
                          <ol className="list-decimal pl-3 space-y-0.5">
                            {cardRules.map((rule, idx) => (
                              <li key={idx} className="text-[7px] text-slate-600 leading-snug font-medium">
                                {rule}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Stamp & Sign footer */}
                        <div className="border-t border-slate-100 pt-1 flex items-end justify-between shrink-0">
                          <div className="text-left shrink-0">
                            <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">SMP BUKU INDUK</p>
                            <p className="text-[5.5px] text-slate-500 leading-none">Sistem Administrasi Elektronik</p>
                          </div>
                          <div className="text-right shrink-0 pr-2">
                            <p className="text-[5.5px] text-slate-500 font-medium leading-none">Kepala Sekolah,</p>
                            <div className="h-4.5 relative flex items-center justify-end">
                              {/* Decorative Stamp Badge */}
                              <div className={`absolute right-3 w-5 h-5 rounded-full border border-dashed ${cardColors[cardColor].border} opacity-20`} />
                              <span className="text-[7px] font-serif italic text-slate-400 mr-2 leading-none">ttd</span>
                            </div>
                            <p className="text-[7.5px] font-bold text-slate-800 leading-none">{cardHeadmasterName}</p>
                            <p className="text-[6px] text-slate-400 font-mono mt-0.5 leading-none">NIP. {cardHeadmasterNip}</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>

          </div>
        );
      })()}
    </div>
  );
}
