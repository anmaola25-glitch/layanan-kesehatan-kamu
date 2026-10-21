export type ApplicationStatus = 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Dibatalkan';

export type QueueServiceStatus = 'Menunggu Giliran' | 'Dipanggil' | 'Sedang Dilayani' | 'Dilewati' | 'Selesai' | 'Dibatalkan';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  price: number;
  isActive: boolean;
}

export interface StatusHistory {
  status: string;
  timestamp: string;
  actor: string;
  notes?: string;
}

export interface QueueApplication {
  id: string;
  applicationCode: string; // e.g. PA2506170003
  fullName: string;
  email: string;
  phone?: string;
  serviceId: string;
  serviceName: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  queueNumber?: string; // e.g. A001
  appliedAt: string;
  processedAt?: string;
  processedBy?: string;
  history: StatusHistory[];
  accessToken: string; // secure token for direct status check
}

export interface QueueEntry {
  id: string;
  applicationId: string;
  queueNumber: string; // e.g. A001
  date: string; // YYYY-MM-DD
  fullName: string;
  email: string;
  phone?: string;
  serviceName: string;
  status: QueueServiceStatus;
  callCount: number;
  calledAt?: string;
  serviceStartedAt?: string;
  serviceCompletedAt?: string;
  notes?: string;
  history: StatusHistory[];
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  isEnabled: boolean;
}

export interface ClinicSettings {
  practiceName: string;
  mantriName: string;
  mantriTitle: string;
  phone: string;
  address: string;
  adminEmail: string;
  dailyQuota: number;
  isRegistrationOpen: boolean;
  prefix: string;
  openingHours: {
    weekdays: string;
    sunday: string;
  };
  emailNotificationsEnabled: boolean;
  smtpConfigured: boolean;
  smtp?: SmtpConfig;
}

export interface AdminNotification {
  id: string;
  type: 'NEW_APPLICATION' | 'APPROVED' | 'REJECTED' | 'QUEUE_UPDATE' | 'SYSTEM';
  title: string;
  message: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface EmailDeliveryLog {
  id: string;
  recipient: string;
  recipientName: string;
  subject: string;
  templateType: 'APPLICATION_SUBMITTED' | 'APPLICATION_APPROVED' | 'APPLICATION_REJECTED' | 'ADMIN_NEW_ALERT';
  status: 'Terkirim' | 'Gagal' | 'Pending';
  sentAt: string;
  htmlContent: string;
  errorMessage?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  actor: string;
  timestamp: string;
  category: 'APPLICATION' | 'QUEUE' | 'SETTINGS' | 'AUTH';
}

export interface PatientRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  totalVisits: number;
  lastVisitDate: string;
  history: {
    queueNumber?: string;
    serviceName: string;
    date: string;
    status: string;
  }[];
}

export interface DashboardStats {
  pendingApplications: number;
  approvedToday: number;
  waitingInQueue: number;
  currentlyServing: number;
  completedToday: number;
  quotaToday: {
    current: number;
    max: number;
  };
}

export interface BlackBoxTestCase {
  id: number;
  title: string;
  category: string;
  step: string;
  expectedResult: string;
  actualResult: string;
  status: 'Lulus' | 'Gagal' | 'Belum Diuji';
  testedAt?: string;
}
