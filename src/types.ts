/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SubjectScore {
  mapelId: string;
  namaMapel: string;
  nilaiPengetahuan: number;
  nilaiKeterampilan: number;
  deskripsi: string;
}

export interface Extracurricular {
  kegiatan: string;
  nilai: 'A' | 'B' | 'C' | 'D';
  keterangan: string;
}

export interface Attendance {
  sakit: number;
  izin: number;
  alpa: number;
}

export interface SemesterRecord {
  semesterId: string; // e.g. "semester_1", "semester_2", etc.
  namaSemester: string; // e.g. "Semester 1 (Ganjil)", "Semester 2 (Genap)"
  kelas: string;
  tahunAjaran: string;
  scores: SubjectScore[];
  ekstrakurikuler: Extracurricular[];
  absensi: Attendance;
  catatanWali: string;
}

export interface Student {
  id: string;
  // Identitas Pribadi
  nis: string;
  nisn: string;
  namaLengkap: string;
  namaPanggilan: string;
  jenisKelamin: 'L' | 'P'; // Laki-laki | Perempuan
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  kewarganegaraan: string;
  alamat: string;
  telepon: string;
  email: string;
  kelasSaatIni: string;
  tahunMasuk: string;
  statusSiswa: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar';
  foto: string; // Base64 or URL

  // Additional Buku Induk fields (A. KETERANGAN TENTANG DIRI SISWA)
  anakKe?: string;
  jumlahSaudaraKandung?: string;
  jumlahSaudaraTiri?: string;
  jumlahSaudaraAngkat?: string;
  statusYatimPiatu?: string;
  bahasaRumah?: string;

  // B. KETERANGAN TENTANG TEMPAT TINGGAL
  tinggalDengan?: string;
  jarakSekolah?: string;

  // C. KETERANGAN KESEHATAN
  golonganDarah?: string;
  penyakitDerita?: string;
  kelainanJasmani?: string;
  tinggiBadan?: string;
  beratBadan?: string;

  // D. KETERANGAN PENDIDIKAN
  sttbLulusanDari?: string;
  sttbNo?: string;
  sttbLamaBelajar?: string;
  pindahanDariSekolah?: string;
  pindahanAlasan?: string;
  diterimaTingkat?: string;
  diterimaKelompok?: string;
  diterimaJurusan?: string;
  diterimaTanggal?: string;

  // Data Orang Tua / Wali
  namaAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;
  teleponOrangTua: string;
  alamatOrangTua: string;

  // E. KETERANGAN TENTANG AYAH KANDUNG
  ayahTempatLahir?: string;
  ayahTanggalLahir?: string;
  ayahAgama?: string;
  ayahKewarganegaraan?: string;
  ayahPendidikan?: string;
  ayahPenghasilan?: string;
  ayahStatusHidup?: string;

  // F. KETERANGAN TENTANG IBU KANDUNG
  ibuTempatLahir?: string;
  ibuTanggalLahir?: string;
  ibuAgama?: string;
  ibuKewarganegaraan?: string;
  ibuPendidikan?: string;
  ibuPenghasilan?: string;
  ibuStatusHidup?: string;

  // G. KETERANGAN TENTANG WALI
  waliNama?: string;
  waliTempatLahir?: string;
  waliTanggalLahir?: string;
  waliAgama?: string;
  waliKewarganegaraan?: string;
  waliPendidikan?: string;
  waliPekerjaan?: string;
  waliPenghasilan?: string;
  waliAlamatTelepon?: string;

  // H. KEGEMARAN SISWA
  gemarKesenian?: string;
  gemarOlahraga?: string;
  gemarOrganisasi?: string;
  gemarLainnya?: string;

  // Riwayat Mutasi (Optional)
  isMutasiMasuk?: boolean;
  sekolahAsal?: string;
  npsnSekolahAsal?: string;
  alamatSekolahAsal?: string;
  tanggalMutasiMasuk?: string;
  noSuratMutasiMasuk?: string;
  kelasTujuanMasuk?: string;

  sekolahTujuan?: string;
  npsnSekolahTujuan?: string;
  alamatSekolahTujuan?: string;
  tanggalMutasiKeluar?: string;
  noSuratMutasiKeluar?: string;
  alasanMutasi?: string;
  alasanKategoriMutasi?: string;
  noRekomendasiDinas?: string;
  bebasAdministrasi?: {
    perpus?: boolean;
    keuangan?: boolean;
    kesiswaanBK?: boolean;
    kurikulum?: boolean;
  };

