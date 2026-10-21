/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PatientHeader } from './components/PatientHeader.tsx';
import { PatientForm } from './components/PatientForm.tsx';
import { PatientConfirmation } from './components/PatientConfirmation.tsx';
import { CheckStatusModal } from './components/CheckStatusModal.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { AdminSidebar, AdminMenu } from './components/AdminSidebar.tsx';
import { AdminTopbar } from './components/AdminTopbar.tsx';
import { AdminDashboardView } from './components/AdminDashboardView.tsx';
import { AdminApplicationsView } from './components/AdminApplicationsView.tsx';
import { AdminQueuesView } from './components/AdminQueuesView.tsx';
import { AdminPatientsView } from './components/AdminPatientsView.tsx';
import { AdminHistoryView } from './components/AdminHistoryView.tsx';
import { AdminReportsView } from './components/AdminReportsView.tsx';
import { AdminServicesView } from './components/AdminServicesView.tsx';
import { AdminSettingsView } from './components/AdminSettingsView.tsx';

import { api, getAuthToken, setAuthToken, clearAuthToken } from './lib/api.ts';
import {
  QueueApplication,
  QueueEntry,
  DashboardStats,
  AdminNotification,
  ClinicSettings,
  ServiceItem,
  PatientRecord,
  EmailDeliveryLog
} from './types/index.ts';

