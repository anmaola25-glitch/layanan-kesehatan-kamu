import React from 'react';
import {
  Activity,
  LayoutDashboard,
  Inbox,
  Users,
  UserCheck,
  History,
  BarChart3,
  Stethoscope,
  Settings,
  CheckSquare,
  LogOut,
  X
} from 'lucide-react';

export type AdminMenu =
  | 'dashboard'
  | 'applications'
  | 'queues'
  | 'patients'
  | 'history'
  | 'reports'
  | 'services'
  | 'settings';

interface AdminSidebarProps {
  currentMenu: AdminMenu;
  onSelectMenu: (menu: AdminMenu) => void;
  pendingCount: number;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentMenu,
  onSelectMenu,
  pendingCount,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  const menuItems: { id: AdminMenu; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Pengajuan Antrean', icon: Inbox, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'queues', label: 'Antrean Aktif', icon: Users },
    { id: 'patients', label: 'Data Pasien', icon: UserCheck },
    { id: 'history', label: 'Riwayat Pelayanan', icon: History },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'services', label: 'Layanan', icon: Stethoscope },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#34483D] text-[#E8DFD0] select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5 text-[#E8DFD0]" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-white tracking-tight leading-snug">
              Sistem Antrean Pasien
            </h1>
            <p className="text-xs text-[#E8DFD0]/70">
              Praktik Mandiri Mantri
            </p>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectMenu(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-white/15 text-white font-semibold shadow-xs'
                  : 'text-[#E8DFD0]/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E8DFD0]' : 'text-[#E8DFD0]/70'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#B94B4B] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Logout Button */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/20 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
