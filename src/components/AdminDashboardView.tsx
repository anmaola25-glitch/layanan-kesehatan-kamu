import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  Users,
  Stethoscope,
  UserCheck,
  ArrowRight,
  Calendar,
  AlertCircle,
  Eye,
  Check,
  X as XIcon,
  Sparkles
} from 'lucide-react';
import { DashboardStats, QueueApplication, QueueEntry, AdminNotification, ClinicSettings } from '../types/index.ts';
import { StatusBadge } from './Badge.tsx';

interface AdminDashboardViewProps {
  stats: DashboardStats;
  recentApplications: QueueApplication[];
  activeQueues: QueueEntry[];
  notifications: AdminNotification[];
  settings: ClinicSettings | null;
  onViewAllApplications: () => void;
  onViewAllQueues: () => void;
  onApproveApplication: (id: string) => void;
  onRejectApplication: (id: string) => void;
  onOpenDetail: (app: QueueApplication) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  recentApplications,
  activeQueues,
  notifications,
  settings,
  onViewAllApplications,
  onViewAllQueues,
  onApproveApplication,
  onRejectApplication,
  onOpenDetail
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#34483D] tracking-tight">
          Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-[#747C75] mt-0.5">
          Selamat datang, {settings?.mantriName || 'Mantri Husada, S.Kep., Ns.'} &bull; Panel Manajemen Pelayanan Praktik
        </p>
      </div>

      {/* 5 Stat Cards from Design Reference */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Menunggu Persetujuan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD0] shadow-xs flex items-center gap-3.5 hover:shadow-md transition">
          <div className="w-11 h-11 rounded-xl bg-[#FFF6E5] text-[#B78336] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#747C75]">Menunggu Persetujuan</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#26332B] mt-0.5 font-mono">
              {stats.pendingApplications}
            </p>
          </div>
        </div>

        {/* Card 2: Disetujui */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD0] shadow-xs flex items-center gap-3.5 hover:shadow-md transition">
          <div className="w-11 h-11 rounded-xl bg-[#EBF5EE] text-[#43865A] flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#747C75]">Disetujui</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#26332B] mt-0.5 font-mono">
              {stats.approvedToday}
            </p>
          </div>
        </div>

        {/* Card 3: Menunggu Giliran */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD0] shadow-xs flex items-center gap-3.5 hover:shadow-md transition">
          <div className="w-11 h-11 rounded-xl bg-[#FFF0EB] text-[#C05621] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#747C75]">Menunggu Giliran</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#26332B] mt-0.5 font-mono">
              {stats.waitingInQueue}
            </p>
          </div>
        </div>

        {/* Card 4: Sedang Dilayani */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD0] shadow-xs flex items-center gap-3.5 hover:shadow-md transition">
          <div className="w-11 h-11 rounded-xl bg-[#EBF2FE] text-[#2B6CB0] flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#747C75]">Sedang Dilayani</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#26332B] mt-0.5 font-mono">
              {stats.currentlyServing}
            </p>
          </div>
        </div>

        {/* Card 5: Selesai Hari Ini */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD0] shadow-xs flex items-center gap-3.5 hover:shadow-md transition col-span-2 sm:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-[#EBF7F0] text-[#43865A] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#747C75]">Selesai Hari Ini</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#26332B] mt-0.5 font-mono">
              {stats.completedToday}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tables (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Table 1: Pengajuan Terbaru */}
          <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E8DFD0] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#34483D]">Pengajuan Terbaru</h3>
                <p className="text-xs text-[#747C75]">Menampilkan pengajuan pendaftaran yang masuk</p>
              </div>
              <button
                type="button"
                onClick={onViewAllApplications}
                className="text-xs font-semibold text-[#718776] hover:text-[#5d7162] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDFBF7] text-[#747C75] font-semibold uppercase tracking-wider border-b border-[#E8DFD0]">
                  <tr>
                    <th className="px-4 py-3">Kode Pengajuan</th>
                    <th className="px-4 py-3">Nama Pasien</th>
                    <th className="px-4 py-3">Layanan</th>
                    <th className="px-4 py-3">Waktu Pengajuan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFE8]">
                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-[#747C75]">
                        Belum ada data pengajuan antrean
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#F7F5EF] transition">
                        <td className="px-4 py-3 font-mono font-bold text-[#34483D]">
                          {app.applicationCode}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#26332B]">
                          {app.fullName}
                        </td>
                        <td className="px-4 py-3 text-[#747C75]">
                          {app.serviceName}
                        </td>
                        <td className="px-4 py-3 text-[#747C75]">
                          {new Date(app.appliedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={app.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenDetail(app)}
                            title="Lihat Detail"
                            className="px-2 py-1 rounded-md bg-[#F1EFE8] hover:bg-[#E8DFD0] text-[#34483D] font-medium text-[11px] cursor-pointer"
                          >
                            Detail
                          </button>
                          {app.status === 'Menunggu Persetujuan' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApproveApplication(app.id)}
                                title="Setujui"
                                className="px-2 py-1 rounded-md bg-[#EBF5EE] hover:bg-[#C8E6D3] text-[#43865A] font-medium text-[11px] cursor-pointer"
                              >
                                Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => onRejectApplication(app.id)}
                                title="Tolak"
                                className="px-2 py-1 rounded-md bg-[#FDF2F2] hover:bg-[#F8CACA] text-[#B94B4B] font-medium text-[11px] cursor-pointer"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Antrean Aktif Hari Ini */}
          <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E8DFD0] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#34483D]">Antrean Aktif Hari Ini</h3>
                <p className="text-xs text-[#747C75]">Urutan nomor antrean dan status giliran praktik</p>
              </div>
              <button
                type="button"
                onClick={onViewAllQueues}
                className="text-xs font-semibold text-[#718776] hover:text-[#5d7162] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDFBF7] text-[#747C75] font-semibold uppercase tracking-wider border-b border-[#E8DFD0]">
                  <tr>
                    <th className="px-4 py-3">No. Antrean</th>
                    <th className="px-4 py-3">Nama Pasien</th>
                    <th className="px-4 py-3">Layanan</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFE8]">
                  {activeQueues.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-[#747C75]">
                        Belum ada antrean aktif pada tanggal hari ini
                      </td>
                    </tr>
                  ) : (
                    activeQueues.map((q) => (
                      <tr key={q.id} className="hover:bg-[#F7F5EF] transition">
                        <td className="px-4 py-3 font-mono font-bold text-sm text-[#34483D]">
                          {q.queueNumber}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#26332B]">
                          {q.fullName}
                        </td>
                        <td className="px-4 py-3 text-[#747C75]">
                          {q.serviceName}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={q.status} size="sm" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Notifications & Schedule (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Card */}
          <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD0]">
              <h3 className="font-bold text-base text-[#34483D]">Notifikasi</h3>
              <button
                type="button"
                onClick={onViewAllApplications}
                className="text-xs font-semibold text-[#718776] hover:text-[#5d7162] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-[#F1EFE8] max-h-72 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="py-2.5 text-xs flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'NEW_APPLICATION' ? 'bg-[#B78336]' : n.type === 'APPROVED' ? 'bg-[#43865A]' : 'bg-[#718776]'}`} />
                  <div className="flex-1">
                    <p className="font-bold text-[#26332B]">{n.title}</p>
                    <p className="text-[11px] text-[#747C75] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-[#A1A7A1] mt-1 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule and Quota Card */}
          <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-base text-[#34483D] pb-2 border-b border-[#E8DFD0]">
              Jadwal Pelayanan
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#26332B]">
                <span className="font-medium text-[#747C75]">Senin - Sabtu</span>
                <span className="font-bold">{settings?.openingHours.weekdays || '07:00 - 14:00 WIB'}</span>
              </div>
              <div className="flex justify-between items-center text-[#26332B]">
                <span className="font-medium text-[#747C75]">Minggu</span>
                <span className="font-semibold text-[#B94B4B]">{settings?.openingHours.sunday || 'Tutup'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8DFD0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#747C75]">Status Penerimaan Antrean</span>
                <StatusBadge status={settings?.isRegistrationOpen ? 'Dibuka' : 'Ditutup'} size="sm" />
              </div>
              <div className="bg-[#F7F5EF] p-3 rounded-xl border border-[#E8DFD0]">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#747C75]">Kuota Hari Ini:</span>
                  <span className="font-bold text-[#34483D]">
                    {stats.quotaToday.current} / {stats.quotaToday.max} Pasien
                  </span>
                </div>
                <div className="w-full bg-[#E2DED5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#718776] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (stats.quotaToday.current / (stats.quotaToday.max || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
