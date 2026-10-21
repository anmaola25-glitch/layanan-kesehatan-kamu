import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Check,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { QueueApplication } from '../types/index.ts';
import { StatusBadge } from './Badge.tsx';

interface AdminApplicationsViewProps {
  applications: QueueApplication[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  selectedAppForDetail?: QueueApplication | null;
  onCloseDetail: () => void;
  onOpenDetail: (app: QueueApplication) => void;
}

export const AdminApplicationsView: React.FC<AdminApplicationsViewProps> = ({
  applications,
  onApprove,
  onReject,
  selectedAppForDetail,
  onCloseDetail,
  onOpenDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [serviceFilter, setServiceFilter] = useState('Semua Layanan');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [appToApprove, setAppToApprove] = useState<QueueApplication | null>(null);
  const [appToReject, setAppToReject] = useState<QueueApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filtering
  const filtered = applications.filter((app) => {
    const matchesSearch =
      searchTerm === '' ||
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.phone && app.phone.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'Semua Status' || app.status === statusFilter;

    const matchesService =
      serviceFilter === 'Semua Layanan' || app.serviceName === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  // Services list for dropdown
  const uniqueServices = Array.from(new Set(applications.map((a) => a.serviceName)));

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApproveConfirm = async () => {
    if (!appToApprove) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await onApprove(appToApprove.id);
      setAppToApprove(null);
      if (selectedAppForDetail?.id === appToApprove.id) {
        onCloseDetail();
      }
    } catch (err: any) {
      setActionError(err.message || 'Gagal menyetujui pengajuan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!appToReject) return;
    if (!rejectionReason.trim()) {
      setActionError('Alasan penolakan pengajuan wajib diisi.');
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    try {
      await onReject(appToReject.id, rejectionReason.trim());
      setAppToReject(null);
      setRejectionReason('');
      if (selectedAppForDetail?.id === appToReject.id) {
        onCloseDetail();
      }
    } catch (err: any) {
      setActionError(err.message || 'Gagal menolak pengajuan');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#34483D] tracking-tight">
          Pengajuan Antrean
        </h2>
        <p className="text-xs sm:text-sm text-[#747C75] mt-0.5">
          Tinjau, setujui, atau tolak permohonan antrean pasien praktik mandiri
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8DFD0] p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari kode atau nama pasien..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2DED5] text-xs sm:text-sm text-[#26332B] placeholder:text-[#A1A7A1] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#718776]"
          />
          <Search className="w-4 h-4 text-[#747C75] absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#E2DED5] text-xs font-medium text-[#34483D] bg-[#FDFBF7] focus:outline-none focus:border-[#718776] cursor-pointer"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#E2DED5] text-xs font-medium text-[#34483D] bg-[#FDFBF7] focus:outline-none focus:border-[#718776] cursor-pointer"
          >
            <option value="Semua Layanan">Semua Layanan</option>
            {uniqueServices.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FDFBF7] text-[#747C75] font-semibold uppercase tracking-wider border-b border-[#E8DFD0]">
              <tr>
                <th className="px-4 py-3.5">Kode Pengajuan</th>
                <th className="px-4 py-3.5">Nama Pasien</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Layanan</th>
                <th className="px-4 py-3.5">Waktu Pengajuan</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFE8]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#747C75]">
                    Tidak ada pengajuan antrean yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F7F5EF] transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-[#34483D]">
                      {app.applicationCode}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#26332B]">
                      {app.fullName}
                    </td>
                    <td className="px-4 py-3.5 text-[#747C75] font-mono text-[11px]">
                      {app.email}
                    </td>
                    <td className="px-4 py-3.5 text-[#747C75]">
                      {app.serviceName}
                    </td>
                    <td className="px-4 py-3.5 text-[#747C75]">
                      {new Date(app.appliedAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(app)}
                        className="px-2.5 py-1 rounded-md bg-[#F1EFE8] hover:bg-[#E8DFD0] text-[#34483D] font-medium text-[11px] cursor-pointer"
                      >
                        Detail
                      </button>
                      {app.status === 'Menunggu Persetujuan' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setActionError(null);
                              setAppToApprove(app);
                            }}
                            className="px-2.5 py-1 rounded-md bg-[#EBF5EE] hover:bg-[#C8E6D3] text-[#43865A] font-semibold text-[11px] cursor-pointer"
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionError(null);
                              setRejectionReason('');
                              setAppToReject(app);
                            }}
                            className="px-2.5 py-1 rounded-md bg-[#FDF2F2] hover:bg-[#F8CACA] text-[#B94B4B] font-semibold text-[11px] cursor-pointer"
                          >
                            Tolak
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#A1A7A1] italic">
                          {app.queueNumber ? `No: ${app.queueNumber}` : 'Diproses'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E8DFD0] flex items-center justify-between text-xs text-[#747C75] bg-[#FDFBF7]">
          <span>
            Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} pengajuan
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#E8DFD0] bg-white hover:bg-[#F7F5EF] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-1 rounded-lg bg-white border border-[#E8DFD0] font-bold text-[#34483D]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#E8DFD0] bg-white hover:bg-[#F7F5EF] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER (Matching Reference Board "Detail Pengajuan") */}
      {selectedAppForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26332B]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8DFD0] overflow-hidden">
            <div className="p-5 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FDFBF7]">
              <div>
                <h3 className="font-bold text-lg text-[#34483D]">Detail Pengajuan</h3>
                <p className="text-xs font-mono text-[#747C75]">{selectedAppForDetail.applicationCode}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedAppForDetail.status} size="sm" />
                <button
                  onClick={onCloseDetail}
                  className="p-1.5 text-[#747C75] hover:text-[#26332B] rounded-full hover:bg-[#E8DFD0]/50"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Applicant Info */}
              <div className="bg-[#F7F5EF] rounded-xl p-4 text-xs space-y-2.5 border border-[#E8DFD0]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#747C75]">Nama Pasien</span>
                    <p className="font-bold text-sm text-[#26332B]">{selectedAppForDetail.fullName}</p>
                  </div>
                  <div>
                    <span className="text-[#747C75]">Layanan</span>
                    <p className="font-bold text-sm text-[#26332B]">{selectedAppForDetail.serviceName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8DFD0]">
                  <div>
                    <span className="text-[#747C75]">Email</span>
                    <p className="font-mono text-[#26332B]">{selectedAppForDetail.email}</p>
                  </div>
                  <div>
                    <span className="text-[#747C75]">Nomor Telepon</span>
                    <p className="text-[#26332B]">{selectedAppForDetail.phone || '-'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DFD0]">
                  <span className="text-[#747C75]">Waktu Pengajuan</span>
                  <p className="text-[#26332B] font-medium">
                    {new Date(selectedAppForDetail.appliedAt).toLocaleString('id-ID')}
                  </p>
                </div>

                {selectedAppForDetail.queueNumber && (
                  <div className="pt-2 border-t border-[#E8DFD0] flex items-center justify-between">
                    <span className="text-[#747C75]">Nomor Antrean Resmi</span>
                    <span className="font-mono font-extrabold text-lg text-[#34483D]">
                      {selectedAppForDetail.queueNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div>
                <p className="text-xs font-bold text-[#34483D] mb-3 uppercase tracking-wider">
                  Riwayat Status
                </p>
                <div className="relative pl-6 space-y-3 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DFD0]">
                  {selectedAppForDetail.history.map((h, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#718776] ring-4 ring-white" />
                      <div className="text-xs">
                        <p className="font-semibold text-[#26332B]">{h.status}</p>
                        <p className="text-[11px] text-[#747C75]">
                          {new Date(h.timestamp).toLocaleString('id-ID')} &bull; {h.actor}
                        </p>
                        {h.notes && (
                          <p className="text-[11px] text-[#718776] italic mt-0.5">{h.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Modal */}
            <div className="p-4 bg-[#FDFBF7] border-t border-[#E8DFD0] flex justify-end gap-2">
              {selectedAppForDetail.status === 'Menunggu Persetujuan' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null);
                      setRejectionReason('');
                      setAppToReject(selectedAppForDetail);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#B94B4B] bg-[#FDF2F2] hover:bg-[#F8CACA] transition cursor-pointer"
                  >
                    Tolak
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null);
                      setAppToApprove(selectedAppForDetail);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#718776] hover:bg-[#5d7162] transition shadow-xs cursor-pointer"
                  >
                    Setujui
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onCloseDetail}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#34483D] bg-white border border-[#E8DFD0] hover:bg-[#F7F5EF]"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* APPROVE CONFIRMATION DIALOG */}
      {appToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26332B]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#E8DFD0]">
            <div className="w-12 h-12 rounded-full bg-[#EBF5EE] text-[#43865A] flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-center text-[#34483D]">
              Konfirmasi Persetujuan Antrean
            </h3>
            <p className="text-xs text-center text-[#747C75] mt-1.5 leading-relaxed">
              Anda akan menyetujui pengajuan atas nama <strong>{appToApprove.fullName}</strong> ({appToApprove.serviceName}).
              Sistem akan membuat nomor antrean resmi baru dan mengirimkan email konfirmasi ke pasien.
            </p>

            {actionError && (
              <div className="mt-3 p-3 rounded-xl bg-[#FDF2F2] border border-[#F8CACA] text-xs text-[#B94B4B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setAppToApprove(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8DFD0] text-xs font-semibold text-[#747C75] hover:bg-[#F7F5EF] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApproveConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#718776] hover:bg-[#5d7162] text-xs font-semibold text-white shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Memproses...' : 'Ya, Setujui Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION DIALOG (Mandatory Reason Requirement) */}
      {appToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26332B]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#E8DFD0]">
            <div className="w-12 h-12 rounded-full bg-[#FDF2F2] text-[#B94B4B] flex items-center justify-center mx-auto mb-4">
              <XIcon className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-center text-[#34483D]">
              Tolak Pengajuan Antrean
            </h3>
            <p className="text-xs text-center text-[#747C75] mt-1.5">
              Mohon berikan alasan penolakan untuk pasien <strong>{appToReject.fullName}</strong>. Alasan ini akan dikirimkan via email.
            </p>

            {actionError && (
              <div className="mt-3 p-3 rounded-xl bg-[#FDF2F2] border border-[#F8CACA] text-xs text-[#B94B4B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#26332B] uppercase tracking-wider mb-1.5">
                Alasan Penolakan <span className="text-[#B94B4B]">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Kuota hari ini telah habis, silakan ajukan antrean besok pagi."
                className="w-full p-3 rounded-xl border border-[#E2DED5] text-xs text-[#26332B] focus:outline-none focus:border-[#B94B4B] bg-[#FDFBF7]"
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setAppToReject(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8DFD0] text-xs font-semibold text-[#747C75] hover:bg-[#F7F5EF] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRejectConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#B94B4B] hover:bg-[#9e3f3f] text-xs font-semibold text-white shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Memproses...' : 'Tolak Pengajuan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
