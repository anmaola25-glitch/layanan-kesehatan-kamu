import React, { useState } from 'react';
import {
  Settings,
  Mail,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ClinicSettings, EmailDeliveryLog } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AdminSettingsViewProps {
  settings: ClinicSettings;
  emailLogs: EmailDeliveryLog[];
  onUpdateSettings: (settings: Partial<ClinicSettings>) => Promise<void>;
  onRefreshEmailLogs: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings,
  emailLogs,
  onUpdateSettings,
  onRefreshEmailLogs
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'emails'>('general');

  // Form states
  const [practiceName, setPracticeName] = useState(settings.practiceName);
  const [mantriName, setMantriName] = useState(settings.mantriName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail);
  const [dailyQuota, setDailyQuota] = useState(settings.dailyQuota);
  const [prefix, setPrefix] = useState(settings.prefix);
  const [weekdaysHours, setWeekdaysHours] = useState(settings.openingHours.weekdays);
  const [sundayHours, setSundayHours] = useState(settings.openingHours.sunday);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(settings.isRegistrationOpen);

  // SMTP states
  const [smtpHost, setSmtpHost] = useState(settings.smtp?.host || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(settings.smtp?.port || 465);
  const [smtpSecure, setSmtpSecure] = useState(settings.smtp?.secure ?? true);
  const [smtpUser, setSmtpUser] = useState(settings.smtp?.user || settings.adminEmail || 'anmaola25@gmail.com');
  const [smtpPass, setSmtpPass] = useState(settings.smtp?.pass || '');
  const [smtpFromEmail, setSmtpFromEmail] = useState(settings.smtp?.fromEmail || settings.adminEmail || 'anmaola25@gmail.com');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewEmail, setPreviewEmail] = useState<EmailDeliveryLog | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    try {
      await onUpdateSettings({
        practiceName,
        mantriName,
        phone,
        address,
        adminEmail,
        dailyQuota: Number(dailyQuota),
        prefix,
        openingHours: {
          weekdays: weekdaysHours,
          sunday: sundayHours
        },
        isRegistrationOpen,
        smtp: {
          host: smtpHost.trim(),
          port: Number(smtpPort),
          secure: smtpSecure,
          user: smtpUser.trim(),
          pass: smtpPass.trim(),
          fromEmail: smtpFromEmail.trim() || adminEmail.trim(),
          fromName: practiceName,
          isEnabled: true
        }
      });
      setSuccessMessage('Pengaturan praktik dan konfigurasi email berhasil disimpan.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await api.sendTestEmail(adminEmail);
      setTestEmailResult(`Email uji coba berhasil diproses ke: ${adminEmail} (Status: ${res.log.status})`);
      onRefreshEmailLogs();
    } catch (err: any) {
      setTestEmailResult(`Gagal mengirim: ${err.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleResendEmail = async (id: string) => {
    setResendingId(id);
    try {
      await api.resendEmail(id);
      onRefreshEmailLogs();
      alert('Email berhasil dikirim ulang ke penerima.');
    } catch (e: any) {
      alert('Gagal mengirim ulang email: ' + e.message);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#34483D] tracking-tight">
          Pengaturan & Riwayat Email
        </h2>
        <p className="text-xs sm:text-sm text-[#747C75] mt-0.5">
          Konfigurasi identitas praktik, jadwal, kuota, serta audit pengiriman email
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E8DFD0]">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'general'
              ? 'border-[#718776] text-[#34483D]'
              : 'border-transparent text-[#747C75] hover:text-[#34483D]'
          }`}
        >
          Konfigurasi Praktik
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'emails'
              ? 'border-[#718776] text-[#34483D]'
              : 'border-transparent text-[#747C75] hover:text-[#34483D]'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Riwayat Pengiriman Email ({emailLogs.length})</span>
        </button>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6">
          {successMessage && (
            <div className="p-3.5 bg-[#EBF5EE] border border-[#C8E6D3] rounded-xl text-xs sm:text-sm text-[#43865A] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E8DFD0] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#34483D] border-b border-[#E8DFD0] pb-2">
              Identitas & Kontak Praktik
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Nama Praktik</label>
                <input
                  type="text"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#718776]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Nama & Gelar Mantri</label>
                <input
                  type="text"
                  value={mantriName}
                  onChange={(e) => setMantriName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#718776]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Nomor Telepon / WhatsApp Praktik</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#718776]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Email Pemberitahuan Admin</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#718776]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#26332B] mb-1">Alamat Lengkap Praktik</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#718776]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFD0] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#34483D] border-b border-[#E8DFD0] pb-2">
              Jadwal & Pengaturan Antrean
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Kuota Pasien per Hari</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#718776]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Awalan Huruf Nomor Antrean (Prefix)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#718776] uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Status Pendaftaran Pasien</label>
                <button
                  type="button"
                  onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                  className={`w-full py-2 px-3 rounded-xl font-semibold text-xs border transition cursor-pointer ${
                    isRegistrationOpen
                      ? 'bg-[#EBF5EE] text-[#43865A] border-[#C8E6D3]'
                      : 'bg-[#FDF2F2] text-[#B94B4B] border-[#F8CACA]'
                  }`}
                >
                  {isRegistrationOpen ? 'Pendaftaran DIBUKA' : 'Pendaftaran DITUTUP'}
                </button>
              </div>

              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Jam Pelayanan (Senin - Sabtu)</label>
                <input
                  type="text"
                  value={weekdaysHours}
                  onChange={(e) => setWeekdaysHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Jam Pelayanan (Minggu)</label>
                <input
                  type="text"
                  value={sundayHours}
                  onChange={(e) => setSundayHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7]"
                />
              </div>
            </div>
          </div>

          {/* Email Notification Integration Card */}
          <div className="bg-white rounded-2xl border border-[#E8DFD0] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#718776]" />
                <h3 className="font-bold text-base text-[#34483D]">
                  Sistem Notifikasi Email (Admin & Pasien)
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF5EE] text-[#43865A] border border-[#C8E6D3]">
                Aktif Otomatis
              </span>
            </div>

            {/* Email Flow Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E8DFD0] space-y-1">
                <p className="font-bold text-[#34483D] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#43865A]" />
                  <span>Notifikasi Email Pasien</span>
                </p>
                <p className="text-[#747C75] leading-relaxed">
                  Otomatis terkirim ke email pasien saat:
                </p>
                <ul className="list-disc pl-4 text-[#26332B] space-y-0.5">
                  <li><strong>Pendaftaran:</strong> Bukti registrasi & kode pengajuan</li>
                  <li><strong>Persetujuan:</strong> Tiket resmi + nomor antrean (A001)</li>
                  <li><strong>Penolakan:</strong> Alasan penolakan dari mantri</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E8DFD0] space-y-1">
                <p className="font-bold text-[#34483D] flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#718776]" />
                  <span>Notifikasi Email Admin</span>
                </p>
                <p className="text-[#747C75] leading-relaxed">
                  Otomatis terkirim ke <strong>{adminEmail}</strong> saat ada pasien baru mendaftar, lengkap dengan rincian nama, layanan, dan tautan dashboard.
                </p>
                <button
                  type="button"
                  disabled={testingEmail}
                  onClick={handleSendTestEmail}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-[#34483D] hover:bg-[#27362e] text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingEmail ? 'animate-spin' : ''}`} />
                  <span>{testingEmail ? 'Mengirim Uji Coba...' : 'Kirim Email Uji Coba ke Admin'}</span>
                </button>
              </div>
            </div>

            {testEmailResult && (
              <div className="p-3 bg-[#EBF5EE] border border-[#C8E6D3] rounded-xl text-xs text-[#43865A] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{testEmailResult}</span>
              </div>
            )}

            {/* SMTP Settings */}
            <div className="pt-2 border-t border-[#F1EFE8] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#34483D]">Konfigurasi Relay SMTP (Pengiriman Langsung)</h4>
                  <p className="text-[11px] text-[#747C75]">Hubungkan akun SMTP/Gmail Anda untuk pengiriman email live langsung ke inbox</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSmtpHost('smtp.gmail.com');
                      setSmtpPort(465);
                      setSmtpSecure(true);
                      setSmtpUser(adminEmail);
                    }}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-[#F7F5EF] hover:bg-[#E8DFD0] text-[#34483D] cursor-pointer"
                  >
                    Preset Gmail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmtpHost('sandbox.smtp.mailtrap.io');
                      setSmtpPort(2525);
                      setSmtpSecure(false);
                    }}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-[#F7F5EF] hover:bg-[#E8DFD0] text-[#34483D] cursor-pointer"
                  >
                    Preset Mailtrap
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#26332B] mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#26332B] mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    placeholder="465"
                    className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#26332B] mb-1">SMTP Username / Email</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#26332B] mb-1">SMTP Password / App Password</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="16-digit Google App Password"
                    className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#26332B] mb-1">Email Pengirim (Sender Address)</label>
                  <input
                    type="email"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    placeholder="anmaola25@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs bg-[#FDFBF7]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#718776] hover:bg-[#5d7162] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'emails' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FDFBF7]">
            <div>
              <h3 className="font-bold text-sm text-[#34483D]">Log Pengiriman Email Transaksional</h3>
              <p className="text-xs text-[#747C75]">Catatan riwayat notifikasi email yang dikirim kepada pasien dan admin</p>
            </div>
            <button
              type="button"
              onClick={onRefreshEmailLogs}
              className="p-1.5 rounded-lg border border-[#E8DFD0] text-[#747C75] hover:text-[#34483D] bg-white cursor-pointer"
              title="Segarkan Log"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] text-[#747C75] font-semibold uppercase tracking-wider border-b border-[#E8DFD0]">
                <tr>
                  <th className="px-4 py-3">Penerima</th>
                  <th className="px-4 py-3">Subjek Email</th>
                  <th className="px-4 py-3">Tipe Template</th>
                  <th className="px-4 py-3">Waktu Kirim</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFE8]">
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#747C75]">
                      Belum ada email yang terkirim.
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F7F5EF] transition">
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#26332B]">{log.recipientName}</p>
                        <p className="text-[11px] text-[#747C75] font-mono">{log.recipient}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#26332B] max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#747C75]">
                        {log.templateType}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#747C75]">
                        {new Date(log.sentAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF5EE] text-[#43865A] border border-[#C8E6D3]">
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewEmail(log)}
                          className="px-2 py-1 rounded bg-[#F1EFE8] hover:bg-[#E8DFD0] text-[#34483D] font-medium text-[11px] cursor-pointer"
                        >
                          Lihat Email
                        </button>
                        <button
                          type="button"
                          disabled={resendingId === log.id}
                          onClick={() => handleResendEmail(log.id)}
                          className="px-2 py-1 rounded bg-[#EBF5EE] hover:bg-[#C8E6D3] text-[#43865A] font-medium text-[11px] cursor-pointer disabled:opacity-50"
                        >
                          {resendingId === log.id ? 'Mengirim...' : 'Kirim Ulang'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26332B]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-[#E8DFD0] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FDFBF7]">
              <div>
                <h4 className="font-bold text-sm text-[#34483D]">Pratinjau Email Transaksional</h4>
                <p className="text-xs text-[#747C75]">Kepada: {previewEmail.recipient} ({previewEmail.recipientName})</p>
              </div>
              <button
                onClick={() => setPreviewEmail(null)}
                className="p-1 text-[#747C75] hover:text-[#26332B] rounded-full hover:bg-[#E8DFD0]/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div
                className="bg-white rounded-xl shadow-xs p-4 border border-[#E8DFD0]"
                dangerouslySetInnerHTML={{ __html: previewEmail.htmlContent }}
              />
            </div>

            <div className="p-4 bg-[#FDFBF7] border-t border-[#E8DFD0] flex justify-between items-center text-xs">
              <span className="text-[#747C75]">Dikirim: {new Date(previewEmail.sentAt).toLocaleString('id-ID')}</span>
              <button
                type="button"
                onClick={() => setPreviewEmail(null)}
                className="px-4 py-2 bg-white border border-[#E8DFD0] rounded-xl text-xs font-semibold text-[#34483D] hover:bg-[#F7F5EF]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
