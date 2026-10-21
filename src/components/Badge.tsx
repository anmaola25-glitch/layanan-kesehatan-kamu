import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Menunggu Persetujuan':
      case 'Menunggu':
      case 'Menunggu Giliran':
        return 'bg-[#FFF6E5] text-[#B78336] border-[#F2DEB7]';
      case 'Disetujui':
      case 'Selesai':
        return 'bg-[#EBF5EE] text-[#43865A] border-[#C8E6D3]';
      case 'Dipanggil':
        return 'bg-[#EBF2FE] text-[#2B6CB0] border-[#BCD4FA] animate-pulse';
      case 'Sedang Dilayani':
        return 'bg-[#EBF7F0] text-[#2E7D5B] border-[#B2DFCB] font-semibold';
      case 'Dilewati':
        return 'bg-[#FFF0EB] text-[#C05621] border-[#FBD38D]';
      case 'Ditolak':
      case 'Dibatalkan':
        return 'bg-[#FDF2F2] text-[#B94B4B] border-[#F8CACA]';
      case 'Dibuka':
        return 'bg-[#EBF5EE] text-[#43865A] border-[#C8E6D3]';
      case 'Ditutup':
        return 'bg-[#FDF2F2] text-[#B94B4B] border-[#F8CACA]';
      default:
        return 'bg-[#F1EFE8] text-[#747C75] border-[#E2DED5]';
    }
  };

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5 rounded-md',
    md: 'text-xs font-medium px-2.5 py-1 rounded-full border',
    lg: 'text-sm font-medium px-3.5 py-1.5 rounded-full border'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 ${getStyle()} ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};
