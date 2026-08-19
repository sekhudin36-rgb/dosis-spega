/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student } from '../types';
import { DEFAULT_BOY_PHOTO, DEFAULT_GIRL_PHOTO } from '../data/mockStudents';
import { X, Save, ArrowLeft, ArrowRight } from 'lucide-react';

interface StudentFormProps {
  student?: Student; // If provided, we are editing. If undefined, we are adding.
  onSave: (student: Student) => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSave, onCancel }: StudentFormProps) {
  const isEdit = !!student;
  
  // Set up local state for all student fields (with defaults matching Buku Induk structure)
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'riwayatAkademik'>>({
    nis: student?.nis || '',
    nisn: student?.nisn || '',
    namaLengkap: student?.namaLengkap || '',
    namaPanggilan: student?.namaPanggilan || '',
    jenisKelamin: student?.jenisKelamin || 'L',
    tempatLahir: student?.tempatLahir || '',
    tanggalLahir: student?.tanggalLahir || '2011-01-01',
    agama: student?.agama || 'Islam',
    kewarganegaraan: student?.kewarganegaraan || 'WNI',
    alamat: student?.alamat || '',
    telepon: student?.telepon || '',
    email: student?.email || '',
    kelasSaatIni: student?.kelasSaatIni || '7-A',
    tahunMasuk: student?.tahunMasuk || String(new Date().getFullYear()),
    statusSiswa: student?.statusSiswa || 'Aktif',
    foto: student?.foto || DEFAULT_BOY_PHOTO,
    
    // Additional A. KETERANGAN TENTANG DIRI SISWA
    anakKe: student?.anakKe || '1',
    jumlahSaudaraKandung: student?.jumlahSaudaraKandung || '0',
    jumlahSaudaraTiri: student?.jumlahSaudaraTiri || '0',
    jumlahSaudaraAngkat: student?.jumlahSaudaraAngkat || '0',
    statusYatimPiatu: student?.statusYatimPiatu || 'Bukan',
    bahasaRumah: student?.bahasaRumah || 'Jawa / Indonesia',

    // B. KETERANGAN TEMPAT TINGGAL
    tinggalDengan: student?.tinggalDengan || 'Bersama orang tua',
    jarakSekolah: student?.jarakSekolah || '',

    // C. KETERANGAN KESEHATAN
    golonganDarah: student?.golonganDarah || '',
    penyakitDerita: student?.penyakitDerita || '',
    kelainanJasmani: student?.kelainanJasmani || '',
    tinggiBadan: student?.tinggiBadan || '',
    beratBadan: student?.beratBadan || '',

    // D. KETERANGAN PENDIDIKAN
    sttbLulusanDari: student?.sttbLulusanDari || '',
    sttbNo: student?.sttbNo || '',
    sttbLamaBelajar: student?.sttbLamaBelajar || '',
    pindahanDariSekolah: student?.pindahanDariSekolah || '',
    pindahanAlasan: student?.pindahanAlasan || '',
    diterimaTingkat: student?.diterimaTingkat || '',
    diterimaKelompok: student?.diterimaKelompok || '',
    diterimaJurusan: student?.diterimaJurusan || '',
    diterimaTanggal: student?.diterimaTanggal || '',

    // Data Orang Tua / Wali
    namaAyah: student?.namaAyah || '',
    pekerjaanAyah: student?.pekerjaanAyah || '',
    namaIbu: student?.namaIbu || '',
    pekerjaanIbu: student?.pekerjaanIbu || '',
    teleponOrangTua: student?.teleponOrangTua || '',
    alamatOrangTua: student?.alamatOrangTua || '',

    // E. KETERANGAN TENTANG AYAH KANDUNG
    ayahTempatLahir: student?.ayahTempatLahir || '',
    ayahTanggalLahir: student?.ayahTanggalLahir || '',
    ayahAgama: student?.ayahAgama || 'Islam',
    ayahKewarganegaraan: student?.ayahKewarganegaraan || 'WNI',
    ayahPendidikan: student?.ayahPendidikan || '',
    ayahPenghasilan: student?.ayahPenghasilan || '',
    ayahStatusHidup: student?.ayahStatusHidup || 'Masih Hidup',

    // F. KETERANGAN TENTANG IBU KANDUNG
    ibuTempatLahir: student?.ibuTempatLahir || '',
    ibuTanggalLahir: student?.ibuTanggalLahir || '',
    ibuAgama: student?.ibuAgama || 'Islam',
    ibuKewarganegaraan: student?.ibuKewarganegaraan || 'WNI',
    ibuPendidikan: student?.ibuPendidikan || '',
    ibuPenghasilan: student?.ibuPenghasilan || '',
    ibuStatusHidup: student?.ibuStatusHidup || 'Masih Hidup',

    // G. KETERANGAN TENTANG WALI
    waliNama: student?.waliNama || '',
    waliTempatLahir: student?.waliTempatLahir || '',
    waliTanggalLahir: student?.waliTanggalLahir || '',
    waliAgama: student?.waliAgama || '',
    waliKewarganegaraan: student?.waliKewarganegaraan || '',
    waliPendidikan: student?.waliPendidikan || '',
    waliPekerjaan: student?.waliPekerjaan || '',
    waliPenghasilan: student?.waliPenghasilan || '',
    waliAlamatTelepon: student?.waliAlamatTelepon || '',

    // H. KEGEMARAN SISWA
    gemarKesenian: student?.gemarKesenian || '',
    gemarOlahraga: student?.gemarOlahraga || '',
    gemarOrganisasi: student?.gemarOrganisasi || '',
    gemarLainnya: student?.gemarLainnya || ''
  });

  const [activeTab, setActiveTab] = useState<'pribadi' | 'pendidikan' | 'keluarga' | 'kegemaran'>('pribadi');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Update default photo if gender changes and photo is still default
      if (name === 'jenisKelamin' && (prev.foto === DEFAULT_BOY_PHOTO || prev.foto === DEFAULT_GIRL_PHOTO)) {
        updated.foto = value === 'L' ? DEFAULT_BOY_PHOTO : DEFAULT_GIRL_PHOTO;
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple verification
    if (!formData.nis.trim() || !formData.nisn.trim() || !formData.namaLengkap.trim()) {
      setErrorMsg('Harap lengkapi Kolom Wajib (NIS, NISN, dan Nama Lengkap)');
      setActiveTab('pribadi');
      return;
    }

    const savedStudent: Student = {
      ...student,
      id: student?.id || `siswa-${Date.now()}`,
      riwayatAkademik: student?.riwayatAkademik || {},
      ...formData
    };

    onSave(savedStudent);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden max-w-4xl mx-auto">
      {/* Form Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Ubah Data Buku Induk Siswa' : 'Tambah Data Buku Induk Baru'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Lengkapi rincian formulir isian identitas lengkap sesuai format Buku Induk UPTD SMPN 3 Kras.
          </p>
        </div>
        <button 
          type="button"
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form Tab Toggles */}
        <div className="flex flex-wrap border-b border-slate-100 px-6 bg-slate-50/20">
          <button
            type="button"
            onClick={() => setActiveTab('pribadi')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pribadi' 
                ? 'border-slate-800 text-slate-800' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            1. Diri Siswa & Kesehatan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pendidikan')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pendidikan' 
                ? 'border-slate-800 text-slate-800' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            2. Riwayat Pendidikan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keluarga')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'keluarga' 
                ? 'border-slate-800 text-slate-800' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            3. Orang Tua & Wali
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kegemaran')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'kegemaran' 
                ? 'border-slate-800 text-slate-800' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            4. Kegemaran & Status
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Identitas Pribadi & Kesehatan */}
        {activeTab === 'pribadi' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">A. Keterangan Tentang Diri Siswa</h3>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700 block">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                name="namaLengkap" 
                value={formData.namaLengkap} 
                onChange={handleChange}
                placeholder="cth: AHMAD ADITYA SAPUTRA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
                required
              />
            </div>

            {/* Nama Panggilan */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Nama Panggilan</label>
              <input 
                type="text" 
                name="namaPanggilan" 
                value={formData.namaPanggilan} 
                onChange={handleChange}
                placeholder="cth: ADITYA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Jenis Kelamin</label>
              <select 
                name="jenisKelamin" 
                value={formData.jenisKelamin} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            {/* NIS */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Nomor Induk Siswa (NIS) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                name="nis" 
                value={formData.nis} 
                onChange={handleChange}
                placeholder="cth: 3018"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none font-mono"
                required
              />
            </div>

            {/* NISN */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                NISN <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                name="nisn" 
                value={formData.nisn} 
                onChange={handleChange}
                placeholder="cth: 0107695903"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none font-mono"
                required
              />
            </div>

            {/* Tempat Lahir */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tempat Lahir</label>
              <input 
                type="text" 
                name="tempatLahir" 
                value={formData.tempatLahir} 
                onChange={handleChange}
                placeholder="cth: KEDIRI"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Tanggal Lahir */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tanggal Lahir</label>
              <input 
                type="date" 
                name="tanggalLahir" 
                value={formData.tanggalLahir} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Agama */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Agama / Keyakinan</label>
              <select 
                name="agama" 
                value={formData.agama} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen Protestan">Kristen Protestan</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            {/* Kewarganegaraan */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Kewarganegaraan</label>
              <input 
                type="text" 
                name="kewarganegaraan" 
                value={formData.kewarganegaraan} 
                onChange={handleChange}
                placeholder="cth: WNI"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Anak Keberapa */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Anak Keberapa</label>
              <input 
                type="text" 
                name="anakKe" 
                value={formData.anakKe} 
                onChange={handleChange}
                placeholder="cth: 1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Jumlah Saudara */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-bold text-slate-500 block mb-0.5 text-[10px]">Saudara Kandung</label>
                <input 
                  type="text" 
                  name="jumlahSaudaraKandung" 
                  value={formData.jumlahSaudaraKandung} 
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none text-center"
                />
              </div>
              <div>
                <label className="font-bold text-slate-500 block mb-0.5 text-[10px]">Saudara Tiri</label>
                <input 
                  type="text" 
                  name="jumlahSaudaraTiri" 
                  value={formData.jumlahSaudaraTiri} 
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none text-center"
                />
              </div>
              <div>
                <label className="font-bold text-slate-500 block mb-0.5 text-[10px]">Saudara Angkat</label>
                <input 
                  type="text" 
                  name="jumlahSaudaraAngkat" 
                  value={formData.jumlahSaudaraAngkat} 
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none text-center"
                />
              </div>
            </div>

            {/* Status Yatim Piatu */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Anak Yatim / Yatim Piatu / Bukan</label>
              <input 
                type="text" 
                name="statusYatimPiatu" 
                value={formData.statusYatimPiatu} 
                onChange={handleChange}
                placeholder="cth: Bukan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Bahasa Sehari-hari */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Bahasa Sehari-hari di Rumah</label>
              <input 
                type="text" 
                name="bahasaRumah" 
                value={formData.bahasaRumah} 
                onChange={handleChange}
                placeholder="cth: Jawa / Indonesia"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">B. Keterangan Tempat Tinggal Siswa</h3>
            </div>

            {/* Alamat */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700 block">Alamat Tinggal Siswa</label>
              <textarea 
                name="alamat" 
                value={formData.alamat} 
                onChange={handleChange}
                rows={2}
                placeholder="cth: Dsn Bulur, RT.01/RW.02, Desa Kras, Kediri"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Telepon */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">No. HP / Telepon Siswa</label>
              <input 
                type="text" 
                name="telepon" 
                value={formData.telepon} 
                onChange={handleChange}
                placeholder="cth: 085856298331"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Alamat Email Siswa</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="cth: ahmad.aditya@siswa.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Tinggal Dengan */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tinggal Dengan Orang Tua / Saudara / Mandiri</label>
              <input 
                type="text" 
                name="tinggalDengan" 
                value={formData.tinggalDengan} 
                onChange={handleChange}
                placeholder="cth: Bersama orang tua"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Jarak ke Sekolah */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Jarak Tempat Tinggal ke Sekolah (Km)</label>
              <input 
                type="text" 
                name="jarakSekolah" 
                value={formData.jarakSekolah} 
                onChange={handleChange}
                placeholder="cth: 4"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">C. Keterangan Kesehatan Siswa</h3>
            </div>

            {/* Golongan Darah */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Golongan Darah</label>
              <input 
                type="text" 
                name="golonganDarah" 
                value={formData.golonganDarah} 
                onChange={handleChange}
                placeholder="cth: A / B / AB / O / -"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Penyakit Derita */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Penyakit yang Pernah Diderita</label>
              <input 
                type="text" 
                name="penyakitDerita" 
                value={formData.penyakitDerita} 
                onChange={handleChange}
                placeholder="cth: Typhus, Demam Berdarah, dll"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Kelainan Jasmani */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Kelainan Jasmani / Disabilitas</label>
              <input 
                type="text" 
                name="kelainanJasmani" 
                value={formData.kelainanJasmani} 
                onChange={handleChange}
                placeholder="cth: Tidak ada"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Tinggi & Berat Badan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Tinggi Badan (Cm)</label>
                <input 
                  type="text" 
                  name="tinggiBadan" 
                  value={formData.tinggiBadan} 
                  onChange={handleChange}
                  placeholder="cth: 163"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Berat Badan (Kg)</label>
                <input 
                  type="text" 
                  name="beratBadan" 
                  value={formData.beratBadan} 
                  onChange={handleChange}
                  placeholder="cth: 48"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Riwayat Pendidikan */}
        {activeTab === 'pendidikan' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs animate-fade-in">
            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">D. Keterangan Pendidikan</h3>
            </div>

            {/* Lulusan dari */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700 block">Pendidikan Sebelumnya (Lulusan Dari)</label>
              <input 
                type="text" 
                name="sttbLulusanDari" 
                value={formData.sttbLulusanDari} 
                onChange={handleChange}
                placeholder="cth: SDN Rejomulyo 2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* STTB */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tanggal dan Nomor STTB / Ijazah</label>
              <input 
                type="text" 
                name="sttbNo" 
                value={formData.sttbNo} 
                onChange={handleChange}
                placeholder="cth: DN-01/D-SD/06/12345"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Lama Belajar */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Lama Belajar di Jenjang Sebelumnya</label>
              <input 
                type="text" 
                name="sttbLamaBelajar" 
                value={formData.sttbLamaBelajar} 
                onChange={handleChange}
                placeholder="cth: 6 Tahun"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">Data Pindahan (Hanya diisi untuk siswa pindahan)</h3>
            </div>

            {/* Dari Sekolah & Alasan */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Pindahan Dari Sekolah</label>
              <input 
                type="text" 
                name="pindahanDariSekolah" 
                value={formData.pindahanDariSekolah} 
                onChange={handleChange}
                placeholder="cth: SMPN 1 Wates"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Alasan Pindahan</label>
              <input 
                type="text" 
                name="pindahanAlasan" 
                value={formData.pindahanAlasan} 
                onChange={handleChange}
                placeholder="cth: Ikut orang tua pindah rumah"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">Diterima Di Sekolah Ini (UPTD SMPN 3 Kras)</h3>
            </div>

            {/* Diterima Tingkat & Kelompok */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Di Tingkat / Kelas</label>
              <input 
                type="text" 
                name="diterimaTingkat" 
                value={formData.diterimaTingkat} 
                onChange={handleChange}
                placeholder="cth: 7"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Di Kelompok / Rombel</label>
              <input 
                type="text" 
                name="diterimaKelompok" 
                value={formData.diterimaKelompok} 
                onChange={handleChange}
                placeholder="cth: A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Jurusan & Tanggal Diterima */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Jurusan (Jika Ada)</label>
              <input 
                type="text" 
                name="diterimaJurusan" 
                value={formData.diterimaJurusan} 
                onChange={handleChange}
                placeholder="cth: Umum"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tanggal Diterima</label>
              <input 
                type="date" 
                name="diterimaTanggal" 
                value={formData.diterimaTanggal} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Orang Tua & Wali */}
        {activeTab === 'keluarga' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs animate-fade-in">
            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">E. Keterangan Tentang Ayah Kandung</h3>
            </div>

            {/* Nama Ayah */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Nama Lengkap Ayah Kandung</label>
              <input 
                type="text" 
                name="namaAyah" 
                value={formData.namaAyah} 
                onChange={handleChange}
                placeholder="cth: Muhammad Munir"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Pekerjaan Ayah */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Pekerjaan Ayah</label>
              <input 
                type="text" 
                name="pekerjaanAyah" 
                value={formData.pekerjaanAyah} 
                onChange={handleChange}
                placeholder="cth: Pedagang Kecil"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Tempat & Tanggal Lahir Ayah */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tempat Lahir Ayah</label>
              <input 
                type="text" 
                name="ayahTempatLahir" 
                value={formData.ayahTempatLahir} 
                onChange={handleChange}
                placeholder="cth: Kediri"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tanggal / Tahun Lahir Ayah</label>
              <input 
                type="text" 
                name="ayahTanggalLahir" 
                value={formData.ayahTanggalLahir} 
                onChange={handleChange}
                placeholder="cth: 1980"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Agama & Kewarganegaraan Ayah */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Agama Ayah</label>
              <input 
                type="text" 
                name="ayahAgama" 
                value={formData.ayahAgama} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Kewarganegaraan Ayah</label>
              <input 
                type="text" 
                name="ayahKewarganegaraan" 
                value={formData.ayahKewarganegaraan} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Pendidikan & Penghasilan Ayah */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Pendidikan Ayah</label>
              <input 
                type="text" 
                name="ayahPendidikan" 
                value={formData.ayahPendidikan} 
                onChange={handleChange}
                placeholder="cth: SMP / sederajat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Penghasilan Ayah per Bulan</label>
              <input 
                type="text" 
                name="ayahPenghasilan" 
                value={formData.ayahPenghasilan} 
                onChange={handleChange}
                placeholder="cth: Rp. 500,000 - Rp. 999,999"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Status Hidup Ayah */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Status Hidup Ayah (Tulis Tahun Wafat jika meninggal)</label>
              <input 
                type="text" 
                name="ayahStatusHidup" 
                value={formData.ayahStatusHidup} 
                onChange={handleChange}
                placeholder="cth: Masih Hidup atau 2021"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">F. Keterangan Tentang Ibu Kandung</h3>
            </div>

            {/* Nama Ibu */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Nama Lengkap Ibu Kandung</label>
              <input 
                type="text" 
                name="namaIbu" 
                value={formData.namaIbu} 
                onChange={handleChange}
                placeholder="cth: FITRIYANI"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Pekerjaan Ibu */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Pekerjaan Ibu</label>
              <input 
                type="text" 
                name="pekerjaanIbu" 
                value={formData.pekerjaanIbu} 
                onChange={handleChange}
                placeholder="cth: Buruh"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Tempat & Tanggal Lahir Ibu */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tempat Lahir Ibu</label>
              <input 
                type="text" 
                name="ibuTempatLahir" 
                value={formData.ibuTempatLahir} 
                onChange={handleChange}
                placeholder="cth: Kediri"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tanggal / Tahun Lahir Ibu</label>
              <input 
                type="text" 
                name="ibuTanggalLahir" 
                value={formData.ibuTanggalLahir} 
                onChange={handleChange}
                placeholder="cth: 1985"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Agama & Kewarganegaraan Ibu */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Agama Ibu</label>
              <input 
                type="text" 
                name="ibuAgama" 
                value={formData.ibuAgama} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Kewarganegaraan Ibu</label>
              <input 
                type="text" 
                name="ibuKewarganegaraan" 
                value={formData.ibuKewarganegaraan} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Pendidikan & Penghasilan Ibu */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Pendidikan Ibu</label>
              <input 
                type="text" 
                name="ibuPendidikan" 
                value={formData.ibuPendidikan} 
                onChange={handleChange}
                placeholder="cth: SMP / sederajat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Penghasilan Ibu per Bulan</label>
              <input 
                type="text" 
                name="ibuPenghasilan" 
                value={formData.ibuPenghasilan} 
                onChange={handleChange}
                placeholder="cth: Rp. 500,000 - Rp. 999,999"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Status Hidup Ibu */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Status Hidup Ibu (Tulis Tahun Wafat jika meninggal)</label>
              <input 
                type="text" 
                name="ibuStatusHidup" 
                value={formData.ibuStatusHidup} 
                onChange={handleChange}
                placeholder="cth: Masih Hidup"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">Kontak & Alamat Orang Tua</h3>
            </div>

            {/* Telepon Orang Tua */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">No. HP Orang Tua</label>
              <input 
                type="text" 
                name="teleponOrangTua" 
                value={formData.teleponOrangTua} 
                onChange={handleChange}
                placeholder="cth: 085856298331"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Alamat Orang Tua */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700 block">Alamat Lengkap Orang Tua (Sama dengan siswa jika kosong)</label>
              <textarea 
                name="alamatOrangTua" 
                value={formData.alamatOrangTua} 
                onChange={handleChange}
                rows={2}
                placeholder="Sama dengan alamat tinggal siswa..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">G. Keterangan Tentang Wali (Diisi jika tidak tinggal bersama orang tua)</h3>
            </div>

            {/* Wali Nama & Pekerjaan */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Nama Lengkap Wali</label>
              <input 
                type="text" 
                name="waliNama" 
                value={formData.waliNama} 
                onChange={handleChange}
                placeholder="cth: Bambang Santoso"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Pekerjaan Wali</label>
              <input 
                type="text" 
                name="waliPekerjaan" 
                value={formData.waliPekerjaan} 
                onChange={handleChange}
                placeholder="cth: Karyawan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Wali Tempat, Tanggal, Agama, Kewarganegaraan, Pendidikan, Penghasilan, Alamat */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tempat & Tanggal Lahir Wali</label>
              <input 
                type="text" 
                name="waliTempatLahir" 
                value={`${formData.waliTempatLahir || ''}${formData.waliTanggalLahir ? ', ' + formData.waliTanggalLahir : ''}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setFormData(prev => ({
                    ...prev,
                    waliTempatLahir: parts[0]?.trim() || '',
                    waliTanggalLahir: parts[1]?.trim() || ''
                  }));
                }}
                placeholder="cth: Kediri, 1975"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Pendidikan Wali</label>
              <input 
                type="text" 
                name="waliPendidikan" 
                value={formData.waliPendidikan} 
                onChange={handleChange}
                placeholder="cth: Tidak sekolah atau SMA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Penghasilan Wali per Bulan</label>
              <input 
                type="text" 
                name="waliPenghasilan" 
                value={formData.waliPenghasilan} 
                onChange={handleChange}
                placeholder="cth: Rp 1.500.000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Alamat & Nomor Telepon Wali</label>
              <input 
                type="text" 
                name="waliAlamatTelepon" 
                value={formData.waliAlamatTelepon} 
                onChange={handleChange}
                placeholder="cth: Jl. Mawar No. 10 / 0812xxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Kegemaran & Status */}
        {activeTab === 'kegemaran' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs animate-fade-in">
            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">H. Kegemaran Siswa</h3>
            </div>

            {/* Kegemaran Kesenian & Olahraga */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Kesenian</label>
              <input 
                type="text" 
                name="gemarKesenian" 
                value={formData.gemarKesenian} 
                onChange={handleChange}
                placeholder="cth: Seni Musik, Seni Lukis"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Olahraga</label>
              <input 
                type="text" 
                name="gemarOlahraga" 
                value={formData.gemarOlahraga} 
                onChange={handleChange}
                placeholder="cth: Praja Muda Karana (Pramuka), Sepakbola"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            {/* Kegemaran Organisasi & Lainnya */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Organisasi / Kemasyarakatan</label>
              <input 
                type="text" 
                name="gemarOrganisasi" 
                value={formData.gemarOrganisasi} 
                onChange={handleChange}
                placeholder="cth: OSIS, PMR"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Kegemaran Lain-lain</label>
              <input 
                type="text" 
                name="gemarLainnya" 
                value={formData.gemarLainnya} 
                onChange={handleChange}
                placeholder="cth: Membaca, Menulis"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">Status & Penempatan Siswa Saat Ini</h3>
            </div>

            {/* Kelas Saat Ini */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Kelas Saat Ini</label>
              <input 
                type="text" 
                name="kelasSaatIni" 
                value={formData.kelasSaatIni} 
                onChange={handleChange}
                placeholder="cth: 7-A / 8-A / 9-B"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none font-bold"
              />
            </div>

            {/* Tahun Masuk */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tahun Masuk Sekolah</label>
              <input 
                type="text" 
                name="tahunMasuk" 
                value={formData.tahunMasuk} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none font-mono"
              />
            </div>

            {/* Status Siswa */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Status Siswa</label>
              <select 
                name="statusSiswa" 
                value={formData.statusSiswa} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Lulus">Lulus</option>
                <option value="Pindah">Pindah</option>
                <option value="Keluar">Keluar</option>
              </select>
            </div>
          </div>
        )}

        {/* Form Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4.5 flex items-center justify-between">
          <div>
            {activeTab === 'pribadi' && (
              <button
                type="button"
                onClick={() => setActiveTab('pendidikan')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <span>Selanjutnya: Riwayat Pendidikan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {activeTab === 'pendidikan' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('pribadi')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya: Diri Siswa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('keluarga')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Selanjutnya: Orang Tua & Wali</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {activeTab === 'keluarga' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('pendidikan')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya: Pendidikan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('kegemaran')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Selanjutnya: Kegemaran & Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {activeTab === 'kegemaran' && (
              <button
                type="button"
                onClick={() => setActiveTab('keluarga')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya: Orang Tua & Wali</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
