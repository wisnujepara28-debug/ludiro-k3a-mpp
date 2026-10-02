import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Ship,
  Phone,
  Calendar,
  Award,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { Crew as CrewType, Ship as ShipType, CertStatus } from '../types';

interface CrewManagementProps {
  crew: CrewType[];
  ships: ShipType[];
  onCreateCrew: (data: Partial<CrewType>) => Promise<boolean>;
  onUpdateCrew: (id: string, data: Partial<CrewType>) => Promise<boolean>;
  onDeleteCrew: (id: string) => Promise<boolean>;
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const CrewManagement: React.FC<CrewManagementProps> = ({
  crew,
  ships,
  onCreateCrew,
  onUpdateCrew,
  onDeleteCrew,
  isModalOpenExternal = false,
  onCloseExternalModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [certFilter, setCertFilter] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(isModalOpenExternal);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCrew, setSelectedCrew] = useState<CrewType | null>(null);
  const [deleteConfirmCrew, setDeleteConfirmCrew] = useState<CrewType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isModalOpenExternal) {
      setFormMode('create');
      setSelectedCrew(null);
      setFormData(initialFormData);
      setIsFormOpen(true);
    }
  }, [isModalOpenExternal]);

  const initialFormData = {
    seafarerCode: `SEA-ID-${Math.floor(100000 + Math.random() * 900000)}-K`,
    fullName: '',
    rank: 'Nakhoda (Master Mariner)',
    assignedShipId: ships[0]?.id || '',
    stcwCertificate: 'ANT-I (Master Unlimited) IMO STCW',
    certificateExpiry: '2028-12-31',
    contractEndDate: '2027-10-31',
    nationality: 'Indonesia',
    phone: '+62 812-3456-7890',
    emergencyContact: 'Keluarga Inti - 0812-9876-5432',
  };

  const [formData, setFormData] = useState(initialFormData);

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedCrew(null);
    setFormData({
      ...initialFormData,
      seafarerCode: `SEA-ID-${Math.floor(100000 + Math.random() * 900000)}-K`,
      assignedShipId: ships[0]?.id || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (member: CrewType) => {
    setFormMode('edit');
    setSelectedCrew(member);
    setFormData({
      seafarerCode: member.seafarerCode,
      fullName: member.fullName,
      rank: member.rank,
      assignedShipId: member.assignedShipId,
      stcwCertificate: member.stcwCertificate,
      certificateExpiry: member.certificateExpiry,
      contractEndDate: member.contractEndDate,
      nationality: member.nationality,
      phone: member.phone,
      emergencyContact: member.emergencyContact,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Nama lengkap pelaut wajib diisi minimal 3 karakter.';
    }

    if (!formData.seafarerCode.trim() || formData.seafarerCode.trim().length < 4) {
      errs.seafarerCode = 'Nomor Buku Pelaut / Seafarer ID wajib diisi.';
    }

    if (!formData.rank) {
      errs.rank = 'Pilih jabatan pelaut.';
    }

    if (!formData.certificateExpiry) {
      errs.certificateExpiry = 'Masa berlaku sertifikat STCW wajib diisi.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (formMode === 'create') {
        const success = await onCreateCrew(formData);
        if (success) {
          setIsFormOpen(false);
          onCloseExternalModal?.();
        }
      } else if (selectedCrew) {
        const success = await onUpdateCrew(selectedCrew.id, formData);
        if (success) {
          setIsFormOpen(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCrew) return;
    setSubmitting(true);
    try {
      const success = await onDeleteCrew(deleteConfirmCrew.id);
      if (success) {
        setDeleteConfirmCrew(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCrew = crew.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      c.fullName.toLowerCase().includes(q) ||
      c.seafarerCode.toLowerCase().includes(q) ||
      c.rank.toLowerCase().includes(q) ||
      c.assignedShipName.toLowerCase().includes(q);

    const matchCert = certFilter === 'ALL' || c.certStatus === certFilter;
    return matchQuery && matchCert;
  });

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Awak Kapal & Sertifikasi STCW (Crewing)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Database nakhoda, perwira mesin, kelasi geladak, verifikasi sertifikat kepelautan STCW Manila Amendments, dan kontrak kerja.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrasi Awak Kapal
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pelaut, nomor buku pelaut, jabatan, atau kapal penugasan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={certFilter}
            onChange={(e) => setCertFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Status Sertifikat</option>
            <option value="Valid">Valid (Aktif)</option>
            <option value="Expiring Soon">Segera Kedaluwarsa (&lt; 90 Hari)</option>
            <option value="Expired">Kedaluwarsa (Expired)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Nama Pelaut & Buku Pelaut</th>
                <th className="py-3 px-4">Jabatan (Rank)</th>
                <th className="py-3 px-4">Kapal Penugasan</th>
                <th className="py-3 px-4">Sertifikat STCW</th>
                <th className="py-3 px-4">Status & Masa Berlaku</th>
                <th className="py-3 px-4">Kontak Darurat</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCrew.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada data awak kapal ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Daftarkan awak kapal baru melalui formulir di atas.</p>
                  </td>
                </tr>
              ) : (
                filteredCrew.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition group">
                    {/* Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700">
                        {member.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ID: {member.seafarerCode} • {member.nationality}
                      </div>
                    </td>

                    {/* Rank */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {member.rank}
                    </td>

                    {/* Assigned Ship */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Ship className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{member.assignedShipName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Kontrak s/d {new Date(member.contractEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    {/* STCW */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-medium text-slate-800 truncate" title={member.stcwCertificate}>
                        {member.stcwCertificate}
                      </div>
                    </td>

                    {/* Status & Expiry */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          member.certStatus === 'Valid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : member.certStatus === 'Expiring Soon'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {member.certStatus === 'Valid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {member.certStatus === 'Expiring Soon' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {member.certStatus === 'Expired' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {member.certStatus}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Exp: {new Date(member.certificateExpiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Phone & Emergency */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="text-slate-800 font-mono text-[11px]">{member.phone}</div>
                      <div className="text-[10px] text-slate-400 truncate" title={member.emergencyContact}>
                        {member.emergencyContact}
                      </div>
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(member)}
                          title="Ubah Data Awak Kapal"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCrew(member)}
                          title="Hapus Awak Kapal"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredCrew.length} perwira dan anak buah kapal</span>
          <span className="font-medium text-slate-600">Database Persisten Server Terhubung</span>
        </div>
      </div>

      {/* CREATE / EDIT CREW MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {formMode === 'create' ? 'Registrasi Awak Kapal Baru' : `Perbarui Awak: ${selectedCrew?.fullName}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi identitas pelaut, kualifikasi ijazah STCW, dan penugasan kapal armada.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  onCloseExternalModal?.();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap Pelaut <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Capt. Nama Pelaut, M.Mar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.fullName && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Seafarer Code */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Buku Pelaut (Seafarer ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.seafarerCode}
                    onChange={(e) => setFormData({ ...formData, seafarerCode: e.target.value.toUpperCase() })}
                    placeholder="SEA-ID-992014-A"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.seafarerCode && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.seafarerCode}</p>
                  )}
                </div>

                {/* Rank / Jabatan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan di Kapal (Rank) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Nakhoda (Master Mariner)">Nakhoda (Master Mariner)</option>
                    <option value="Chief Officer (Mualim I)">Chief Officer (Mualim I)</option>
                    <option value="2nd Officer (Mualim II)">2nd Officer (Mualim II)</option>
                    <option value="3rd Officer (Mualim III)">3rd Officer (Mualim III)</option>
                    <option value="Chief Engineer (Kamar Mesin)">Chief Engineer (Kamar Mesin)</option>
                    <option value="2nd Engineer (Masinis II)">2nd Engineer (Masinis II)</option>
                    <option value="Electrician / ETO">Electrician / ETO</option>
                    <option value="Bosun / Mandor Geladak">Bosun / Mandor Geladak</option>
                    <option value="Able Seaman (Juru Mudi)">Able Seaman (Juru Mudi)</option>
                    <option value="Oiler / Juru Minyak">Oiler / Juru Minyak</option>
                    <option value="Chief Cook">Chief Cook (Koki Kapal)</option>
                  </select>
                </div>

                {/* Ship Assignment */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapal Penugasan
                  </label>
                  <select
                    value={formData.assignedShipId}
                    onChange={(e) => setFormData({ ...formData, assignedShipId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="">-- Standby Pool (Darat / Cuti) --</option>
                    {ships.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* STCW Certificate */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ijazah Kepelautan & Endorsement STCW <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.stcwCertificate}
                    onChange={(e) => setFormData({ ...formData, stcwCertificate: e.target.value })}
                    placeholder="Contoh: ANT-I (Master Unlimited) / ATT-I (Chief Engineer)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Certificate Expiry Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Masa Berlaku Sertifikat STCW <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.certificateExpiry}
                    onChange={(e) => setFormData({ ...formData, certificateExpiry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.certificateExpiry && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.certificateExpiry}</p>
                  )}
                </div>

                {/* Contract End Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Masa Akhir Kontrak Kerja Laut
                  </label>
                  <input
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Telepon Seluler / Satelit
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kontak Darurat (Nama & Hubungan)
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Nama Istri/Orang Tua - No. HP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    onCloseExternalModal?.();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : formMode === 'create' ? 'Daftarkan Pelaut' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmCrew && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">
              Hapus Data Awak Kapal
            </h3>
            <p className="text-xs text-center text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pelaut <span className="font-bold text-slate-900">{deleteConfirmCrew.fullName}</span> ({deleteConfirmCrew.rank}) dari sistem?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmCrew(null)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-500/20 transition cursor-pointer"
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
