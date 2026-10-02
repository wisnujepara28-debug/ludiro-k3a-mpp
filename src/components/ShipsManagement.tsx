import React, { useState } from 'react';
import {
  Ship,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Anchor,
  Compass,
  Gauge,
  Fuel,
  MapPin,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Ship as ShipType, ShipStatus, ShipType as ShipTypeCategory } from '../types';

interface ShipsManagementProps {
  ships: ShipType[];
  onCreateShip: (data: Partial<ShipType>) => Promise<boolean>;
  onUpdateShip: (id: string, data: Partial<ShipType>) => Promise<boolean>;
  onDeleteShip: (id: string) => Promise<boolean>;
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const ShipsManagement: React.FC<ShipsManagementProps> = ({
  ships,
  onCreateShip,
  onUpdateShip,
  onDeleteShip,
  isModalOpenExternal = false,
  onCloseExternalModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(isModalOpenExternal);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);
  const [detailShip, setDetailShip] = useState<ShipType | null>(null);
  const [deleteConfirmShip, setDeleteConfirmShip] = useState<ShipType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Sync external modal state if prop changes
  React.useEffect(() => {
    if (isModalOpenExternal) {
      setFormMode('create');
      setSelectedShip(null);
      setFormData(initialFormData);
      setIsFormOpen(true);
    }
  }, [isModalOpenExternal]);

  const initialFormData = {
    name: '',
    imo: 'IMO ',
    callSign: '',
    type: 'Container Ship',
    flag: 'Indonesia',
    yearBuilt: 2022,
    dwt: 45000,
    teuCapacity: 3500,
    lengthOverall: 220,
    beam: 32,
    draft: 11.5,
    status: 'Berthed' as ShipStatus,
    currentPort: 'Tanjung Priok, Jakarta',
    destinationPort: 'Tanjung Perak, Surabaya',
    speedKnots: 15.0,
    fuelLevelPct: 85,
    masterName: 'Capt. M. Bahari',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedShip(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (ship: ShipType) => {
    setFormMode('edit');
    setSelectedShip(ship);
    setFormData({
      name: ship.name,
      imo: ship.imo,
      callSign: ship.callSign,
      type: ship.type,
      flag: ship.flag,
      yearBuilt: ship.yearBuilt,
      dwt: ship.dwt,
      teuCapacity: ship.teuCapacity,
      lengthOverall: ship.lengthOverall,
      beam: ship.beam,
      draft: ship.draft,
      status: ship.status as ShipStatus,
      currentPort: ship.currentPort,
      destinationPort: ship.destinationPort,
      speedKnots: ship.speedKnots,
      fuelLevelPct: ship.fuelLevelPct,
      masterName: ship.masterName,
      notes: ship.notes || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = 'Nama kapal wajib diisi minimal 3 karakter.';
    }

    const imoRegex = /^IMO\s*\d{7}$/i;
    if (!formData.imo || !imoRegex.test(formData.imo.trim())) {
      errs.imo = 'Nomor IMO harus berformat "IMO [7 digit]" (contoh: IMO 9482103).';
    }

    if (!formData.callSign.trim()) {
      errs.callSign = 'Call Sign kapal wajib diisi.';
    }

    if (!formData.dwt || Number(formData.dwt) <= 0) {
      errs.dwt = 'Bobot DWT harus berupa angka positif lebih dari 0.';
    }

    if (formData.yearBuilt < 1960 || formData.yearBuilt > 2030) {
      errs.yearBuilt = 'Tahun pembuatan harus di antara 1960 dan 2030.';
    }

    if (!formData.currentPort.trim()) {
      errs.currentPort = 'Pelabuhan posisi saat ini wajib diisi.';
    }

    if (!formData.destinationPort.trim()) {
      errs.destinationPort = 'Pelabuhan tujuan wajib diisi.';
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
        const success = await onCreateShip(formData);
        if (success) {
          setIsFormOpen(false);
          onCloseExternalModal?.();
        }
      } else if (selectedShip) {
        const success = await onUpdateShip(selectedShip.id, formData);
        if (success) {
          setIsFormOpen(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmShip) return;
    setSubmitting(true);
    try {
      const success = await onDeleteShip(deleteConfirmShip.id);
      if (success) {
        setDeleteConfirmShip(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered ships
  const filteredShips = ships.filter((ship) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      ship.name.toLowerCase().includes(q) ||
      ship.imo.toLowerCase().includes(q) ||
      ship.callSign.toLowerCase().includes(q) ||
      ship.currentPort.toLowerCase().includes(q) ||
      ship.destinationPort.toLowerCase().includes(q) ||
      ship.masterName.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || ship.status === statusFilter;
    const matchType = typeFilter === 'ALL' || ship.type === typeFilter;

    return matchQuery && matchStatus && matchType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Underway':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Berlayar (Underway)
          </span>
        );
      case 'Berthed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Sandar (Berthed)
          </span>
        );
      case 'Anchored':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Labuh Jangkar
          </span>
        );
      case 'Drydock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            Perawatan Dok
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Ship className="w-5 h-5 text-blue-600" />
            Manajemen Armada Kapal (Fleet Master)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kapal berbendera Indonesia, sertifikasi IMO, spesifikasi teknis DWT, dan lokasi operasional.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrasi Kapal Baru
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
            placeholder="Cari kapal berdasarkan nama, nomor IMO, Call Sign, pelabuhan, atau nakhoda..."
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
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Underway">Berlayar (Underway)</option>
              <option value="Berthed">Sandar (Berthed)</option>
              <option value="Anchored">Labuh Jangkar</option>
              <option value="Drydock">Perawatan Dok</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Tipe Kapal</option>
            <option value="Container Ship">Container Ship</option>
            <option value="Oil / Chemical Tanker">Oil / Chemical Tanker</option>
            <option value="Bulk Carrier">Bulk Carrier</option>
            <option value="General Cargo">General Cargo</option>
            <option value="Tugboat & Barge Handler">Tugboat & Barge</option>
          </select>
        </div>
      </div>

      {/* Ships Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Nama Kapal & IMO</th>
                <th className="py-3 px-4">Tipe & Bendera</th>
                <th className="py-3 px-4">Kapasitas (DWT / TEU)</th>
                <th className="py-3 px-4">Status Operasional</th>
                <th className="py-3 px-4">Posisi & Rute</th>
                <th className="py-3 px-4">Bahan Bakar</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Ship className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada data kapal ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
                  </td>
                </tr>
              ) : (
                filteredShips.map((ship) => (
                  <tr key={ship.id} className="hover:bg-slate-50/80 transition group">
                    {/* Name & IMO */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5 text-blue-600" />
                        {ship.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {ship.imo} • CS: {ship.callSign}
                      </div>
                    </td>

                    {/* Type & Flag */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{ship.type}</div>
                      <div className="text-[11px] text-slate-500">
                        {ship.flag} ({ship.yearBuilt})
                      </div>
                    </td>

                    {/* DWT & TEU */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {ship.dwt.toLocaleString('id-ID')} DWT
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ship.teuCapacity > 0 ? `${ship.teuCapacity.toLocaleString('id-ID')} TEU` : 'Non-Container'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ship.status)}
                    </td>

                    {/* Current & Destination Port */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="text-slate-800 font-medium truncate" title={ship.currentPort}>
                        {ship.currentPort}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate" title={`Tujuan: ${ship.destinationPort}`}>
                        → {ship.destinationPort}
                      </div>
                    </td>

                    {/* Fuel & Speed */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              ship.fuelLevelPct > 50
                                ? 'bg-emerald-500'
                                : ship.fuelLevelPct > 20
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${ship.fuelLevelPct}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-slate-700 text-[11px]">
                          {ship.fuelLevelPct}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {ship.speedKnots} knot
                      </div>
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setDetailShip(ship)}
                          title="Lihat Detail Spesifikasi"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(ship)}
                          title="Ubah Data Kapal"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmShip(ship)}
                          title="Hapus Kapal dari Armada"
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

        {/* Table footer info */}
        <div className="p-3.5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredShips.length} dari {ships.length} unit kapal</span>
          <span className="font-medium text-slate-600">Single Source of Truth: Database Persisten</span>
        </div>
      </div>

      {/* CREATE / EDIT SHIP MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Ship className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {formMode === 'create' ? 'Registrasi Kapal Armada Baru' : `Perbarui Data Kapal: ${selectedShip?.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formMode === 'create' ? 'Lengkapi identitas maritim dan spesifikasi teknis kapal' : 'Pastikan seluruh perubahan data tervalidasi sebelum disimpan'}
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

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ship Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Kapal (Vessel Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: MV Samudera Perkasa"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.name && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* IMO Number */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor IMO (7 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.imo}
                    onChange={(e) => setFormData({ ...formData, imo: e.target.value })}
                    placeholder="IMO 9482103"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.imo && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.imo}</p>
                  )}
                </div>

                {/* Call Sign */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Call Sign Radio Maritim <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.callSign}
                    onChange={(e) => setFormData({ ...formData, callSign: e.target.value.toUpperCase() })}
                    placeholder="Contoh: YBHP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.callSign && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.callSign}</p>
                  )}
                </div>

                {/* Ship Type */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipe / Jenis Kapal <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Container Ship">Container Ship (Kapal Peti Kemas)</option>
                    <option value="Oil / Chemical Tanker">Oil / Chemical Tanker (Tangker Minyak)</option>
                    <option value="Bulk Carrier">Bulk Carrier (Curah Kering / Batubara)</option>
                    <option value="General Cargo">General Cargo (Kargo Umum)</option>
                    <option value="Tugboat & Barge Handler">Tugboat & Barge (Kapal Tunda)</option>
                    <option value="Ro-Ro Passenger / Vehicle">Ro-Ro Passenger & Kendaraan</option>
                  </select>
                </div>

                {/* Deadweight Tonnage (DWT) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas DWT (Deadweight Tonnage) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.dwt}
                    onChange={(e) => setFormData({ ...formData, dwt: Number(e.target.value) })}
                    placeholder="Contoh: 52400"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.dwt && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.dwt}</p>
                  )}
                </div>

                {/* TEU Capacity */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas Kontainer (TEU)
                  </label>
                  <input
                    type="number"
                    value={formData.teuCapacity}
                    onChange={(e) => setFormData({ ...formData, teuCapacity: Number(e.target.value) })}
                    placeholder="0 jika bukan container"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Year Built */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahun Pembuatan (Year Built) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({ ...formData, yearBuilt: Number(e.target.value) })}
                    min={1960}
                    max={2030}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.yearBuilt && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.yearBuilt}</p>
                  )}
                </div>

                {/* Operational Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Operasional <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ShipStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Underway">Berlayar (Underway)</option>
                    <option value="Berthed">Sandar di Pelabuhan (Berthed)</option>
                    <option value="Anchored">Labuh Jangkar (Anchored)</option>
                    <option value="Drydock">Perawatan Galangan (Drydock)</option>
                  </select>
                </div>

                {/* Current Port */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pelabuhan Saat Ini / Posisi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.currentPort}
                    onChange={(e) => setFormData({ ...formData, currentPort: e.target.value })}
                    placeholder="Contoh: Tanjung Priok, Jakarta"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.currentPort && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.currentPort}</p>
                  )}
                </div>

