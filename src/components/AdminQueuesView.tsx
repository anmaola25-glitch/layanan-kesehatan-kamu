import React, { useState } from 'react';
import {
  Search,
  Volume2,
  Play,
  CheckCircle,
  SkipForward,
  XCircle,
  Tv,
  Clock,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { QueueEntry } from '../types/index.ts';
import { StatusBadge } from './Badge.tsx';
import { announceQueue } from '../lib/sound.ts';

interface AdminQueuesViewProps {
  queues: QueueEntry[];
  onUpdateStatus: (id: string, action: 'call' | 'start' | 'complete' | 'skip' | 'cancel') => Promise<void>;
  audioEnabled: boolean;
  onRefresh: () => void;
}

export const AdminQueuesView: React.FC<AdminQueuesViewProps> = ({
  queues,
  onUpdateStatus,
  audioEnabled,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [tvMode, setTvMode] = useState(false);
  const [callingId, setCallingId] = useState<string | null>(null);

  const filtered = queues.filter((q) => {
    const matchesSearch =
      search === '' ||
      q.fullName.toLowerCase().includes(search.toLowerCase()) ||
      q.queueNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.serviceName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'Semua Status' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCall = async (entry: QueueEntry) => {
    setCallingId(entry.id);
    try {
      await onUpdateStatus(entry.id, 'call');
      if (audioEnabled) {
        await announceQueue(entry.queueNumber, entry.fullName);
      }
    } finally {
      setCallingId(null);
    }
  };

  // Find currently serving patient
  const currentlyServing = queues.find((q) => q.status === 'Sedang Dilayani');
  const currentlyCalling = queues.find((q) => q.status === 'Dipanggil');
  const nextInLine = queues.find((q) => q.status === 'Menunggu Giliran');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#34483D] tracking-tight">
            Antrean Aktif
          </h2>
          <p className="text-xs sm:text-sm text-[#747C75] mt-0.5">
            Manajemen alur pelayanan antrean ruang praktik secara langsung
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white border border-[#E8DFD0] hover:bg-[#F7F5EF] text-[#34483D] transition cursor-pointer"
            title="Refresh Antrean"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTvMode(true)}
            className="px-3.5 py-2 rounded-xl bg-[#34483D] hover:bg-[#27362e] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Tv className="w-4 h-4 text-[#E8DFD0]" />
            <span>Mode Layar Ruang Tunggu (TV)</span>
          </button>
        </div>
      </div>

      {/* Real-time calling spotlight cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border-2 border-[#718776] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#718776] uppercase tracking-wider">
              Sedang Dilayani
            </span>
            <div className="text-3xl font-extrabold text-[#34483D] font-mono mt-1">
              {currentlyServing ? currentlyServing.queueNumber : '-'}
            </div>
            <p className="text-xs font-semibold text-[#26332B] truncate max-w-[180px] mt-0.5">
              {currentlyServing ? currentlyServing.fullName : 'Belum ada pasien'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBF5EE] text-[#43865A] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#BCD4FA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#2B6CB0] uppercase tracking-wider">
              Sedang Dipanggil
            </span>
            <div className="text-3xl font-extrabold text-[#2B6CB0] font-mono mt-1">
              {currentlyCalling ? currentlyCalling.queueNumber : '-'}
            </div>
            <p className="text-xs font-semibold text-[#26332B] truncate max-w-[180px] mt-0.5">
              {currentlyCalling ? currentlyCalling.fullName : 'Tidak ada panggilan'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBF2FE] text-[#2B6CB0] flex items-center justify-center animate-pulse">
            <Volume2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8DFD0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#747C75] uppercase tracking-wider">
              Giliran Selanjutnya
            </span>
            <div className="text-3xl font-extrabold text-[#747C75] font-mono mt-1">
              {nextInLine ? nextInLine.queueNumber : '-'}
            </div>
            <p className="text-xs font-semibold text-[#26332B] truncate max-w-[180px] mt-0.5">
              {nextInLine ? nextInLine.fullName : 'Antrean kosong'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F5EF] text-[#747C75] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8DFD0] p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor antrean atau nama pasien..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2DED5] text-xs sm:text-sm text-[#26332B] placeholder:text-[#A1A7A1] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#718776]"
          />
          <Search className="w-4 h-4 text-[#747C75] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E2DED5] text-xs font-medium text-[#34483D] bg-[#FDFBF7] focus:outline-none focus:border-[#718776] cursor-pointer"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Menunggu Giliran">Menunggu Giliran</option>
            <option value="Dipanggil">Dipanggil</option>
            <option value="Sedang Dilayani">Sedang Dilayani</option>
            <option value="Dilewati">Dilewati</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Queues Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FDFBF7] text-[#747C75] font-semibold uppercase tracking-wider border-b border-[#E8DFD0]">
              <tr>
                <th className="px-4 py-3.5">No. Antrean</th>
                <th className="px-4 py-3.5">Nama Pasien</th>
                <th className="px-4 py-3.5">Layanan</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Panggilan</th>
                <th className="px-4 py-3.5 text-right">Tindakan Mantri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFE8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#747C75]">
                    Belum ada antrean yang sesuai pada kriteria ini.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F5EF] transition">
                    <td className="px-4 py-3.5 font-mono font-black text-sm text-[#34483D]">
                      {item.queueNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-[#26332B]">{item.fullName}</p>
                      {item.phone && (
                        <p className="text-[11px] text-[#747C75] font-mono">{item.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[#747C75]">
                      {item.serviceName}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold text-[#747C75]">
                      {item.callCount}x
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Panggil Button */}
                      {item.status !== 'Selesai' && item.status !== 'Dibatalkan' && (
                        <button
                          type="button"
                          onClick={() => handleCall(item)}
                          disabled={callingId === item.id}
                          className="px-2.5 py-1 rounded-md bg-[#718776] hover:bg-[#5d7162] text-white font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{item.callCount > 0 ? 'Panggil Ulang' : 'Panggil'}</span>
                        </button>
                      )}

                      {/* Mulai Button */}
                      {(item.status === 'Dipanggil' || item.status === 'Menunggu Giliran' || item.status === 'Dilewati') && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'start')}
                          className="px-2.5 py-1 rounded-md bg-[#34483D] hover:bg-[#27362e] text-white font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Mulai</span>
                        </button>
                      )}

                      {/* Selesai Button */}
                      {item.status === 'Sedang Dilayani' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'complete')}
                          className="px-2.5 py-1 rounded-md bg-[#43865A] hover:bg-[#346b47] text-white font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Selesai</span>
                        </button>
                      )}

                      {/* Lewati Button */}
                      {(item.status === 'Dipanggil' || item.status === 'Menunggu Giliran') && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'skip')}
                          className="px-2.5 py-1 rounded-md bg-[#FFF0EB] hover:bg-[#FBD38D] text-[#C05621] font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <SkipForward className="w-3 h-3" />
                          <span>Lewati</span>
                        </button>
                      )}

                      {/* Batal Button */}
                      {item.status !== 'Selesai' && item.status !== 'Dibatalkan' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Batalkan antrean ${item.queueNumber} (${item.fullName})?`)) {
                              onUpdateStatus(item.id, 'cancel');
                            }
                          }}
                          className="px-2 py-1 rounded-md bg-[#FDF2F2] hover:bg-[#F8CACA] text-[#B94B4B] font-medium text-[11px] cursor-pointer"
                        >
                          Batal
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TV / WAITING ROOM MONITOR DISPLAY MODAL */}
      {tvMode && (
        <div className="fixed inset-0 z-50 bg-[#26332B] text-white flex flex-col p-6 sm:p-10 animate-fadeIn">
          {/* Top Bar of TV display */}
          <div className="flex items-center justify-between pb-6 border-b border-white/20">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E8DFD0] tracking-tight">
                Praktik Mandiri Mantri Husada
              </h1>
              <p className="text-sm text-white/70">Papan Antrean Ruang Tunggu Pasien</p>
            </div>
            <button
              onClick={() => setTvMode(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Keluar dari layar TV"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* TV Grid Content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
            {/* Big Active Calling Card */}
            <div className="lg:col-span-7 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-[#718776] text-white text-sm font-bold tracking-widest uppercase">
                {currentlyCalling ? 'SEDANG DIPANGGIL' : 'SEDANG DILAYANI'}
              </span>
              <div className="text-8xl sm:text-9xl font-black text-white font-mono my-4 tracking-tighter">
                {currentlyCalling?.queueNumber || currentlyServing?.queueNumber || '-'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E8DFD0]">
                {currentlyCalling?.fullName || currentlyServing?.fullName || 'Belum Ada Pasien'}
              </h2>
              <p className="text-lg text-white/80">
                Layanan: {currentlyCalling?.serviceName || currentlyServing?.serviceName || '-'}
              </p>
            </div>

            {/* Next Queues List */}
            <div className="lg:col-span-5 bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
              <h3 className="text-xl font-bold text-[#E8DFD0] border-b border-white/10 pb-3">
                Antrean Selanjutnya
              </h3>
              <div className="space-y-3">
                {queues
                  .filter((q) => q.status === 'Menunggu Giliran' || q.status === 'Dilewati')
                  .slice(0, 5)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 border border-white/10 text-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-mono font-bold text-[#E8DFD0]">{q.queueNumber}</span>
                        <span className="font-semibold text-sm">{q.fullName}</span>
                      </div>
                      <StatusBadge status={q.status} size="sm" />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-white/50 pt-4 border-t border-white/10">
            Harap memperhatikan nomor antrean dan mendengarkan panggilan speaker ruang praktik &bull; Tekan tombol Esc atau silang untuk menutup
          </div>
        </div>
      )}
    </div>
  );
};
