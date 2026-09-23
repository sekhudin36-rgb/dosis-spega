/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ActivityLog } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  Download, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  FileSpreadsheet,
  RefreshCw,
  Info
} from 'lucide-react';

interface ActivityLogPanelProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
}

export default function ActivityLogPanel({
  logs,
  onClearLogs
}: ActivityLogPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('Semua');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Action filter
      if (actionFilter !== 'Semua' && log.action !== actionFilter) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.description.toLowerCase().includes(q) ||
        log.username.toLowerCase().includes(q) ||
        (log.targetName && log.targetName.toLowerCase().includes(q)) ||
        (log.targetId && log.targetId.toLowerCase().includes(q))
      );
    });
  }, [logs, searchQuery, actionFilter]);

  // Action badge styling helper
  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'TAMBAH_SISWA':
        return {
          label: 'Tambah Siswa',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'EDIT_SISWA':
        return {
          label: 'Edit Siswa',
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'HAPUS_SISWA':
        return {
          label: 'Hapus Siswa',
          className: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'NILAI_RAPOR':
        return {
          label: 'Nilai Rapor',
          className: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'KENAIKAN_KELAS':
        return {
          label: 'Kenaikan Kelas',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'MUTASI_SISWA':
        return {
          label: 'Mutasi Siswa',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'PENGATURAN':
        return {
          label: 'Pengaturan Sekolah',
          className: 'bg-cyan-50 text-cyan-700 border-cyan-200'
        };
      case 'CADANGAN_DATA':
        return {
          label: 'Cadangan & Pemulihan',
          className: 'bg-slate-100 text-slate-700 border-slate-300'
        };
      case 'ALUMNI_UPDATE':
        return {
          label: 'Data Alumni',
          className: 'bg-teal-50 text-teal-700 border-teal-200'
        };
      case 'AUTH_SESSION':
        return {
          label: 'Autentikasi & Sesi',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'SYSTEM':
        return {
          label: 'Sistem & Data',
          className: 'bg-violet-50 text-violet-700 border-violet-200'
        };
      default:
        return {
          label: action,
          className: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  // Export logs to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID Log', 'Waktu (ISO)', 'Operator', 'Peran', 'Aksi', 'Keterangan', 'Target ID', 'Nama Target'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.username}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.targetId || ''}"`,
      `"${l.targetName || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_trail_buku_induk_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Log Aktivitas & Audit Trail Sistem
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Pencatatan Otomatis Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Catatan riwayat rekam jejak setiap mutasi data, penambahan siswa, pembaruan rapor semester, dan modifikasi konfigurasi instansi untuk kepatuhan akuntabilitas dan audit internal sekolah.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
            title="Ekspor seluruh rekaman log aktivitas ke CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer border border-rose-200"
            title="Bersihkan riwayat log"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Clear Log Confirmation Alert */}
      {showClearConfirm && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3 text-rose-800 text-xs font-medium">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Apakah Anda yakin ingin mengosongkan seluruh riwayat audit trail? Rekam jejak sebelumnya tidak dapat dikembalikan.</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Batalkan
            </button>
            <button
              onClick={() => {
                onClearLogs();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Ya, Kosongkan
            </button>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari deskripsi kegiatan, nama operator, atau nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-hidden focus:border-slate-800 focus:bg-white text-slate-800"
          />
        </div>

        {/* Action Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden focus:border-slate-800 w-full md:w-48 cursor-pointer"
          >
            <option value="Semua">Semua Kategori Aksi</option>
            <option value="TAMBAH_SISWA">Tambah Siswa</option>
            <option value="EDIT_SISWA">Edit Siswa</option>
            <option value="HAPUS_SISWA">Hapus Siswa</option>
            <option value="NILAI_RAPOR">Nilai Rapor</option>
            <option value="KENAIKAN_KELAS">Kenaikan Kelas</option>
            <option value="MUTASI_SISWA">Mutasi Siswa</option>
            <option value="PENGATURAN">Pengaturan Sekolah</option>
            <option value="CADANGAN_DATA">Cadangan & Pemulihan</option>
            <option value="ALUMNI_UPDATE">Data Alumni</option>
            <option value="AUTH_SESSION">Autentikasi & Sesi</option>
            <option value="SYSTEM">Sistem & Basis Data</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Belum ada riwayat aktivitas yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">
              Aktivitas pengelolaan data siswa, penginputan nilai, atau pengaturan akan otomatis tercatat di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-44">Waktu Kejadian</th>
                  <th className="py-3 px-4 w-36">Operator</th>
                  <th className="py-3 px-4 w-36">Kategori</th>
                  <th className="py-3 px-4">Deskripsi Aktivitas</th>
                  <th className="py-3 px-4 w-32 text-right">Target Terkait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const dateObj = new Date(log.timestamp);
                  const formattedTime = dateObj.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) + ', ' + dateObj.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Time */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formattedTime}</span>
                        </div>
                      </td>

                      {/* Operator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="capitalize">{log.username}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-mono">
                            {log.userRole}
                          </span>
                        </div>
                      </td>

                      {/* Action category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium leading-relaxed">
                        {log.description}
                      </td>

                      {/* Target Name/ID */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {log.targetName ? (
                          <div>
                            <p className="font-bold text-slate-800 text-[11px] truncate max-w-xs">{log.targetName}</p>
                            {log.targetId && (
                              <p className="font-mono text-[9px] text-slate-400">ID: {log.targetId}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Menampilkan <strong>{filteredLogs.length}</strong> rekaman log dari total <strong>{logs.length}</strong> rekaman.</span>
          <span className="font-mono text-[10px] text-slate-400">Penyimpanan Terenkripsi Lokal Browser (LocalStorage)</span>
        </div>
      </div>

    </div>
  );
}
