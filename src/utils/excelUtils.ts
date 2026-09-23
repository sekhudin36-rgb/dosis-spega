/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Student, LIST_MAPEL_DEFAULT, Extracurricular } from '../types';
import { DEFAULT_BOY_PHOTO, DEFAULT_GIRL_PHOTO } from '../data/mockStudents';

// Headers for the Excel template
const EXCEL_HEADERS = [
  'NIS',
  'NISN',
  'Nama Lengkap',
  'Nama Panggilan',
  'Jenis Kelamin (L/P)',
  'Tempat Lahir',
  'Tanggal Lahir (YYYY-MM-DD)',
  'Agama',
  'Kewarganegaraan',
  'Anak Keberapa',
  'Jumlah Saudara Kandung',
  'Jumlah Saudara Tiri',
  'Jumlah Saudara Angkat',
  'Status Yatim Piatu',
  'Bahasa Sehari-hari di Rumah',
  'Alamat',
  'Telepon',
  'Email',
  'Tinggal Dengan',
  'Jarak Tempat Tinggal ke Sekolah (Km)',
  'Golongan Darah',
  'Penyakit yang Pernah Diderita',
  'Kelainan Jasmani',
  'Tinggi Badan (Cm)',
  'Berat Badan (Kg)',
  'Pendidikan Sebelumnya Lulusan Dari',
  'Tanggal dan Nomor STTB',
  'Lama Belajar',
  'Pindahan Dari Sekolah',
  'Alasan Pindahan',
  'Diterima di Tingkat',
  'Diterima di Kelompok',
  'Diterima di Jurusan',
  'Diterima Tanggal (YYYY-MM-DD)',
  'Nama Ayah',
  'Tempat Lahir Ayah',
  'Tanggal/Tahun Lahir Ayah',
  'Agama Ayah',
  'Kewarganegaraan Ayah',
  'Pendidikan Ayah',
  'Pekerjaan Ayah',
  'Penghasilan Ayah per Bulan',
  'Alamat & No Telepon Ayah',
  'Status Hidup Ayah (Tahun Meninggal jika wafat)',
  'Nama Ibu',
  'Tempat Lahir Ibu',
  'Tanggal/Tahun Lahir Ibu',
  'Agama Ibu',
  'Kewarganegaraan Ibu',
  'Pendidikan Ibu',
  'Pekerjaan Ibu',
  'Penghasilan Ibu per Bulan',
  'Alamat & No Telepon Ibu',
  'Status Hidup Ibu (Tahun Meninggal jika wafat)',
  'Nama Wali',
  'Tempat Lahir Wali',
  'Tanggal/Tahun Lahir Wali',
  'Agama Wali',
  'Kewarganegaraan Wali',
  'Pendidikan Wali',
  'Pekerjaan Wali',
  'Penghasilan Wali per Bulan',
  'Alamat & No Telepon Wali',
  'Kegemaran Kesenian',
  'Kegemaran Olahraga',
  'Kegemaran Organisasi',
  'Kegemaran Lain-lain',
  'Penerima PIP (Ya/Tidak)',
  'Nomor KIP',
  'Alat Transportasi ke Sekolah',
  'Kelas Saat Ini',
  'Tahun Masuk',
  'Status (Aktif/Lulus/Pindah/Keluar)'
];

/**
 * Downloads a blank Excel template for mass importing students.
 */
export function downloadExcelTemplate() {
  const exampleRow = {
    'NIS': '3018',
    'NISN': '0107695903',
    'Nama Lengkap': 'AHMAD ADITYA SAPUTRA',
    'Nama Panggilan': 'AHMAD ADITYA SAPUTRA',
    'Jenis Kelamin (L/P)': 'L',
    'Tempat Lahir': 'KEDIRI',
    'Tanggal Lahir (YYYY-MM-DD)': '2010-06-27',
    'Agama': 'Islam',
    'Kewarganegaraan': 'WNI',
    'Anak Keberapa': '1',
    'Jumlah Saudara Kandung': '1',
    'Jumlah Saudara Tiri': '',
    'Jumlah Saudara Angkat': '',
    'Status Yatim Piatu': 'Bukan',
    'Bahasa Sehari-hari di Rumah': 'Jawa / Indonesia',
    'Alamat': 'BULUR',
    'Telepon': '085856298331',
    'Email': 'ahmad.aditya@siswa.id',
    'Tinggal Dengan': 'Bersama orang tua',
    'Jarak Tempat Tinggal ke Sekolah (Km)': '4',
    'Golongan Darah': '',
    'Penyakit yang Pernah Diderita': '',
    'Kelainan Jasmani': '',
    'Tinggi Badan (Cm)': '163',
    'Berat Badan (Kg)': '48',
    'Pendidikan Sebelumnya Lulusan Dari': 'SDN Rejomulyo 2',
    'Tanggal dan Nomor STTB': '',
    'Lama Belajar': '',
    'Pindahan Dari Sekolah': '',
    'Alasan Pindahan': '',
    'Diterima di Tingkat': '',
    'Diterima di Kelompok': '',
    'Diterima di Jurusan': '',
    'Diterima Tanggal (YYYY-MM-DD)': '',
    'Nama Ayah': 'Muhammad Munir',
    'Tempat Lahir Ayah': 'Kediri',
    'Tanggal/Tahun Lahir Ayah': '1980',
    'Agama Ayah': 'Islam',
    'Kewarganegaraan Ayah': 'WNI',
    'Pendidikan Ayah': 'SMP / sederajat',
    'Pekerjaan Ayah': 'Pedagang Kecil',
    'Penghasilan Ayah per Bulan': 'Rp. 500,000 - Rp. 999,999',
    'Alamat & No Telepon Ayah': '',
    'Status Hidup Ayah (Tahun Meninggal jika wafat)': '0',
    'Nama Ibu': 'FITRIYANI',
    'Tempat Lahir Ibu': 'Kediri',
    'Tanggal/Tahun Lahir Ibu': '1985',
    'Agama Ibu': 'Islam',
    'Kewarganegaraan Ibu': 'WNI',
    'Pendidikan Ibu': 'SMP / sederajat',
    'Pekerjaan Ibu': 'Buruh',
    'Penghasilan Ibu per Bulan': 'Rp. 500,000 - Rp. 999,999',
    'Alamat & No Telepon Ibu': '',
    'Status Hidup Ibu (Tahun Meninggal jika wafat)': 'Masih Hidup',
    'Nama Wali': '',
    'Tempat Lahir Wali': '',
    'Tanggal/Tahun Lahir Wali': '',
    'Agama Wali': '',
    'Kewarganegaraan Wali': '',
    'Pendidikan Wali': 'Tidak sekolah',
    'Pekerjaan Wali': '',
    'Penghasilan Wali per Bulan': '',
    'Alamat & No Telepon Wali': '',
    'Kegemaran Kesenian': '',
    'Kegemaran Olahraga': 'Praja Muda Karana (Pramuka)',
    'Kegemaran Organisasi': '',
    'Kegemaran Lain-lain': '',
    'Penerima PIP (Ya/Tidak)': 'Ya',
    'Nomor KIP': 'KIP-2023-9981',
    'Alat Transportasi ke Sekolah': 'Sepeda Motor',
    'Kelas Saat Ini': '7-A',
    'Tahun Masuk': '2023',
    'Status (Aktif/Lulus/Pindah/Keluar)': 'Aktif'
  };

  const worksheet = XLSX.utils.json_to_sheet([exampleRow], { header: EXCEL_HEADERS });
  
  // Set column widths for better readability
  const max_widths = EXCEL_HEADERS.map(h => ({ wch: Math.max(h.length + 3, 15) }));
  worksheet['!cols'] = max_widths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Buku Induk');
  
  XLSX.writeFile(workbook, 'Template_Buku_Induk_Siswa.xlsx');
}

