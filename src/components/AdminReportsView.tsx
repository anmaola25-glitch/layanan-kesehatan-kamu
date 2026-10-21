import React, { useState } from 'react';
import { Download, Printer, Filter, Calendar, BarChart2, PieChart, Clock } from 'lucide-react';
import { QueueApplication, QueueEntry } from '../types/index.ts';

interface AdminReportsViewProps {
  reportData: {
    summary: {
      totalPengajuan: number;
      totalDisetujui: number;
      totalDitolak: number;
      totalDibatalkan: number;
      totalSelesai: number;
      totalDilewati: number;
      avgDurationMinutes: number;
    };
    applications: QueueApplication[];
    queues: QueueEntry[];
  };
  onFilterChange: (startDate: string, endDate: string) => void;
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({
  reportData,
  onFilterChange
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { summary, applications, queues } = reportData;

  const handleDownloadCsv = () => {
    // Generate real CSV from applications and queues
    const headers = ['Kode Pengajuan', 'Nama Pasien', 'Email', 'No Telepon', 'Layanan', 'Status Pengajuan', 'No Antrean', 'Waktu Pengajuan'];
    const rows = applications.map((a) => [
      `"${a.applicationCode}"`,
      `"${a.fullName}"`,
      `"${a.email}"`,
      `"${a.phone || ''}"`,
      `"${a.serviceName}"`,
      `"${a.status}"`,
      `"${a.queueNumber || ''}"`,
      `"${a.appliedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Antrean_Mantri_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Percentages for status distribution
  const total = summary.totalPengajuan || 1;
  const pctDisetujui = Math.round((summary.totalDisetujui / total) * 100);
  const pctDitolak = Math.round((summary.totalDitolak / total) * 100);
  const pctDibatalkan = Math.round((summary.totalDibatalkan / total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#34483D] tracking-tight">
            Laporan
          </h2>
          <p className="text-xs sm:text-sm text-[#747C75] mt-0.5">
            Statistik dan evaluasi efisiensi antrean pelayanan praktik mandiri
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-[#34483D] hover:bg-[#27362e] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#E8DFD0]" />
            <span>Unduh CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F5EF] text-[#34483D] border border-[#E8DFD0] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E8DFD0] p-4 shadow-xs flex flex-wrap items-center gap-4 no-print">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-[#747C75]" />
          <span className="font-semibold text-[#747C75]">Periode Tanggal:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              onFilterChange(e.target.value, endDate);
            }}
            className="px-3 py-1.5 rounded-lg border border-[#E2DED5] text-xs text-[#26332B] bg-[#FDFBF7]"
          />
          <span className="text-[#747C75]">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              onFilterChange(startDate, e.target.value);
            }}
            className="px-3 py-1.5 rounded-lg border border-[#E2DED5] text-xs text-[#26332B] bg-[#FDFBF7]"
          />
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              onFilterChange('', '');
            }}
            className="text-xs text-[#B94B4B] hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E8DFD0] shadow-xs">
          <p className="text-xs text-[#747C75] font-medium">Total Pengajuan</p>
          <p className="text-2xl font-extrabold text-[#34483D] font-mono mt-1">
            {summary.totalPengajuan}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8DFD0] shadow-xs">
          <p className="text-xs text-[#747C75] font-medium">Disetujui</p>
          <p className="text-2xl font-extrabold text-[#43865A] font-mono mt-1">
            {summary.totalDisetujui}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8DFD0] shadow-xs">
          <p className="text-xs text-[#747C75] font-medium">Ditolak</p>
          <p className="text-2xl font-extrabold text-[#B94B4B] font-mono mt-1">
            {summary.totalDitolak}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8DFD0] shadow-xs">
          <p className="text-xs text-[#747C75] font-medium">Selesai Dilayani</p>
          <p className="text-2xl font-extrabold text-[#2B6CB0] font-mono mt-1">
            {summary.totalSelesai}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8DFD0] shadow-xs col-span-2 sm:col-span-1">
          <p className="text-xs text-[#747C75] font-medium">Rata-rata Durasi</p>
          <p className="text-2xl font-extrabold text-[#34483D] font-mono mt-1">
            {summary.avgDurationMinutes} <span className="text-sm font-normal text-[#747C75]">menit</span>
          </p>
        </div>
      </div>

      {/* Visual Chart and Breakdown Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E8DFD0] p-6 shadow-xs">
          <h3 className="font-bold text-base text-[#34483D] mb-4">
            Grafik Status Pengajuan
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Ring Donut Chart */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#E8DFD0"
                  strokeWidth="3.5"
                />
                {/* Disetujui Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#43865A"
                  strokeWidth="3.5"
                  strokeDasharray={`${pctDisetujui} ${100 - pctDisetujui}`}
                  strokeDashoffset="0"
                />
                {/* Ditolak Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#B94B4B"
                  strokeWidth="3.5"
                  strokeDasharray={`${pctDitolak} ${100 - pctDitolak}`}
                  strokeDashoffset={`-${pctDisetujui}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[#747C75]">Disetujui</span>
                <span className="text-xl font-black text-[#43865A] font-mono">{pctDisetujui}%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#43865A]" />
                <span className="text-[#26332B] font-medium">Disetujui:</span>
                <span className="font-bold font-mono">{summary.totalDisetujui} ({pctDisetujui}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#B94B4B]" />
                <span className="text-[#26332B] font-medium">Ditolak:</span>
                <span className="font-bold font-mono">{summary.totalDitolak} ({pctDitolak}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#B78336]" />
                <span className="text-[#26332B] font-medium">Dibatalkan:</span>
                <span className="font-bold font-mono">{summary.totalDibatalkan} ({pctDibatalkan}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Analysis */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E8DFD0] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#34483D] mb-2">
              Evaluasi Efisiensi Pelayanan Antrean
            </h3>
            <p className="text-xs text-[#747C75] leading-relaxed mb-4">
              Penerapan sistem antrean berbasis web ini berhasil mengeliminasi penumpukan fisik di ruang tunggu dengan tingkat kehadiran pelayanan:
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#EBF5EE] rounded-xl border border-[#C8E6D3]">
                <p className="font-bold text-[#43865A]">Tingkat Keberhasilan Pelayanan (Service Completion Rate)</p>
                <p className="text-lg font-black text-[#34483D] font-mono mt-0.5">
                  {summary.totalDisetujui > 0 ? Math.round((summary.totalSelesai / summary.totalDisetujui) * 100) : 0}%
                </p>
                <p className="text-[11px] text-[#747C75] mt-1">
                  Pasien yang telah disetujui hadir dan selesai menerima pemeriksaan tanpa kendala waktu tunggu berlebih.
                </p>
              </div>

              <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8DFD0]">
                <p className="font-bold text-[#34483D]">Rata-rata Waktu Pelayanan per Pasien</p>
                <p className="text-sm font-semibold text-[#26332B] mt-0.5">
                  {summary.avgDurationMinutes} Menit &bull; Sesuai standar operasional pelayanan mandiri keperawatan
                </p>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-[#747C75] pt-3 border-t border-[#E8DFD0]">
            Dicetak untuk keperluan dokumentasi akademik skripsi &bull; Praktik Mandiri Mantri
          </div>
        </div>
      </div>
    </div>
  );
};
