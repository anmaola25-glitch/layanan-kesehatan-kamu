import React, { useState, useEffect } from 'react';
import { Bell, Menu, Volume2, VolumeX, CheckCircle, Clock, UserCheck, AlertCircle, Check } from 'lucide-react';
import { AdminNotification } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AdminTopbarProps {
  onOpenMobileSidebar: () => void;
  notifications: AdminNotification[];
  onRefreshNotifications: () => void;
  onNavigateToApplications: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onOpenMobileSidebar,
  notifications,
  onRefreshNotifications,
  onNavigateToApplications,
  audioEnabled,
  onToggleAudio
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: AdminNotification) => {
    if (!notif.isRead) {
      await api.markNotificationRead(notif.id);
      onRefreshNotifications();
    }
    setIsNotifOpen(false);
    onNavigateToApplications();
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#E8DFD0] flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          type="button"
          className="lg:hidden p-2 text-[#34483D] hover:bg-[#F7F5EF] rounded-xl transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xs sm:text-sm font-medium text-[#747C75]">
          {currentTime || 'Memuat waktu...'}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Audio Speech Toggle Button */}
        <button
          type="button"
          onClick={onToggleAudio}
          title={audioEnabled ? 'Panggilan suara speaker aktif' : 'Panggilan suara nonaktif'}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
            audioEnabled
              ? 'bg-[#EBF5EE] text-[#43865A] border-[#C8E6D3]'
              : 'bg-[#F7F5EF] text-[#747C75] border-[#E8DFD0]'
          }`}
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Suara Panggilan Aktif</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Suara Bisu</span>
            </>
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-[#34483D] hover:bg-[#F7F5EF] rounded-xl relative transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#B94B4B] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E8DFD0] overflow-hidden z-50 animate-fadeIn">
              <div className="p-3.5 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FDFBF7]">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#34483D]">Notifikasi</h4>
                  {unreadCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#B94B4B] text-white font-semibold">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#718776] hover:underline font-medium cursor-pointer"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#F1EFE8]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#747C75]">
                    Belum ada notifikasi
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-xs flex items-start gap-3 hover:bg-[#F7F5EF] cursor-pointer transition ${
                        !n.isRead ? 'bg-[#FFFDF9]' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-[#718776]' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <p className={`font-semibold ${!n.isRead ? 'text-[#26332B]' : 'text-[#747C75]'}`}>
                          {n.title}
                        </p>
                        <p className="text-[#747C75] text-[11px] mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-[#A1A7A1] mt-1 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-[#E8DFD0] text-center bg-[#FDFBF7]">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigateToApplications();
                  }}
                  className="text-xs font-semibold text-[#718776] hover:underline"
                >
                  Buka Halaman Pengajuan &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E8DFD0]">
          <div className="w-8 h-8 rounded-full bg-[#718776] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            M
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#34483D] leading-tight">Mantri Husada</p>
            <p className="text-[10px] text-[#747C75] leading-none">Praktik Mandiri</p>
          </div>
        </div>
      </div>
    </header>
  );
};
