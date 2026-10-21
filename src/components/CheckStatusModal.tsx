import React, { useState, useEffect } from 'react';
import { X, Search, Clock, CheckCircle2, AlertCircle, ArrowRight, Bell, Sparkles } from 'lucide-react';
import { api } from '../lib/api.ts';
import { StatusBadge } from './Badge.tsx';
import { QueueApplication } from '../types/index.ts';

interface CheckStatusModalProps {
  initialCode?: string;
  onClose: () => void;
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({ initialCode = '', onClose }) => {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ application: QueueApplication; queue: any } | null>(null);

  const fetchStatus = async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.checkStatus(searchCode.trim());
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Data pengajuan tidak ditemukan. Pastikan kode sudah benar.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchStatus(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26332B]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DFD0]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FDFBF7]">
          <div>
            <h3 className="font-bold text-lg text-[#34483D]">Cek Status Antrean</h3>
            <p className="text-xs text-[#747C75]">Masukkan kode pengajuan untuk melacak antrean Anda</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-[#747C75] hover:text-[#26332B] hover:bg-[#E8DFD0]/50 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: PA2506170003"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2DED5] text-sm font-mono uppercase text-[#26332B] placeholder:text-[#A1A7A1] focus:outline-none focus:border-[#718776] focus:ring-1 focus:ring-[#718776]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-5 py-2.5 bg-[#718776] hover:bg-[#5d7162] text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Cari</span>
            </button>
          </form>

          {error && (
            <div className="p-3.5 bg-[#FDF2F2] border border-[#F8CACA] rounded-xl text-xs sm:text-sm text-[#B94B4B] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {data && (
            <div className="space-y-4 animate-fadeIn">
              {/* Main Ticket Banner */}
              <div className="bg-gradient-to-br from-[#F7F5EF] to-[#EDE7DC] border-2 border-[#718776]/40 rounded-2xl p-5 text-center relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-[#747C75] mb-2 font-mono">
                  <span>KODE: {data.application.applicationCode}</span>
                  <StatusBadge status={data.application.status} size="sm" />
                </div>

                {data.application.queueNumber ? (
                  <div className="py-2">
                    <p className="text-xs uppercase tracking-widest text-[#747C75] font-semibold">
                      Nomor Antrean Resmi Anda
                    </p>
                    <div className="text-5xl font-black text-[#34483D] tracking-tight my-2 font-mono">
                      {data.application.queueNumber}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#718776]/30 text-xs font-semibold text-[#34483D]">
                      <Sparkles className="w-3.5 h-3.5 text-[#718776]" />
                      <span>Status Layanan: {data.queue?.serviceStatus || 'Menunggu Giliran'}</span>
                    </div>

                    {data.queue?.waitingAhead !== undefined && (
                      <p className="text-xs text-[#747C75] mt-3">
                        {data.queue.waitingAhead === 0 ? (
                          <span className="text-[#43865A] font-semibold">Giliran Anda adalah selanjutnya! Harap bersiap di dekat ruang praktik.</span>
                        ) : (
                          <span>Terdapat <strong>{data.queue.waitingAhead}</strong> pasien menunggu di depan giliran Anda.</span>
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="w-12 h-12 rounded-full bg-[#FFF6E5] text-[#B78336] flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="font-bold text-[#34483D] text-base">
                      {data.application.status}
                    </h4>
                    <p className="text-xs text-[#747C75] mt-1 max-w-sm mx-auto">
                      {data.application.status === 'Ditolak'
                        ? `Alasan: ${data.application.rejectionReason || 'Jadwal kuota penuh'}`
                        : 'Pengajuan Anda sedang ditinjau oleh Mantri. Nomor antrean resmi akan diterbitkan setelah disetujui.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Patient and Service Details */}
              <div className="bg-white border border-[#E8DFD0] rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-[#F1EFE8]">
                  <span className="text-[#747C75]">Nama Pasien</span>
                  <span className="font-semibold text-[#26332B]">{data.application.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1EFE8]">
                  <span className="text-[#747C75]">Layanan</span>
                  <span className="font-semibold text-[#26332B]">{data.application.serviceName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1EFE8]">
                  <span className="text-[#747C75]">Waktu Pengajuan</span>
                  <span className="text-[#26332B]">
                    {new Date(data.application.appliedAt).toLocaleString('id-ID')}
                  </span>
                </div>
                {data.application.processedAt && (
                  <div className="flex justify-between py-1">
                    <span className="text-[#747C75]">Diproses Pada</span>
                    <span className="text-[#26332B]">
                      {new Date(data.application.processedAt).toLocaleString('id-ID')} ({data.application.processedBy})
                    </span>
                  </div>
                )}
              </div>

              {/* History Timeline */}
              {data.application.history && data.application.history.length > 0 && (
                <div className="bg-[#FDFBF7] border border-[#E8DFD0] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#34483D] mb-3 uppercase tracking-wider">
                    Riwayat Perjalanan Antrean
                  </p>
                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DFD0]">
                    {data.application.history.map((h, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#718776] ring-4 ring-[#FDFBF7]" />
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
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F7F5EF] border-t border-[#E8DFD0] flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-xs font-semibold text-[#34483D] bg-white hover:bg-[#E8DFD0]/40 rounded-xl border border-[#D5CDC0] transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