  // Bantuan Siswa & Transportasi
  penerimaKipPip?: boolean;
  noKipPip?: string;
  alatTransportasi?: string; // e.g. "Jalan Kaki", "Sepeda", "Sepeda Motor", "Angkutan Umum", "Antar Jemput"

  // Riwayat Kelulusan / Alumni (Optional)
  tanggalLulus?: string;
  alumniLanjutKe?: string; // Sekolah tujuan lanjut (e.g., SMAN 1, SMKN 2)
  alumniCatatan?: string;

  // Prestasi & Rapor Uploads (Optional)
  prestasi?: PrestasiSiswa[];
  raporFiles?: {
    [semesterId: string]: RaporFileRecord; // key: "1" | "2" | "3" | "4" | "5" | "6" | "7"
  };

  // Riwayat Akademik (Semester 1 - 6)
  riwayatAkademik: {
    [key: string]: SemesterRecord; // key: "1" | "2" | "3" | "4" | "5" | "6"
  };
}

export interface PrestasiSiswa {
  id: string;
  tanggal: string;
  namaPrestasi: string;
  tingkat: 'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional' | string;
  kategori: 'Akademik' | 'Non-Akademik' | string;
  keterangan: string;
}

export interface RaporFileRecord {
  fileName: string;
  fileContent: string; // Base64
  fileType: string; // e.g. "application/pdf", "image/png"
  uploadedAt: string;
}

