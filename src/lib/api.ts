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

// API Client
export const api = {
  // Public
  async getSettings(): Promise<{ settings: ClinicSettings; todayStats: any }> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Gagal memuat pengaturan klinik');
    return res.json();
  },

  async getServices(): Promise<ServiceItem[]> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Gagal memuat daftar layanan');
    return res.json();
  },

  async submitApplication(data: {
    fullName: string;
    email: string;
    phone?: string;
    serviceId: string;
    agreed: boolean;
  }): Promise<{ success: boolean; application: QueueApplication }> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal mengirim pengajuan antrean');
    return json;
  },

  async checkStatus(code: string): Promise<{ application: QueueApplication; queue: any }> {
    const res = await fetch(`/api/applications/check/${encodeURIComponent(code)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Data antrean tidak ditemukan');
    return json;
  },

  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; token: string; admin: any }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login gagal');
    setAuthToken(json.token);
    return json;
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
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Sesi tidak valid');
    return res.json();
  },

  // Admin Dashboard
  async getDashboardData(): Promise<{
    stats: DashboardStats;
    recentApplications: QueueApplication[];
    activeQueues: QueueEntry[];
    unreadNotificationsCount: number;
  }> {
    const res = await fetch('/api/admin/dashboard', { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat data dashboard');
    return res.json();
  },

  // Applications
  async getApplications(params?: { search?: string; status?: string; service?: string; date?: string }): Promise<QueueApplication[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.service) q.append('service', params.service);
    if (params?.date) q.append('date', params.date);

    const res = await fetch(`/api/admin/applications?${q.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat daftar pengajuan');
    return res.json();
  },

  async approveApplication(id: string): Promise<{ success: boolean; application: QueueApplication; queue: QueueEntry }> {
    const res = await fetch(`/api/admin/applications/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menyetujui pengajuan');
    return json;
  },

  async rejectApplication(id: string, reason: string): Promise<{ success: boolean; application: QueueApplication }> {
    const res = await fetch(`/api/admin/applications/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menolak pengajuan');
    return json;
  },

  // Queues
  async getQueues(params?: { search?: string; status?: string; date?: string }): Promise<QueueEntry[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.date) q.append('date', params.date);

    const res = await fetch(`/api/admin/queues?${q.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat antrean aktif');
    return res.json();
  },

  async updateQueueStatus(id: string, action: 'call' | 'start' | 'complete' | 'skip' | 'cancel'): Promise<{ success: boolean; queue: QueueEntry }> {
    const res = await fetch(`/api/admin/queues/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal mengubah status antrean');
    return json;
  },

  // Patients
  async getPatients(search?: string): Promise<PatientRecord[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/admin/patients${q}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat data pasien');
    return res.json();
  },

  // Service History
  async getHistory(params?: { search?: string; status?: string; date?: string }): Promise<QueueEntry[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.date) q.append('date', params.date);

    const res = await fetch(`/api/admin/history?${q.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat riwayat pelayanan');
    return res.json();
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

    const res = await fetch(`/api/admin/reports?${q.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat laporan');
    return res.json();
  },

  // Settings
  async updateSettings(settings: Partial<ClinicSettings>): Promise<{ success: boolean; settings: ClinicSettings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menyimpan pengaturan');
    return json;
  },

  // Services CRUD
  async createService(data: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menambah layanan');
    return json;
  },

  async updateService(id: string, data: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memperbarui layanan');
    return json;
  },

  async deleteService(id: string): Promise<void> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus layanan');
  },

  // Notifications
  async getNotifications(): Promise<AdminNotification[]> {
    const res = await fetch('/api/admin/notifications', { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat notifikasi');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/admin/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/admin/notifications/mark-all-read', {
      method: 'POST',
      headers: getHeaders(),
    });
  },

  // Emails
  async getEmailLogs(): Promise<EmailDeliveryLog[]> {
    const res = await fetch('/api/admin/emails', { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat riwayat email');
    return res.json();
  },

  async resendEmail(id: string): Promise<void> {
    const res = await fetch(`/api/admin/emails/${id}/resend`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengirim ulang email');
  },

  async sendTestEmail(toEmail?: string): Promise<{ success: boolean; log: EmailDeliveryLog }> {
    const res = await fetch('/api/admin/emails/test', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ toEmail })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal mengirim email uji coba');
    return json;
  },

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const res = await fetch('/api/admin/activity-logs', { headers: getHeaders() });
    if (!res.ok) throw new Error('Gagal memuat log aktivitas');
    return res.json();
  },

  // Testing
  async runBlackBoxTests(): Promise<BlackBoxTestCase[]> {
    const res = await fetch('/api/test/run', { method: 'POST' });
    const json = await res.json();
    return json.testCases;
  },

  async getTestResults(): Promise<BlackBoxTestCase[]> {
    const res = await fetch('/api/test/results');
    return res.json();
  }
};
