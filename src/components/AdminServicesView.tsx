import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Stethoscope, Clock, Banknote, X } from 'lucide-react';
import { ServiceItem } from '../types/index.ts';

interface AdminServicesViewProps {
  services: ServiceItem[];
  onCreateService: (service: Partial<ServiceItem>) => Promise<void>;
  onUpdateService: (id: string, service: Partial<ServiceItem>) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
}

export const AdminServicesView: React.FC<AdminServicesViewProps> = ({
  services,
  onCreateService,
  onUpdateService,
  onDeleteService
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [price, setPrice] = useState(35000);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setEstimatedMinutes(15);
    setPrice(35000);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setName(srv.name);
    setDescription(srv.description);
    setEstimatedMinutes(srv.estimatedMinutes);
    setPrice(srv.price);
    setIsActive(srv.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingService) {
        await onUpdateService(editingService.id, {
          name: name.trim(),
          description: description.trim(),
          estimatedMinutes: Number(estimatedMinutes),
          price: Number(price),
          isActive
        });
      } else {
        await onCreateService({
          name: name.trim(),
          description: description.trim(),
          estimatedMinutes: Number(estimatedMinutes),
          price: Number(price),
          isActive
        });
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#34483D] tracking-tight">
            Layanan Praktik
          </h2>
          <p className="text-xs sm:text-sm text-[#747C75] mt-0.5">
            Kelola jenis pemeriksaan dan tindakan medis yang dapat dipilih pasien
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-[#718776] hover:bg-[#5d7162] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan Baru</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition hover:shadow-md ${
              srv.isActive ? 'border-[#E8DFD0]' : 'border-[#E8DFD0]/50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F7F5EF] text-[#34483D] flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-[#718776]" />
                  </div>
                  <h3 className="font-bold text-sm text-[#26332B]">{srv.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${srv.isActive ? 'bg-[#EBF5EE] text-[#43865A]' : 'bg-gray-100 text-gray-500'}`}>
                  {srv.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="text-xs text-[#747C75] mt-2.5 leading-relaxed line-clamp-3">
                {srv.description || 'Tidak ada deskripsi.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1EFE8] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-mono font-bold text-[#34483D]">
                  Rp {srv.price.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-[#747C75]">
                  &plusmn; {srv.estimatedMinutes} Menit
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(srv)}
                  className="p-1.5 rounded-lg text-[#747C75] hover:text-[#34483D] hover:bg-[#F7F5EF] transition cursor-pointer"
                  title="Edit Layanan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus layanan ${srv.name}?`)) {
                      onDeleteService(srv.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#B94B4B] hover:bg-[#FDF2F2] transition cursor-pointer"
                  title="Hapus Layanan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26332B]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E8DFD0] overflow-hidden">
            <div className="p-5 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FDFBF7]">
              <h3 className="font-bold text-base text-[#34483D]">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#747C75] hover:text-[#26332B] rounded-full hover:bg-[#E8DFD0]/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Nama Layanan *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pemeriksaan Tensi & Konsultasi"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs focus:outline-none focus:border-[#718776] bg-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#26332B] mb-1">Deskripsi Layanan</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Uraian singkat tindakan pelayanan"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs focus:outline-none focus:border-[#718776] bg-[#FDFBF7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#26332B] mb-1">Estimasi Durasi (Menit)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs focus:outline-none focus:border-[#718776] bg-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#26332B] mb-1">Tarif (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2DED5] text-xs focus:outline-none focus:border-[#718776] bg-[#FDFBF7]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#718776] border-[#D5CDC0] focus:ring-[#718776]"
                  />
                  <span className="font-medium text-[#26332B]">Layanan Aktif (Dapat dipilih pasien pada pendaftaran)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8DFD0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8DFD0] text-[#747C75] hover:bg-[#F7F5EF] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#718776] hover:bg-[#5d7162] text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
