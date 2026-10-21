import {
  ClinicSettings,
  ServiceItem,
  QueueApplication,
  QueueEntry,
  AdminNotification,
  EmailDeliveryLog,
  ActivityLog,
  PatientRecord,
  DashboardStats
} from '../types/index.ts';

const DB_STORAGE_KEY = 'mantri_clinic_db_v2';
const TOKEN_KEY = 'mantri_auth_token';

interface LocalDatabase {
  admin: {
    username: string;
    email: string;
    password: string;
    name: string;
    role: string;
  };
  settings: ClinicSettings;
  services: ServiceItem[];
  applications: QueueApplication[];
  queues: QueueEntry[];
  notifications: AdminNotification[];
  emailLogs: EmailDeliveryLog[];
  activityLogs: ActivityLog[];
}

function getInitialData(): LocalDatabase {
  const now = new Date();
  const formatTime = (d: Date) => d.toISOString();
  const todayStr = now.toISOString().slice(0, 10);

  const initialServices: ServiceItem[] = [
    {
      id: 'srv-1',
      name: 'Pemeriksaan Umum',
      description: 'Pemeriksaan keluhan kesehatan umum, tensi darah, konsultasi keluhan fisik dan resep obat.',
      estimatedMinutes: 15,
      price: 35000,
      isActive: true,
    },
    {
      id: 'srv-2',
      name: 'Konsultasi Keluarga',
      description: 'Konsultasi kesehatan keluarga, gizi, penanganan penyakit kronis, dan pola hidup sehat.',
      estimatedMinutes: 20,
      price: 40000,
      isActive: true,
    },
    {
      id: 'srv-3',
      name: 'Cek Gula Darah',
      description: 'Pemeriksaan kadar glukosa darah puasa / sewaktu dengan alat uji digital akurat.',
      estimatedMinutes: 10,
      price: 20000,
      isActive: true,
    },
    {
      id: 'srv-4',
      name: 'Cek Kolesterol',
      description: 'Pemeriksaan profil kadar kolesterol total darah cepat dan akurat.',
      estimatedMinutes: 10,
      price: 25000,
      isActive: true,
    },
    {
      id: 'srv-5',
      name: 'Cek Asam Urat',
      description: 'Skrining kadar asam urat dalam darah untuk penanganan nyeri sendi.',
      estimatedMinutes: 10,
      price: 20000,
      isActive: true,
    },
    {
      id: 'srv-6',
      name: 'Perawatan Luka Ringan',
      description: 'Pembersihan luka, antiseptik, ganti perban steril dan edukasi perawatan luka.',
      estimatedMinutes: 20,
      price: 30000,
      isActive: true,
    },
    {
      id: 'srv-7',
      name: 'Suntik Vitamin / Imunitas',
      description: 'Pemberian injeksi vitamin C dan neurobion untuk menjaga daya tahan tubuh.',
      estimatedMinutes: 15,
      price: 45000,
      isActive: true,
    },
  ];

  const initialApplications: QueueApplication[] = [
    {
      id: 'app-003',
      applicationCode: 'PA2506170003',
      fullName: 'Siti Aisyah',
      email: 'siti@gmail.com',
      phone: '081234567891',
      serviceId: 'srv-1',
      serviceName: 'Pemeriksaan Umum',
      status: 'Menunggu Persetujuan',
      appliedAt: formatTime(new Date(now.getTime() - 1000 * 60 * 15)),
      history: [
        {
          status: 'Pengajuan dibuat',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 15)),
          actor: 'Pasien (Siti Aisyah)',
          notes: 'Pengajuan online via web'
        },
        {
          status: 'Menunggu Persetujuan',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 15)),
          actor: 'Sistem'
        }
      ],
      accessToken: 'token_pa2506170003'
    },
    {
      id: 'app-002',
      applicationCode: 'PA2506170002',
      fullName: 'Budi Santoso',
      email: 'budi@gmail.com',
      phone: '081298765432',
      serviceId: 'srv-2',
      serviceName: 'Konsultasi Keluarga',
      status: 'Menunggu Persetujuan',
      appliedAt: formatTime(new Date(now.getTime() - 1000 * 60 * 25)),
      history: [
        {
          status: 'Pengajuan dibuat',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 25)),
          actor: 'Pasien (Budi Santoso)'
        }
      ],
      accessToken: 'token_pa2506170002'
    },
    {
      id: 'app-001',
      applicationCode: 'PA2506170001',
      fullName: 'Rina Lestari',
      email: 'rina@gmail.com',
      phone: '085711223344',
      serviceId: 'srv-1',
      serviceName: 'Pemeriksaan Umum',
      status: 'Menunggu Persetujuan',
      appliedAt: formatTime(new Date(now.getTime() - 1000 * 60 * 40)),
      history: [
        {
          status: 'Pengajuan dibuat',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 40)),
          actor: 'Pasien (Rina Lestari)'
        }
      ],
      accessToken: 'token_pa2506170001'
    },
    {
      id: 'app-008',
      applicationCode: 'PA2506160008',
      fullName: 'Andi Pratama',
      email: 'andi@gmail.com',
      phone: '081377889900',
      serviceId: 'srv-3',
      serviceName: 'Cek Gula Darah',
      status: 'Disetujui',
      queueNumber: 'A004',
      appliedAt: formatTime(new Date(now.getTime() - 1000 * 60 * 90)),
      processedAt: formatTime(new Date(now.getTime() - 1000 * 60 * 60)),
      processedBy: 'Mantri Husada',
      history: [
        {
          status: 'Pengajuan dibuat',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 90)),
          actor: 'Pasien (Andi Pratama)'
        },
        {
          status: 'Disetujui',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 60)),
          actor: 'Mantri Husada',
          notes: 'Diterbitkan nomor antrean A004'
        }
      ],
      accessToken: 'token_pa2506160008'
    },
    {
      id: 'app-007',
      applicationCode: 'PA2506160007',
      fullName: 'Dewi Lestari',
      email: 'dewi@gmail.com',
      phone: '081244556677',
      serviceId: 'srv-4',
      serviceName: 'Cek Kolesterol',
      status: 'Disetujui',
      queueNumber: 'A005',
      appliedAt: formatTime(new Date(now.getTime() - 1000 * 60 * 120)),
      processedAt: formatTime(new Date(now.getTime() - 1000 * 60 * 80)),
      processedBy: 'Mantri Husada',
      history: [
        {
          status: 'Pengajuan dibuat',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 120)),
          actor: 'Pasien (Dewi Lestari)'
        },
        {
          status: 'Disetujui',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 80)),
          actor: 'Mantri Husada',
          notes: 'Diterbitkan nomor antrean A005'
        }
      ],
      accessToken: 'token_pa2506160007'
    }
  ];

  const initialQueues: QueueEntry[] = [
    {
      id: 'q-001',
      applicationId: 'app-past-1',
      queueNumber: 'A001',
      date: todayStr,
      fullName: 'Rina Lestari',
      email: 'rina@gmail.com',
      phone: '085711223344',
      serviceName: 'Pemeriksaan Umum',
      status: 'Dipanggil',
      callCount: 2,
      calledAt: formatTime(new Date(now.getTime() - 1000 * 60 * 8)),
      history: [
        {
          status: 'Menunggu Giliran',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 50)),
          actor: 'Sistem'
        },
        {
          status: 'Dipanggil',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 8)),
          actor: 'Mantri Husada'
        }
      ]
    },
    {
      id: 'q-002',
      applicationId: 'app-past-2',
      queueNumber: 'A002',
      date: todayStr,
      fullName: 'Budi Santoso',
      email: 'budi@gmail.com',
      phone: '081298765432',
      serviceName: 'Cek Gula Darah',
      status: 'Sedang Dilayani',
      callCount: 1,
      calledAt: formatTime(new Date(now.getTime() - 1000 * 60 * 20)),
      serviceStartedAt: formatTime(new Date(now.getTime() - 1000 * 60 * 12)),
      history: [
        {
          status: 'Sedang Dilayani',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 12)),
          actor: 'Mantri Husada'
        }
      ]
    },
    {
      id: 'q-003',
      applicationId: 'app-003',
      queueNumber: 'A003',
      date: todayStr,
      fullName: 'Siti Aisyah',
      email: 'siti@gmail.com',
      phone: '081234567891',
      serviceName: 'Konsultasi Keluarga',
      status: 'Menunggu Giliran',
      callCount: 0,
      history: [
        {
          status: 'Menunggu Giliran',
          timestamp: formatTime(new Date(now.getTime() - 1000 * 60 * 30)),
          actor: 'Sistem'
        }
      ]
    },
    {
      id: 'q-004',
      applicationId: 'app-008',
      queueNumber: 'A004',
      date: todayStr,
      fullName: 'Andi Pratama',
      email: 'andi@gmail.com',
      phone: '081377889900',
      serviceName: 'Pemeriksaan Umum',
      status: 'Menunggu Giliran',
      callCount: 0,
      history: []
    },
    {
      id: 'q-005',
      applicationId: 'app-007',
      queueNumber: 'A005',
      date: todayStr,
      fullName: 'Dewi Lestari',
      email: 'dewi@gmail.com',
      phone: '081244556677',
      serviceName: 'Cek Kolesterol',
      status: 'Menunggu Giliran',
      callCount: 0,
      history: []
    }
  ];

  const initialNotifications: AdminNotification[] = [
    {
      id: 'notif-1',
      type: 'NEW_APPLICATION',
      title: 'Pengajuan antrean baru',
      message: 'Siti Aisyah telah mengajukan antrean untuk Pemeriksaan Umum (PA2506170003)',
      referenceId: 'app-003',
      isRead: false,
      createdAt: formatTime(new Date(now.getTime() - 1000 * 60 * 15))
    },
    {
      id: 'notif-2',
      type: 'APPROVED',
      title: 'Pengajuan disetujui',
      message: 'Budi Santoso disetujui untuk Konsultasi Keluarga (PA2506170002)',
      referenceId: 'app-002',
      isRead: true,
      createdAt: formatTime(new Date(now.getTime() - 1000 * 60 * 45))
    }
  ];

  return {
    admin: {
      username: 'mantri',
      email: 'anmaola25@gmail.com',
      password: 'mantri123',
      name: 'Mantri Husada, S.Kep., Ns.',
      role: 'Praktik Mandiri Mantri'
    },
    settings: {
      practiceName: 'Praktik Mandiri Mantri',
      mantriName: 'Mantri Husada, S.Kep., Ns.',
      mantriTitle: 'Praktik Perawat Mandiri Terdaftar',
      phone: '0812-3456-7890',
      address: 'Jl. Kesehatan No. 12, Kel. Sejahtera, Kec. Husada',
      adminEmail: 'anmaola25@gmail.com',
      dailyQuota: 40,
      isRegistrationOpen: true,
      prefix: 'A',
      openingHours: {
        weekdays: '07:00 - 14:00',
        sunday: 'Tutup'
      },
      emailNotificationsEnabled: true,
      smtpConfigured: true,
      smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: 'anmaola25@gmail.com',
        pass: '',
        fromEmail: 'anmaola25@gmail.com',
        fromName: 'Praktik Mandiri Mantri',
        isEnabled: true
      }
    },
    services: initialServices,
    applications: initialApplications,
    queues: initialQueues,
    notifications: initialNotifications,
    emailLogs: [],
    activityLogs: []
  };
}