                {/* Destination Port */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pelabuhan Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.destinationPort}
                    onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                    placeholder="Contoh: Tanjung Perak, Surabaya"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.destinationPort && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.destinationPort}</p>
                  )}
                </div>

                {/* Master Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nakhoda Bertugas (Master Mariner)
                  </label>
                  <input
                    type="text"
                    value={formData.masterName}
                    onChange={(e) => setFormData({ ...formData, masterName: e.target.value })}
                    placeholder="Capt. Nama Nakhoda"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Fuel Level */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Level Bahan Bakar Bunker: <span className="text-blue-700">{formData.fuelLevelPct}%</span>
                    </label>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.fuelLevelPct}
                    onChange={(e) => setFormData({ ...formData, fuelLevelPct: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Dimensions (Length, Beam, Draft) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-2">
                  Dimensi Fisik Kapal (Metrik)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">LOA (Panjang - m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.lengthOverall}
                      onChange={(e) => setFormData({ ...formData, lengthOverall: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Beam (Lebar - m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.beam}
                      onChange={(e) => setFormData({ ...formData, beam: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Draft (Sarat Air - m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.draft}
                      onChange={(e) => setFormData({ ...formData, draft: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Operasional & Maintenance
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan inspeksi surveyor, rute tol laut, atau instruksi khusus..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                ></textarea>
              </div>

              {/* Form Actions */}
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
                  {submitting ? 'Menyimpan ke Database...' : formMode === 'create' ? 'Daftarkan Kapal' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {detailShip && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">{detailShip.name}</h3>
              </div>
              <button
                onClick={() => setDetailShip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Nomor IMO</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{detailShip.imo}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Call Sign</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{detailShip.callSign}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tipe Kapal</span>
                  <span className="font-semibold">{detailShip.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kapasitas Muatan</span>
                  <span className="font-semibold">{detailShip.dwt.toLocaleString('id-ID')} DWT ({detailShip.teuCapacity} TEU)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dimensi (LOA x Beam x Draft)</span>
                  <span className="font-semibold">{detailShip.lengthOverall}m x {detailShip.beam}m x {detailShip.draft}m</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tahun & Bendera</span>
                  <span className="font-semibold">{detailShip.yearBuilt} • {detailShip.flag}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nakhoda Bertugas</span>
                  <span className="font-semibold text-blue-800">{detailShip.masterName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Pelabuhan Posisi</span>
                  <span className="font-semibold">{detailShip.currentPort}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Pelabuhan Tujuan</span>
                  <span className="font-semibold text-sky-800">{detailShip.destinationPort}</span>
                </div>
              </div>

              {detailShip.notes && (
                <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-[11px] leading-relaxed">
                  <span className="font-bold block mb-0.5">Catatan Operasional:</span>
                  {detailShip.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailShip(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmShip && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">
              Konfirmasi Hapus Kapal
            </h3>
            <p className="text-xs text-center text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus kapal <span className="font-bold text-slate-900">{deleteConfirmShip.name}</span> ({deleteConfirmShip.imo}) dari database armada?
            </p>
            <p className="text-[11px] text-center text-rose-600 mt-1 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
              Tindakan ini tidak dapat dibatalkan. Kapal dengan pelayaran aktif tidak dapat dihapus.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmShip(null)}
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
                {submitting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
