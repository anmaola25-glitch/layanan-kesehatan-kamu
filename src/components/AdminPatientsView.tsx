import React, { useState } from 'react';
import { Search, UserCheck, Calendar, Phone, Mail, ChevronRight, X, Clock } from 'lucide-react';
import { PatientRecord } from '../types/index.ts';
import { StatusBadge } from './Badge.tsx';

interface AdminPatientsViewProps {
  patients: PatientRecord[];
}

export const AdminPatientsView: React.FC<AdminPatientsViewProps> = ({ patients }) => {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const filtered = patients.filter((p) => {
    return (
      search === '' ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#34483D] tracking-tight">
          Data Pasien
        </h2>
        <p className="text-xs sm:text-sm text-[#747C75] mt-0.5">
          Direktori pasien terdaftar dan akumulasi kunjungan pelayanan
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8DFD0] p-4 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pasien, email, atau no. telepon..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2DED5] text-xs sm:text-sm text-[#26332B] placeholder:text-[#A1A7A1] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#718776]"
          />
          <Search className="w-4 h-4 text-[#747C75] absolute left-3 top-2.5" />
        </div>
        <div className="text-xs text-[#747C75]">
          Total Pasien Terdata: <strong>{patients.length}</strong>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FDFBF7] text-[#747C75] font-semibold uppercase tracking-wider border-b border-[#E8DFD0]">
              <tr>
                <th className="px-4 py-3.5">Nama Pasien</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Nomor Telepon</th>
                <th className="px-4 py-3.5 text-center">Total Kunjungan</th>
                <th className="px-4 py-3.5">Kunjungan Terakhir</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFE8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#747C75]">
                    Belum ada data pasien yang terdaftar.
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr key={patient.id} className="hover:bg-[#F7F5EF] transition">
                    <td className="px-4 py-3.5 font-bold text-[#26332B]">
                      {patient.fullName}
                    </td>
                    <td className="px-4 py-3.5 text-[#747C75] font-mono">
                      {patient.email}
                    </td>
                    <td className="px-4 py-3.5 text-[#747C75]">
                      {patient.phone || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-[#34483D] font-mono">
                      {patient.totalVisits} kali
                    </td>
                    <td className="px-4 py-3.5 text-[#747C75]">
                      {patient.lastVisitDate}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPatient(patient)}
                        className="px-2.5 py-1 rounded-md bg-[#F1EFE8] hover:bg-[#E8DFD0] text-[#34483D] font-medium text-[11px] cursor-pointer"
                      >
                        Riwayat Kunjungan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Visit History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26332B]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8DFD0] overflow-hidden">
            <div className="p-5 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FDFBF7]">
              <div>
                <h3 className="font-bold text-lg text-[#34483D]">Riwayat Kunjungan Pasien</h3>
                <p className="text-xs text-[#747C75]">{selectedPatient.fullName} ({selectedPatient.email})</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-[#747C75] hover:text-[#26332B] rounded-full hover:bg-[#E8DFD0]/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {selectedPatient.history.length === 0 ? (
                <p className="text-xs text-[#747C75] text-center py-4">Belum ada riwayat kunjungan.</p>
              ) : (
                selectedPatient.history.map((h, i) => (
                  <div key={i} className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8DFD0] flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#34483D]">{h.queueNumber || '-'}</span>
                        <span className="font-semibold text-[#26332B]">{h.serviceName}</span>
                      </div>
                      <p className="text-[11px] text-[#747C75] mt-1">{h.date}</p>
                    </div>
                    <StatusBadge status={h.status} size="sm" />
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[#F7F5EF] border-t border-[#E8DFD0] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#34483D] bg-white border border-[#E8DFD0] hover:bg-[#F7F5EF]"
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