export const localDb = {
  load(): LocalDatabase {
    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (!raw) {
        const initial = getInitialData();
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      const initial = getInitialData();
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
  },

  save(data: LocalDatabase): void {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  },

  // Auth
  login(user: string, pass: string): { success: boolean; token: string; admin: any } {
    const db = this.load();
    const clean = user.trim().toLowerCase();
    const valid = (clean === db.admin.username.toLowerCase() || clean === db.admin.email.toLowerCase()) && pass === db.admin.password;
    if (!valid) {
      throw new Error('Kredensial tidak valid: username/password salah.');
    }
    const token = 'local_session_' + Date.now();
    localStorage.setItem(TOKEN_KEY, token);
    return {
      success: true,
      token,
      admin: {
        name: db.admin.name,
        username: db.admin.username,
        email: db.admin.email,
        role: db.admin.role
      }
    };
  },

  getMe(): { admin: any } {
    const db = this.load();
    return {
      admin: {
        name: db.admin.name,
        username: db.admin.username,
        email: db.admin.email,
        role: db.admin.role
      }
    };
  },

  // Submit Application
  submitApplication(data: { fullName: string; email: string; phone?: string; serviceId: string; agreed: boolean }): { success: boolean; application: QueueApplication } {
    const db = this.load();
    const todayStr = new Date().toISOString().slice(0, 10);
    const datePrefix = todayStr.replace(/-/g, '').slice(2);
    const todayApps = db.applications.filter(a => a.appliedAt.startsWith(todayStr));
    const nextSeq = String(todayApps.length + 1).padStart(4, '0');
    const applicationCode = `PA${datePrefix}${nextSeq}`;
    const nowIso = new Date().toISOString();

    const service = db.services.find(s => s.id === data.serviceId) || db.services[0];

    const newApp: QueueApplication = {
      id: 'app-' + Date.now(),
      applicationCode,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim(),
      serviceId: service.id,
      serviceName: service.name,
      status: 'Menunggu Persetujuan',
      appliedAt: nowIso,
      history: [
        {
          status: 'Pengajuan dibuat',
          timestamp: nowIso,
          actor: `Pasien (${data.fullName.trim()})`,
          notes: 'Pendaftaran online mandiri'
        },
        {
          status: 'Menunggu Persetujuan',
          timestamp: nowIso,
          actor: 'Sistem'
        }
      ],
      accessToken: 'token_' + applicationCode.toLowerCase()
    };

    db.applications.unshift(newApp);

    // Notification
    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      type: 'NEW_APPLICATION',
      title: 'Pengajuan antrean baru',
      message: `${data.fullName.trim()} mengajukan ${service.name} (${applicationCode})`,
      referenceId: newApp.id,
      isRead: false,
      createdAt: nowIso
    });

    // Email logs
    db.emailLogs.unshift({
      id: 'email-' + Date.now() + '-1',
      recipient: data.email.trim(),
      recipientName: data.fullName.trim(),
      subject: `Konfirmasi Pengajuan Antrean [${applicationCode}] - ${db.settings.practiceName}`,
      templateType: 'APPLICATION_SUBMITTED',
      status: 'Terkirim',
      sentAt: nowIso,
      htmlContent: `<p>Pengajuan Anda (${applicationCode}) telah kami terima dan menunggu persetujuan mantri.</p>`
    });

    db.emailLogs.unshift({
      id: 'email-' + Date.now() + '-2',
      recipient: db.settings.adminEmail,
      recipientName: 'Mantri Husada',
      subject: `[Antrean Baru Masuk] ${applicationCode} - ${data.fullName.trim()}`,
      templateType: 'ADMIN_NEW_ALERT',
      status: 'Terkirim',
      sentAt: nowIso,
      htmlContent: `<p>Ada antrean baru masuk dari ${data.fullName.trim()} untuk layanan ${service.name}.</p>`
    });

    this.save(db);
    return { success: true, application: newApp };
  },

  // Check Status
  checkStatus(code: string): { application: QueueApplication; queue: any } {
    const db = this.load();
    const search = code.trim().toUpperCase();
    const app = db.applications.find(a => a.applicationCode.toUpperCase() === search || a.accessToken === code);
    if (!app) {
      throw new Error('Data pengajuan tidak ditemukan. Pastikan kode sudah benar.');
    }
    let queueDetails = null;
    if (app.queueNumber) {
      const q = db.queues.find(item => item.queueNumber === app.queueNumber);
      if (q) {
        const todayQueues = db.queues.filter(item => item.date === q.date);
        const waitingAhead = todayQueues.filter(item => (item.status === 'Menunggu Giliran' || item.status === 'Dipanggil') && item.queueNumber < q.queueNumber).length;
        queueDetails = {
          queueNumber: q.queueNumber,
          serviceStatus: q.status,
          callCount: q.callCount,
          waitingAhead
        };
      }
    }
    return { application: app, queue: queueDetails };
  },

  // Approve
  approveApplication(id: string): { success: boolean; application: QueueApplication; queue: QueueEntry } {
    const db = this.load();
    const app = db.applications.find(a => a.id === id);
    if (!app) throw new Error('Pengajuan tidak ditemukan');
    if (app.status !== 'Menunggu Persetujuan') throw new Error(`Pengajuan sudah berstatus '${app.status}'`);

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayQueues = db.queues.filter(q => q.date === todayStr);
    const nextQueueNum = `${db.settings.prefix}${String(todayQueues.length + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    app.status = 'Disetujui';
    app.queueNumber = nextQueueNum;
    app.processedAt = nowIso;
    app.processedBy = db.admin.name;
    app.history.push({
      status: 'Disetujui',
      timestamp: nowIso,
      actor: db.admin.name,
      notes: `Nomor antrean resmi diterbitkan: ${nextQueueNum}`
    });

    const newQueue: QueueEntry = {
      id: 'q-' + Date.now(),
      applicationId: app.id,
      queueNumber: nextQueueNum,
      date: todayStr,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      serviceName: app.serviceName,
      status: 'Menunggu Giliran',
      callCount: 0,
      history: [{ status: 'Menunggu Giliran', timestamp: nowIso, actor: 'Sistem' }]
    };

    db.queues.push(newQueue);

    db.emailLogs.unshift({
      id: 'email-' + Date.now() + '-appr',
      recipient: app.email,
      recipientName: app.fullName,
      subject: `Antrean Disetujui - No. ${nextQueueNum} - ${db.settings.practiceName}`,
      templateType: 'APPLICATION_APPROVED',
      status: 'Terkirim',
      sentAt: nowIso,
      htmlContent: `<p>Antrean Anda telah disetujui. Nomor resmi Anda: <strong>${nextQueueNum}</strong></p>`
    });

    this.save(db);
    return { success: true, application: app, queue: newQueue };
  },

  // Reject
  rejectApplication(id: string, reason: string): { success: boolean; application: QueueApplication } {
    const db = this.load();
    const app = db.applications.find(a => a.id === id);
    if (!app) throw new Error('Pengajuan tidak ditemukan');
    const nowIso = new Date().toISOString();

    app.status = 'Ditolak';
    app.rejectionReason = reason;
    app.processedAt = nowIso;
    app.processedBy = db.admin.name;
    app.history.push({
      status: 'Ditolak',
      timestamp: nowIso,
      actor: db.admin.name,
      notes: `Alasan: ${reason}`
    });

    db.emailLogs.unshift({
      id: 'email-' + Date.now() + '-rej',
      recipient: app.email,
      recipientName: app.fullName,
      subject: `Pemberitahuan Status Antrean [${app.applicationCode}]`,
      templateType: 'APPLICATION_REJECTED',
      status: 'Terkirim',
      sentAt: nowIso,
      htmlContent: `<p>Mohon maaf, pengajuan Anda tidak dapat disetujui. Alasan: ${reason}</p>`
    });

    this.save(db);
    return { success: true, application: app };
  },

  // Update Queue Status
  updateQueueStatus(id: string, action: 'call' | 'start' | 'complete' | 'skip' | 'cancel'): { success: boolean; queue: QueueEntry } {
    const db = this.load();
    const q = db.queues.find(item => item.id === id);
    if (!q) throw new Error('Data antrean tidak ditemukan');

    const nowIso = new Date().toISOString();
    if (action === 'call') {
      q.callCount += 1;
      q.calledAt = nowIso;
      q.status = 'Dipanggil';
    } else if (action === 'start') {
      q.status = 'Sedang Dilayani';
      q.serviceStartedAt = nowIso;
    } else if (action === 'complete') {
      q.status = 'Selesai';
      q.serviceCompletedAt = nowIso;
    } else if (action === 'skip') {
      q.status = 'Dilewati';
    } else if (action === 'cancel') {
      q.status = 'Dibatalkan';
    }

    q.history.push({ status: q.status, timestamp: nowIso, actor: db.admin.name });
    this.save(db);
    return { success: true, queue: q };
  },

  // Get Stats
  getDashboardData() {
    const db = this.load();
    const todayStr = new Date().toISOString().slice(0, 10);
    const pendingApplications = db.applications.filter(a => a.status === 'Menunggu Persetujuan').length;
    const approvedToday = db.applications.filter(a => a.status === 'Disetujui' && (a.processedAt?.startsWith(todayStr) || a.appliedAt?.startsWith(todayStr))).length;
    const waitingInQueue = db.queues.filter(q => q.date === todayStr && q.status === 'Menunggu Giliran').length;
    const currentlyServing = db.queues.filter(q => q.date === todayStr && q.status === 'Sedang Dilayani').length;
    const completedToday = db.queues.filter(q => q.date === todayStr && q.status === 'Selesai').length;

    return {
      stats: {
        pendingApplications,
        approvedToday,
        waitingInQueue,
        currentlyServing,
        completedToday,
        quotaToday: {
          current: db.queues.filter(q => q.date === todayStr).length,
          max: db.settings.dailyQuota
        }
      },
      recentApplications: db.applications.slice(0, 5),
      activeQueues: db.queues.filter(q => q.date === todayStr).slice(0, 5),
      unreadNotificationsCount: db.notifications.filter(n => !n.isRead).length
    };
  }
};