export const LIST_MAPEL_DEFAULT = [
  { id: "agama", nama: "Pendidikan Agama dan Budi Pekerti" },
  { id: "pancasila", nama: "Pendidikan Pancasila dan Kewarganegaraan" },
  { id: "indonesia", nama: "Bahasa Indonesia" },
  { id: "matematika", nama: "Matematika" },
  { id: "ipa", nama: "Ilmu Pengetahuan Alam (IPA)" },
  { id: "ips", nama: "Ilmu Pengetahuan Sosial (IPS)" },
  { id: "inggris", nama: "Bahasa Inggris" },
  { id: "seni", nama: "Seni Budaya" },
  { id: "pjok", nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan" },
  { id: "prakarya", nama: "Prakarya" },
  { id: "jawa", nama: "Bahasa Jawa" },
  { id: "informatika", nama: "Informatika" }
];

export interface Teacher {
  id: string;
  nip: string; // Nomor Induk Pegawai
  nama: string;
  jenisKelamin: 'L' | 'P';
  mataPelajaran: string[]; // Pelajaran yang diampu
  telepon: string;
  email: string;
  statusKepegawaian: 'PNS' | 'PPPK' | 'GTT' | 'Honor';
  statusAktif: 'Aktif' | 'Cuti' | 'Pensiun' | 'Pindah';
}

export interface Staff {
  id: string;
  nuptk: string; // Nomor Unik Pendidik dan Tenaga Kependidikan / ID Pegawai
  nama: string;
  jenisKelamin: 'L' | 'P';
  jabatan: string; // Jabatan (Kepala TU, Bendahara, Pustakawan, Laboran, dll)
  telepon: string;
  email: string;
  statusKepegawaian: 'PNS' | 'PPPK' | 'PTT' | 'Honor';
  statusAktif: 'Aktif' | 'Cuti' | 'Pensiun' | 'Pindah';
}

export interface SchoolSettings {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  tahunAjaranAktif: string;
  temaAplikasi?: 'gelap' | 'terang' | 'biru' | 'indigo' | 'hijau';
  kopDinasAtas?: string; // e.g. "PEMERINTAH KABUPATEN KEDIRI\nDINAS PENDIDIKAN"
  logoSekolah?: string; // Base64 or image URL
  stempelSekolah?: string; // Base64 or image URL
  tandaTanganKepalaSekolah?: string; // Base64 or image URL
  gunakanStempelPadaCetak?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string; // Stored securely in real apps, plain here for simplicity per request
  role: 'admin' | 'guru';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userRole: string;
  action: 'TAMBAH_SISWA' | 'EDIT_SISWA' | 'HAPUS_SISWA' | 'NILAI_RAPOR' | 'KENAIKAN_KELAS' | 'MUTASI_SISWA' | 'PENGATURAN' | 'CADANGAN_DATA' | 'ALUMNI_UPDATE' | 'AUTH_SESSION' | 'SYSTEM' | 'IMPOR_SISWA' | 'CETAK_SURAT';
  description: string;
  targetId?: string;
  targetName?: string;
}

export interface MutationApplication {
  id: string;
  nomorRegistrasi: string; // e.g. "REG-MUT-202609-001"
  jenisMutasi: 'MUTASI_MASUK' | 'MUTASI_KELUAR';
  tanggalPengajuan: string; // YYYY-MM-DD
  statusPengajuan: 'MENUNGGU_VERIFIKASI' | 'DIPROSES' | 'DISETUJUI' | 'DITOLAK';
  
  // Kategori & Jalur Mutasi Kedinasan
  jalurMutasi?: 'DALAM_KABUPATEN' | 'ANTAR_KABUPATEN' | 'ANTAR_PROVINSI' | 'MADRASAH_KEMENAG' | 'SWASTA_KE_NEGERI' | 'LUAR_NEGERI';
  kategoriAlasan?: 'TUGAS_ORANG_TUA' | 'PINDAH_DOMISILI' | 'PONDOK_PESANTREN' | 'JARAK_TRANSPORTASI' | 'KESEHATAN' | 'LAINNYA';
  semesterMutasi?: 'Ganjil' | 'Genap';
  tahunAjaranMutasi?: string; // e.g. "2025/2026"
  tanggalEfektifMutasi?: string; // TMT Mutasi
  kurikulumDitempuh?: 'Kurikulum Merdeka' | 'Kurikulum 2013';

  // Identitas Pemohon (Orang Tua / Wali)
  namaPemohon: string;
  hubunganDenganSiswa: 'Orang Tua' | 'Wali' | 'Siswa Sendiri' | 'Lainnya';
  pekerjaanPemohon?: string;
  nikPemohon?: string;
  kontakPemohon: string; // No HP / WhatsApp
  emailPemohon?: string;
  alamatPemohon: string;

  // Data Siswa
  studentId?: string; // Jika mutasi keluar dari data siswa aktif yang ada
  namaSiswa: string;
  nis?: string;
  nisn: string;
  nikSiswa?: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  kelasAsal: string; // e.g. "7-A" atau "8"
  kelasTujuan?: string; // e.g. "8-B"

  // Sekolah Asal & Tujuan
  sekolahAsal: string;
  npsnSekolahAsal?: string;
  alamatSekolahAsal?: string;
  sekolahTujuan: string;
  npsnSekolahTujuan?: string;
  alamatSekolahTujuan?: string;
  kabupatenKotaTujuan?: string;
  provinsiTujuan?: string;
  alasanMutasi: string;

  // Berkas Persyaratan (Checklist Berkas Fisik / Digital)
  berkas: {
    suratPermohonanOrtu: boolean;
    suratKeteranganPindahAsal?: boolean; // Wajib untuk mutasi masuk
    suratRekomendasiDinas?: boolean;
    fotokopiRapor: boolean;
    fotokopiKkKtp: boolean;
    suratBebasPinjamPerpus?: boolean; // Wajib untuk mutasi keluar
    suratKelakuanBaik?: boolean;
    suratKeteranganBersediaMenerima?: boolean;
    aktaKelahiran?: boolean;
    bukuRaporAsliDiserahkan?: boolean;
    catatanBerkas?: string;
  };

  // Pos Bebas Administrasi Internal Sekolah (Clearance)
  bebasAdministrasi?: {
    perpustakaan: boolean;
    catatanPerpus?: string;
    keuanganKomite: boolean;
    catatanKeuangan?: string;
    kesiswaanBK: boolean;
    catatanBK?: string;
    kurikulum: boolean;
    catatanKurikulum?: string;
  };

  // Status Sinkronisasi Dapodik Kemdikbud
  statusDapodik?: {
    terdaftarDapodik: boolean;
    statusVervalPD: 'VALID_DUKCAPIL' | 'RESIDU' | 'BELUM_VERVAL';
    tanggalSinkronisasi?: string;
    noSuratTarikDapodik?: string;
    catatanDapodik?: string;
  };

  // Informasi Verifikasi Tata Usaha
  catatanVerifikasi?: string;
  verifikator?: string; // Nama petugas TU yang memverifikasi
  tanggalDiproses?: string;
  noSuratResmi?: string; // Nomor Surat Pindah Resmi / Keterangan Diterima
  noSuratRekomendasiDinas?: string;
  namaKepalaSekolahPenandatangan?: string;
  nipKepalaSekolahPenandatangan?: string;
}

export interface BackupDataEnvelope {
  appVersion: string;
  exportedAt: string;
  schoolName: string;
  checksum: string;
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  settings: SchoolSettings;
  logs?: ActivityLog[];
  mutationApplications?: MutationApplication[];
}



