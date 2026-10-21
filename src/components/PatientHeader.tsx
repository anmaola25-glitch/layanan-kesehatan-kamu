import React from 'react';
import { Activity, User } from 'lucide-react';

interface PatientHeaderProps {
  onAdminClick: () => void;
  onCheckStatusClick?: () => void;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({ onAdminClick, onCheckStatusClick }) => {
  return (
    <header className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between z-20 relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#34483D] flex items-center justify-center text-white shadow-sm">
          <Activity className="w-5 h-5 text-[#E8DFD0]" />
        </div>
        <div>
          <h1 className="font-bold text-lg sm:text-xl text-[#34483D] tracking-tight leading-tight">
            Sistem Antrean Pasien
          </h1>
          <p className="text-xs sm:text-sm text-[#747C75] font-medium">
            Praktik Mandiri Mantri
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onCheckStatusClick && (
          <button
            onClick={onCheckStatusClick}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#34483D] bg-white/80 hover:bg-white rounded-full border border-[#E8DFD0] transition shadow-xs"
          >
            Cek Status Antrean
          </button>
        )}
        <button
          onClick={onAdminClick}
          type="button"
          title="Login Admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#34483D] bg-white/90 hover:bg-[#34483D] hover:text-white rounded-full border border-[#D5CDC0] transition-colors shadow-xs group"
        >
          <User className="w-3.5 h-3.5 group-hover:text-[#E8DFD0]" />
          <span>Login Admin</span>
        </button>
      </div>
    </header>
  );
};
