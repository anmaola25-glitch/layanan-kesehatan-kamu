import React, { useState } from 'react';
import { Search, Calendar, Clock, CheckCircle } from 'lucide-react';
import { QueueEntry } from '../types/index.ts';
import { StatusBadge } from './Badge.tsx';

interface AdminHistoryViewProps {
  history: QueueEntry[];
}

export const AdminHistoryView: React.FC<AdminHistoryViewProps> = ({ history }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const filtered = history.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.queueNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.serviceName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'Semua Status' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#34483D] tracking-tight">
          Riwayat Pelayanan
        </h2>
        <p className="text-xs sm:text-sm text-[#747C75] mt-0.5">
          Rekam jejak seluruh antrean pelayanan medis yang telah diproses
        </p>
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#E2DED5] text-xs font-medium text-[#34483D] bg-[#FDFBF7] focus:outline-none focus:border-[#718776] cursor-pointer"
        >
          <option value="Semua Status">Semua Status</option>
          <option value="Selesai">Selesai</option>
          <option value="Dilewati">Dilewati</option>
          <option value="Sedang Dilayani">Sedang Dilayani</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FDFBF7] text-[#747C75] font-semibold uppercase tracking-wider border-b border-[#E8DFD0]">
              <tr>
                <th className="px-4 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">No. Antrean</th>
                <th className="px-4 py-3.5">Nama Pasien</th>
                <th className="px-4 py-3.5">Layanan</th>
                <th className="px-4 py-3.5">Waktu Mulai & Selesai</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFE8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#747C75]">
                    Belum ada riwayat pelayanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  let duration = null;
                  if (item.serviceStartedAt && item.serviceCompletedAt) {
                    const diffMs = new Date(item.serviceCompletedAt).getTime() - new Date(item.serviceStartedAt).getTime();
                    const mins = Math.max(1, Math.round(diffMs / 60000));
                    duration = `${mins} menit`;
                  }
                  return (
                    <tr key={item.id} className="hover:bg-[#F7F5EF] transition">
                      <td className="px-4 py-3.5 font-mono text-[#747C75]">
                        {item.date}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-[#34483D]">
                        {item.queueNumber}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#26332B]">
                        {item.fullName}
                      </td>
                      <td className="px-4 py-3.5 text-[#747C75]">
                        {item.serviceName}
                      </td>
                      <td className="px-4 py-3.5 text-[#747C75]">
                        {item.serviceStartedAt ? (
                          <span>
                            {new Date(item.serviceStartedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {item.serviceCompletedAt
                              ? new Date(item.serviceCompletedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                              : '...'}
                            {duration && <span className="ml-1.5 text-[#718776] font-medium">({duration})</span>}
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
