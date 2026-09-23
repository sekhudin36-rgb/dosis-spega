/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, LIST_MAPEL_DEFAULT } from '../types';

// Simple SVG default profiles to keep them offline-friendly, beautiful, and fast
export const DEFAULT_BOY_PHOTO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="%23E0F2FE"/><circle cx="50" cy="40" r="22" fill="%230284C7"/><path d="M15 88C15 72 30 60 50 60C70 60 85 72 85 88H15Z" fill="%230369A1"/><path d="M38 25C44 21 56 21 62 25" stroke="%230F172A" stroke-width="3" stroke-linecap="round"/></svg>`;

export const DEFAULT_GIRL_PHOTO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="%23FCE7F3"/><circle cx="50" cy="40" r="22" fill="%23DB2777"/><path d="M15 88C15 72 30 60 50 60C70 60 85 72 85 88H15Z" fill="%23BE185D"/><path d="M28 35C28 25 35 15 50 15C65 15 72 25 72 35" stroke="%23431407" stroke-width="4" stroke-linecap="round"/></svg>`;

export function createEmptySemester(semesterId: string, namaSemester: string, kelas: string, tahunAjaran: string) {
  return {
    semesterId,
    namaSemester,
    kelas,
    tahunAjaran,
    scores: LIST_MAPEL_DEFAULT.map(mapel => ({
      mapelId: mapel.id,
      namaMapel: mapel.nama,
      nilaiPengetahuan: 0,
      nilaiKeterampilan: 0,
      deskripsi: ""
    })),
    ekstrakurikuler: [
      { kegiatan: "Pramuka", nilai: "A", keterangan: "Sangat aktif dan disiplin mengikuti kegiatan." } as const
    ],
    absensi: { sakit: 0, izin: 0, alpa: 0 },
    catatanWali: ""
  };
}