export default function App() {
  // Navigation State
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [adminMenu, setAdminMenu] = useState<AdminMenu>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  // Patient Workflow States
  const [submittedApplication, setSubmittedApplication] = useState<QueueApplication | null>(null);
  const [checkStatusModalOpen, setCheckStatusModalOpen] = useState(false);
  const [checkStatusCode, setCheckStatusCode] = useState('');

  // Audio calling feature toggle
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Admin Data States
  const [stats, setStats] = useState<DashboardStats>({
    pendingApplications: 0,
    approvedToday: 0,
    waitingInQueue: 0,
    currentlyServing: 0,
    completedToday: 0,
    quotaToday: { current: 0, max: 40 }
  });
  const [applications, setApplications] = useState<QueueApplication[]>([]);
  const [queues, setQueues] = useState<QueueEntry[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [history, setHistory] = useState<QueueEntry[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailDeliveryLog[]>([]);
  const [reportsData, setReportsData] = useState<any>({
    summary: {
      totalPengajuan: 0,
      totalDisetujui: 0,
      totalDitolak: 0,
      totalDibatalkan: 0,
      totalSelesai: 0,
      totalDilewati: 0,
      avgDurationMinutes: 14
    },
    applications: [],
    queues: []
  });

  // Selected app for detail modal
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<QueueApplication | null>(null);

  // Handle URL change
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sync menu based on path
  useEffect(() => {
    if (currentPath.startsWith('/admin')) {
      if (currentPath === '/admin/login') {
        // Login view
      } else if (currentPath === '/admin/pengajuan') {
        setAdminMenu('applications');
      } else if (currentPath === '/admin/antrean') {
        setAdminMenu('queues');
      } else if (currentPath === '/admin/pasien') {
        setAdminMenu('patients');
      } else if (currentPath === '/admin/riwayat') {
        setAdminMenu('history');
      } else if (currentPath === '/admin/laporan') {
        setAdminMenu('reports');
      } else if (currentPath === '/admin/layanan') {
        setAdminMenu('services');
      } else if (currentPath === '/admin/pengaturan') {
        setAdminMenu('settings');
      } else {
        setAdminMenu('dashboard');
      }
    } else if (currentPath.startsWith('/status/')) {
      const code = currentPath.replace('/status/', '');
      setCheckStatusCode(code);
      setCheckStatusModalOpen(true);
    }
  }, [currentPath]);

  // Load Admin Data
  const refreshAdminData = async () => {
    if (!isAuthenticated) return;
    try {
      const [
        dashRes,
        appsRes,
        queuesRes,
        notifsRes,
        settingsRes,
        servicesRes,
        patientsRes,
        historyRes,
        emailsRes,
        reportsRes
      ] = await Promise.all([
        api.getDashboardData(),
        api.getApplications(),
        api.getQueues(),
        api.getNotifications(),
        api.getSettings(),
        api.getServices(),
        api.getPatients(),
        api.getHistory(),
        api.getEmailLogs(),
        api.getReports()
      ]);

      setStats(dashRes.stats);
      setApplications(appsRes);
      setQueues(queuesRes);
      setNotifications(notifsRes);
      setSettings(settingsRes.settings);
      setServices(servicesRes);
      setPatients(patientsRes);
      setHistory(historyRes);
      setEmailLogs(emailsRes);
      setReportsData(reportsRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAdminData();
      // Periodically refresh notifications & queue numbers
      const interval = setInterval(refreshAdminData, 12000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Check login session on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then((res) => {
          setIsAuthenticated(true);
          setCurrentAdmin(res.admin);
        })
        .catch(() => {
          setIsAuthenticated(false);
          clearAuthToken();
        });
    }
  }, []);

  // Admin Actions
  const handleApproveApplication = async (id: string) => {
    await api.approveApplication(id);
    await refreshAdminData();
  };

  const handleRejectApplication = async (id: string, reason: string) => {
    await api.rejectApplication(id, reason);
    await refreshAdminData();
  };

  const handleUpdateQueueStatus = async (id: string, action: 'call' | 'start' | 'complete' | 'skip' | 'cancel') => {
    await api.updateQueueStatus(id, action);
    await refreshAdminData();
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    navigateTo('/admin/login');
  };

  // 1. PATIENT FLOW (Root "/")
  const isPatientPage = currentPath === '/' || currentPath.startsWith('/status/');

  if (isPatientPage) {
    return (
      <div className="min-h-screen relative flex flex-col justify-between bg-[#F7F5EF] text-[#26332B] overflow-x-hidden">
        {/* Clinic Background Image with warm overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-700 opacity-20 lg:opacity-25 filter blur-[0.5px]"
          style={{ backgroundImage: `url('/clinic-bg.jpg')` }}
        />
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#F7F5EF]/85 via-[#F7F5EF]/75 to-[#F7F5EF]/95" />

        {/* Patient Header */}
        <PatientHeader
          onAdminClick={() => navigateTo('/admin/login')}
          onCheckStatusClick={() => {
            setCheckStatusCode('');
            setCheckStatusModalOpen(true);
          }}
        />

        {/* Patient Main Content */}
        <main className="flex-1 flex items-center justify-center py-4">
          {submittedApplication ? (
            <PatientConfirmation
              application={submittedApplication}
              onCheckStatus={(code) => {
                setCheckStatusCode(code);
                setCheckStatusModalOpen(true);
              }}
              onBackToForm={() => setSubmittedApplication(null)}
            />
          ) : (
            <PatientForm
              onSuccess={(app) => setSubmittedApplication(app)}
              onOpenCheckStatus={() => {
                setCheckStatusCode('');
                setCheckStatusModalOpen(true);
              }}
            />
          )}
        </main>

        {/* Discrete Patient Footer */}
        <footer className="w-full max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#747C75] z-10 border-t border-[#E8DFD0]/60 gap-2">
          <p>
            &copy; {new Date().getFullYear()} Praktik Mandiri Mantri Husada, S.Kep., Ns. &bull; Pelayanan Ramah & Terpercaya
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setCheckStatusCode('');
                setCheckStatusModalOpen(true);
              }}
              className="hover:text-[#34483D] underline cursor-pointer"
            >
              Cek Status Antrean
            </button>
            <span>&bull;</span>
            <button
              onClick={() => navigateTo('/admin/login')}
              className="hover:text-[#34483D] underline cursor-pointer"
            >
              Area Admin / Mantri
            </button>
          </div>
        </footer>

        {/* Patient Status Check Modal */}
        {checkStatusModalOpen && (
          <CheckStatusModal
            initialCode={checkStatusCode}
            onClose={() => setCheckStatusModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // 2. ADMIN LOGIN PAGE (`/admin/login`)
  if (currentPath === '/admin/login') {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#F7F5EF] text-[#26332B]">
        {/* Background photo */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center opacity-25 filter blur-[0.5px]"
          style={{ backgroundImage: `url('/clinic-bg.jpg')` }}
        />
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#F7F5EF]/80 to-[#F7F5EF]/95" />

        <AdminLogin
          onLoginSuccess={(admin) => {
            setIsAuthenticated(true);
            setCurrentAdmin(admin);
            navigateTo('/admin/dashboard');
          }}
          onBackToPatient={() => navigateTo('/')}
        />
      </div>
    );
  }

  // 3. ADMIN DASHBOARD & MANAGEMENT (Protected)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] p-4 text-center">
        <div className="bg-white p-6 rounded-2xl border border-[#E8DFD0] shadow-md max-w-sm">
          <h3 className="font-bold text-base text-[#34483D]">Akses Memerlukan Login</h3>
          <p className="text-xs text-[#747C75] mt-1 mb-4">
            Silakan masuk dengan akun Mantri untuk mengakses dashboard.
          </p>
          <button
            onClick={() => navigateTo('/admin/login')}
            className="w-full py-2.5 rounded-xl bg-[#718776] text-white text-xs font-semibold"
          >
            Menuju Halaman Login
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === 'Menunggu Persetujuan').length;

  return (
    <div className="min-h-screen flex bg-[#F7F5EF] text-[#26332B]">
      {/* Sidebar (Deep Forest Green) */}
      <AdminSidebar
        currentMenu={adminMenu}
        onSelectMenu={(menu) => {
          setAdminMenu(menu);
          const routeMap: Record<AdminMenu, string> = {
            dashboard: '/admin/dashboard',
            applications: '/admin/pengajuan',
            queues: '/admin/antrean',
            patients: '/admin/pasien',
            history: '/admin/riwayat',
            reports: '/admin/laporan',
            services: '/admin/layanan',
            settings: '/admin/pengaturan'
          };
          window.history.pushState({}, '', routeMap[menu]);
          setCurrentPath(routeMap[menu]);
        }}
        pendingCount={pendingCount}
        onLogout={handleLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          notifications={notifications}
          onRefreshNotifications={refreshAdminData}
          onNavigateToApplications={() => {
            setAdminMenu('applications');
            navigateTo('/admin/pengajuan');
          }}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {adminMenu === 'dashboard' && (
            <AdminDashboardView
              stats={stats}
              recentApplications={applications.slice(0, 5)}
              activeQueues={queues.slice(0, 5)}
              notifications={notifications}
              settings={settings}
              onViewAllApplications={() => {
                setAdminMenu('applications');
                navigateTo('/admin/pengajuan');
              }}
              onViewAllQueues={() => {
                setAdminMenu('queues');
                navigateTo('/admin/antrean');
              }}
              onApproveApplication={handleApproveApplication}
              onRejectApplication={(id) => {
                const app = applications.find(a => a.id === id);
                if (app) setSelectedAppForDetail(app);
                setAdminMenu('applications');
                navigateTo('/admin/pengajuan');
              }}
              onOpenDetail={(app) => {
                setSelectedAppForDetail(app);
                setAdminMenu('applications');
                navigateTo('/admin/pengajuan');
              }}
            />
          )}

          {adminMenu === 'applications' && (
            <AdminApplicationsView
              applications={applications}
              onApprove={handleApproveApplication}
              onReject={handleRejectApplication}
              selectedAppForDetail={selectedAppForDetail}
              onCloseDetail={() => setSelectedAppForDetail(null)}
              onOpenDetail={(app) => setSelectedAppForDetail(app)}
            />
          )}

          {adminMenu === 'queues' && (
            <AdminQueuesView
              queues={queues}
              onUpdateStatus={handleUpdateQueueStatus}
              audioEnabled={audioEnabled}
              onRefresh={refreshAdminData}
            />
          )}

          {adminMenu === 'patients' && (
            <AdminPatientsView patients={patients} />
          )}

          {adminMenu === 'history' && (
            <AdminHistoryView history={history} />
          )}

          {adminMenu === 'reports' && (
            <AdminReportsView
              reportData={reportsData}
              onFilterChange={(sDate, eDate) => {
                api.getReports({ startDate: sDate, endDate: eDate }).then(setReportsData);
              }}
            />
          )}

          {adminMenu === 'services' && (
            <AdminServicesView
              services={services}
              onCreateService={async (data) => {
                await api.createService(data);
                refreshAdminData();
              }}
              onUpdateService={async (id, data) => {
                await api.updateService(id, data);
                refreshAdminData();
              }}
              onDeleteService={async (id) => {
                await api.deleteService(id);
                refreshAdminData();
              }}
            />
          )}

          {adminMenu === 'settings' && settings && (
            <AdminSettingsView
              settings={settings}
              emailLogs={emailLogs}
              onUpdateSettings={async (newSet) => {
                await api.updateSettings(newSet);
                refreshAdminData();
              }}
              onRefreshEmailLogs={refreshAdminData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
