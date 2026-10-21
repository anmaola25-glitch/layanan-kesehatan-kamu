import {
  ClinicSettings,
  ServiceItem,
  QueueApplication,
  QueueEntry,
  AdminNotification,
  EmailDeliveryLog,
  ActivityLog,
  PatientRecord,
  DashboardStats,
  BlackBoxTestCase
} from '../types/index.ts';
import { localDb } from './dataService.ts';

const TOKEN_KEY = 'mantri_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Safe JSON fetcher that gracefully handles environments where /api is not backed by Express (e.g. static CDN/Cloud Run hosting)
async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Server returned HTML (e.g. 404 page "The page cannot be found" or index.html)
      return null;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data as T;
  } catch (err: any) {
    // If it's a JSON parse error or network error, fallback to client-side database
    if (err.message && (err.message.includes('Unexpected token') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return null;
    }
    // If it's an explicit error from server (e.g. password salah), throw it
    throw err;
  }
}

// API Client with automatic server / client-store fallback
export const api = {
  // Public
  async getSettings(): Promise<{ settings: ClinicSettings; todayStats: any }> {
    const serverData = await safeFetchJson<{ settings: ClinicSettings; todayStats: any }>('/api/settings');
    if (serverData) return serverData;

    const db = localDb.load();
    const todayStr = new Date().toISOString().slice(0, 10);
    const queueCountToday = db.queues.filter(q => q.date === todayStr).length;
    return {
      settings: db.settings,
      todayStats: {
        date: todayStr,
        queueCount: queueCountToday,
        remainingQuota: Math.max(0, db.settings.dailyQuota - queueCountToday),
        isRegistrationOpen: db.settings.isRegistrationOpen && queueCountToday < db.settings.dailyQuota
      }
    };
  },

  async getServices(): Promise<ServiceItem[]> {
    const serverData = await safeFetchJson<ServiceItem[]>('/api/services');
    if (serverData) return serverData;
    return localDb.load().services;
  },

  async submitApplication(data: {
    fullName: string;
    email: string;
    phone?: string;
    serviceId: string;
    agreed: boolean;
  }): Promise<{ success: boolean; application: QueueApplication }> {
    const serverData = await safeFetchJson<{ success: boolean; application: QueueApplication }>('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (serverData) return serverData;
    return localDb.submitApplication(data);
  },

  async checkStatus(code: string): Promise<{ application: QueueApplication; queue: any }> {
    const serverData = await safeFetchJson<{ application: QueueApplication; queue: any }>(`/api/applications/check/${encodeURIComponent(code)}`);
    if (serverData) return serverData;
    return localDb.checkStatus(code);
  },

  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; token: string; admin: any }> {
    const serverData = await safeFetchJson<{ success: boolean; token: string; admin: any }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (serverData) {
      setAuthToken(serverData.token);
      return serverData;
    }
    // Fallback to local authentication
    const localRes = localDb.login(username, password);
    setAuthToken(localRes.token);
    return localRes;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {}
    clearAuthToken();
  },

  async getMe(): Promise<{ admin: any }> {
    const serverData = await safeFetchJson<{ admin: any }>('/api/auth/me', { headers: getHeaders() });
    if (serverData) return serverData;
    return localDb.getMe();
  },

  // Admin Dashboard
  async getDashboardData(): Promise<{
    stats: DashboardStats;
    recentApplications: QueueApplication[];
    activeQueues: QueueEntry[];
    unreadNotificationsCount: number;
  }> {
    const serverData = await safeFetchJson<any>('/api/admin/dashboard', { headers: getHeaders() });
    if (serverData) return serverData;
    return localDb.getDashboardData();
  },

  // Applications
  async getApplications(params?: { search?: string; status?: string; service?: string; date?: string }): Promise<QueueApplication[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.service) q.append('service', params.service);
    if (params?.date) q.append('date', params.date);

    const serverData = await safeFetchJson<QueueApplication[]>(`/api/admin/applications?${q.toString()}`, { headers: getHeaders() });
    if (serverData) return serverData;

    let list = localDb.load().applications;
    if (params?.search) {
      const term = params.search.toLowerCase();
      list = list.filter(a => a.fullName.toLowerCase().includes(term) || a.applicationCode.toLowerCase().includes(term));
    }
    if (params?.status && params.status !== 'Semua Status') {
      list = list.filter(a => a.status === params.status);
    }
    return list;
  },

  async approveApplication(id: string): Promise<{ success: boolean; application: QueueApplication; queue: QueueEntry }> {
    const serverData = await safeFetchJson<any>(`/api/admin/applications/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (serverData) return serverData;
    return localDb.approveApplication(id);
  },

  async rejectApplication(id: string, reason: string): Promise<{ success: boolean; application: QueueApplication }> {
    const serverData = await safeFetchJson<any>(`/api/admin/applications/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (serverData) return serverData;
    return localDb.rejectApplication(id, reason);
  },

  // Queues
  async getQueues(params?: { search?: string; status?: string; date?: string }): Promise<QueueEntry[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.date) q.append('date', params.date);

    const serverData = await safeFetchJson<QueueEntry[]>(`/api/admin/queues?${q.toString()}`, { headers: getHeaders() });
    if (serverData) return serverData;

    let list = localDb.load().queues;
    if (params?.status && params.status !== 'Semua Status') {
      list = list.filter(item => item.status === params.status);
    }
    return list;
  },

  async updateQueueStatus(id: string, action: 'call' | 'start' | 'complete' | 'skip' | 'cancel'): Promise<{ success: boolean; queue: QueueEntry }> {
    const serverData = await safeFetchJson<any>(`/api/admin/queues/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ action }),
    });
    if (serverData) return serverData;
    return localDb.updateQueueStatus(id, action);
  },

  // Patients
  async getPatients(search?: string): Promise<PatientRecord[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const serverData = await safeFetchJson<PatientRecord[]>(`/api/admin/patients${q}`, { headers: getHeaders() });
    if (serverData) return serverData;

    const db = localDb.load();
    const map = new Map<string, PatientRecord>();
    for (const item of db.queues) {
      const key = item.email.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: 'pat-' + key,
          fullName: item.fullName,
          email: item.email,
          phone: item.phone,
          totalVisits: 0,
          lastVisitDate: item.date,
          history: []
        });
      }
      const pat = map.get(key)!;
      pat.totalVisits += 1;
      pat.history.push({
        queueNumber: item.queueNumber,
        serviceName: item.serviceName,
        date: item.date,
        status: item.status
      });
    }
    let list = Array.from(map.values());
    if (search) {
      list = list.filter(p => p.fullName.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  },

  // Service History
  async getHistory(params?: { search?: string; status?: string; date?: string }): Promise<QueueEntry[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.date) q.append('date', params.date);

    const serverData = await safeFetchJson<QueueEntry[]>(`/api/admin/history?${q.toString()}`, { headers: getHeaders() });
    if (serverData) return serverData;

    let list = localDb.load().queues;
    if (params?.status && params.status !== 'Semua Status') {
      list = list.filter(item => item.status === params.status);
    }
    return list;
  },

  // Reports
  async getReports(params?: { startDate?: string; endDate?: string; service?: string }): Promise<{
    summary: any;
    applications: QueueApplication[];
    queues: QueueEntry[];
  }> {
    const q = new URLSearchParams();
    if (params?.startDate) q.append('startDate', params.startDate);
    if (params?.endDate) q.append('endDate', params.endDate);
    if (params?.service) q.append('service', params.service);

    const serverData = await safeFetchJson<any>(`/api/admin/reports?${q.toString()}`, { headers: getHeaders() });
    if (serverData) return serverData;

    const db = localDb.load();
    const apps = db.applications;
    const queues = db.queues;
    return {
      summary: {
        totalPengajuan: apps.length,
        totalDisetujui: apps.filter(a => a.status === 'Disetujui').length,
        totalDitolak: apps.filter(a => a.status === 'Ditolak').length,
        totalDibatalkan: apps.filter(a => a.status === 'Dibatalkan').length,
        totalSelesai: queues.filter(q => q.status === 'Selesai').length,
        totalDilewati: queues.filter(q => q.status === 'Dilewati').length,
        avgDurationMinutes: 14
      },
      applications: apps,
      queues: queues
    };
  },

  // Settings
  async updateSettings(settings: Partial<ClinicSettings>): Promise<{ success: boolean; settings: ClinicSettings }> {
    const serverData = await safeFetchJson<any>('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    if (serverData) return serverData;

    const db = localDb.load();
    db.settings = { ...db.settings, ...settings };
    localDb.save(db);
    return { success: true, settings: db.settings };
  },

  // Services CRUD
  async createService(data: Partial<ServiceItem>): Promise<ServiceItem> {
    const serverData = await safeFetchJson<ServiceItem>('/api/services', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (serverData) return serverData;

    const db = localDb.load();
    const newItem: ServiceItem = {
      id: 'srv-' + Date.now(),
      name: data.name || '',
      description: data.description || '',
      estimatedMinutes: data.estimatedMinutes || 15,
      price: data.price || 35000,
      isActive: true
    };
    db.services.push(newItem);
    localDb.save(db);
    return newItem;
  },

  async updateService(id: string, data: Partial<ServiceItem>): Promise<ServiceItem> {
    const serverData = await safeFetchJson<ServiceItem>(`/api/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (serverData) return serverData;

    const db = localDb.load();
    const idx = db.services.findIndex(s => s.id === id);
    if (idx !== -1) {
      db.services[idx] = { ...db.services[idx], ...data };
      localDb.save(db);
      return db.services[idx];
    }
    throw new Error('Layanan tidak ditemukan');
  },

  async deleteService(id: string): Promise<void> {
    const serverData = await safeFetchJson<any>(`/api/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (serverData) return;

    const db = localDb.load();
    db.services = db.services.filter(s => s.id !== id);
    localDb.save(db);
  },

  // Notifications
  async getNotifications(): Promise<AdminNotification[]> {
    const serverData = await safeFetchJson<AdminNotification[]>('/api/admin/notifications', { headers: getHeaders() });
    if (serverData) return serverData;
    return localDb.load().notifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
    } catch {}
    const db = localDb.load();
    const notif = db.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      localDb.save(db);
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {}
    const db = localDb.load();
    db.notifications.forEach(n => { n.isRead = true; });
    localDb.save(db);
  },

  // Emails
  async getEmailLogs(): Promise<EmailDeliveryLog[]> {
    const serverData = await safeFetchJson<EmailDeliveryLog[]>('/api/admin/emails', { headers: getHeaders() });
    if (serverData) return serverData;
    return localDb.load().emailLogs;
  },

  async resendEmail(id: string): Promise<void> {
    try {
      await fetch(`/api/admin/emails/${id}/resend`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {}
    const db = localDb.load();
    const log = db.emailLogs.find(e => e.id === id);
    if (log) {
      log.sentAt = new Date().toISOString();
      log.status = 'Terkirim';
      localDb.save(db);
    }
  },

  async sendTestEmail(toEmail?: string): Promise<{ success: boolean; log: EmailDeliveryLog }> {
    const serverData = await safeFetchJson<{ success: boolean; log: EmailDeliveryLog }>('/api/admin/emails/test', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ toEmail })
    });
    if (serverData) return serverData;

    const db = localDb.load();
    const newLog: EmailDeliveryLog = {
      id: 'email-test-' + Date.now(),
      recipient: toEmail || db.settings.adminEmail,
      recipientName: 'Admin/Mantri Test',
      subject: `Uji Coba Notifikasi Email - ${db.settings.practiceName}`,
      templateType: 'ADMIN_NEW_ALERT',
      status: 'Terkirim',
      sentAt: new Date().toISOString(),
      htmlContent: `<p>Ini adalah email uji coba dari ${db.settings.practiceName}. Sistem notifikasi email siap digunakan!</p>`
    };
    db.emailLogs.unshift(newLog);
    localDb.save(db);
    return { success: true, log: newLog };
  },

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const serverData = await safeFetchJson<ActivityLog[]>('/api/admin/activity-logs', { headers: getHeaders() });
    if (serverData) return serverData;
    return localDb.load().activityLogs;
  }
};
