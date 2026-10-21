import React, { useState, useEffect } from 'react';
import { ArrowRight, Info, AlertCircle, CheckCircle, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ServiceItem, ClinicSettings } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface PatientFormProps {
  onSuccess: (application: any) => void;
  onOpenCheckStatus: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onSuccess, onOpenCheckStatus }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Status & validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, servicesRes] = await Promise.all([
          api.getSettings(),
          api.getServices()
        ]);
        setSettings(settingsRes.settings);
        setTodayStats(settingsRes.todayStats);
        const activeServices = servicesRes.filter(s => s.isActive);
        setServices(activeServices);
        if (activeServices.length > 0) {
          setServiceId(activeServices[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load initial data', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Nama lengkap wajib diisi.';
    } else if (fullName.trim().length < 3) {
      errors.fullName = 'Nama minimal 3 karakter.';
    }

    if (!email.trim()) {
      errors.email = 'Alamat email aktif wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format email tidak valid (contoh: nama@email.com).';
    }

    if (phone.trim() && !/^[0-9+()-\s]{8,16}$/.test(phone.trim())) {
      errors.phone = 'Nomor telepon tidak valid.';
    }

    if (!serviceId) {
      errors.serviceId = 'Silakan pilih jenis layanan.';
    }

    if (!agreed) {
      errors.agreed = 'Anda wajib menyetujui pemberitahuan privasi untuk melanjutkan.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    if (isSubmitting) return; // Prevent double submit
    setIsSubmitting(true);

    try {
      const res = await api.submitApplication({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        serviceId,
        agreed
      });

      if (res.success && res.application) {
        onSuccess(res.application);
      } else {
        throw new Error('Gagal memproses pendaftaran.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat mengirim pengajuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isClosed = todayStats && !todayStats.isRegistrationOpen;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">
      {/* Left side text and info */}
      <div className="lg:col-span-6 space-y-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#34483D]/10 border border-[#34483D]/20 text-[#34483D] text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-[#718776]" />
          <span>Praktik Perawat Mandiri Terdaftar</span>
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#34483D] tracking-tight leading-tight">
            Pelayanan Kesehatan <br className="hidden sm:inline" />
            <span className="text-[#718776]">Dengan Sepenuh Hati</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#747C75] max-w-lg leading-relaxed">
            Melayani dengan ramah, profesional dan terpercaya untuk kesehatan Anda dan keluarga.
          </p>
        </div>

        {/* Practice info highlights */}
        <div className="grid grid-cols-2 gap-3 max-w-md pt-2">
          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-[#E8DFD0] shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#747C75] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#718776]" />
              <span>Jadwal Praktik</span>
            </div>
            <p className="mt-1 font-bold text-sm text-[#26332B]">
              {settings?.openingHours.weekdays || '07:00 - 14:00 WIB'}
            </p>
            <p className="text-xs text-[#747C75]">Senin - Sabtu (Minggu Libur)</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-[#E8DFD0] shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#747C75] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#718776]" />
              <span>Status Kuota</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className="font-bold text-sm text-[#26332B]">
                {todayStats ? `${todayStats.remainingQuota} Tersisa` : 'Tersedia'}
              </p>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isClosed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                {isClosed ? 'Penuh / Tutup' : 'Buka'}
              </span>
            </div>
            <p className="text-xs text-[#747C75]">Maksimal {settings?.dailyQuota || 40} pasien/hari</p>
          </div>
        </div>

        <div className="pt-2 text-xs text-[#747C75] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#43865A]" />
          <span>Nomor antrean dan notifikasi terverifikasi langsung via Email</span>
        </div>
      </div>

      {/* Right side form card */}
      <div className="lg:col-span-6 flex justify-center lg:justify-end">
        <div className="w-full max-w-[520px] bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-[#E8DFD0]/80">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#34483D] tracking-tight">
              Pendaftaran Antrean
            </h3>
            <p className="text-sm text-[#747C75] mt-1">
              Silakan isi formulir untuk mengajukan antrean pelayanan.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F8CACA] text-[#B94B4B] text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isClosed && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FFF6E5] border border-[#F2DEB7] text-[#B78336] text-xs sm:text-sm flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Penerimaan antrean hari ini telah mencapai batas kuota atau sedang ditutup. Anda tetap dapat mengecek status antrean yang telah didaftarkan sebelumnya.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#26332B] uppercase tracking-wider mb-1.5">
                Nama Lengkap <span className="text-[#B94B4B]">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting || isClosed}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                }}
                placeholder="Masukkan nama lengkap sesuai identitas"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#26332B] placeholder:text-[#A1A7A1] bg-[#FDFBF7] focus:bg-white focus:outline-none transition ${
                  fieldErrors.fullName ? 'border-[#B94B4B] ring-1 ring-[#B94B4B]' : 'border-[#E2DED5] focus:border-[#718776] focus:ring-1 focus:ring-[#718776]'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-[#B94B4B]">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#26332B] uppercase tracking-wider mb-1.5">
                Email Aktif <span className="text-[#B94B4B]">*</span>
              </label>
              <input
                type="email"
                disabled={isSubmitting || isClosed}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                placeholder="contoh@email.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#26332B] placeholder:text-[#A1A7A1] bg-[#FDFBF7] focus:bg-white focus:outline-none transition ${
                  fieldErrors.email ? 'border-[#B94B4B] ring-1 ring-[#B94B4B]' : 'border-[#E2DED5] focus:border-[#718776] focus:ring-1 focus:ring-[#718776]'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-[#B94B4B]">{fieldErrors.email}</p>
              )}
              <p className="text-[11px] text-[#747C75] mt-1">
                Pemberitahuan persetujuan dan nomor antrean akan dikirimkan ke email ini.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#26332B] uppercase tracking-wider mb-1.5">
                Nomor Telepon / WhatsApp <span className="text-[#747C75] text-[11px] font-normal lowercase">(opsional)</span>
              </label>
              <input
                type="tel"
                disabled={isSubmitting || isClosed}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                }}
                placeholder="08xxxxxxxxxx"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#26332B] placeholder:text-[#A1A7A1] bg-[#FDFBF7] focus:bg-white focus:outline-none transition ${
                  fieldErrors.phone ? 'border-[#B94B4B] ring-1 ring-[#B94B4B]' : 'border-[#E2DED5] focus:border-[#718776] focus:ring-1 focus:ring-[#718776]'
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-[#B94B4B]">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Service Select */}
            <div>
              <label className="block text-xs font-semibold text-[#26332B] uppercase tracking-wider mb-1.5">
                Pilih Layanan <span className="text-[#B94B4B]">*</span>
              </label>
              <select
                disabled={isSubmitting || isClosed}
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  if (fieldErrors.serviceId) setFieldErrors({ ...fieldErrors, serviceId: '' });
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#26332B] bg-[#FDFBF7] focus:bg-white focus:outline-none transition cursor-pointer ${
                  fieldErrors.serviceId ? 'border-[#B94B4B] ring-1 ring-[#B94B4B]' : 'border-[#E2DED5] focus:border-[#718776] focus:ring-1 focus:ring-[#718776]'
                }`}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.estimatedMinutes} menit - Rp {s.price.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
              {fieldErrors.serviceId && (
                <p className="mt-1 text-xs text-[#B94B4B]">{fieldErrors.serviceId}</p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isSubmitting || isClosed}
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (fieldErrors.agreed) setFieldErrors({ ...fieldErrors, agreed: '' });
                  }}
                  className="mt-1 w-4 h-4 rounded text-[#718776] border-[#D5CDC0] focus:ring-[#718776] cursor-pointer"
                />
                <span className="text-xs text-[#747C75] leading-relaxed select-none">
                  Saya menyetujui bahwa data yang saya berikan akan digunakan untuk keperluan pelayanan dan pemberitahuan antrean praktik mandiri mantri.
                </span>
              </label>
              {fieldErrors.agreed && (
                <p className="mt-1 text-xs text-[#B94B4B]">{fieldErrors.agreed}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isClosed}
                className="w-full py-3 px-5 rounded-xl font-semibold text-white bg-[#718776] hover:bg-[#5d7162] active:bg-[#4d5e51] transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengirim Pengajuan...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Pengajuan Antrean</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Helper note */}
            <div className="pt-2 text-center">
              <p className="text-xs text-[#747C75] flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#718776]" />
                <span>Nomor antrean resmi diberikan setelah pengajuan disetujui mantri.</span>
              </p>
            </div>

            <div className="pt-3 border-t border-[#E8DFD0] text-center">
              <button
                type="button"
                onClick={onOpenCheckStatus}
                className="text-xs font-semibold text-[#34483D] hover:text-[#718776] underline underline-offset-4 transition cursor-pointer"
              >
                Sudah Pernah Mendaftar? Cek Status Pengajuan & Antrean
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