/**
 * Exports all students' personal and parent records to an Excel file.
 */
export function exportStudentsToExcel(students: Student[]) {
  const data = students.map(s => ({
    'NIS': s.nis,
    'NISN': s.nisn,
    'Nama Lengkap': s.namaLengkap,
    'Nama Panggilan': s.namaPanggilan,
    'Jenis Kelamin (L/P)': s.jenisKelamin,
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir (YYYY-MM-DD)': s.tanggalLahir,
    'Agama': s.agama,
    'Kewarganegaraan': s.kewarganegaraan,
    'Anak Keberapa': s.anakKe || '',
    'Jumlah Saudara Kandung': s.jumlahSaudaraKandung || '',
    'Jumlah Saudara Tiri': s.jumlahSaudaraTiri || '',
    'Jumlah Saudara Angkat': s.jumlahSaudaraAngkat || '',
    'Status Yatim Piatu': s.statusYatimPiatu || '',
    'Bahasa Sehari-hari di Rumah': s.bahasaRumah || '',
    'Alamat': s.alamat,
    'Telepon': s.telepon,
    'Email': s.email,
    'Tinggal Dengan': s.tinggalDengan || '',
    'Jarak Tempat Tinggal ke Sekolah (Km)': s.jarakSekolah || '',
    'Golongan Darah': s.golonganDarah || '',
    'Penyakit yang Pernah Diderita': s.penyakitDerita || '',
    'Kelainan Jasmani': s.kelainanJasmani || '',
    'Tinggi Badan (Cm)': s.tinggiBadan || '',
    'Berat Badan (Kg)': s.beratBadan || '',
    'Pendidikan Sebelumnya Lulusan Dari': s.sttbLulusanDari || '',
    'Tanggal dan Nomor STTB': s.sttbNo || '',
    'Lama Belajar': s.sttbLamaBelajar || '',
    'Pindahan Dari Sekolah': s.pindahanDariSekolah || '',
    'Alasan Pindahan': s.pindahanAlasan || '',
    'Diterima di Tingkat': s.diterimaTingkat || '',
    'Diterima di Kelompok': s.diterimaKelompok || '',
    'Diterima di Jurusan': s.diterimaJurusan || '',
    'Diterima Tanggal (YYYY-MM-DD)': s.diterimaTanggal || '',
    'Nama Ayah': s.namaAyah,
    'Tempat Lahir Ayah': s.ayahTempatLahir || '',
    'Tanggal/Tahun Lahir Ayah': s.ayahTanggalLahir || '',
    'Agama Ayah': s.ayahAgama || '',
    'Kewarganegaraan Ayah': s.ayahKewarganegaraan || '',
    'Pendidikan Ayah': s.ayahPendidikan || '',
    'Pekerjaan Ayah': s.pekerjaanAyah,
    'Penghasilan Ayah per Bulan': s.ayahPenghasilan || '',
    'Alamat & No Telepon Ayah': s.teleponOrangTua || s.alamatOrangTua || '',
    'Status Hidup Ayah (Tahun Meninggal jika wafat)': s.ayahStatusHidup || '',
    'Nama Ibu': s.namaIbu,
    'Tempat Lahir Ibu': s.ibuTempatLahir || '',
    'Tanggal/Tahun Lahir Ibu': s.ibuTanggalLahir || '',
    'Agama Ibu': s.ibuAgama || '',
    'Kewarganegaraan Ibu': s.ibuKewarganegaraan || '',
    'Pendidikan Ibu': s.ibuPendidikan || '',
    'Pekerjaan Ibu': s.pekerjaanIbu,
    'Penghasilan Ibu per Bulan': s.ibuPenghasilan || '',
    'Alamat & No Telepon Ibu': s.alamatOrangTua || '',
    'Status Hidup Ibu (Tahun Meninggal jika wafat)': s.ibuStatusHidup || '',
    'Nama Wali': s.waliNama || '',
    'Tempat Lahir Wali': s.waliTempatLahir || '',
    'Tanggal/Tahun Lahir Wali': s.waliTanggalLahir || '',
    'Agama Wali': s.waliAgama || '',
    'Kewarganegaraan Wali': s.waliKewarganegaraan || '',
    'Pendidikan Wali': s.waliPendidikan || '',
    'Pekerjaan Wali': s.waliPekerjaan || '',
    'Penghasilan Wali per Bulan': s.waliPenghasilan || '',
    'Alamat & No Telepon Wali': s.waliAlamatTelepon || '',
    'Kegemaran Kesenian': s.gemarKesenian || '',
    'Kegemaran Olahraga': s.gemarOlahraga || '',
    'Kegemaran Organisasi': s.gemarOrganisasi || '',
    'Kegemaran Lain-lain': s.gemarLainnya || '',
    'Penerima PIP (Ya/Tidak)': s.penerimaKipPip ? 'Ya' : 'Tidak',
    'Nomor KIP': s.noKipPip || '',
    'Alat Transportasi ke Sekolah': s.alatTransportasi || '',
    'Kelas Saat Ini': s.kelasSaatIni,
    'Tahun Masuk': s.tahunMasuk,
    'Status (Aktif/Lulus/Pindah/Keluar)': s.statusSiswa
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, { header: EXCEL_HEADERS });
  
  // Auto-fit column widths
  const max_widths = EXCEL_HEADERS.map(col => {
    let maxLen = col.length;
    data.forEach(row => {
      const val = row[col as keyof typeof row];
      if (val) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    });
    return { wch: maxLen + 3 };
  });
  worksheet['!cols'] = max_widths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Buku Induk');
  
  const currentDate = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Buku_Induk_Siswa_${currentDate}.xlsx`);
}

/**
 * Parses an uploaded Excel file and returns an array of Student records.
 */
export function parseExcelImport(file: File): Promise<Partial<Student>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Gagal membaca file Excel'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert worksheet to JSON rows
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        const importedStudents: Partial<Student>[] = rawRows.map((row, idx) => {
          // Normalize gender
          let jk: 'L' | 'P' = 'L';
          const rowJK = String(row['Jenis Kelamin (L/P)'] || row['jenisKelamin'] || '').trim().toUpperCase();
          if (rowJK.startsWith('P') || rowJK.startsWith('F')) {
            jk = 'P';
          }

          // Format status
          let status: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar' = 'Aktif';
          const rowStatus = String(row['Status (Aktif/Lulus/Pindah/Keluar)'] || row['Status'] || '').trim();
          if (['Aktif', 'Lulus', 'Pindah', 'Keluar'].includes(rowStatus)) {
            status = rowStatus as any;
          }

          // Parse birthday safely (excel dates can be serial numbers or string)
          let tglLahir = '';
          const rawTgl = row['Tanggal Lahir (YYYY-MM-DD)'] || row['Tanggal Lahir'];
          if (rawTgl) {
            if (typeof rawTgl === 'number') {
              // Convert serial number to Date
              const dateObj = XLSX.SSF.parse_date_code(rawTgl);
              const yy = dateObj.y;
              const mm = String(dateObj.m).padStart(2, '0');
              const dd = String(dateObj.d).padStart(2, '0');
              tglLahir = `${yy}-${mm}-${dd}`;
            } else {
              // Match regex or clean string
              tglLahir = String(rawTgl).trim();
            }
          }

          const id = `siswa-imported-${Date.now()}-${idx}`;

          return {
            id,
            nis: String(row['NIS'] || row['nis'] || '').trim(),
            nisn: String(row['NISN'] || row['nisn'] || '').trim(),
            namaLengkap: String(row['Nama Lengkap'] || row['namaLengkap'] || '').trim(),
            namaPanggilan: String(row['Nama Panggilan'] || row['namaPanggilan'] || '').trim(),
            jenisKelamin: jk,
            tempatLahir: String(row['Tempat Lahir'] || row['tempatLahir'] || '').trim(),
            tanggalLahir: tglLahir,
            agama: String(row['Agama'] || row['agama'] || 'Islam').trim(),
            kewarganegaraan: String(row['Kewarganegaraan'] || row['kewarganegaraan'] || 'WNI').trim(),
            alamat: String(row['Alamat'] || row['alamat'] || '').trim(),
            telepon: String(row['Telepon'] || row['telepon'] || '').trim(),
            email: String(row['Email'] || row['email'] || '').trim(),
            kelasSaatIni: String(row['Kelas Saat Ini'] || row['Kelas'] || '').trim(),
            tahunMasuk: String(row['Tahun Masuk'] || row['tahunMasuk'] || new Date().getFullYear()).trim(),
            statusSiswa: status,
            foto: jk === 'L' ? DEFAULT_BOY_PHOTO : DEFAULT_GIRL_PHOTO,
            
            // Additional Buku Induk fields
            anakKe: String(row['Anak Keberapa'] || '').trim(),
            jumlahSaudaraKandung: String(row['Jumlah Saudara Kandung'] || '').trim(),
            jumlahSaudaraTiri: String(row['Jumlah Saudara Tiri'] || '').trim(),
            jumlahSaudaraAngkat: String(row['Jumlah Saudara Angkat'] || '').trim(),
            statusYatimPiatu: String(row['Status Yatim Piatu'] || '').trim(),
            bahasaRumah: String(row['Bahasa Sehari-hari di Rumah'] || '').trim(),
            tinggalDengan: String(row['Tinggal Dengan'] || '').trim(),
            jarakSekolah: String(row['Jarak Tempat Tinggal ke Sekolah (Km)'] || '').trim(),
            golonganDarah: String(row['Golongan Darah'] || '').trim(),
            penyakitDerita: String(row['Penyakit yang Pernah Diderita'] || '').trim(),
            kelainanJasmani: String(row['Kelainan Jasmani'] || '').trim(),
            tinggiBadan: String(row['Tinggi Badan (Cm)'] || '').trim(),
            beratBadan: String(row['Berat Badan (Kg)'] || '').trim(),
            sttbLulusanDari: String(row['Pendidikan Sebelumnya Lulusan Dari'] || '').trim(),
            sttbNo: String(row['Tanggal dan Nomor STTB'] || '').trim(),
            sttbLamaBelajar: String(row['Lama Belajar'] || '').trim(),
            pindahanDariSekolah: String(row['Pindahan Dari Sekolah'] || '').trim(),
            pindahanAlasan: String(row['Alasan Pindahan'] || '').trim(),
            diterimaTingkat: String(row['Diterima di Tingkat'] || '').trim(),
            diterimaKelompok: String(row['Diterima di Kelompok'] || '').trim(),
            diterimaJurusan: String(row['Diterima di Jurusan'] || '').trim(),
            diterimaTanggal: String(row['Diterima Tanggal (YYYY-MM-DD)'] || '').trim(),

            namaAyah: String(row['Nama Ayah'] || row['namaAyah'] || '').trim(),
            ayahTempatLahir: String(row['Tempat Lahir Ayah'] || '').trim(),
            ayahTanggalLahir: String(row['Tanggal/Tahun Lahir Ayah'] || '').trim(),
            ayahAgama: String(row['Agama Ayah'] || '').trim(),
            ayahKewarganegaraan: String(row['Kewarganegaraan Ayah'] || '').trim(),
            ayahPendidikan: String(row['Pendidikan Ayah'] || '').trim(),
            pekerjaanAyah: String(row['Pekerjaan Ayah'] || row['pekerjaanAyah'] || '').trim(),
            ayahPenghasilan: String(row['Penghasilan Ayah per Bulan'] || '').trim(),
            ayahStatusHidup: String(row['Status Hidup Ayah (Tahun Meninggal jika wafat)'] || '').trim(),

            namaIbu: String(row['Nama Ibu'] || row['namaIbu'] || '').trim(),
            ibuTempatLahir: String(row['Tempat Lahir Ibu'] || '').trim(),
            ibuTanggalLahir: String(row['Tanggal/Tahun Lahir Ibu'] || '').trim(),
            ibuAgama: String(row['Agama Ibu'] || '').trim(),
            ibuKewarganegaraan: String(row['Kewarganegaraan Ibu'] || '').trim(),
            ibuPendidikan: String(row['Pendidikan Ibu'] || '').trim(),
            pekerjaanIbu: String(row['Pekerjaan Ibu'] || row['pekerjaanIbu'] || '').trim(),
            ibuPenghasilan: String(row['Penghasilan Ibu per Bulan'] || '').trim(),
            ibuStatusHidup: String(row['Status Hidup Ibu (Tahun Meninggal jika wafat)'] || '').trim(),

            teleponOrangTua: String(row['Alamat & No Telepon Ayah'] || row['Alamat & No Telepon Ibu'] || row['Telepon Orang Tua'] || '').trim(),
            alamatOrangTua: String(row['Alamat & No Telepon Ayah'] || row['Alamat & No Telepon Ibu'] || row['Alamat Orang Tua'] || '').trim(),

            waliNama: String(row['Nama Wali'] || '').trim(),
            waliTempatLahir: String(row['Tempat Lahir Wali'] || '').trim(),
            waliTanggalLahir: String(row['Tanggal/Tahun Lahir Wali'] || '').trim(),
            waliAgama: String(row['Agama Wali'] || '').trim(),
            waliKewarganegaraan: String(row['Kewarganegaraan Wali'] || '').trim(),
            waliPendidikan: String(row['Pendidikan Wali'] || '').trim(),
            waliPekerjaan: String(row['Pekerjaan Wali'] || '').trim(),
            waliPenghasilan: String(row['Penghasilan Wali per Bulan'] || '').trim(),
            waliAlamatTelepon: String(row['Alamat & No Telepon Wali'] || '').trim(),

            gemarKesenian: String(row['Kegemaran Kesenian'] || '').trim(),
            gemarOlahraga: String(row['Kegemaran Olahraga'] || '').trim(),
            gemarOrganisasi: String(row['Kegemaran Organisasi'] || '').trim(),
            gemarLainnya: String(row['Kegemaran Lain-lain'] || '').trim(),

            penerimaKipPip: String(row['Penerima PIP (Ya/Tidak)'] || row['penerimaPIP'] || row['penerimaKipPip'] || '').trim().toLowerCase().startsWith('y') ||
                            String(row['Penerima PIP (Ya/Tidak)'] || '').trim().toLowerCase() === 'true' ||
                            String(row['Penerima PIP (Ya/Tidak)'] || '').trim().toLowerCase() === '1',
            noKipPip: String(row['Nomor KIP'] || row['nomorKIP'] || row['noKipPip'] || '').trim(),
            alatTransportasi: String(row['Alat Transportasi ke Sekolah'] || row['alatTransportasi'] || '').trim(),

            riwayatAkademik: {}
          };
        });

        // Filter out empty rows (e.g. rows with no name and no NIS)
        const validStudents = importedStudents.filter(s => s.namaLengkap && s.nis);
        resolve(validStudents);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

/**
 * Parses an uploaded Excel file exported from the EDOSIS application and returns student records.
 */
export function parseEdosisImport(file: File): Promise<Partial<Student>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Gagal membaca file Excel EDOSIS'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert worksheet to raw array of rows
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (rawRows.length === 0) {
          reject(new Error('File Excel EDOSIS kosong atau tidak terbaca'));
          return;
        }

        // Find the header row index
        // We look for a row containing 'NIPD' or 'NISN' and 'Nama'
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
          const row = rawRows[i];
          if (row && Array.isArray(row)) {
            const rowStr = row.map(cell => String(cell || '').trim().toUpperCase());
            const hasNIPD = rowStr.includes('NIPD');
            const hasNISN = rowStr.includes('NISN');
            const hasNama = rowStr.some(cell => cell.includes('NAMA'));
            if ((hasNIPD && hasNama) || (hasNIPD && hasNISN)) {
              headerRowIndex = i;
              break;
            }
          }
        }

        // If not found, try index-based fallback (often headers are in row 0, 1, or 2)
        if (headerRowIndex === -1) {
          if (rawRows[1] && rawRows[1].length > 5) {
            headerRowIndex = 1;
          } else if (rawRows[2] && rawRows[2].length > 5) {
            headerRowIndex = 2;
          } else {
            headerRowIndex = 0;
          }
        }

        const dataRows = rawRows.slice(headerRowIndex + 1);
        
        const importedStudents: Partial<Student>[] = dataRows
          .map((row, idx) => {
            if (!row || !Array.isArray(row) || row.length < 2) return null;

            const getVal = (colIdx: number) => {
              if (colIdx >= row.length) return '';
              const val = row[colIdx];
              return val === undefined || val === null ? '' : String(val).trim();
            };

            // 1. Student Identity
            const namaLengkap = getVal(1);
            if (!namaLengkap) return null; // Skip if empty name

            // NIPD is the unique identifier in Edosis (mapped to NIS)
            const nis = getVal(2) || `ED-${Date.now().toString().slice(-4)}-${idx}`;
            const rawJK = getVal(3).toUpperCase();
            const jk: 'L' | 'P' = (rawJK.startsWith('P') || rawJK.startsWith('F')) ? 'P' : 'L';
            const nisn = getVal(4);
            const tempatLahir = getVal(5);

            // Format Tanggal Lahir (safely parsing number or string)
            let tanggalLahir = getVal(6);
            if (row[6] && typeof row[6] === 'number') {
              try {
                const dateObj = XLSX.SSF.parse_date_code(row[6]);
                const yy = dateObj.y;
                const mm = String(dateObj.m).padStart(2, '0');
                const dd = String(dateObj.d).padStart(2, '0');
                tanggalLahir = `${yy}-${mm}-${dd}`;
              } catch (e) {
                // Ignore and use string
              }
            }

            // Composing address from EDOSIS columns:
            // Alamat (9), RT (10), RW (11), Dusun (12), Desa / Kelurahan (13), Kecamatan (14), Kode Pos (15)
            const street = getVal(9);
            const rt = getVal(10);
            const rw = getVal(11);
            const dusun = getVal(12);
            const desa = getVal(13);
            const kec = getVal(14);
            const pos = getVal(15);
            
            const alamatParts = [];
            if (street) alamatParts.push(street);
            if (rt) alamatParts.push(`RT ${rt}`);
            if (rw) alamatParts.push(`RW ${rw}`);
            if (dusun) alamatParts.push(`Dsn. ${dusun}`);
            if (desa) alamatParts.push(`Ds. ${desa}`);
            if (kec) alamatParts.push(`Kec. ${kec}`);
            if (pos) alamatParts.push(pos);
            const alamat = alamatParts.join(', ');

            const telepon = getVal(18) || getVal(19); // Telepon or HP
            const email = getVal(20);
            
            // Rombel Saat Ini (Format Kelas 9-A) -> map to kelasSaatIni
            let rombel = getVal(42);
            if (rombel.toLowerCase().startsWith('kelas ')) {
              rombel = rombel.substring(6).trim();
            }

            // Parents and Wali
            const namaAyah = getVal(24);
            const ayahTanggalLahir = getVal(25); // Tahun Lahir Ayah
            const ayahPendidikan = getVal(26); // Jenjang Pendidikan Ayah
            const pekerjaanAyah = getVal(27);
            const ayahPenghasilan = getVal(28);
            const ayahNik = getVal(29);

            const namaIbu = getVal(30);
            const ibuTanggalLahir = getVal(31);
            const ibuPendidikan = getVal(32);
            const pekerjaanIbu = getVal(33);
            const ibuPenghasilan = getVal(34);
            const ibuNik = getVal(35);

            const waliNama = getVal(36);
            const waliTanggalLahir = getVal(37);
            const waliPendidikan = getVal(38);
            const waliPekerjaan = getVal(39);
            const waliPenghasilan = getVal(40);
            const waliNik = getVal(41);

            // STTB, Anak ke, BB, TB
            const sttbLulusanDari = getVal(56); // Sekolah Asal
            const anakKe = getVal(57);
            const beratBadan = getVal(61);
            const tinggiBadan = getVal(62);
            const jumlahSaudaraKandung = getVal(64);
            const jarakSekolah = getVal(65);

            // Ayah Detail (Page 16)
            const ayahTempatLahir = getVal(66);
            const alamatAyah = getVal(67);
            const teleponAyah = getVal(68);
            const ayahStatusHidup = getVal(69);

            // Ibu Detail (Page 17)
            const ibuTempatLahir = getVal(70);
            const alamatIbu = getVal(71);
            const teleponIbu = getVal(72);
            const ibuStatusHidup = getVal(73);

            // Wali Detail (Page 18)
            const waliTempatLahir = getVal(74);
            const alamatWali = getVal(75);
            const teleponWali = getVal(76);
            const waliStatusHidup = getVal(77);

            // Compose parent contacts / addresses
            const teleponOrangTua = teleponAyah || teleponIbu || '';
            const alamatOrangTua = alamatAyah || alamatIbu || '';

            const gemarKesenian = getVal(78);
            const gemarOlahraga = getVal(79);
            const gemarOrganisasi = getVal(80);
            const gemarLainnya = getVal(81);

            const id = `siswa-edosis-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`;

            return {
              id,
              nis,
              nisn,
              namaLengkap: namaLengkap.toUpperCase(),
              namaPanggilan: namaLengkap.split(' ')[0]?.toUpperCase() || namaLengkap.toUpperCase(),
              jenisKelamin: jk,
              tempatLahir: tempatLahir || 'KEDIRI',
              tanggalLahir: tanggalLahir || '2011-01-01',
              agama: getVal(8) || 'Islam',
              kewarganegaraan: 'WNI',
              alamat: alamat || '-',
              telepon: telepon || '-',
              email: email || '',
              kelasSaatIni: rombel || '7-A',
              tahunMasuk: new Date().getFullYear().toString(),
              statusSiswa: 'Aktif',
              foto: jk === 'L' ? DEFAULT_BOY_PHOTO : DEFAULT_GIRL_PHOTO,

              // Additional Buku Induk fields
              anakKe: anakKe || '1',
              jumlahSaudaraKandung: jumlahSaudaraKandung || '0',
              jumlahSaudaraTiri: '0',
              jumlahSaudaraAngkat: '0',
              statusYatimPiatu: 'Bukan',
              bahasaRumah: 'Jawa / Indonesia',
              tinggalDengan: getVal(16) || 'Bersama orang tua', // Jenis Tinggal
              jarakSekolah: jarakSekolah || '1',
              golonganDarah: '-',
              penyakitDerita: '-',
              kelainanJasmani: '-',
              tinggiBadan: tinggiBadan || '150',
              beratBadan: beratBadan || '45',
              sttbLulusanDari: sttbLulusanDari || 'SDN',
              sttbNo: getVal(44) || '-', // No Seri Ijazah
              sttbLamaBelajar: '6 Tahun',
              pindahanDariSekolah: '-',
              pindahanAlasan: '-',
              diterimaTingkat: rombel ? rombel.split('-')[0] : '7',
              diterimaKelompok: '-',
              diterimaJurusan: 'Umum',
              diterimaTanggal: new Date().toISOString().split('T')[0],

              namaAyah: namaAyah || '-',
              ayahTempatLahir: ayahTempatLahir || '-',
              ayahTanggalLahir: ayahTanggalLahir || '-',
              ayahAgama: getVal(8) || 'Islam',
              ayahKewarganegaraan: 'WNI',
              ayahPendidikan: ayahPendidikan || '-',
              pekerjaanAyah: pekerjaanAyah || '-',
              ayahPenghasilan: ayahPenghasilan || '-',
              ayahStatusHidup: ayahStatusHidup || 'Masih Hidup',

              namaIbu: namaIbu || '-',
              ibuTempatLahir: ibuTempatLahir || '-',
              ibuTanggalLahir: ibuTanggalLahir || '-',
              ibuAgama: getVal(8) || 'Islam',
              ibuKewarganegaraan: 'WNI',
              ibuPendidikan: ibuPendidikan || '-',
              pekerjaanIbu: pekerjaanIbu || '-',
              ibuPenghasilan: ibuPenghasilan || '-',
              ibuStatusHidup: ibuStatusHidup || 'Masih Hidup',

              teleponOrangTua,
              alamatOrangTua,

              waliNama: waliNama || '',
              waliTempatLahir: waliTempatLahir || '',
              waliTanggalLahir: waliTanggalLahir || '',
              waliAgama: waliNama ? (getVal(8) || 'Islam') : '',
              waliKewarganegaraan: waliNama ? 'WNI' : '',
              waliPendidikan: waliPendidikan || '',
              waliPekerjaan: waliPekerjaan || '',
              waliPenghasilan: waliPenghasilan || '',
              waliAlamatTelepon: alamatWali || teleponWali || '',

              gemarKesenian,
              gemarOlahraga,
              gemarOrganisasi,
              gemarLainnya,

              riwayatAkademik: {}
            };
          })
          .filter(Boolean) as Partial<Student>[];

        resolve(importedStudents);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

/// Headers for the Grades Excel
export const GRADES_HEADERS = [
  'NO',
  'NAMA SISWA',
  'NISN',
  'NIS',
  'PAIBP',
  'PPKn',
  'BI',
  'MAT',
  'IPA',
  'IPS',
  'BIG',
  'SB',
  'PJOK',
  'PRK',
  'BJ',
  'INFORMATIKA',
  'Sakit',
  'Izin',
  'Alpa',
  'TARI',
  'PMR',
  'BANJARI',
  'KIR',
  'BASKET',
  'PRAMUKA'
];

export const MAPEL_COLUMNS: { [key: string]: string[] } = {
  agama: ['PAIBP', 'Agama', 'Pendidikan Agama'],
  pancasila: ['PPKn', 'Pancasila', 'Pendidikan Pancasila'],
  indonesia: ['BI', 'B. Indonesia', 'Bahasa Indonesia'],
  matematika: ['MAT', 'Matematika', 'MTK'],
  ipa: ['IPA', 'Ilmu Pengetahuan Alam'],
  ips: ['IPS', 'Ilmu Pengetahuan Sosial'],
  inggris: ['BIG', 'B. Inggris', 'Bahasa Inggris'],
  seni: ['SB', 'Seni Budaya', 'Seni'],
  pjok: ['PJOK', 'Penjas', 'Penjasorkes'],
  prakarya: ['PRK', 'Prakarya'],
  jawa: ['BJ', 'B. Jawa', 'Bahasa Jawa'],
  informatika: ['INFORMATIKA', 'Informatika', 'TIK']
};

export const EKSTRA_COLUMNS = ['TARI', 'PMR', 'BANJARI', 'KIR', 'BASKET', 'PRAMUKA'];

/**
 * Downloads a blank or pre-populated Excel template for mass importing student grades.
 */
export function downloadGradesTemplate(students: Student[]) {
  // If there are students, populate template with existing student names & NIS
  const data = students.length > 0 
    ? students.map((s, idx) => {
        const row: any = {
          'NO': idx + 1,
          'NAMA SISWA': s.namaLengkap,
          'NISN': s.nisn,
          'NIS': s.nis,
        };
        // Fill default scores
        row['PAIBP'] = 80;
        row['PPKn'] = 80;
        row['BI'] = 80;
        row['MAT'] = 80;
        row['IPA'] = 80;
        row['IPS'] = 80;
        row['BIG'] = 80;
        row['SB'] = 80;
        row['PJOK'] = 80;
        row['PRK'] = 80;
        row['BJ'] = 80;
        row['INFORMATIKA'] = 80;

        row['Sakit'] = 0;
        row['Izin'] = 0;
        row['Alpa'] = 0;

        row['TARI'] = '';
        row['PMR'] = '';
        row['BANJARI'] = '';
        row['KIR'] = '';
        row['BASKET'] = '';
        row['PRAMUKA'] = 'B';
        return row;
      })
    : [{
        'NO': 1,
        'NAMA SISWA': 'AARIL DWI PRASETYO',
        'NISN': '3094092696',
        'NIS': '11938',
        'PAIBP': 86,
        'PPKn': 88,
        'BI': 81,
        'MAT': 85,
        'IPA': 87,
        'IPS': 85,
        'BIG': 83,
        'SB': 86,
        'PJOK': 95,
        'PRK': 90,
        'BJ': 85,
        'INFORMATIKA': 80,
        'Sakit': 2,
        'Izin': 0,
        'Alpa': 0,
        'TARI': '',
        'PMR': '',
        'BANJARI': '',
        'KIR': '',
        'BASKET': '',
        'PRAMUKA': 'B'
      }];

  // Re-map objects to be strictly in order of GRADES_HEADERS
  const sortedData = data.map(item => {
    const row: any = {};
    GRADES_HEADERS.forEach(header => {
      row[header] = item[header] !== undefined ? item[header] : '';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(sortedData, { header: GRADES_HEADERS });
  
  // Set column widths
  const max_widths = GRADES_HEADERS.map(h => ({ wch: Math.max(h.length + 3, 10) }));
  worksheet['!cols'] = max_widths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Nilai');
  
  XLSX.writeFile(workbook, 'Template_Impor_Nilai_Siswa.xlsx');
}

/**
 * Exports grades of students for a specific semester into an Excel file.
 */
export function exportGradesToExcel(students: Student[], semesterId: string) {
  const data = students.map((s, idx) => {
    const record = s.riwayatAkademik[semesterId];
    
    const row: any = {
      'NO': idx + 1,
      'NAMA SISWA': s.namaLengkap,
      'NISN': s.nisn,
      'NIS': s.nis,
    };

    // Helper to get subject score
    const getScore = (mapelId: string) => {
      const score = record?.scores?.find(sc => sc.mapelId === mapelId);
      if (!score) return '';
      return score.nilaiPengetahuan !== undefined ? score.nilaiPengetahuan : '';
    };

    row['PAIBP'] = getScore('agama');
    row['PPKn'] = getScore('pancasila');
    row['BI'] = getScore('indonesia');
    row['MAT'] = getScore('matematika');
    row['IPA'] = getScore('ipa');
    row['IPS'] = getScore('ips');
    row['BIG'] = getScore('inggris');
    row['SB'] = getScore('seni');
    row['PJOK'] = getScore('pjok');
    row['PRK'] = getScore('prakarya');
    row['BJ'] = getScore('jawa');
    row['INFORMATIKA'] = getScore('informatika');

    row['Sakit'] = record?.absensi?.sakit !== undefined ? record.absensi.sakit : '';
    row['Izin'] = record?.absensi?.izin !== undefined ? record.absensi.izin : '';
    row['Alpa'] = record?.absensi?.alpa !== undefined ? record.absensi.alpa : '';

    // Initialize extracurricular columns to empty
    row['TARI'] = '';
    row['PMR'] = '';
    row['BANJARI'] = '';
    row['KIR'] = '';
    row['BASKET'] = '';
    row['PRAMUKA'] = '';

    // Fill extracurricular columns if they exist in record
    if (record?.ekstrakurikuler) {
      record.ekstrakurikuler.forEach(ekstra => {
        const key = String(ekstra.kegiatan || '').toUpperCase();
        if (key.includes('TARI')) row['TARI'] = ekstra.nilai || 'B';
        else if (key.includes('PMR')) row['PMR'] = ekstra.nilai || 'B';
        else if (key.includes('BANJARI')) row['BANJARI'] = ekstra.nilai || 'B';
        else if (key.includes('KIR')) row['KIR'] = ekstra.nilai || 'B';
        else if (key.includes('BASKET')) row['BASKET'] = ekstra.nilai || 'B';
        else if (key.includes('PRAMUKA')) row['PRAMUKA'] = ekstra.nilai || 'B';
      });
    }

    return row;
  });

  // Sort keys in GRADES_HEADERS order
  const sortedData = data.map(item => {
    const row: any = {};
    GRADES_HEADERS.forEach(header => {
      row[header] = item[header] !== undefined ? item[header] : '';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(sortedData, { header: GRADES_HEADERS });
  
  // Set column widths
  const max_widths = GRADES_HEADERS.map(h => ({ wch: Math.max(h.length + 3, 10) }));
  worksheet['!cols'] = max_widths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Nilai Semester ${semesterId}`);
  
  XLSX.writeFile(workbook, `Ekspor_Nilai_Semester_${semesterId}.xlsx`);
}

/**
 * Parses an uploaded Excel file of grades and maps it to student records.
 */
export function parseGradesImport(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Gagal membaca file Excel'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (rawRows.length === 0) {
          reject(new Error('File Excel kosong'));
          return;
        }

        // Find header row containing 'NIS' and 'NAMA'
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
          const row = rawRows[i];
          if (row && Array.isArray(row)) {
            const rowStr = row.map(cell => String(cell || '').trim().toUpperCase());
            const hasNIS = rowStr.includes('NIS');
            const hasNama = rowStr.some(cell => cell.includes('NAMA SISWA') || cell.includes('NAMA'));
            if (hasNIS && hasNama) {
              headerRowIndex = i;
              break;
            }
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 0;
        }

        const headers = rawRows[headerRowIndex].map((h: any) => String(h || '').trim());
        const dataRows = rawRows.slice(headerRowIndex + 1);

        const importedRecords = dataRows
          .map(row => {
            if (!row || !Array.isArray(row) || row.length < 3) return null;

            const getValByHeader = (headerName: string) => {
              const colIdx = headers.findIndex(h => h.toLowerCase() === headerName.toLowerCase());
              if (colIdx === -1 || colIdx >= row.length) return '';
              const val = row[colIdx];
              return val === undefined || val === null ? '' : String(val).trim();
            };

            const getValByIdx = (idx: number) => {
              if (idx >= row.length) return '';
              const val = row[idx];
              return val === undefined || val === null ? '' : String(val).trim();
            };

            // Identify student by NIS (or column 3)
            const colNisIdx = headers.findIndex(h => String(h || '').trim().toUpperCase() === 'NIS');
            const nis = colNisIdx !== -1 && colNisIdx < row.length ? String(row[colNisIdx] || '').trim() : getValByIdx(3);
            if (!nis || nis === 'NIS') return null;

            // Construct Subject Scores
            const scores = LIST_MAPEL_DEFAULT.map(mapel => {
              const aliases = MAPEL_COLUMNS[mapel.id];
              let valPengetahuan = 80;
              if (aliases) {
                for (const alias of aliases) {
                  const colIdx = headers.findIndex(h => String(h || '').trim().toUpperCase() === alias.toUpperCase());
                  if (colIdx !== -1 && colIdx < row.length) {
                    const val = row[colIdx];
                    if (val !== undefined && val !== null && String(val).trim() !== '') {
                      valPengetahuan = Number(val) || 0;
                      break;
                    }
                  }
                }
              }

              return {
                mapelId: mapel.id,
                namaMapel: mapel.nama,
                nilaiPengetahuan: Math.min(100, Math.max(0, valPengetahuan)),
                nilaiKeterampilan: Math.min(100, Math.max(0, valPengetahuan)),
                deskripsi: `Sangat baik dalam memahami materi ${mapel.nama}`
              };
            });

            // Absensi
            const getAbsensiVal = (aliases: string[]) => {
              for (const alias of aliases) {
                const colIdx = headers.findIndex(h => String(h || '').trim().toUpperCase() === alias.toUpperCase());
                if (colIdx !== -1 && colIdx < row.length) {
                  const val = row[colIdx];
                  if (val !== undefined && val !== null && String(val).trim() !== '') {
                    return Number(val) || 0;
                  }
                }
              }
              return 0;
            };

            const sakit = getAbsensiVal(['Sakit', 'Absensi Sakit']);
            const izin = getAbsensiVal(['Izin', 'Absensi Izin']);
            const alpa = getAbsensiVal(['Alpa', 'Absensi Alpa', 'Tanpa Keterangan']);

            // Ekstrakurikuler
            const ekstrakurikuler: Extracurricular[] = [];
            EKSTRA_COLUMNS.forEach(ekstraName => {
              const colIdx = headers.findIndex(h => String(h || '').trim().toUpperCase() === ekstraName.toUpperCase());
              if (colIdx !== -1 && colIdx < row.length) {
                const rawVal = String(row[colIdx] || '').trim().toUpperCase();
                if (rawVal) {
                  let nilai: 'A' | 'B' | 'C' | 'D' = 'B';
                  if (rawVal === 'SB' || rawVal === 'A') nilai = 'A';
                  else if (rawVal === 'B') nilai = 'B';
                  else if (rawVal === 'C') nilai = 'C';
                  else if (rawVal === 'D') nilai = 'D';

                  const keterangan = nilai === 'A' ? `Sangat baik mengikuti kegiatan ${ekstraName}.` : `Baik mengikuti kegiatan ${ekstraName}.`;
                  ekstrakurikuler.push({
                    kegiatan: ekstraName.charAt(0) + ekstraName.slice(1).toLowerCase(),
                    nilai,
                    keterangan
                  });
                }
              }
            });

            return {
              nis,
              scores,
              absensi: { sakit, izin, alpa },
              ekstrakurikuler
            };
          })
          .filter(Boolean);

        resolve(importedRecords);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
