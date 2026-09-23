/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  MutationApplication, 
  Student, 
  SchoolSettings 
} from '../types';
import { 
  exportStudentMutationApplicationPDF,
  exportOfficialSuratMutasiKeluarPDF,
  exportOfficialSuratMutasiMasukPDF
} from '../utils/pdfUtils';
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Printer,
  Eye,
  Trash2,
  Building2,
  User,
  Phone,
  Calendar,
  Send,
  ArrowRight,
  UserCheck,
  CheckSquare,
  Square,
  Sparkles,
  Filter,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  Save,
  ShieldCheck,
  Layers,
  School,
  MapPin,
  Award,
  BookOpen,
  FileSignature,
  QrCode,
  RefreshCw,
  Briefcase
} from 'lucide-react';

interface MutationApplicationManagementProps {
  applications: MutationApplication[];
  onSaveApplications: (apps: MutationApplication[]) => void;
  activeStudents: Student[];
  userRole?: 'admin' | 'guru';
  settings: SchoolSettings;
  onExecuteOutgoingMutation: (student: Student, keluarData: { sekolahTujuan: string; tanggalMutasiKeluar: string; noSuratMutasiKeluar?: string; alasanMutasi?: string }) => void;
  onExecuteIncomingMutation: (incomingStudent: Partial<Student>) => void;
  onAddActivityLog?: (action: any, desc: string) => void;
  triggerAlert: (text: string, type?: 'success' | 'error') => void;
}

