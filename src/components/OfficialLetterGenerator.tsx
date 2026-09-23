/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Student, SchoolSettings } from '../types';
import { 
  FileText, 
  Printer, 
  Search, 
  Check, 
  Award, 
  ShieldCheck, 
  Users, 
  Building2, 
  Sparkles,
  Calendar,
  Layers,
  ArrowLeft,
  Stamp,
  Download,
  MessageCircle,
  Share2
} from 'lucide-react';

interface OfficialLetterGeneratorProps {
  students: Student[];
  settings: SchoolSettings;
  userRole?: 'admin' | 'guru';
  initialStudentId?: string;
  onBack?: () => void;
  onLogPrint?: (letterType: string, studentName: string) => void;
}

export default function OfficialLetterGenerator({
  students,
  settings,
  userRole = 'admin',
  initialStudentId,
  onBack,
  onLogPrint
}: OfficialLetterGeneratorProps) {
  // Determine initial student
  const activeStudents = useMemo(() => {
    return students.filter(s => s.statusSiswa === 'Aktif');
  }, [students]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (activeStudents[0]?.id || '')
  );

  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Letter types: 'AKTIF' | 'BERKELAKUAN_BAIK' | 'REKOMENDASI'
  const [letterType, setLetterType] = useState<'AKTIF' | 'BERKELAKUAN_BAIK' | 'REKOMENDASI'>('AKTIF');

  // Year calculation
  const currentYear = new Date().getFullYear();
  const [letterNumber, setLetterNumber] = useState(`421.3 / ${Math.floor(Math.random() * 800 + 100)} / 418.20.123 / ${currentYear}`);
  
  // Format indonesian date
  const todayFormatted = useMemo(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  const [letterDate, setLetterDate] = useState(todayFormatted);
  const [purpose, setPurpose] = useState('Pengurusan Tunjangan Gaji Orang Tua (PNS/TNI/Polri/BUMN/Swasta)');
  const [customNotes, setCustomNotes] = useState('Siswa yang bersangkutan memiliki catatan prestasi yang baik serta aktif dalam kegiatan ekstrakurikuler sekolah.');
  
  const [signatoryName, setSignatoryName] = useState(settings.kepalaSekolah || 'Drs. H. Mulyono, M.Pd.');
  const [signatoryNip, setSignatoryNip] = useState(settings.nipKepalaSekolah || '19750812 200003 1 002');
  const [signatoryTitle, setSignatoryTitle] = useState('Kepala Sekolah');
  const [includeStampAndSignature, setIncludeStampAndSignature] = useState<boolean>(
    settings.gunakanStempelPadaCetak ?? true
  );

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || activeStudents[0];
  }, [students, selectedStudentId, activeStudents]);

  // Filtered student list for search
  const filteredSearchStudents = useMemo(() => {
    if (!searchKeyword.trim()) return activeStudents.slice(0, 10);
    const kw = searchKeyword.toLowerCase();
    return activeStudents.filter(s => 
      s.namaLengkap.toLowerCase().includes(kw) || 
      s.nis.includes(kw) || 
      s.nisn.includes(kw) ||
      s.kelasSaatIni.toLowerCase().includes(kw)
    ).slice(0, 15);
  }, [activeStudents, searchKeyword]);

  // Quick purposes suggestions
  const purposeSuggestions = [
    'Pengurusan Tunjangan Gaji Orang Tua (PNS/TNI/Polri/BUMN/Swasta)',
    'Pencairan Bantuan PIP (Program Indonesia Pintar) / KIP',
    'Pengajuan Beasiswa Pendidikan Prestasi / Kurang Mampu',
    'Pembuatan Rekening Tabungan Pelajar (SimPel) di Bank',
    'Persyaratan Kelengkapan BPJS Kesehatan / Ketenagakerjaan',
    'Persyaratan Pendaftaran Mengikuti Lomba / Kejuaraan Tingkat Daerah'
  ];

  const handlePrint = () => {
    if (onLogPrint && selectedStudent) {
      const typeLabel = letterType === 'AKTIF' 
        ? 'Surat Keterangan Siswa Aktif' 
        : letterType === 'BERKELAKUAN_BAIK' 
          ? 'Surat Keterangan Berkelakuan Baik' 
          : 'Surat Rekomendasi Siswa';
      onLogPrint(typeLabel, selectedStudent.namaLengkap);
    }
    window.print();
  };

  const handleSendWhatsAppNotification = () => {
    if (!selectedStudent) return;
    const studentName = selectedStudent.namaLengkap;
    const letterTitle = letterType === 'AKTIF' 
      ? 'Surat Keterangan Siswa Aktif' 
      : letterType === 'BERKELAKUAN_BAIK' 
        ? 'Surat Keterangan Berkelakuan Baik' 
        : 'Surat Rekomendasi Siswa';
    
    const message = `*PEMBERITAHUAN DOKUMEN RESMI SEKOLAH*\n` +
      `*${settings.namaSekolah || 'SMP Negeri 3 Kras'}*\n\n` +
      `Yth. Orang Tua / Wali dari:\n` +
      `• Nama Siswa: *${studentName}*\n` +
      `• NIS / NISN: ${selectedStudent.nis} / ${selectedStudent.nisn}\n` +
      `• Kelas: ${selectedStudent.kelasSaatIni}\n\n` +
      `Dokumen *${letterTitle}* dengan Nomor Resmi:\n` +
      `*${letterNumber}*\n` +
      `untuk keperluan: "${purpose}"\n` +
      `telah selesai diterbitkan dan divalidasi oleh Tata Usaha Sekolah.\n\n` +
      `Bapak/Ibu dapat mengambil dokumen fisik legalisir di bagian Tata Usaha Sekolah atau meminta salinan digital.\n\n` +
      `_Sistem Buku Induk Siswa Digital ${settings.namaSekolah || 'SMPN 3 Kras'}_`;

    const rawPhone = selectedStudent.telepon || selectedStudent.hp || '';
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    let targetPhone = cleanDigits;
    if (targetPhone.startsWith('0')) {
      targetPhone = '62' + targetPhone.substring(1);
    }

    const waUrl = targetPhone 
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  if (!selectedStudent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-3">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-700">Belum Ada Data Siswa Aktif</h3>
        <p className="text-xs text-slate-400">Silakan tambahkan data siswa terlebih dahulu sebelum membuat surat keterangan.</p>
        {onBack && (
          <button onClick={onBack} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
            Kembali
          </button>
        )}
      </div>
    );
  }

  // Format date of birth in Indonesian
  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header (hidden on print) */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-all cursor-pointer shrink-0"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800">Cetak Surat Keterangan Resmi Sekolah</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Generator surat resmi berstandar Dinas Pendidikan dengan Kop Surat otomatis, nomor resmi, dan verifikasi tanda tangan/stempel.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSendWhatsAppNotification}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-md"
            title="Kirim pemberitahuan resmi surat keterangan ini ke nomor WhatsApp orang tua/wali siswa"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim WA ke Wali Siswa</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Editor Controls & Layout Grid (no-print) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Parameters & Configuration */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Card: Student Picker & Letter Type */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>1. Pilih Siswa & Jenis Surat</span>
            </h3>

            {/* Letter Type Selection */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Jenis Dokumen Surat</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLetterType('AKTIF');
                    setPurpose('Pengurusan Tunjangan Gaji Orang Tua (PNS/TNI/Polri/BUMN/Swasta)');
                  }}
                  className={`px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    letterType === 'AKTIF' 
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-800 shadow-xs' 
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${letterType === 'AKTIF' ? 'text-indigo-600' : 'opacity-0'}`} />
                    <span>Surat Keterangan Siswa Aktif</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-100/50 px-1.5 py-0.5 rounded-md">Reguler</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLetterType('BERKELAKUAN_BAIK');
                    setPurpose('Persyaratan Pendaftaran Beasiswa / Seleksi Sekolah');
                  }}
                  className={`px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    letterType === 'BERKELAKUAN_BAIK' 
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 shadow-xs' 
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${letterType === 'BERKELAKUAN_BAIK' ? 'text-emerald-600' : 'opacity-0'}`} />
                    <span>Surat Kelakuan Baik</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded-md">Disiplin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLetterType('REKOMENDASI');
                    setPurpose('Rekomendasi Mengikuti Perlombaan / Beasiswa Prestasi');
                  }}
                  className={`px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    letterType === 'REKOMENDASI' 
                      ? 'bg-purple-50/80 border-purple-200 text-purple-800 shadow-xs' 
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${letterType === 'REKOMENDASI' ? 'text-purple-600' : 'opacity-0'}`} />
                    <span>Surat Rekomendasi Prestasi</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-600 bg-purple-100/50 px-1.5 py-0.5 rounded-md">Khusus</span>
                </button>
              </div>
            </div>

            {/* Student Search & Select */}
            <div className="relative pt-1">
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Pilih Peserta Didik</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Ketik Nama, NIS, atau Kelas..."
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Autocomplete dropdown */}
              {isDropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {filteredSearchStudents.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">Siswa tidak ditemukan</div>
                  ) : (
                    filteredSearchStudents.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setIsDropdownOpen(false);
                          setSearchKeyword('');
                        }}
                        className={`w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          s.id === selectedStudentId ? 'bg-indigo-50/50 font-bold text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img 
                            src={s.foto} 
                            alt="" 
                            className="w-6 h-6 rounded-md object-cover bg-slate-100" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="block leading-tight">{s.namaLengkap}</span>
                            <span className="text-[10px] text-slate-400 font-mono">NIS: {s.nis} • Kelas {s.kelasSaatIni}</span>
                          </div>
                        </div>
                        {s.id === selectedStudentId && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Current Student Selected Banner */}
              <div className="mt-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center gap-3">
                <img 
                  src={selectedStudent.foto} 
                  alt="" 
                  className="w-10 h-10 rounded-xl object-cover border border-indigo-200 bg-white shadow-2xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 text-xs block truncate">{selectedStudent.namaLengkap}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">NISN: {selectedStudent.nisn} • Kelas: {selectedStudent.kelasSaatIni}</span>
                  <span className="text-[10px] text-indigo-600 font-medium block truncate">Wali: {selectedStudent.namaAyah || selectedStudent.namaIbu || '-'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Card: Surat Parameters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>2. Atribut & Keperluan Surat</span>
            </h3>

            {/* Nomor Surat */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Nomor Surat Resmi</label>
              <input 
                type="text"
                value={letterNumber}
                onChange={(e) => setLetterNumber(e.target.value)}
                placeholder="421.3 / ... / 418.20.123 / 2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Tanggal Surat */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Titimangsa / Tanggal Surat</label>
              <input 
                type="text"
                value={letterDate}
                onChange={(e) => setLetterDate(e.target.value)}
                placeholder="Contoh: 18 September 2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Keperluan / Dasar Penerbitan */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Keperluan / Keterangan Digunakan Untuk</label>
              <textarea 
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Misal: Persyaratan pengurusan tunjangan gaji orang tua..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500"
              />

              {/* Quick pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {purposeSuggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPurpose(item)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition-colors text-left cursor-pointer"
                  >
                    + {item.substring(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* If Rekomendasi, show custom notes */}
            {letterType === 'REKOMENDASI' && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Catatan Rekomendasi / Kualifikasi Siswa</label>
                <textarea 
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            )}

            {/* Penandatangan & Stempel */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 block">Pejabat Penandatangan</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nama Terang</label>
                  <input 
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">NIP</label>
                  <input 
                    type="text"
                    value={signatoryNip}
                    onChange={(e) => setSignatoryNip(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Digital Stamp Toggle */}
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                <input 
                  type="checkbox"
                  checked={includeStampAndSignature}
                  onChange={(e) => setIncludeStampAndSignature(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Stamp className="w-4 h-4 text-indigo-600" />
                  <span>Sertakan Stempel Dinas & Tanda Tangan</span>
                </div>
              </label>
            </div>

          </div>

        </div>

        {/* Right Side: High-fidelity Live Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pratinjau Lembar Cetak Dokumen Resmi (Kertas Ukuran A4)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Skala Cetak 1:1</span>
          </div>

          {/* Paper Canvas Preview Container */}
          <div className="bg-slate-200/70 p-4 md:p-6 rounded-2xl overflow-x-auto flex justify-center border border-slate-200">
            <div className="bg-white shadow-xl w-full max-w-[760px] min-h-[980px] p-8 md:p-12 text-black font-serif text-[12px] leading-relaxed relative flex flex-col justify-between select-text">
              
              {/* DOCUMENT CONTENT */}
              <div className="space-y-4">
                
                {/* 1. KOP SURAT RESMI STANDAR DINAS */}
                <div className="border-b-[3px] border-double border-black pb-3 text-center relative">
                  {/* Left Logo (Tut Wuri Handayani or School Logo) */}
                  <div className="absolute left-0 top-1 w-16 h-16 flex items-center justify-center">
                    {settings.logoSekolah ? (
                      <img 
                        src={settings.logoSekolah} 
                        alt="Logo Sekolah" 
                        className="w-16 h-16 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 border-2 border-black rounded-full flex flex-col items-center justify-center p-1 text-center font-sans">
                        <Building2 className="w-6 h-6 text-slate-800 mb-0.5" />
                        <span className="text-[7px] font-bold uppercase leading-none">KEDIRI</span>
                      </div>
                    )}
                  </div>

                  {/* Institution Texts */}
                  <div className="px-16 space-y-0.5">
                    <h4 className="font-sans font-bold text-xs tracking-wider uppercase">
                      {settings.kopDinasAtas || 'PEMERINTAH KABUPATEN KEDIRI\nDINAS PENDIDIKAN'}
                    </h4>
                    <h2 className="font-sans font-black text-lg tracking-wide uppercase">
                      {settings.namaSekolah || 'SMP NEGERI 3 KRAS'}
                    </h2>
                    <p className="font-sans text-[10px] text-slate-800">
                      NPSN: {settings.npsn || '20511874'} • Status Akreditasi: A (Amat Baik)
                    </p>
                    <p className="font-sans text-[10px] text-slate-700 leading-tight">
                      {settings.alamat || 'Jl. Raya Desa Kras'}, Kec. {settings.kecamatan || 'Kras'}, Kab. {settings.kabupatenKota || 'Kediri'}, Prov. {settings.provinsi || 'Jawa Timur'}
                    </p>
                    <p className="font-sans text-[9px] text-slate-600">
                      Telepon: {settings.telepon || '(0354) 479123'} • Pos-el: {settings.email || 'smpn3kras@dinas.kedirikab.go.id'}
                    </p>
                  </div>
                </div>

                {/* 2. JUDUL SURAT & NOMOR */}
                <div className="text-center pt-2 pb-1 space-y-1">
                  <h3 className="font-bold text-sm uppercase underline tracking-wider">
                    {letterType === 'AKTIF' 
                      ? 'SURAT KETERANGAN SISWA AKTIF' 
                      : letterType === 'BERKELAKUAN_BAIK' 
                        ? 'SURAT KETERANGAN BERKELAKUAN BAIK' 
                        : 'SURAT REKOMENDASI PRESTASI SISWA'}
                  </h3>
                  <p className="font-sans text-[11px] font-semibold text-slate-800 tracking-wide">
                    Nomor : {letterNumber}
                  </p>
                </div>

                {/* 3. PARAGRAF PEMBUKA */}
                <div className="pt-2 text-justify">
                  <p>
                    Yang bertanda tangan di bawah ini, Kepala <strong>{settings.namaSekolah || 'SMP Negeri 3 Kras'}</strong> Kabupaten Kediri, dengan ini menerangkan dengan sesungguhnya bahwa:
                  </p>
                </div>

                {/* 4. TABEL BIODATA SISWA */}
                <div className="pl-6 pr-2 py-1">
                  <table className="w-full text-[12px] border-collapse">
                    <tbody>
                      <tr className="align-top leading-6">
                        <td className="w-48 font-medium">1. Nama Lengkap</td>
                        <td className="w-4">:</td>
                        <td className="font-bold uppercase">{selectedStudent.namaLengkap}</td>
                      </tr>
                      <tr className="align-top leading-6">
                        <td className="font-medium">2. NIS / NISN</td>
                        <td>:</td>
                        <td className="font-mono">{selectedStudent.nis} / {selectedStudent.nisn}</td>
                      </tr>
                      <tr className="align-top leading-6">
                        <td className="font-medium">3. Tempat, Tanggal Lahir</td>
                        <td>:</td>
                        <td>{selectedStudent.tempatLahir || '-'}, {formatIndonesianDate(selectedStudent.tanggalLahir)}</td>
                      </tr>
                      <tr className="align-top leading-6">
                        <td className="font-medium">4. Jenis Kelamin</td>
                        <td>:</td>
                        <td>{selectedStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      </tr>
                      <tr className="align-top leading-6">
                        <td className="font-medium">5. Kelas / Rombongan Belajar</td>
                        <td>:</td>
                        <td className="font-semibold">Kelas {selectedStudent.kelasSaatIni} (Tingkat SMP)</td>
                      </tr>
                      <tr className="align-top leading-6">
                        <td className="font-medium">6. Nama Orang Tua / Wali</td>
                        <td>:</td>
                        <td>{selectedStudent.namaAyah || selectedStudent.namaIbu || selectedStudent.waliNama || '-'}</td>
                      </tr>
                      <tr className="align-top leading-6">
                        <td className="font-medium">7. Pekerjaan Orang Tua</td>
                        <td>:</td>
                        <td>{selectedStudent.pekerjaanAyah || selectedStudent.pekerjaanIbu || selectedStudent.waliPekerjaan || 'Wiraswasta'}</td>
                      </tr>
                      <tr className="align-top leading-6">
                        <td className="font-medium">8. Alamat Tempat Tinggal</td>
                        <td>:</td>
                        <td>{selectedStudent.alamat || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. PARAGRAF ISI PERNYATAAN RESMI */}
                <div className="text-justify space-y-2 pt-1">
                  {letterType === 'AKTIF' && (
                    <>
                      <p>
                        Adalah benar nama tersebut di atas terdaftar sebagai <strong>Peserta Didik Aktif</strong> pada <strong>{settings.namaSekolah || 'SMP Negeri 3 Kras'}</strong> pada Tahun Ajaran <strong>{settings.tahunAjaranAktif || '2025/2026'}</strong> dan tercatat secara resmi dalam Buku Induk Pokok Sekolah serta sistem pangkalan data kementerian (Dapodik).
                      </p>
                      <p>
                        Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan: <br />
                        <span className="font-semibold italic pl-4 block mt-0.5">"{purpose}"</span>
                      </p>
                    </>
                  )}

                  {letterType === 'BERKELAKUAN_BAIK' && (
                    <>
                      <p>
                        Berdasarkan catatan buku bimbingan konseling dan tata tertib sekolah, peserta didik yang bersangkutan selama menempuh pendidikan pada <strong>{settings.namaSekolah || 'SMP Negeri 3 Kras'}</strong> menunjukkan sikap, perilaku, serta budi pekerti yang <strong>BAIK</strong>, tidak pernah terlibat tindak kriminalitas, penyalahgunaan narkotika/zat adiktif, maupun pelanggaran disiplin berat sekolah.
                      </p>
                      <p>
                        Surat keterangan kelakuan baik ini diberikan untuk keperluan: <br />
                        <span className="font-semibold italic pl-4 block mt-0.5">"{purpose}"</span>
                      </p>
                    </>
                  )}

                  {letterType === 'REKOMENDASI' && (
                    <>
                      <p>
                        Dengan ini memberikan <strong>REKOMENDASI</strong> penuh kepada peserta didik tersebut di atas untuk dapat diikutsertakan dalam: <br />
                        <span className="font-semibold italic pl-4 block mt-0.5">"{purpose}"</span>
                      </p>
                      <p>
                        Pertimbangan rekomendasi ini didasarkan atas komitmen akademik, kepribadian, serta rekam jejak prestasi yang bersangkutan: <br />
                        <span className="pl-4 block text-[11px] text-slate-800 italic mt-0.5">"{customNotes}"</span>
                      </p>
                    </>
                  )}

                  <p>
                    Demikian surat keterangan ini dibuat dengan sebenarnya dengan penuh rasa tanggung jawab untuk dapat dipergunakan sebagaimana mestinya.
                  </p>
                </div>

              </div>

              {/* 6. KOLOM TANDA TANGAN & STEMPEL (BAGIAN BAWAH SURAT) */}
              <div className="pt-6 pb-2 flex justify-end">
                <div className="w-64 text-center font-sans space-y-1 relative">
                  <p className="text-[11px] text-slate-800">
                    {settings.kecamatan || 'Kras'}, {letterDate}
                  </p>
                  <p className="text-[11px] font-bold text-slate-900 pb-16">
                    {signatoryTitle},
                  </p>

                  {/* Stamp and Signature Overlay */}
                  {includeStampAndSignature && (
                    <div className="absolute top-5 left-0 right-0 pointer-events-none flex items-center justify-center">
                      {/* Signature graphic */}
                      {settings.tandaTanganKepalaSekolah ? (
                        <img 
                          src={settings.tandaTanganKepalaSekolah} 
                          alt="Tanda Tangan" 
                          className="w-32 h-20 object-contain absolute opacity-90"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-28 h-14 border-b-2 border-indigo-900/40 transform -rotate-6 absolute flex items-center justify-center text-[10px] text-indigo-900 font-mono italic">
                          (Ttd. Sah)
                        </div>
                      )}

                      {/* Official Stamp graphic */}
                      {settings.stempelSekolah ? (
                        <img 
                          src={settings.stempelSekolah} 
                          alt="Stempel Resmi" 
                          className="w-28 h-28 object-contain absolute -left-2 top-0 opacity-80 mix-blend-multiply pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-24 h-24 border-2 border-indigo-700 rounded-full flex flex-col items-center justify-center p-1 text-center font-sans text-indigo-800 text-[8px] font-bold uppercase tracking-tighter opacity-70 transform -rotate-12 absolute -left-2 top-1">
                          <span className="border-b border-indigo-700 pb-0.5">KEMENDIKBUD</span>
                          <span className="my-0.5">{settings.namaSekolah || 'SMPN 3 KRAS'}</span>
                          <span className="border-t border-indigo-700 pt-0.5">KAB. KEDIRI</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Signatory Full Name & NIP */}
                  <div className="pt-2">
                    <p className="text-xs font-bold underline uppercase tracking-wide">
                      {signatoryName}
                    </p>
                    <p className="text-[10px] font-mono text-slate-700">
                      NIP. {signatoryNip}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* PRINT-ONLY VIEW (Hidden on screen, active on Ctrl+P) */}
      <div className="print-only hidden font-serif text-[12pt] leading-relaxed text-black p-4">
        {/* KOP SURAT RESMI */}
        <div className="border-b-[3px] border-double border-black pb-3 text-center relative mb-4">
          <div className="absolute left-0 top-0 w-20 h-20 flex items-center justify-center">
            {settings.logoSekolah ? (
              <img 
                src={settings.logoSekolah} 
                alt="Logo" 
                className="w-20 h-20 object-contain" 
              />
            ) : (
              <div className="w-16 h-16 border-2 border-black rounded-full flex flex-col items-center justify-center text-center font-sans">
                <span className="text-[9pt] font-bold uppercase">KEDIRI</span>
              </div>
            )}
          </div>

          <div className="px-20 space-y-0.5">
            <h4 className="font-sans font-bold text-[10pt] uppercase tracking-wider">
              {settings.kopDinasAtas || 'PEMERINTAH KABUPATEN KEDIRI\nDINAS PENDIDIKAN'}
            </h4>
            <h2 className="font-sans font-black text-[15pt] uppercase tracking-wide">
              {settings.namaSekolah || 'SMP NEGERI 3 KRAS'}
            </h2>
            <p className="font-sans text-[9pt]">
              NPSN: {settings.npsn || '20511874'} • Status Akreditasi: A (Amat Baik)
            </p>
            <p className="font-sans text-[8.5pt]">
              {settings.alamat || 'Jl. Raya Desa Kras'}, Kec. {settings.kecamatan || 'Kras'}, Kab. {settings.kabupatenKota || 'Kediri'}, Prov. {settings.provinsi || 'Jawa Timur'}
            </p>
            <p className="font-sans text-[8pt]">
              Telepon: {settings.telepon || '(0354) 479123'} • Pos-el: {settings.email || 'smpn3kras@dinas.kedirikab.go.id'}
            </p>
          </div>
        </div>

        {/* JUDUL */}
        <div className="text-center pt-2 pb-2 space-y-1">
          <h3 className="font-bold text-[13pt] uppercase underline">
            {letterType === 'AKTIF' 
              ? 'SURAT KETERANGAN SISWA AKTIF' 
              : letterType === 'BERKELAKUAN_BAIK' 
                ? 'SURAT KETERANGAN BERKELAKUAN BAIK' 
                : 'SURAT REKOMENDASI PRESTASI SISWA'}
          </h3>
          <p className="font-sans text-[10pt] font-semibold">
            Nomor : {letterNumber}
          </p>
        </div>

        {/* PEMBUKA */}
        <p className="pt-2 text-justify">
          Yang bertanda tangan di bawah ini, Kepala <strong>{settings.namaSekolah || 'SMP Negeri 3 Kras'}</strong> Kabupaten Kediri, dengan ini menerangkan dengan sesungguhnya bahwa:
        </p>

        {/* BIODATA */}
        <div className="pl-6 py-2">
          <table className="w-full text-[11pt]">
            <tbody>
              <tr className="align-top leading-7">
                <td className="w-56">1. Nama Lengkap</td>
                <td className="w-4">:</td>
                <td className="font-bold uppercase">{selectedStudent.namaLengkap}</td>
              </tr>
              <tr className="align-top leading-7">
                <td>2. NIS / NISN</td>
                <td>:</td>
                <td>{selectedStudent.nis} / {selectedStudent.nisn}</td>
              </tr>
              <tr className="align-top leading-7">
                <td>3. Tempat, Tanggal Lahir</td>
                <td>:</td>
                <td>{selectedStudent.tempatLahir || '-'}, {formatIndonesianDate(selectedStudent.tanggalLahir)}</td>
              </tr>
              <tr className="align-top leading-7">
                <td>4. Jenis Kelamin</td>
                <td>:</td>
                <td>{selectedStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
              </tr>
              <tr className="align-top leading-7">
                <td>5. Kelas / Rombongan Belajar</td>
                <td>:</td>
                <td className="font-semibold">Kelas {selectedStudent.kelasSaatIni} (Tingkat SMP)</td>
              </tr>
              <tr className="align-top leading-7">
                <td>6. Nama Orang Tua / Wali</td>
                <td>:</td>
                <td>{selectedStudent.namaAyah || selectedStudent.namaIbu || selectedStudent.waliNama || '-'}</td>
              </tr>
              <tr className="align-top leading-7">
                <td>7. Pekerjaan Orang Tua</td>
                <td>:</td>
                <td>{selectedStudent.pekerjaanAyah || selectedStudent.pekerjaanIbu || selectedStudent.waliPekerjaan || 'Wiraswasta'}</td>
              </tr>
              <tr className="align-top leading-7">
                <td>8. Alamat Tempat Tinggal</td>
                <td>:</td>
                <td>{selectedStudent.alamat || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ISI */}
        <div className="space-y-3 pt-2 text-justify">
          {letterType === 'AKTIF' && (
            <>
              <p>
                Adalah benar nama tersebut di atas terdaftar sebagai <strong>Peserta Didik Aktif</strong> pada <strong>{settings.namaSekolah || 'SMP Negeri 3 Kras'}</strong> pada Tahun Ajaran <strong>{settings.tahunAjaranAktif || '2025/2026'}</strong> dan tercatat secara resmi dalam Buku Induk Pokok Sekolah serta sistem pangkalan data kementerian (Dapodik).
              </p>
              <p>
                Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan: <br />
                <span className="font-semibold italic pl-6 block mt-1">"{purpose}"</span>
              </p>
            </>
          )}

          {letterType === 'BERKELAKUAN_BAIK' && (
            <>
              <p>
                Berdasarkan catatan buku bimbingan konseling dan tata tertib sekolah, peserta didik yang bersangkutan selama menempuh pendidikan pada <strong>{settings.namaSekolah || 'SMP Negeri 3 Kras'}</strong> menunjukkan sikap, perilaku, serta budi pekerti yang <strong>BAIK</strong>, tidak pernah terlibat tindak kriminalitas, penyalahgunaan narkotika/zat adiktif, maupun pelanggaran disiplin berat sekolah.
              </p>
              <p>
                Surat keterangan kelakuan baik ini diberikan untuk keperluan: <br />
                <span className="font-semibold italic pl-6 block mt-1">"{purpose}"</span>
              </p>
            </>
          )}

          {letterType === 'REKOMENDASI' && (
            <>
              <p>
                Dengan ini memberikan <strong>REKOMENDASI</strong> penuh kepada peserta didik tersebut di atas untuk dapat diikutsertakan dalam: <br />
                <span className="font-semibold italic pl-6 block mt-1">"{purpose}"</span>
              </p>
              <p>
                Pertimbangan rekomendasi ini didasarkan atas komitmen akademik, kepribadian, serta rekam jejak prestasi yang bersangkutan: <br />
                <span className="pl-6 block text-[10pt] italic mt-1">"{customNotes}"</span>
              </p>
            </>
          )}

          <p>
            Demikian surat keterangan ini dibuat dengan sebenarnya dengan penuh rasa tanggung jawab untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* TANDA TANGAN */}
        <div className="pt-10 flex justify-end">
          <div className="w-72 text-center font-sans space-y-1 relative">
            <p className="text-[11pt]">
              {settings.kecamatan || 'Kras'}, {letterDate}
            </p>
            <p className="text-[11pt] font-bold pb-24">
              {signatoryTitle},
            </p>

            {/* Stamp and Signature Overlay */}
            {includeStampAndSignature && (
              <div className="absolute top-7 left-0 right-0 pointer-events-none flex items-center justify-center">
                {settings.tandaTanganKepalaSekolah && (
                  <img 
                    src={settings.tandaTanganKepalaSekolah} 
                    alt="Ttd" 
                    className="w-36 h-24 object-contain absolute opacity-90" 
                  />
                )}
                {settings.stempelSekolah && (
                  <img 
                    src={settings.stempelSekolah} 
                    alt="Stempel" 
                    className="w-32 h-32 object-contain absolute -left-2 top-0 opacity-85 mix-blend-multiply" 
                  />
                )}
              </div>
            )}

            <div>
              <p className="text-[11pt] font-bold underline uppercase">
                {signatoryName}
              </p>
              <p className="text-[10pt] font-mono">
                NIP. {signatoryNip}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