export const mockStudents: Student[] = [
  {
    id: "siswa-1",
    nis: "24001",
    nisn: "0091234567",
    namaLengkap: "Ahmad Ridwan Santoso",
    namaPanggilan: "Ridwan",
    jenisKelamin: "L",
    tempatLahir: "Semarang",
    tanggalLahir: "2011-04-12",
    agama: "Islam",
    kewarganegaraan: "WNI",
    alamat: "Jl. Pemuda No. 45, Kecamatan Semarang Tengah, Kota Semarang, Jawa Tengah",
    telepon: "081234567890",
    email: "ridwan.santoso@siswa.id",
    kelasSaatIni: "8-A",
    tahunMasuk: "2024",
    statusSiswa: "Aktif",
    penerimaKipPip: false,
    alatTransportasi: "Sepeda Motor",
    foto: DEFAULT_BOY_PHOTO,
    namaAyah: "Bambang Santoso",
    pekerjaanAyah: "Pegawai Negeri Sipil (PNS)",
    namaIbu: "Siti Rahmawati",
    pekerjaanIbu: "Ibu Rumah Tangga",
    teleponOrangTua: "081234567891",
    alamatOrangTua: "Jl. Pemuda No. 45, Semarang",
    riwayatAkademik: {
      "1": {
        semesterId: "1",
        namaSemester: "Semester I (Ganjil)",
        kelas: "7-A",
        tahunAjaran: "2024/2025",
        scores: [
          { mapelId: "agama", namaMapel: "Pendidikan Agama dan Budi Pekerti", nilaiPengetahuan: 85, nilaiKeterampilan: 88, deskripsi: "Sangat baik dalam memahami materi akhlak dan hafalan ayat-ayat pilihan." },
          { mapelId: "pancasila", namaMapel: "Pendidikan Pancasila dan Kewarganegaraan", nilaiPengetahuan: 82, nilaiKeterampilan: 80, deskripsi: "Baik dalam memahami konsep hak dan kewajiban warga negara." },
          { mapelId: "indonesia", namaMapel: "Bahasa Indonesia", nilaiPengetahuan: 88, nilaiKeterampilan: 86, deskripsi: "Sangat terampil dalam menulis teks deskriptif dan menyampaikan pidato singkat." },
          { mapelId: "matematika", namaMapel: "Matematika", nilaiPengetahuan: 78, nilaiKeterampilan: 80, deskripsi: "Cukup baik dalam operasi aljabar, perlu bimbingan lebih lanjut pada konsep himpunan." },
          { mapelId: "ipa", namaMapel: "Ilmu Pengetahuan Alam (IPA)", nilaiPengetahuan: 84, nilaiKeterampilan: 85, deskripsi: "Sangat antusias dalam kegiatan praktikum mikroskop dan pengamatan sel." },
          { mapelId: "ips", namaMapel: "Ilmu Pengetahuan Sosial (IPS)", nilaiPengetahuan: 80, nilaiKeterampilan: 82, deskripsi: "Menunjukkan pemahaman yang baik tentang sejarah kerajaan Hindu-Budha di Indonesia." },
          { mapelId: "inggris", namaMapel: "Bahasa Inggris", nilaiPengetahuan: 85, nilaiKeterampilan: 88, deskripsi: "Sangat lancar dalam percakapan sehari-hari dan penulisan teks prosedur sederhana." },
          { mapelId: "pjok", namaMapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", nilaiPengetahuan: 90, nilaiKeterampilan: 92, deskripsi: "Luar biasa dalam penguasaan teknik dasar bola basket dan kebugaran jasmani." },
          { mapelId: "seni", namaMapel: "Seni Budaya dan Prakarya", nilaiPengetahuan: 85, nilaiKeterampilan: 88, deskripsi: "Kreatif dalam membuat kerajinan dari bahan alam dan menggambar ragam hias." },
          { mapelId: "informatika", namaMapel: "Informatika / Teknologi Informasi", nilaiPengetahuan: 88, nilaiKeterampilan: 90, deskripsi: "Sangat terampil dalam menggunakan perangkat lunak pengolah kata dan logika pemrograman dasar." }
        ],
        ekstrakurikuler: [
          { kegiatan: "Pramuka", nilai: "A", keterangan: "Aktif, disiplin, dan menunjukkan jiwa kepemimpinan yang baik." },
          { kegiatan: "Pecinta Alam", nilai: "B", keterangan: "Memiliki kepedulian lingkungan yang tinggi." }
        ],
        absensi: { sakit: 1, izin: 2, alpa: 0 },
        catatanWali: "Ahmad Ridwan adalah siswa yang cerdas dan berbudi pekerti luhur. Pertahankan prestasimu dan teruslah aktif di kelas."
      },
      "2": {
        semesterId: "2",
        namaSemester: "Semester II (Genap)",
        kelas: "7-A",
        tahunAjaran: "2024/2025",
        scores: [
          { mapelId: "agama", namaMapel: "Pendidikan Agama dan Budi Pekerti", nilaiPengetahuan: 87, nilaiKeterampilan: 89, deskripsi: "Mempertahankan prestasi yang sangat baik dalam ibadah praktis." },
          { mapelId: "pancasila", namaMapel: "Pendidikan Pancasila dan Kewarganegaraan", nilaiPengetahuan: 85, nilaiKeterampilan: 84, deskripsi: "Sangat memahami konsep keberagaman suku bangsa di Indonesia." },
          { mapelId: "indonesia", namaMapel: "Bahasa Indonesia", nilaiPengetahuan: 90, nilaiKeterampilan: 88, deskripsi: "Sangat baik dalam menulis fabel dan mengulas karya sastra anak." },
          { mapelId: "matematika", namaMapel: "Matematika", nilaiPengetahuan: 82, nilaiKeterampilan: 84, deskripsi: "Menunjukkan peningkatan signifikan pada materi statistika dasar dan geometri." },
          { mapelId: "ipa", namaMapel: "Ilmu Pengetahuan Alam (IPA)", nilaiPengetahuan: 86, nilaiKeterampilan: 88, deskripsi: "Sangat baik memahami interaksi makhluk hidup dan lingkungannya." },
          { mapelId: "ips", namaMapel: "Ilmu Pengetahuan Sosial (IPS)", nilaiPengetahuan: 83, nilaiKeterampilan: 85, deskripsi: "Baik dalam menguraikan aktivitas ekonomi masyarakat pesisir." },
          { mapelId: "inggris", namaMapel: "Bahasa Inggris", nilaiPengetahuan: 87, nilaiKeterampilan: 90, deskripsi: "Sangat baik dalam mengekspresikan opini dan mendongeng (storytelling)." },
          { mapelId: "pjok", namaMapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", nilaiPengetahuan: 92, nilaiKeterampilan: 95, deskripsi: "Sangat baik dalam atletik jalan cepat dan senam lantai." },
          { mapelId: "seni", namaMapel: "Seni Budaya dan Prakarya", nilaiPengetahuan: 88, nilaiKeterampilan: 90, deskripsi: "Kreatif dalam mengaransemen lagu daerah secara vokal grup." },
          { mapelId: "informatika", namaMapel: "Informatika / Teknologi Informasi", nilaiPengetahuan: 91, nilaiKeterampilan: 92, deskripsi: "Sangat baik dalam perancangan algoritma flowchart dasar." }
        ],
        ekstrakurikuler: [
          { kegiatan: "Pramuka", nilai: "A", keterangan: "Konsisten berkontribusi aktif dalam regu inti." },
          { kegiatan: "Pecinta Alam", nilai: "A", keterangan: "Sangat aktif dalam kegiatan pelestarian alam sekolah." }
        ],
        absensi: { sakit: 0, izin: 1, alpa: 0 },
        catatanWali: "Selamat! Ahmad Ridwan berhasil mempertahankan peringkat 3 besar di kelas. Pertahankan kebiasaan belajarmu yang teratur."
      }
    }
  },
  {
    id: "siswa-2",
    nis: "24002",
    nisn: "0098765432",
    namaLengkap: "Siti Aminah Azzahra",
    namaPanggilan: "Siti",
    jenisKelamin: "P",
    tempatLahir: "Bandung",
    tanggalLahir: "2011-08-22",
    agama: "Islam",
    kewarganegaraan: "WNI",
    alamat: "Jl. Dago No. 102, Kecamatan Coblong, Kota Bandung, Jawa Barat",
    telepon: "087712345678",
    email: "siti.aminah@siswa.id",
    kelasSaatIni: "8-A",
    tahunMasuk: "2024",
    statusSiswa: "Aktif",
    penerimaKipPip: true,
    noKipPip: "KIP-2024-88219",
    alatTransportasi: "Sepeda",
    foto: DEFAULT_GIRL_PHOTO,
    namaAyah: "Hendra Wijaya",
    pekerjaanAyah: "Wiraswasta (Kuliner)",
    namaIbu: "Lilis Herlina",
    pekerjaanIbu: "Ibu Rumah Tangga",
    teleponOrangTua: "087712345679",
    alamatOrangTua: "Jl. Dago No. 102, Bandung",
    riwayatAkademik: {
      "1": {
        semesterId: "1",
        namaSemester: "Semester I (Ganjil)",
        kelas: "7-B",
        tahunAjaran: "2024/2025",
        scores: [
          { mapelId: "agama", namaMapel: "Pendidikan Agama dan Budi Pekerti", nilaiPengetahuan: 92, nilaiKeterampilan: 95, deskripsi: "Luar biasa dalam menghafal juz amma dan mempraktikkan doa harian." },
          { mapelId: "pancasila", namaMapel: "Pendidikan Pancasila dan Kewarganegaraan", nilaiPengetahuan: 88, nilaiKeterampilan: 86, deskripsi: "Sangat baik dalam mengamalkan nilai-nilai Pancasila di lingkungan sekolah." },
          { mapelId: "indonesia", namaMapel: "Bahasa Indonesia", nilaiPengetahuan: 91, nilaiKeterampilan: 93, deskripsi: "Sangat terampil membaca puisi dan menulis esai pendek dengan diksi indah." },
          { mapelId: "matematika", namaMapel: "Matematika", nilaiPengetahuan: 88, nilaiKeterampilan: 90, deskripsi: "Sangat baik dalam penguasaan rumus logika matematika dan aljabar." },
          { mapelId: "ipa", namaMapel: "Ilmu Pengetahuan Alam (IPA)", nilaiPengetahuan: 90, nilaiKeterampilan: 92, deskripsi: "Kombinasi teori dan praktik yang sangat unggul terutama pada klasifikasi makhluk hidup." },
          { mapelId: "ips", namaMapel: "Ilmu Pengetahuan Sosial (IPS)", nilaiPengetahuan: 86, nilaiKeterampilan: 85, deskripsi: "Menunjukkan pemahaman mumpuni mengenai peta wilayah nusantara." },
          { mapelId: "inggris", namaMapel: "Bahasa Inggris", nilaiPengetahuan: 93, nilaiKeterampilan: 95, deskripsi: "Sangat fasih, tata bahasa mendekati sempurna, aktif memimpin diskusi." },
          { mapelId: "pjok", namaMapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", nilaiPengetahuan: 80, nilaiKeterampilan: 82, deskripsi: "Cukup baik dalam memahami teori kesehatan remaja, gerakan senam cukup lentur." },
          { mapelId: "seni", namaMapel: "Seni Budaya dan Prakarya", nilaiPengetahuan: 94, nilaiKeterampilan: 96, deskripsi: "Bakat seni luar biasa dalam seni rupa dua dimensi dan menyanyi solo." },
          { mapelId: "informatika", namaMapel: "Informatika / Teknologi Informasi", nilaiPengetahuan: 89, nilaiKeterampilan: 91, deskripsi: "Sangat baik dalam merancang presentasi visual yang interaktif." }
        ],
        ekstrakurikuler: [
          { kegiatan: "Pramuka", nilai: "A", keterangan: "Sangat rajin dan disiplin. Menjadi panutan rekan satu regu." },
          { kegiatan: "Paduan Suara", nilai: "A", keterangan: "Merupakan penyanyi utama (sopran) yang berprestasi mengharumkan nama sekolah." }
        ],
        absensi: { sakit: 0, izin: 0, alpa: 0 },
        catatanWali: "Siti adalah murid yang sangat berbakat dan teladan bagi teman-temannya. Nilai-nilaimu mendekati sempurna. Teruskan perjuanganmu!"
      }
    }
  },
  {
    id: "siswa-3",
    nis: "24003",
    nisn: "0093456789",
    namaLengkap: "Dewanto Dewa Kurnia",
    namaPanggilan: "Dewa",
    jenisKelamin: "L",
    tempatLahir: "Surabaya",
    tanggalLahir: "2010-12-05",
    agama: "Kristen Protestan",
    kewarganegaraan: "WNI",
    alamat: "Jl. Dharmahusada Indah No. 12, Surabaya, Jawa Timur",
    telepon: "081398765432",
    email: "dewanto.dewa@siswa.id",
    kelasSaatIni: "8-B",
    tahunMasuk: "2024",
    statusSiswa: "Aktif",
    penerimaKipPip: false,
    alatTransportasi: "Mobil / Antar Jemput",
    foto: DEFAULT_BOY_PHOTO,
    namaAyah: "Rudolf Kurnia",
    pekerjaanAyah: "Dokter Spesialis Anak",
    namaIbu: "Yuliana Wardhani",
    pekerjaanIbu: "Dosen Perguruan Tinggi",
    teleponOrangTua: "081398765433",
    alamatOrangTua: "Jl. Dharmahusada Indah No. 12, Surabaya",
    riwayatAkademik: {}
  },
  {
    id: "siswa-4",
    nis: "22045",
    nisn: "0081230045",
    namaLengkap: "Rian Hermawan",
    namaPanggilan: "Rian",
    jenisKelamin: "L",
    tempatLahir: "Semarang",
    tanggalLahir: "2009-02-18",
    agama: "Islam",
    kewarganegaraan: "WNI",
    alamat: "Jl. Singosari No. 89, Kota Semarang",
    telepon: "081211112222",
    email: "rian.hermawan@alumni.id",
    kelasSaatIni: "9-A",
    tahunMasuk: "2022",
    statusSiswa: "Lulus",
    foto: DEFAULT_BOY_PHOTO,
    namaAyah: "Agus Hermawan",
    pekerjaanAyah: "PNS Dinas Perhubungan",
    namaIbu: "Kartika Sari",
    pekerjaanIbu: "Karyawan Swasta",
    teleponOrangTua: "081211112223",
    alamatOrangTua: "Jl. Singosari No. 89, Semarang",
    tanggalLulus: "2025-06-15",
    alumniLanjutKe: "SMAN 1 Semarang",
    alumniCatatan: "Melanjutkan di kelas unggulan IPA SMAN 1 Semarang.",
    riwayatAkademik: {}
  },
  {
    id: "siswa-5",
    nis: "22099",
    nisn: "0089870099",
    namaLengkap: "Farah Amalia Putri",
    namaPanggilan: "Farah",
    jenisKelamin: "P",
    tempatLahir: "Solo",
    tanggalLahir: "2009-07-30",
    agama: "Islam",
    kewarganegaraan: "WNI",
    alamat: "Jl. Gajah Mada No. 12, Kota Semarang",
    telepon: "087833334444",
    email: "farah.amalia@alumni.id",
    kelasSaatIni: "9-C",
    tahunMasuk: "2022",
    statusSiswa: "Lulus",
    foto: DEFAULT_GIRL_PHOTO,
    namaAyah: "Suryo Putro",
    pekerjaanAyah: "Arsitek",
    namaIbu: "Winda Lestari",
    pekerjaanIbu: "Apoteker",
    teleponOrangTua: "087833334445",
    alamatOrangTua: "Jl. Gajah Mada No. 12, Semarang",
    tanggalLulus: "2025-06-15",
    alumniLanjutKe: "SMKN 2 Semarang",
    alumniCatatan: "Melanjutkan studi di kompetensi keahlian Rekayasa Perangkat Lunak (RPL).",
    riwayatAkademik: {}
  },
  {
    id: "siswa-6",
    nis: "24056",
    nisn: "0094560056",
    namaLengkap: "Gathan Saputra",
    namaPanggilan: "Gathan",
    jenisKelamin: "L",
    tempatLahir: "Jakarta",
    tanggalLahir: "2011-01-25",
    agama: "Islam",
    kewarganegaraan: "WNI",
    alamat: "Jl. Siliwangi No. 14, Kota Semarang",
    telepon: "082155556666",
    email: "gathan.saputra@siswa.id",
    kelasSaatIni: "8-A",
    tahunMasuk: "2024",
    statusSiswa: "Pindah",
    foto: DEFAULT_BOY_PHOTO,
    namaAyah: "Hendra Saputra",
    pekerjaanAyah: "Karyawan PT Kereta Api Indonesia",
    namaIbu: "Yanti Marlina",
    pekerjaanIbu: "Bidan",
    teleponOrangTua: "082155556667",
    alamatOrangTua: "Jl. Siliwangi No. 14, Semarang",
    sekolahTujuan: "SMP Negeri 5 Bandung",
    tanggalMutasiKeluar: "2025-10-15",
    noSuratMutasiKeluar: "421.3/281/SMP-IJ/2025",
    alasanMutasi: "Mengikuti kepindahan tugas orang tua ke Kota Bandung.",
    riwayatAkademik: {}
  }
];