export default function MutationApplicationManagement({
  applications,
  onSaveApplications,
  activeStudents,
  userRole = 'admin',
  settings,
  onExecuteOutgoingMutation,
  onExecuteIncomingMutation,
  onAddActivityLog,
  triggerAlert
}: MutationApplicationManagementProps) {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MUTASI_MASUK' | 'MUTASI_KELUAR'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'MENUNGGU_VERIFIKASI' | 'DIPROSES' | 'DISETUJUI' | 'DITOLAK'>('ALL');
  const [filterJalur, setFilterJalur] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppDetail, setSelectedAppDetail] = useState<MutationApplication | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'profil' | 'mutasi' | 'berkas_clearance' | 'keputusan_cetak'>('profil');

  // New Application Form State
  const [newAppType, setNewAppType] = useState<'MUTASI_MASUK' | 'MUTASI_KELUAR'>('MUTASI_KELUAR');
  const [selectedActiveStudentId, setSelectedActiveStudentId] = useState('');
  const [newAppForm, setNewAppForm] = useState({
    namaSiswa: '',
    nis: '',
    nisn: '',
    nikSiswa: '',
    jenisKelamin: 'L' as 'L' | 'P',
    tempatLahir: 'Kediri',
    tanggalLahir: '2011-01-01',
    agama: 'Islam',
    kelasAsal: '7-A',
    kelasTujuan: '7-A',
    sekolahAsal: 'SMP NEGERI 3 KRAS',
    npsnSekolahAsal: '20511869',
    alamatSekolahAsal: 'Jl. Raya Kras, Doko, Kec. Kras, Kab. Kediri',
    sekolahTujuan: '',
    npsnSekolahTujuan: '',
    alamatSekolahTujuan: '',
    kabupatenKotaTujuan: '',
    provinsiTujuan: 'Jawa Timur',
    alasanMutasi: '',
    jalurMutasi: 'ANTAR_KABUPATEN' as MutationApplication['jalurMutasi'],
    kategoriAlasan: 'TUGAS_ORANG_TUA' as MutationApplication['kategoriAlasan'],
    semesterMutasi: 'Ganjil' as 'Ganjil' | 'Genap',
    tahunAjaranMutasi: settings.tahunAjaranAktif || '2026/2027',
    tanggalEfektifMutasi: new Date().toISOString().split('T')[0],
    kurikulumDitempuh: 'Kurikulum Merdeka' as 'Kurikulum Merdeka' | 'Kurikulum 2013',
    namaPemohon: '',
    hubunganDenganSiswa: 'Orang Tua' as 'Orang Tua' | 'Wali' | 'Siswa Sendiri' | 'Lainnya',
    pekerjaanPemohon: '',
    nikPemohon: '',
    kontakPemohon: '',
    emailPemohon: '',
    alamatPemohon: '',
    berkas: {
      suratPermohonanOrtu: true,
      suratKeteranganPindahAsal: false,
      suratRekomendasiDinas: false,
      fotokopiRapor: true,
      fotokopiKkKtp: true,
      suratBebasPinjamPerpus: true,
      suratKelakuanBaik: false,
      suratKeteranganBersediaMenerima: false,
      aktaKelahiran: true,
      bukuRaporAsliDiserahkan: false,
      catatanBerkas: ''
    },
    bebasAdministrasi: {
      perpustakaan: true,
      catatanPerpus: 'Bebas pinjaman perpustakaan terverifikasi.',
      keuanganKomite: true,
      catatanKeuangan: 'Bebas administrasi komite/sekolah.',
      kesiswaanBK: true,
      catatanBK: 'Kelakuan baik dan tertib.',
      kurikulum: true,
      catatanKurikulum: 'Kapasitas kelas sesuai Dapodik.'
    }
  });

  // Verification Edit in Detail Modal
  const [detailVerificationForm, setDetailVerificationForm] = useState<{
    statusPengajuan: 'MENUNGGU_VERIFIKASI' | 'DIPROSES' | 'DISETUJUI' | 'DITOLAK';
    catatanVerifikasi: string;
    verifikator: string;
    noSuratResmi: string;
    noSuratRekomendasiDinas: string;
    berkas: NonNullable<MutationApplication['berkas']>;
    bebasAdministrasi: NonNullable<MutationApplication['bebasAdministrasi']>;
    statusDapodik: NonNullable<MutationApplication['statusDapodik']>;
  }>({
    statusPengajuan: 'MENUNGGU_VERIFIKASI',
    catatanVerifikasi: '',
    verifikator: '',
    noSuratResmi: '',
    noSuratRekomendasiDinas: '',
    berkas: {
      suratPermohonanOrtu: false,
      fotokopiRapor: false,
      fotokopiKkKtp: false
    },
    bebasAdministrasi: {
      perpustakaan: false,
      keuanganKomite: false,
      kesiswaanBK: false,
      kurikulum: false
    },
    statusDapodik: {
      terdaftarDapodik: true,
      statusVervalPD: 'VALID_DUKCAPIL'
    }
  });

  // When opening Detail Modal, initialize verification form
  const handleOpenDetailModal = (app: MutationApplication) => {
    setSelectedAppDetail(app);
    setDetailModalTab('profil');
    setDetailVerificationForm({
      statusPengajuan: app.statusPengajuan,
      catatanVerifikasi: app.catatanVerifikasi || '',
      verifikator: app.verifikator || (userRole === 'admin' ? 'Petugas Tata Usaha Kesiswaan' : 'Guru / Wali Kelas'),
      noSuratResmi: app.noSuratResmi || '',
      noSuratRekomendasiDinas: app.noSuratRekomendasiDinas || '',
      berkas: {
        suratPermohonanOrtu: app.berkas?.suratPermohonanOrtu ?? true,
        suratKeteranganPindahAsal: app.berkas?.suratKeteranganPindahAsal ?? false,
        suratRekomendasiDinas: app.berkas?.suratRekomendasiDinas ?? false,
        fotokopiRapor: app.berkas?.fotokopiRapor ?? true,
        fotokopiKkKtp: app.berkas?.fotokopiKkKtp ?? true,
        suratBebasPinjamPerpus: app.berkas?.suratBebasPinjamPerpus ?? false,
        suratKelakuanBaik: app.berkas?.suratKelakuanBaik ?? false,
        suratKeteranganBersediaMenerima: app.berkas?.suratKeteranganBersediaMenerima ?? false,
        aktaKelahiran: app.berkas?.aktaKelahiran ?? true,
        bukuRaporAsliDiserahkan: app.berkas?.bukuRaporAsliDiserahkan ?? false,
        catatanBerkas: app.berkas?.catatanBerkas || ''
      },
      bebasAdministrasi: {
        perpustakaan: app.bebasAdministrasi?.perpustakaan ?? true,
        catatanPerpus: app.bebasAdministrasi?.catatanPerpus || 'Bebas pustaka terverifikasi.',
        keuanganKomite: app.bebasAdministrasi?.keuanganKomite ?? true,
        catatanKeuangan: app.bebasAdministrasi?.catatanKeuangan || 'Bebas administrasi komite.',
        kesiswaanBK: app.bebasAdministrasi?.kesiswaanBK ?? true,
        catatanBK: app.bebasAdministrasi?.catatanBK || 'Berkelakuan baik.',
        kurikulum: app.bebasAdministrasi?.kurikulum ?? true,
        catatanKurikulum: app.bebasAdministrasi?.catatanKurikulum || 'Kuota rombel tersedia.'
      },
      statusDapodik: {
        terdaftarDapodik: app.statusDapodik?.terdaftarDapodik ?? true,
        statusVervalPD: app.statusDapodik?.statusVervalPD || 'VALID_DUKCAPIL',
        tanggalSinkronisasi: app.statusDapodik?.tanggalSinkronisasi || '',
        noSuratTarikDapodik: app.statusDapodik?.noSuratTarikDapodik || '',
        catatanDapodik: app.statusDapodik?.catatanDapodik || 'Validasi Verval PD Kemdikbud.'
      }
    });
  };

  // Helper to auto-generate standard official surat mutasi number
  const generateOfficialNomorSurat = (jenis: 'MUTASI_MASUK' | 'MUTASI_KELUAR') => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const code = jenis === 'MUTASI_KELUAR' ? '043' : '088';
    return `421.3 / ${randomNum} / 418.20.02.${code} / ${currentYear}`;
  };

  // Rombel Capacity Monitoring (Futuristic Real-time Capacity Engine)
  const capacityStats = useMemo(() => {
    const k7 = activeStudents.filter(s => s.kelasSaatIni?.startsWith('7')).length;
    const k8 = activeStudents.filter(s => s.kelasSaatIni?.startsWith('8')).length;
    const k9 = activeStudents.filter(s => s.kelasSaatIni?.startsWith('9')).length;
    
    // Asumsi per jenjang 6 rombel x 32 siswa = 192 kapasitas
    const capPerLevel = 192;
    return {
      kelas7: { count: k7, max: capPerLevel, remaining: Math.max(0, capPerLevel - k7) },
      kelas8: { count: k8, max: capPerLevel, remaining: Math.max(0, capPerLevel - k8) },
      kelas9: { count: k9, max: capPerLevel, remaining: Math.max(0, capPerLevel - k9) },
      totalAktif: activeStudents.length
    };
  }, [activeStudents]);

  // KPI Counts
  const stats = useMemo(() => {
    return {
      total: applications.length,
      menunggu: applications.filter(a => a.statusPengajuan === 'MENUNGGU_VERIFIKASI').length,
      diproses: applications.filter(a => a.statusPengajuan === 'DIPROSES').length,
      disetujui: applications.filter(a => a.statusPengajuan === 'DISETUJUI').length,
      ditolak: applications.filter(a => a.statusPengajuan === 'DITOLAK').length,
      mutasiMasuk: applications.filter(a => a.jenisMutasi === 'MUTASI_MASUK').length,
      mutasiKeluar: applications.filter(a => a.jenisMutasi === 'MUTASI_KELUAR').length,
    };
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (filterType !== 'ALL' && app.jenisMutasi !== filterType) return false;
      if (filterStatus !== 'ALL' && app.statusPengajuan !== filterStatus) return false;
      if (filterJalur !== 'ALL' && app.jalurMutasi !== filterJalur) return false;
      
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchReg = app.nomorRegistrasi.toLowerCase().includes(q);
        const matchName = app.namaSiswa.toLowerCase().includes(q);
        const matchNisn = app.nisn.includes(q);
        const matchNis = app.nis ? app.nis.includes(q) : false;
        const matchPemohon = app.namaPemohon.toLowerCase().includes(q);
        const matchSekolah = (app.sekolahAsal + ' ' + app.sekolahTujuan).toLowerCase().includes(q);
        const matchSurat = app.noSuratResmi?.toLowerCase().includes(q) ?? false;
        return matchReg || matchName || matchNisn || matchNis || matchPemohon || matchSekolah || matchSurat;
      }
      return true;
    });
  }, [applications, filterType, filterStatus, filterJalur, searchTerm]);

  // Auto-fill student data when choosing an active student for Outgoing transfer
  const handleSelectActiveStudent = (studentId: string) => {
    setSelectedActiveStudentId(studentId);
    const stu = activeStudents.find(s => s.id === studentId);
    if (stu) {
      setNewAppForm(prev => ({
        ...prev,
        namaSiswa: stu.namaLengkap,
        nis: stu.nis,
        nisn: stu.nisn,
        nikSiswa: '',
        jenisKelamin: stu.jenisKelamin,
        tempatLahir: stu.tempatLahir,
        tanggalLahir: stu.tanggalLahir?.substring(0, 10) || '2011-01-01',
        agama: stu.agama || 'Islam',
        kelasAsal: stu.kelasSaatIni,
        sekolahAsal: settings.namaSekolah || 'SMP NEGERI 3 KRAS',
        npsnSekolahAsal: settings.npsn || '20511869',
        namaPemohon: stu.namaAyah || stu.namaIbu || '',
        hubunganDenganSiswa: stu.namaAyah ? 'Orang Tua' : 'Wali',
        kontakPemohon: stu.teleponOrangTua || stu.telepon || '',
        alamatPemohon: stu.alamatOrangTua || stu.alamat || ''
      }));
    }
  };

  // Submit New Mutation Application
  const handleSubmitNewApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAppForm.namaSiswa || !newAppForm.nisn || !newAppForm.sekolahAsal || !newAppForm.sekolahTujuan || !newAppForm.namaPemohon) {
      triggerAlert('Harap isi Nama Siswa, NISN, Sekolah Asal, Sekolah Tujuan, dan Nama Pemohon!', 'error');
      return;
    }

    const regCode = `REG-MUT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newApp: MutationApplication = {
      id: 'mut-app-' + Date.now(),
      nomorRegistrasi: regCode,
      jenisMutasi: newAppType,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      statusPengajuan: 'MENUNGGU_VERIFIKASI',
      studentId: newAppType === 'MUTASI_KELUAR' ? selectedActiveStudentId : undefined,
      namaSiswa: newAppForm.namaSiswa,
      nis: newAppForm.nis || undefined,
      nisn: newAppForm.nisn,
      nikSiswa: newAppForm.nikSiswa || undefined,
      jenisKelamin: newAppForm.jenisKelamin,
      tempatLahir: newAppForm.tempatLahir,
      tanggalLahir: newAppForm.tanggalLahir,
      agama: newAppForm.agama,
      kelasAsal: newAppForm.kelasAsal,
      kelasTujuan: newAppForm.kelasTujuan,
      sekolahAsal: newAppForm.sekolahAsal,
      npsnSekolahAsal: newAppForm.npsnSekolahAsal,
      alamatSekolahAsal: newAppForm.alamatSekolahAsal,
      sekolahTujuan: newAppForm.sekolahTujuan,
      npsnSekolahTujuan: newAppForm.npsnSekolahTujuan,
      alamatSekolahTujuan: newAppForm.alamatSekolahTujuan,
      kabupatenKotaTujuan: newAppForm.kabupatenKotaTujuan,
      provinsiTujuan: newAppForm.provinsiTujuan,
      alasanMutasi: newAppForm.alasanMutasi,
      jalurMutasi: newAppForm.jalurMutasi,
      kategoriAlasan: newAppForm.kategoriAlasan,
      semesterMutasi: newAppForm.semesterMutasi,
      tahunAjaranMutasi: newAppForm.tahunAjaranMutasi,
      tanggalEfektifMutasi: newAppForm.tanggalEfektifMutasi,
      kurikulumDitempuh: newAppForm.kurikulumDitempuh,
      namaPemohon: newAppForm.namaPemohon,
      hubunganDenganSiswa: newAppForm.hubunganDenganSiswa,
      pekerjaanPemohon: newAppForm.pekerjaanPemohon,
      nikPemohon: newAppForm.nikPemohon,
      kontakPemohon: newAppForm.kontakPemohon,
      emailPemohon: newAppForm.emailPemohon,
      alamatPemohon: newAppForm.alamatPemohon,
      berkas: { ...newAppForm.berkas },
      bebasAdministrasi: { ...newAppForm.bebasAdministrasi },
      statusDapodik: {
        terdaftarDapodik: true,
        statusVervalPD: 'VALID_DUKCAPIL',
        catatanDapodik: 'Permohonan baru, menunggu verifikasi berkas dinas.'
      },
      verifikator: userRole === 'admin' ? 'Petugas Tata Usaha Kesiswaan' : 'Wali Kelas',
      catatanVerifikasi: 'Pengajuan baru berhasil diregistrasi ke sistem mutasi digital.'
    };

    const updated = [newApp, ...applications];
    onSaveApplications(updated);
    triggerAlert(`Permohonan mutasi ${regCode} (${newApp.namaSiswa}) berhasil didaftarkan!`);

    if (onAddActivityLog) {
      onAddActivityLog('MUTASI_SISWA', `Mendaftarkan pengajuan mutasi baru ${regCode} untuk siswa ${newApp.namaSiswa}`);
    }

    setShowAddModal(false);
    setSelectedActiveStudentId('');
  };

  // Save Verification in Detail Modal
  const handleSaveVerification = () => {
    if (!selectedAppDetail) return;

    const updatedApp: MutationApplication = {
      ...selectedAppDetail,
      statusPengajuan: detailVerificationForm.statusPengajuan,
      catatanVerifikasi: detailVerificationForm.catatanVerifikasi,
      verifikator: detailVerificationForm.verifikator,
      noSuratResmi: detailVerificationForm.noSuratResmi || (detailVerificationForm.statusPengajuan === 'DISETUJUI' ? generateOfficialNomorSurat(selectedAppDetail.jenisMutasi) : undefined),
      noSuratRekomendasiDinas: detailVerificationForm.noSuratRekomendasiDinas,
      berkas: { ...detailVerificationForm.berkas },
      bebasAdministrasi: { ...detailVerificationForm.bebasAdministrasi },
      statusDapodik: { ...detailVerificationForm.statusDapodik },
      tanggalDiproses: new Date().toISOString().split('T')[0]
    };

    const updatedList = applications.map(a => a.id === updatedApp.id ? updatedApp : a);
    onSaveApplications(updatedList);
    setSelectedAppDetail(updatedApp);
    triggerAlert(`Status pengajuan ${updatedApp.nomorRegistrasi} berhasil diperbarui menjadi ${updatedApp.statusPengajuan.replace('_', ' ')}.`);

    if (onAddActivityLog) {
      onAddActivityLog('MUTASI_SISWA', `Memperbarui verifikasi pengajuan mutasi ${updatedApp.nomorRegistrasi} (${updatedApp.namaSiswa}) menjadi ${updatedApp.statusPengajuan}.`);
    }
  };

  // Send WhatsApp Notification with rich formatted message
  const handleSendWhatsAppNotification = (app: MutationApplication) => {
    const rawNumber = app.kontakPemohon.replace(/[^0-9]/g, '');
    let formattedNumber = rawNumber;
    if (rawNumber.startsWith('0')) {
      formattedNumber = '62' + rawNumber.slice(1);
    }

    const schoolName = settings.namaSekolah || 'SMP NEGERI 3 KRAS';
    const statusText = app.statusPengajuan === 'DISETUJUI' ? 'DISETUJUI (Surat Resmi Diterbitkan)'
      : app.statusPengajuan === 'DIPROSES' ? 'SEDANG DIPROSES TATA USAHA'
      : app.statusPengajuan === 'DITOLAK' ? 'DITOLAK / PERLU PERBAIKAN BERKAS' : 'MENUNGGU VERIFIKASI';

    const message = encodeURIComponent(
      `*PEMBERITAHUAN STATUS MUTASI SISWA*\n` +
      `*${schoolName.toUpperCase()}*\n` +
      `_Sistem Administrasi Buku Induk & Kesiswaan Digital_\n\n` +
      `Yth. Bapak/Ibu *${app.namaPemohon}*,\n` +
      `Bersama ini kami sampaikan perkembangan pengajuan permohonan mutasi ${app.jenisMutasi === 'MUTASI_MASUK' ? 'Masuk' : 'Keluar'} untuk ananda:\n\n` +
      `• *Nama Siswa:* ${app.namaSiswa}\n` +
      `• *NISN:* ${app.nisn}\n` +
      `• *No. Registrasi:* ${app.nomorRegistrasi}\n` +
      `• *Status Keputusan:* *${statusText}*\n` +
      (app.noSuratResmi ? `• *No. Surat Resmi:* ${app.noSuratResmi}\n` : '') +
      (app.catatanVerifikasi ? `• *Catatan Verifikator:* ${app.catatanVerifikasi}\n\n` : '\n') +
      `Silakan hadir di Ruang Tata Usaha ${schoolName} pada jam kerja dinas untuk pengambilan dokumen fisik / penyelesaian administrasi.\n\n` +
      `Terima kasih atas perhatian dan kerja samanya.\n\n` +
      `_Petugas Pelayanan TU & Kesiswaan ${schoolName}_`
    );

    const waUrl = `https://wa.me/${formattedNumber}?text=${message}`;
    window.open(waUrl, '_blank');
  };

  // Delete Application
  const handleDeleteApp = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data permohonan mutasi siswa ${name}?`)) {
      const updated = applications.filter(a => a.id !== id);
      onSaveApplications(updated);
      triggerAlert(`Permohonan mutasi siswa ${name} berhasil dihapus.`);
      if (selectedAppDetail?.id === id) {
        setSelectedAppDetail(null);
      }
    }
  };

  // Execute Outgoing Mutation directly to Student Master
  const handleExecuteOutgoingDirectly = (app: MutationApplication) => {
    let targetStudent = activeStudents.find(s => s.id === app.studentId || s.nisn === app.nisn || (s.nis && s.nis === app.nis));
    if (!targetStudent) {
      triggerAlert(`Siswa aktif ${app.namaSiswa} tidak ditemukan di buku induk aktif.`, 'error');
      return;
    }

    if (confirm(`Eksekusi mutasi keluar untuk ${targetStudent.namaLengkap} ke ${app.sekolahTujuan}? Status siswa di buku induk akan diubah menjadi 'Pindah'.`)) {
      onExecuteOutgoingMutation(targetStudent, {
        sekolahTujuan: app.sekolahTujuan,
        tanggalMutasiKeluar: app.tanggalDiproses || new Date().toISOString().split('T')[0],
        noSuratMutasiKeluar: app.noSuratResmi || generateOfficialNomorSurat('MUTASI_KELUAR'),
        alasanMutasi: app.alasanMutasi
      });
      triggerAlert(`Mutasi keluar siswa ${targetStudent.namaLengkap} berhasil dieksekusi ke Buku Induk.`);
      setSelectedAppDetail(null);
    }
  };

  // Execute Incoming Mutation directly to Student Master
  const handleExecuteIncomingDirectly = (app: MutationApplication) => {
    if (confirm(`Eksekusi mutasi masuk untuk ${app.namaSiswa} dari ${app.sekolahAsal}? Siswa akan ditambahkan ke Buku Induk Siswa Aktif.`)) {
      onExecuteIncomingMutation({
        namaLengkap: app.namaSiswa,
        nisn: app.nisn,
        nis: app.nis || `${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
        jenisKelamin: app.jenisKelamin,
        tempatLahir: app.tempatLahir || 'Kediri',
        tanggalLahir: app.tanggalLahir || '2011-01-01',
        agama: app.agama || 'Islam',
        kelasSaatIni: app.kelasTujuan || app.kelasAsal || '7-A',
        sekolahAsal: app.sekolahAsal,
        tanggalMutasiMasuk: app.tanggalDiproses || new Date().toISOString().split('T')[0],
        noSuratMutasiMasuk: app.noSuratResmi || generateOfficialNomorSurat('MUTASI_MASUK'),
        isMutasiMasuk: true,
        statusSiswa: 'Aktif',
        alamat: app.alamatPemohon,
        telepon: app.kontakPemohon,
        namaAyah: app.hubunganDenganSiswa === 'Orang Tua' ? app.namaPemohon : undefined,
        teleponOrangTua: app.kontakPemohon
      });
      triggerAlert(`Siswa pindahan masuk ${app.namaSiswa} berhasil didaftarkan ke Buku Induk Siswa Aktif.`);
      setSelectedAppDetail(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. FUTURISTIC CAPACITY & ROMBEL MONITOR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <Layers className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Dapodik Real-Time Synchronization
              </span>
              <span className="text-xs text-slate-400">TP. {settings.tahunAjaranAktif || '2026/2027'}</span>
            </div>
            <h3 className="text-base font-black text-white tracking-wide">
              Monitoring Kuota Rombel & Kesiapan Mutasi Kemdikbud
            </h3>
            <p className="text-xs text-slate-300/80 mt-0.5">
              Daya tampung maksimal 32 siswa per rombongan belajar sesuai regulasi Permendikbudristek RI.
            </p>
          </div>

          {/* Jenjang Capacity Chips */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Kelas 7</span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  {capacityStats.kelas7.count}/{capacityStats.kelas7.max}
                </span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 mb-1 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (capacityStats.kelas7.count / capacityStats.kelas7.max) * 100)}%` }} 
                />
              </div>
              <span className="text-[10px] text-emerald-300 font-bold">
                {capacityStats.kelas7.remaining > 0 ? `+${capacityStats.kelas7.remaining} Kursi Tersedia` : 'Penuh'}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Kelas 8</span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  {capacityStats.kelas8.count}/{capacityStats.kelas8.max}
                </span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 mb-1 overflow-hidden">
                <div 
                  className="bg-indigo-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (capacityStats.kelas8.count / capacityStats.kelas8.max) * 100)}%` }} 
                />
              </div>
              <span className="text-[10px] text-indigo-300 font-bold">
                {capacityStats.kelas8.remaining > 0 ? `+${capacityStats.kelas8.remaining} Kursi Tersedia` : 'Penuh'}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Kelas 9</span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  {capacityStats.kelas9.count}/{capacityStats.kelas9.max}
                </span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 mb-1 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (capacityStats.kelas9.count / capacityStats.kelas9.max) * 100)}%` }} 
                />
              </div>
              <span className="text-[10px] text-amber-300 font-bold">
                {capacityStats.kelas9.remaining > 0 ? `+${capacityStats.kelas9.remaining} Kursi Tersedia` : 'Penuh'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Mutasi</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">{stats.total}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-medium">
            <span className="text-blue-600 font-bold">{stats.mutasiMasuk} Masuk</span> &bull; 
            <span className="text-rose-600 font-bold">{stats.mutasiKeluar} Keluar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">{stats.menunggu}</div>
          <span className="text-[10px] text-amber-600/80 mt-1 block">Verifikasi berkas TU</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Diproses</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700">{stats.diproses}</div>
          <span className="text-[10px] text-blue-600/80 mt-1 block">Validasi rekomendasi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{stats.disetujui}</div>
          <span className="text-[10px] text-emerald-600/80 mt-1 block">Siap sinkron Dapodik</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ditolak</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">{stats.ditolak}</div>
          <span className="text-[10px] text-rose-600/80 mt-1 block">Berkas tidak sesuai</span>
        </div>
      </div>

      {/* 3. FILTERS & ACTIONS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari Resi, Siswa, NISN, Pemohon, Sekolah, No. Surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterType === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua Jenis
            </button>
            <button
              onClick={() => setFilterType('MUTASI_MASUK')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'MUTASI_MASUK' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Masuk
            </button>
            <button
              onClick={() => setFilterType('MUTASI_KELUAR')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'MUTASI_KELUAR' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Keluar
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="DIPROSES">Sedang Diproses</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
          </select>

          {/* Jalur Filter */}
          <select
            value={filterJalur}
            onChange={(e) => setFilterJalur(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Semua Jalur Mutasi</option>
            <option value="ANTAR_KABUPATEN">Antar Kabupaten</option>
            <option value="DALAM_KABUPATEN">Dalam Kabupaten Kediri</option>
            <option value="ANTAR_PROVINSI">Antar Provinsi</option>
            <option value="MADRASAH_KEMENAG">Madrasah (MTs / Kemenag)</option>
            <option value="SWASTA_KE_NEGERI">Swasta ke Negeri</option>
            <option value="LUAR_NEGERI">Luar Negeri (SILN)</option>
          </select>
        </div>

        {/* Action Button: Register New Mutation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewAppType('MUTASI_KELUAR');
              setSelectedActiveStudentId('');
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Mutasi Baru</span>
          </button>
        </div>

      </div>

      {/* 4. MUTATION APPLICATIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Tidak ada pengajuan mutasi yang cocok</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau filter status dan jenis permohonan di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">No. Registrasi & Tgl</th>
                  <th className="p-4">Jenis & Jalur</th>
                  <th className="p-4">Identitas Siswa</th>
                  <th className="p-4">Sekolah Asal & Tujuan</th>
                  <th className="p-4">Pemohon & Kontak</th>
                  <th className="p-4 text-center">Clearance & Berkas</th>
                  <th className="p-4 text-center">Status & SK Resmi</th>
                  <th className="p-4 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredApplications.map((app) => {
                  const berkasEntries = Object.entries(app.berkas || {});
                  const completedCount = berkasEntries.filter(([k, v]) => typeof v === 'boolean' && v === true).length;
                  const totalItems = berkasEntries.filter(([k, v]) => typeof v === 'boolean').length || 6;

                  return (
                    <tr key={app.id} className="hover:bg-indigo-50/20 transition-colors">
                      
                      {/* No Registrasi */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-800 block text-xs">
                          {app.nomorRegistrasi}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(app.tanggalPengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Jenis & Jalur Mutasi */}
                      <td className="p-4">
                        {app.jenisMutasi === 'MUTASI_MASUK' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            Mutasi Masuk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Mutasi Keluar
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">
                          {app.jalurMutasi?.replace(/_/g, ' ') || 'Jalur Reguler'}
                        </span>
                      </td>

                      {/* Data Siswa */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-xs">{app.namaSiswa}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          NISN: <span className="text-slate-800 font-semibold">{app.nisn}</span>
                          {app.nis && ` | NIS: ${app.nis}`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <span>Kelas: <strong className="text-indigo-600">{app.kelasAsal}</strong></span>
                          {app.kelasTujuan && (
                            <>
                              <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                              <strong className="text-emerald-600">{app.kelasTujuan}</strong>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Asal & Tujuan */}
                      <td className="p-4 max-w-xs">
                        <div className="text-[11px] text-slate-700 font-medium truncate" title={app.sekolahAsal}>
                          <span className="text-slate-400 text-[10px] block">Asal:</span>
                          <strong>{app.sekolahAsal}</strong>
                        </div>
                        <div className="text-[11px] text-indigo-700 font-bold mt-1 truncate" title={app.sekolahTujuan}>
                          <span className="text-slate-400 text-[10px] block font-normal">Tujuan:</span>
                          <strong>{app.sekolahTujuan}</strong>
                        </div>
                      </td>

                      {/* Pemohon & Kontak */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{app.namaPemohon}</div>
                        <div className="text-[10px] text-slate-400">({app.hubunganDenganSiswa})</div>
                        {app.kontakPemohon && (
                          <button
                            onClick={() => handleSendWhatsAppNotification(app)}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                            title="Kirim Notifikasi WhatsApp"
                          >
                            <Phone className="w-3 h-3 text-emerald-500" />
                            <span>{app.kontakPemohon}</span>
                          </button>
                        )}
                      </td>

                      {/* Clearance 4 Meja & Berkas */}
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            completedCount >= 5 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {completedCount}/{totalItems} Berkas
                          </span>

                          {/* 4 Clearance Indicators */}
                          <div className="flex items-center gap-1 mt-0.5" title="Clearance: Perpus, Keuangan, BK, Kurikulum">
                            <span 
                              className={`w-2 h-2 rounded-full ${app.bebasAdministrasi?.perpustakaan ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                              title="Perpustakaan" 
                            />
                            <span 
                              className={`w-2 h-2 rounded-full ${app.bebasAdministrasi?.keuanganKomite ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                              title="Keuangan/Komite" 
                            />
                            <span 
                              className={`w-2 h-2 rounded-full ${app.bebasAdministrasi?.kesiswaanBK ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                              title="Kesiswaan/BK" 
                            />
                            <span 
                              className={`w-2 h-2 rounded-full ${app.bebasAdministrasi?.kurikulum ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                              title="Kurikulum & Rombel" 
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status & SK Resmi */}
                      <td className="p-4 text-center">
                        {app.statusPengajuan === 'MENUNGGU_VERIFIKASI' && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 block">
                            Menunggu Verifikasi
                          </span>
                        )}
                        {app.statusPengajuan === 'DIPROSES' && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 block">
                            Sedang Diproses
                          </span>
                        )}
                        {app.statusPengajuan === 'DISETUJUI' && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 block">
                            Disetujui
                          </span>
                        )}
                        {app.statusPengajuan === 'DITOLAK' && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 block">
                            Ditolak
                          </span>
                        )}

                        {app.noSuratResmi && (
                          <span className="text-[9px] font-mono text-slate-500 block mt-1 truncate max-w-[130px] mx-auto" title={app.noSuratResmi}>
                            {app.noSuratResmi}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetailModal(app)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Detail & Verifikasi Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print Disposisi */}
                          <button
                            onClick={() => exportStudentMutationApplicationPDF(app, settings)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Cetak Lembar Disposisi & Berkas Pengajuan"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Print Official Letter */}
                          {app.jenisMutasi === 'MUTASI_KELUAR' ? (
                            <button
                              onClick={() => {
                                const dummyStudent: Student = {
                                  id: app.studentId || 'dummy',
                                  namaLengkap: app.namaSiswa,
                                  nis: app.nis || '-',
                                  nisn: app.nisn,
                                  jenisKelamin: app.jenisKelamin,
                                  tempatLahir: app.tempatLahir || 'Kediri',
                                  tanggalLahir: app.tanggalLahir || '2011-01-01',
                                  agama: app.agama || 'Islam',
                                  kewarganegaraan: 'WNI',
                                  alamat: app.alamatPemohon,
                                  telepon: app.kontakPemohon,
                                  email: app.emailPemohon || '',
                                  kelasSaatIni: app.kelasAsal,
                                  tahunMasuk: '2024',
                                  statusSiswa: 'Pindah',
                                  sekolahTujuan: app.sekolahTujuan,
                                  tanggalMutasiKeluar: app.tanggalDiproses || app.tanggalEfektifMutasi || new Date().toISOString().split('T')[0],
                                  noSuratMutasiKeluar: app.noSuratResmi,
                                  alasanMutasi: app.alasanMutasi,
                                  namaAyah: app.namaPemohon,
                                  pekerjaanAyah: app.pekerjaanPemohon,
                                  namaIbu: '',
                                  pekerjaanIbu: '',
                                  teleponOrangTua: app.kontakPemohon,
                                  alamatOrangTua: app.alamatPemohon,
                                  foto: '',
                                  namaPanggilan: '',
                                  riwayatAkademik: {}
                                };
                                exportOfficialSuratMutasiKeluarPDF(dummyStudent, app, settings);
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Cetak Surat Keterangan Pindah Sekolah Resmi (Kepala Sekolah)"
                            >
                              <FileSignature className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => exportOfficialSuratMutasiMasukPDF(app, settings)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Cetak Surat Keterangan Bersedia Menerima Resmi (Kepala Sekolah)"
                            >
                              <FileSignature className="w-4 h-4" />
                            </button>
                          )}

                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDeleteApp(app.id, app.namaSiswa)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Permohonan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: TAMBAH PENGAJUAN MUTASI BARU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-scale-up">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Registrasi Permohonan Mutasi Siswa</h3>
                  <p className="text-[11px] text-slate-500">Formulir lengkap Buku Induk & Berita Acara Mutasi Kedinasan</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewApp} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Type Selector */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewAppType('MUTASI_KELUAR')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    newAppType === 'MUTASI_KELUAR' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Mutasi Keluar (Pindah Sekolah)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewAppType('MUTASI_MASUK');
                    setSelectedActiveStudentId('');
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    newAppType === 'MUTASI_MASUK' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Mutasi Masuk (Siswa Pindahan)</span>
                </button>
              </div>

              {/* If Outgoing, pick active student */}
              {newAppType === 'MUTASI_KELUAR' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>Pilih Siswa Aktif Dari Buku Induk (Otomatis Isi Data):</span>
                  </label>
                  <select
                    value={selectedActiveStudentId}
                    onChange={(e) => handleSelectActiveStudent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white text-slate-800 focus:outline-hidden focus:border-amber-500 font-medium"
                  >
                    <option value="">-- Pilih Siswa Terdaftar di SMPN 3 Kras --</option>
                    {activeStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.namaLengkap} - Kelas {s.kelasSaatIni} (NISN: {s.nisn})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* I. IDENTITAS SISWA */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>I. Identitas Peserta Didik</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600">Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Siswa"
                      value={newAppForm.namaSiswa}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, namaSiswa: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Jenis Kelamin</label>
                    <select
                      value={newAppForm.jenisKelamin}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, jenisKelamin: e.target.value as 'L' | 'P' }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">NISN (10 Digit) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0091234567"
                      value={newAppForm.nisn}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, nisn: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">NIS / Nomor Induk</label>
                    <input
                      type="text"
                      placeholder="NIS Sekolah Asal"
                      value={newAppForm.nis}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, nis: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Agama</label>
                    <select
                      value={newAppForm.agama}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, agama: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen Protestan</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Tempat Lahir</label>
                    <input
                      type="text"
                      placeholder="Kota Lahir"
                      value={newAppForm.tempatLahir}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, tempatLahir: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={newAppForm.tanggalLahir}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Kelas Asal *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 7-A atau Kelas 8"
                      value={newAppForm.kelasAsal}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, kelasAsal: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* II. KETERANGAN PERPINDAHAN & LEMBAGA */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-600" />
                  <span>II. Detail Kepindahan & Lembaga</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Sekolah Asal *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Sekolah Asal"
                      value={newAppForm.sekolahAsal}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, sekolahAsal: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">NPSN Sekolah Asal</label>
                    <input
                      type="text"
                      placeholder="8 Digit NPSN Asal"
                      value={newAppForm.npsnSekolahAsal}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, npsnSekolahAsal: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Sekolah Tujuan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Sekolah Tujuan"
                      value={newAppForm.sekolahTujuan}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, sekolahTujuan: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">NPSN Sekolah Tujuan</label>
                    <input
                      type="text"
                      placeholder="8 Digit NPSN Tujuan"
                      value={newAppForm.npsnSekolahTujuan}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, npsnSekolahTujuan: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Jalur Mutasi Kedinasan</label>
                    <select
                      value={newAppForm.jalurMutasi}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, jalurMutasi: e.target.value as any }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="ANTAR_KABUPATEN">Antar Kabupaten / Kota</option>
                      <option value="DALAM_KABUPATEN">Dalam Kabupaten Kediri</option>
                      <option value="ANTAR_PROVINSI">Antar Provinsi</option>
                      <option value="MADRASAH_KEMENAG">Madrasah (MTs / Kemenag)</option>
                      <option value="SWASTA_KE_NEGERI">Sekolah Swasta ke Negeri</option>
                      <option value="LUAR_NEGERI">Luar Negeri (SILN)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Kategori Alasan Mutasi</label>
                    <select
                      value={newAppForm.kategoriAlasan}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, kategoriAlasan: e.target.value as any }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="TUGAS_ORANG_TUA">Perpindahan Tugas Orang Tua / Dinas</option>
                      <option value="PINDAH_DOMISILI">Kepindahan Domisili / Tempat Tinggal Keluarga</option>
                      <option value="PONDOK_PESANTREN">Menempuh Pendidikan Agama / Pesantren</option>
                      <option value="JARAK_TRANSPORTASI">Jarak Tempuh & Akses Transportasi</option>
                      <option value="KESEHATAN">Alasan Kesehatan / Lingkungan</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600">Uraian Alasan Mutasi *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Uraikan secara detail alasan kepindahan siswa bersangkutan..."
                      value={newAppForm.alasanMutasi}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, alasanMutasi: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* III. IDENTITAS PEMOHON */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>III. Identitas Pemohon (Orang Tua / Wali)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600">Nama Lengkap Pemohon *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Orang Tua / Wali"
                      value={newAppForm.namaPemohon}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, namaPemohon: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Hubungan dengan Siswa</label>
                    <select
                      value={newAppForm.hubunganDenganSiswa}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, hubunganDenganSiswa: e.target.value as any }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="Orang Tua">Orang Tua Kandung</option>
                      <option value="Wali">Wali Resmi</option>
                      <option value="Siswa Sendiri">Siswa Sendiri</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Pekerjaan Pemohon</label>
                    <input
                      type="text"
                      placeholder="Contoh: PNS, TNI/Polri, Swasta"
                      value={newAppForm.pekerjaanPemohon}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, pekerjaanPemohon: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Nomor Telepon / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={newAppForm.kontakPemohon}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, kontakPemohon: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Alamat Email (Opsional)</label>
                    <input
                      type="email"
                      placeholder="email@domain.com"
                      value={newAppForm.emailPemohon}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, emailPemohon: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[11px] font-semibold text-slate-600">Alamat Lengkap Tempat Tinggal</label>
                    <input
                      type="text"
                      placeholder="Dusun / Jalan, RT/RW, Desa, Kecamatan, Kabupaten"
                      value={newAppForm.alamatPemohon}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, alamatPemohon: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Daftarkan Pengajuan Mutasi</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. MODAL DETAIL & VERIFIKASI ULTRA-DETAIL */}
      {selectedAppDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  selectedAppDetail.jenisMutasi === 'MUTASI_MASUK' ? 'bg-blue-600' : 'bg-rose-600'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Verifikasi & Disposisi Mutasi Siswa</h3>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700">
                      {selectedAppDetail.nomorRegistrasi}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedAppDetail.namaSiswa} &bull; Diajukan pada: {new Date(selectedAppDetail.tanggalPengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleSendWhatsAppNotification(selectedAppDetail)}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Hubungi Wali Siswa via WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  onClick={() => exportStudentMutationApplicationPDF(selectedAppDetail, settings)}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Cetak Lembar Disposisi"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Cetak PDF</span>
                </button>
                <button
                  onClick={() => setSelectedAppDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-5 bg-slate-50/50 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setDetailModalTab('profil')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  detailModalTab === 'profil' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                1. Profil & Siswa
              </button>
              <button
                type="button"
                onClick={() => setDetailModalTab('mutasi')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  detailModalTab === 'mutasi' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                2. Sekolah & Dapodik
              </button>
              <button
                type="button"
                onClick={() => setDetailModalTab('berkas_clearance')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  detailModalTab === 'berkas_clearance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                3. Berkas & Clearance 4 Meja
              </button>
              <button
                type="button"
                onClick={() => setDetailModalTab('keputusan_cetak')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  detailModalTab === 'keputusan_cetak' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                4. Keputusan & Cetak SK Resmi
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
              
              {/* TAB 1: PROFIL SISWA & PEMOHON */}
              {detailModalTab === 'profil' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Biodata Siswa Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>Data Lengkap Peserta Didik</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Nama Lengkap</span>
                        <span className="font-bold text-slate-900">{selectedAppDetail.namaSiswa}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">NISN</span>
                        <span className="font-mono font-bold text-indigo-700">{selectedAppDetail.nisn}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">NIS Asal / Lokal</span>
                        <span className="font-mono text-slate-700">{selectedAppDetail.nis || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Jenis Kelamin</span>
                        <span className="text-slate-700 font-semibold">
                          {selectedAppDetail.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Tempat, Tanggal Lahir</span>
                        <span className="text-slate-700">
                          {selectedAppDetail.tempatLahir || '-'}, {selectedAppDetail.tanggalLahir?.substring(0, 10) || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Agama</span>
                        <span className="text-slate-700">{selectedAppDetail.agama || 'Islam'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Kelas Asal</span>
                        <span className="font-bold text-indigo-700">{selectedAppDetail.kelasAsal}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Kelas Tujuan</span>
                        <span className="font-bold text-emerald-700">{selectedAppDetail.kelasTujuan || selectedAppDetail.kelasAsal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Biodata Pemohon Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span>Identitas Pemohon (Orang Tua / Wali Siswa)</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Nama Pemohon</span>
                        <span className="font-bold text-slate-900">{selectedAppDetail.namaPemohon}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Hubungan</span>
                        <span className="text-slate-700 font-medium">{selectedAppDetail.hubunganDenganSiswa}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Pekerjaan</span>
                        <span className="text-slate-700">{selectedAppDetail.pekerjaanPemohon || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">No. HP / WhatsApp</span>
                        <span className="font-mono font-bold text-emerald-700">{selectedAppDetail.kontakPemohon}</span>
                      </div>
                      <div className="sm:col-span-4">
                        <span className="text-[10px] text-slate-400 font-semibold block">Alamat Domisili</span>
                        <span className="text-slate-700">{selectedAppDetail.alamatPemohon}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: SEKOLAH ASAL, TUJUAN & DAPODIK */}
              {detailModalTab === 'mutasi' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Lembaga Info */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <School className="w-4 h-4 text-indigo-600" />
                      <span>Keterangan Lembaga & Alur Perpindahan</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sekolah Asal:</span>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedAppDetail.sekolahAsal}</div>
                        {selectedAppDetail.npsnSekolahAsal && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">NPSN: {selectedAppDetail.npsnSekolahAsal}</div>
                        )}
                        {selectedAppDetail.alamatSekolahAsal && (
                          <div className="text-[11px] text-slate-600 mt-1">{selectedAppDetail.alamatSekolahAsal}</div>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-indigo-200">
                        <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">Sekolah Tujuan:</span>
                        <div className="font-bold text-indigo-900 text-sm mt-0.5">{selectedAppDetail.sekolahTujuan}</div>
                        {selectedAppDetail.npsnSekolahTujuan && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">NPSN: {selectedAppDetail.npsnSekolahTujuan}</div>
                        )}
                        {selectedAppDetail.kabupatenKotaTujuan && (
                          <div className="text-[11px] text-slate-600 mt-1">{selectedAppDetail.kabupatenKotaTujuan}</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Jalur Mutasi</span>
                        <span className="font-bold text-slate-800">{selectedAppDetail.jalurMutasi?.replace(/_/g, ' ') || 'Reguler'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Kategori Alasan</span>
                        <span className="text-slate-800 font-medium">{selectedAppDetail.kategoriAlasan?.replace(/_/g, ' ') || 'Pribadi'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Semester / TP</span>
                        <span className="text-slate-800">{selectedAppDetail.semesterMutasi || 'Ganjil'} ({selectedAppDetail.tahunAjaranMutasi || '2026/2027'})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Kurikulum Ditempuh</span>
                        <span className="text-indigo-700 font-bold">{selectedAppDetail.kurikulumDitempuh || 'Kurikulum Merdeka'}</span>
                      </div>
                      <div className="sm:col-span-4 p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block">Uraian Alasan:</span>
                        <p className="text-slate-800 text-xs italic mt-0.5">&ldquo;{selectedAppDetail.alasanMutasi}&rdquo;</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Sinkronisasi Dapodik Kemdikbud */}
                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-indigo-600" />
                        <span>Kesiapan Sinkronisasi Dapodikdasmen & Verval PD</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {detailVerificationForm.statusDapodik.statusVervalPD}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Catatan Sinkronisasi Dapodik</label>
                        <input
                          type="text"
                          value={detailVerificationForm.statusDapodik.catatanDapodik || ''}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            statusDapodik: { ...prev.statusDapodik, catatanDapodik: e.target.value }
                          }))}
                          placeholder="Contoh: Siswa siap ditarik melalui SP Datadik Kemdikbud..."
                          className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">No. Surat Tarik / Mutasi Dapodik</label>
                        <input
                          type="text"
                          value={detailVerificationForm.statusDapodik.noSuratTarikDapodik || ''}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            statusDapodik: { ...prev.statusDapodik, noSuratTarikDapodik: e.target.value }
                          }))}
                          placeholder="Kode registrasi Dapodikdasmen"
                          className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: BERKAS PERSYARATAN & CLEARANCE 4 MEJA */}
              {detailModalTab === 'berkas_clearance' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Clearance 4 Meja Sekolah */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Lembar Clearance Bebas Tanggungan Sekolah (4 Meja)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pastikan siswa bebas pinjaman pustaka, tanggungan komite, dan masalah disiplin sebelum surat resmi diterbitkan.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* 1. Perpustakaan */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailVerificationForm.bebasAdministrasi.perpustakaan}
                            onChange={(e) => setDetailVerificationForm(prev => ({
                              ...prev,
                              bebasAdministrasi: { ...prev.bebasAdministrasi, perpustakaan: e.target.checked }
                            }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span>1. Bebas Peminjaman Perpustakaan</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Catatan Perpustakaan..."
                          value={detailVerificationForm.bebasAdministrasi.catatanPerpus || ''}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            bebasAdministrasi: { ...prev.bebasAdministrasi, catatanPerpus: e.target.value }
                          }))}
                          className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-hidden"
                        />
                      </div>

                      {/* 2. Keuangan / Komite */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailVerificationForm.bebasAdministrasi.keuanganKomite}
                            onChange={(e) => setDetailVerificationForm(prev => ({
                              ...prev,
                              bebasAdministrasi: { ...prev.bebasAdministrasi, keuanganKomite: e.target.checked }
                            }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span>2. Bebas Administrasi & Komite Sekolah</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Catatan Keuangan..."
                          value={detailVerificationForm.bebasAdministrasi.catatanKeuangan || ''}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            bebasAdministrasi: { ...prev.bebasAdministrasi, catatanKeuangan: e.target.value }
                          }))}
                          className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-hidden"
                        />
                      </div>

                      {/* 3. Kesiswaan / BK */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailVerificationForm.bebasAdministrasi.kesiswaanBK}
                            onChange={(e) => setDetailVerificationForm(prev => ({
                              ...prev,
                              bebasAdministrasi: { ...prev.bebasAdministrasi, kesiswaanBK: e.target.checked }
                            }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span>3. Catatan Sikap / Bimbingan Konseling (BK)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Catatan Kelakuan Baik BK..."
                          value={detailVerificationForm.bebasAdministrasi.catatanBK || ''}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            bebasAdministrasi: { ...prev.bebasAdministrasi, catatanBK: e.target.value }
                          }))}
                          className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-hidden"
                        />
                      </div>

                      {/* 4. Kurikulum & Rombel */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailVerificationForm.bebasAdministrasi.kurikulum}
                            onChange={(e) => setDetailVerificationForm(prev => ({
                              ...prev,
                              bebasAdministrasi: { ...prev.bebasAdministrasi, kurikulum: e.target.checked }
                            }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span>4. Validasi Kuota Rombel Kurikulum</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Catatan Rombel Kurikulum..."
                          value={detailVerificationForm.bebasAdministrasi.catatanKurikulum || ''}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            bebasAdministrasi: { ...prev.bebasAdministrasi, catatanKurikulum: e.target.value }
                          }))}
                          className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist 10 Berkas Fisik / Digital */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                      <span>Kelengkapan Berkas Dokumen Fisik / Digital</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detailVerificationForm.berkas.suratPermohonanOrtu}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            berkas: { ...prev.berkas, suratPermohonanOrtu: e.target.checked }
                          }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span>Surat Permohonan Ortu Bermaterai Rp 10.000</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detailVerificationForm.berkas.fotokopiRapor}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            berkas: { ...prev.berkas, fotokopiRapor: e.target.checked }
                          }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span>Fotokopi Rapor Lengkap Dilegalisir</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detailVerificationForm.berkas.fotokopiKkKtp}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            berkas: { ...prev.berkas, fotokopiKkKtp: e.target.checked }
                          }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span>Fotokopi Kartu Keluarga (KK) & KTP Ortu</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detailVerificationForm.berkas.aktaKelahiran}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            berkas: { ...prev.berkas, aktaKelahiran: e.target.checked }
                          }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span>Fotokopi Akta Kelahiran Siswa</span>
                      </label>

                      {selectedAppDetail.jenisMutasi === 'MUTASI_MASUK' ? (
                        <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailVerificationForm.berkas.suratKeteranganPindahAsal}
                            onChange={(e) => setDetailVerificationForm(prev => ({
                              ...prev,
                              berkas: { ...prev.berkas, suratKeteranganPindahAsal: e.target.checked }
                            }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span className="font-semibold text-indigo-900">Surat Keterangan Pindah Sekolah Asal (Asli)</span>
                        </label>
                      ) : (
                        <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailVerificationForm.berkas.suratBebasPinjamPerpus}
                            onChange={(e) => setDetailVerificationForm(prev => ({
                              ...prev,
                              berkas: { ...prev.berkas, suratBebasPinjamPerpus: e.target.checked }
                            }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span className="font-semibold text-indigo-900">Surat Keterangan Bebas Pinjam Perpustakaan</span>
                        </label>
                      )}

                      <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detailVerificationForm.berkas.suratRekomendasiDinas}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            berkas: { ...prev.berkas, suratRekomendasiDinas: e.target.checked }
                          }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span>Surat Rekomendasi Mutasi Dinas Pendidikan</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detailVerificationForm.berkas.suratKelakuanBaik}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            berkas: { ...prev.berkas, suratKelakuanBaik: e.target.checked }
                          }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span>Surat Keterangan Berkelakuan Baik (BK)</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detailVerificationForm.berkas.bukuRaporAsliDiserahkan}
                          onChange={(e) => setDetailVerificationForm(prev => ({
                            ...prev,
                            berkas: { ...prev.berkas, bukuRaporAsliDiserahkan: e.target.checked }
                          }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span>Buku Rapor Asli Telah Diserahkan Fisik</span>
                      </label>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: KEPUTUSAN TU & CETAK DOKUMEN RESMI */}
              {detailModalTab === 'keputusan_cetak' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Status Decision & Number */}
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Keputusan & Disposisi Tata Usaha</span>
                      <button
                        type="button"
                        onClick={() => {
                          const autoNum = generateOfficialNomorSurat(selectedAppDetail.jenisMutasi);
                          setDetailVerificationForm(prev => ({ ...prev, noSuratResmi: autoNum }));
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                      >
                        Auto-Generate No. Surat Kedinasan
                      </button>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Status Keputusan Verifikasi *</label>
                        <select
                          value={detailVerificationForm.statusPengajuan}
                          onChange={(e) => setDetailVerificationForm(prev => ({ ...prev, statusPengajuan: e.target.value as any }))}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-bold bg-white"
                        >
                          <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                          <option value="DIPROSES">Sedang Diproses Tata Usaha</option>
                          <option value="DISETUJUI">DISETUJUI (Surat Resmi Diterbitkan)</option>
                          <option value="DITOLAK">DITOLAK (Syarat Tidak Lengkap)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Nomor Surat Resmi SMPN 3 Kras</label>
                        <input
                          type="text"
                          placeholder="Contoh: 421.3 / 118 / 418.20.02.043 / 2026"
                          value={detailVerificationForm.noSuratResmi}
                          onChange={(e) => setDetailVerificationForm(prev => ({ ...prev, noSuratResmi: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Nomor Rekomendasi Dinas Diknas</label>
                        <input
                          type="text"
                          placeholder="Contoh: 421.2 / 891 / 418.20 / 2026"
                          value={detailVerificationForm.noSuratRekomendasiDinas}
                          onChange={(e) => setDetailVerificationForm(prev => ({ ...prev, noSuratRekomendasiDinas: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Nama Petugas Verifikator TU</label>
                        <input
                          type="text"
                          value={detailVerificationForm.verifikator}
                          onChange={(e) => setDetailVerificationForm(prev => ({ ...prev, verifikator: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-600">Catatan Disposisi untuk Orang Tua / Siswa</label>
                        <input
                          type="text"
                          placeholder="Contoh: Seluruh persyaratan lengkap, silakan mengambil SK mutasi dan rapor di meja TU..."
                          value={detailVerificationForm.catatanVerifikasi}
                          onChange={(e) => setDetailVerificationForm(prev => ({ ...prev, catatanVerifikasi: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSaveVerification}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan Keputusan Verifikasi</span>
                      </button>
                    </div>
                  </div>

                  {/* Cetak Surat Resmi Options */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-emerald-600" />
                      <span>Cetak Dokumen Kedinasan (Kop Surat & Stempel Digital)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Document 1: Surat Keterangan Pindah / Bersedia Menerima */}
                      {selectedAppDetail.jenisMutasi === 'MUTASI_KELUAR' ? (
                        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Dokumen Resmi 1</span>
                            <div className="text-xs font-bold text-slate-900 mt-0.5">Surat Keterangan Pindah Sekolah Resmi</div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Surat resmi Kepala Sekolah lengkap dengan nomor dinas, stempel, dan QR keabsahan.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const dummyStudent: Student = {
                                id: selectedAppDetail.studentId || 'dummy',
                                namaLengkap: selectedAppDetail.namaSiswa,
                                nis: selectedAppDetail.nis || '-',
                                nisn: selectedAppDetail.nisn,
                                jenisKelamin: selectedAppDetail.jenisKelamin,
                                tempatLahir: selectedAppDetail.tempatLahir || 'Kediri',
                                tanggalLahir: selectedAppDetail.tanggalLahir || '2011-01-01',
                                agama: selectedAppDetail.agama || 'Islam',
                                kewarganegaraan: 'WNI',
                                alamat: selectedAppDetail.alamatPemohon,
                                telepon: selectedAppDetail.kontakPemohon,
                                email: selectedAppDetail.emailPemohon || '',
                                kelasSaatIni: selectedAppDetail.kelasAsal,
                                tahunMasuk: '2024',
                                statusSiswa: 'Pindah',
                                sekolahTujuan: selectedAppDetail.sekolahTujuan,
                                tanggalMutasiKeluar: selectedAppDetail.tanggalDiproses || selectedAppDetail.tanggalEfektifMutasi || new Date().toISOString().split('T')[0],
                                noSuratMutasiKeluar: detailVerificationForm.noSuratResmi || selectedAppDetail.noSuratResmi,
                                alasanMutasi: selectedAppDetail.alasanMutasi,
                                namaAyah: selectedAppDetail.namaPemohon,
                                pekerjaanAyah: selectedAppDetail.pekerjaanPemohon,
                                namaIbu: '',
                                pekerjaanIbu: '',
                                teleponOrangTua: selectedAppDetail.kontakPemohon,
                                alamatOrangTua: selectedAppDetail.alamatPemohon,
                                foto: '',
                                namaPanggilan: '',
                                riwayatAkademik: {}
                              };
                              exportOfficialSuratMutasiKeluarPDF(dummyStudent, selectedAppDetail, settings);
                            }}
                            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            <span>Cetak SK Mutasi Keluar (PDF)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Dokumen Resmi 1</span>
                            <div className="text-xs font-bold text-slate-900 mt-0.5">Surat Keterangan Bersedia Menerima Siswa</div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Surat resmi kesiapan menerima siswa pindahan berdasarkan daya tampung rombel.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => exportOfficialSuratMutasiMasukPDF(selectedAppDetail, settings)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            <span>Cetak Surat Kesiapan Terima (PDF)</span>
                          </button>
                        </div>
                      )}

                      {/* Document 2: Lembar Disposisi & Berkas Pengajuan */}
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dokumen Resmi 2</span>
                          <div className="text-xs font-bold text-slate-900 mt-0.5">Lembar Disposisi & Tanda Terima Berkas</div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Bukti verifikasi fisik, kelengkapan checklist, dan disposisi petugas pelayanan TU.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => exportStudentMutationApplicationPDF(selectedAppDetail, settings)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Disposisi TU (PDF)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct Master Database Execution */}
                  {userRole === 'admin' && detailVerificationForm.statusPengajuan === 'DISETUJUI' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h5 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Eksekusi Data ke Buku Induk Siswa Digital</span>
                        </h5>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          {selectedAppDetail.jenisMutasi === 'MUTASI_KELUAR' 
                            ? 'Ubah status siswa menjadi "Pindah", masukkan tanggal mutasi dan sekolah tujuan secara otomatis.'
                            : 'Tambahkan peserta didik baru ini ke daftar Siswa Aktif Buku Induk SMPN 3 Kras.'}
                        </p>
                      </div>
                      {selectedAppDetail.jenisMutasi === 'MUTASI_KELUAR' ? (
                        <button
                          type="button"
                          onClick={() => handleExecuteOutgoingDirectly(selectedAppDetail)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 cursor-pointer"
                        >
                          Eksekusi Status Siswa Pindah
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExecuteIncomingDirectly(selectedAppDetail)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 cursor-pointer"
                        >
                          Eksekusi ke Siswa Aktif
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-500">
                Sistem Tata Usaha & Kesiswaan &bull; {settings.namaSekolah || 'SMP NEGERI 3 KRAS'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAppDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
