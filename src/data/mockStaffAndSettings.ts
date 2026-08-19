/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Teacher, Staff, SchoolSettings } from '../types';

export const mockTeachers: Teacher[] = [
  {
    id: 'guru-1',
    nip: '198503152010011005',
    nama: 'Drs. H. Mulyono, M.Pd.',
    jenisKelamin: 'L',
    mataPelajaran: ['Matematika', 'Informatika / Teknologi Informasi'],
    telepon: '081234567001',
    email: 'mulyono@smp.belajar.id',
    statusKepegawaian: 'PNS',
    statusAktif: 'Aktif'
  },
  {
    id: 'guru-2',
    nip: '199008242019032012',
    nama: 'Rina Wijayanti, S.Pd.',
    jenisKelamin: 'P',
    mataPelajaran: ['Bahasa Indonesia', 'Seni Budaya dan Prakarya'],
    telepon: '081234567002',
    email: 'rina.wijayanti@smp.belajar.id',
    statusKepegawaian: 'PPPK',
    statusAktif: 'Aktif'
  },
  {
    id: 'guru-3',
    nip: '199512052023212045',
    nama: 'Arief Budiman, S.Pd.',
    jenisKelamin: 'L',
    mataPelajaran: ['Ilmu Pengetahuan Alam (IPA)', 'Informatika / Teknologi Informasi'],
    telepon: '081234567003',
    email: 'arief.budiman@smp.belajar.id',
    statusKepegawaian: 'PPPK',
    statusAktif: 'Aktif'
  },
  {
    id: 'guru-4',
    nip: '198801122015041002',
    nama: 'Siti Aminah, S.Ag.',
    jenisKelamin: 'P',
    mataPelajaran: ['Pendidikan Agama dan Budi Pekerti'],
    telepon: '081234567004',
    email: 'siti.aminah@smp.belajar.id',
    statusKepegawaian: 'PNS',
    statusAktif: 'Aktif'
  },
  {
    id: 'guru-5',
    nip: '-',
    nama: 'Dian Permana, S.Or.',
    jenisKelamin: 'L',
    mataPelajaran: ['Pendidikan Jasmani, Olahraga, dan Kesehatan'],
    telepon: '081234567005',
    email: 'dian.permana@smp.belajar.id',
    statusKepegawaian: 'GTT',
    statusAktif: 'Aktif'
  }
];

export const mockStaff: Staff[] = [
  {
    id: 'staff-1',
    nuptk: '197804102008012003',
    nama: 'Hj. Endang Lestari, S.Sos.',
    jenisKelamin: 'P',
    jabatan: 'Kepala Tata Usaha',
    telepon: '081234568001',
    email: 'endang.lestari@smp.belajar.id',
    statusKepegawaian: 'PNS',
    statusAktif: 'Aktif'
  },
  {
    id: 'staff-2',
    nuptk: '199211302022211014',
    nama: 'Budi Santoso, A.Md.',
    jenisKelamin: 'L',
    jabatan: 'Bendahara Sekolah',
    telepon: '081234568002',
    email: 'budi.santoso@smp.belajar.id',
    statusKepegawaian: 'PPPK',
    statusAktif: 'Aktif'
  },
  {
    id: 'staff-3',
    nuptk: '-',
    nama: 'Retno Wulandari, S.I.Pust.',
    jenisKelamin: 'P',
    jabatan: 'Kepala Perpustakaan',
    telepon: '081234568003',
    email: 'retno.w@smp.belajar.id',
    statusKepegawaian: 'PTT',
    statusAktif: 'Aktif'
  },
  {
    id: 'staff-4',
    nuptk: '-',
    nama: 'Supriyanto',
    jenisKelamin: 'L',
    jabatan: 'Penjaga & Keamanan Sekolah',
    telepon: '081234568004',
    email: 'supriyanto@smp.belajar.id',
    statusKepegawaian: 'Honor',
    statusAktif: 'Aktif'
  }
];

export const defaultSchoolSettings: SchoolSettings = {
  namaSekolah: 'UPTD SMPN 3 Kras',
  npsn: '20511869',
  alamat: 'Jalan Doko, Kecamatan Kras Kode Pos : 64172',
  desaKelurahan: 'Doko',
  kecamatan: 'Kras',
  kabupatenKota: 'Kabupaten Kediri',
  provinsi: 'Jawa Timur',
  telepon: '0354-123456',
  email: 'smpn3kras@gmail.com',
  website: 'smpntigakras.blogspot.co.id',
  kepalaSekolah: 'Dr. H. Ahmad Sunaryo, M.Pd.',
  nipKepalaSekolah: '197005121995121002',
  tahunAjaranAktif: '2025/2026',
  temaAplikasi: 'indigo'
};
