import React, { useState } from 'react';
import { Check, Copy, CheckCheck, Mail, ArrowLeft, Search } from 'lucide-react';
import { QueueApplication } from '../types/index.ts';
import { StatusBadge } from './Badge.tsx';

interface PatientConfirmationProps {
  application: QueueApplication;
  onCheckStatus: (code: string) => void;
  onBackToForm: () => void;
}

export const PatientConfirmation: React.FC<PatientConfirmationProps> = ({
  application,
  onCheckStatus,
  onBackToForm
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(application.applicationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(application.appliedAt).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 z-10 relative">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-[#E8DFD0]/90 text-center">
        {/* Animated Green Checkmark Circle */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#43865A] text-white rounded-full mx-auto flex items-center justify-center shadow-md mb-5 animate-scaleUp">
          <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#34483D] tracking-tight">
          Pengajuan Berhasil!
        </h2>
        <p className="text-sm text-[#747C75] mt-2 max-w-md mx-auto leading-relaxed">
          Terima kasih, pengajuan Anda telah berhasil dikirim. <br />
          Saat ini dalam proses persetujuan mantri.
        </p>

        {/* Application details card */}
        <div className="mt-6 bg-[#FDFBF7] rounded-xl border border-[#E8DFD0] p-5 text-left space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD0]">
            <div>
              <p className="text-xs font-semibold text-[#747C75] uppercase tracking-wider">
                Kode Pengajuan
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-bold text-[#34483D] font-mono tracking-wide">
                  {application.applicationCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Salin Kode Pengajuan"
                  className="p-1 text-[#747C75] hover:text-[#34483D] hover:bg-[#E8DFD0]/50 rounded transition cursor-pointer"
                >
                  {copied ? (
                    <CheckCheck className="w-4 h-4 text-[#43865A]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <StatusBadge status={application.status} size="md" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium text-[#747C75]">Nama Pasien</p>
              <p className="font-semibold text-[#26332B] mt-0.5">{application.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#747C75]">Layanan</p>
              <p className="font-semibold text-[#26332B] mt-0.5">{application.serviceName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#747C75]">Email Pemberitahuan</p>
              <p className="text-xs text-[#26332B] mt-0.5 font-mono">{application.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#747C75]">Waktu Pengajuan</p>
              <p className="font-medium text-[#26332B] mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* Email notice alert box */}
          <div className="bg-[#EBF5EE] border border-[#C8E6D3] rounded-lg p-3 text-xs text-[#34483D] flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#43865A] shrink-0" />
            <span>
              Anda akan menerima email notifikasi setelah keputusan mantri tersedia.
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => onCheckStatus(application.applicationCode)}
            className="w-full py-3 px-5 rounded-xl font-semibold text-white bg-[#718776] hover:bg-[#5d7162] active:bg-[#4d5e51] transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Cek Status Pengajuan</span>
          </button>

          <button
            type="button"
            onClick={onBackToForm}
            className="w-full py-2.5 px-5 rounded-xl font-medium text-[#34483D] bg-white hover:bg-[#F7F5EF] border border-[#E8DFD0] transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Formulir</span>
          </button>
        </div>

        <p className="text-[11px] text-[#747C75] mt-4">
          Simpan kode pengajuan Anda untuk melakukan pelacakan status sewaktu-waktu.
        </p>
      </div>
    </div>
  );
};
