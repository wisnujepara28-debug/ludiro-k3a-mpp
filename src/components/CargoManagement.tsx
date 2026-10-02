import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  AlertCircle,
  FileText,
  Printer,
  ShieldAlert,
  CheckCircle2,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { Cargo as CargoType, Voyage as VoyageType, CargoStatus } from '../types';

interface CargoManagementProps {
  cargo: CargoType[];
  voyages: VoyageType[];
  onCreateCargo: (data: Partial<CargoType>) => Promise<boolean>;
  onUpdateCargo: (id: string, data: Partial<CargoType>) => Promise<boolean>;
  onDeleteCargo: (id: string) => Promise<boolean>;
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const CargoManagement: React.FC<CargoManagementProps> = ({
  cargo,
  voyages,
  onCreateCargo,
  onUpdateCargo,
  onDeleteCargo,
  isModalOpenExternal = false,
  onCloseExternalModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(isModalOpenExternal);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCargo, setSelectedCargo] = useState<CargoType | null>(null);
  const [blPreviewCargo, setBlPreviewCargo] = useState<CargoType | null>(null);
  const [deleteConfirmCargo, setDeleteConfirmCargo] = useState<CargoType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isModalOpenExternal) {
      setFormMode('create');
      setSelectedCargo(null);
      setFormData(initialFormData);
      setIsFormOpen(true);
    }
  }, [isModalOpenExternal]);

  const defaultVoyage = voyages[0] || { id: '', voyageNumber: 'Umum' };

  const initialFormData = {
    blNumber: `BL-NSL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    voyageId: defaultVoyage.id,
    voyageNumber: defaultVoyage.voyageNumber,
    shipperName: 'PT Indofood Sukses Makmur Tbk',
    consigneeName: 'PT Trans Retail Indonesia (Carrefour Logistik)',
    commodityType: 'Fast Moving Consumer Goods (Food & Beverage)',
    containerNumber: `SMLU-${Math.floor(100000 + Math.random() * 900000)}-4`,
    packageCount: 1800,
    packageUnit: 'Carton Boxes',
    grossWeightMt: 22.4,
    volumeCbm: 64.5,
    hazardous: false,
    customsStatus: 'Clear (SPPB Released)',
    status: 'Loaded' as CargoStatus,
  };

  const [formData, setFormData] = useState(initialFormData);

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedCargo(null);
    setFormData({
      ...initialFormData,
      blNumber: `BL-NSL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      containerNumber: `SMLU-${Math.floor(100000 + Math.random() * 900000)}-4`,
      voyageId: voyages[0]?.id || '',
      voyageNumber: voyages[0]?.voyageNumber || 'Umum',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (c: CargoType) => {
    setFormMode('edit');
    setSelectedCargo(c);
    setFormData({
      blNumber: c.blNumber,
      voyageId: c.voyageId,
      voyageNumber: c.voyageNumber,
      shipperName: c.shipperName,
      consigneeName: c.consigneeName,
      commodityType: c.commodityType,
      containerNumber: c.containerNumber,
      packageCount: c.packageCount,
      packageUnit: c.packageUnit,
      grossWeightMt: c.grossWeightMt,
      volumeCbm: c.volumeCbm,
      hazardous: c.hazardous,
      customsStatus: c.customsStatus,
      status: c.status as CargoStatus,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.blNumber.trim() || formData.blNumber.trim().length < 5) {
      errs.blNumber = 'Nomor B/L wajib diisi minimal 5 karakter.';
    }

    if (!formData.shipperName.trim() || formData.shipperName.trim().length < 3) {
      errs.shipperName = 'Nama Pengirim (Shipper) wajib diisi.';
    }

    if (!formData.consigneeName.trim() || formData.consigneeName.trim().length < 3) {
      errs.consigneeName = 'Nama Penerima (Consignee) wajib diisi.';
    }

    if (!formData.commodityType.trim()) {
      errs.commodityType = 'Jenis komoditas muatan wajib diisi.';
    }

    if (!formData.grossWeightMt || Number(formData.grossWeightMt) <= 0) {
      errs.grossWeightMt = 'Berat kargo harus berupa angka positif lebih dari 0.';
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
        const success = await onCreateCargo(formData);
        if (success) {
          setIsFormOpen(false);
          onCloseExternalModal?.();
        }
      } else if (selectedCargo) {
        const success = await onUpdateCargo(selectedCargo.id, formData);
        if (success) {
          setIsFormOpen(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCargo) return;
    setSubmitting(true);
    try {
      const success = await onDeleteCargo(deleteConfirmCargo.id);
      if (success) {
        setDeleteConfirmCargo(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCargo = cargo.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      c.blNumber.toLowerCase().includes(q) ||
      c.containerNumber.toLowerCase().includes(q) ||
      c.shipperName.toLowerCase().includes(q) ||
      c.consigneeName.toLowerCase().includes(q) ||
      c.commodityType.toLowerCase().includes(q) ||
      c.voyageNumber.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            Manifes Kargo & Bill of Lading (B/L)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan dokumen muatan laut, nomor peti kemas kontainer, deklarasi muatan berbahaya (IMDG Code), dan kepatuhan bea cukai.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buat Dokumen B/L Kargo
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
            placeholder="Cari nomor B/L, nomor kontainer, shipper, consignee, atau komoditas..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Status Kargo</option>
            <option value="In Warehouse">Masuk Gudang / CFS (In Warehouse)</option>
            <option value="Loaded">Dimuat ke Kapal (Loaded)</option>
            <option value="In Transit">Dalam Pelayaran (In Transit)</option>
            <option value="Discharged">Dibongkar (Discharged)</option>
            <option value="Delivered">Terkirim ke Penerima (Delivered)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Nomor B/L & Kontainer</th>
                <th className="py-3 px-4">Pengirim (Shipper)</th>
                <th className="py-3 px-4">Penerima (Consignee)</th>
                <th className="py-3 px-4">Komoditas & Muatan</th>
                <th className="py-3 px-4">Berat / Volume</th>
                <th className="py-3 px-4">Status & Bea Cukai</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCargo.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada data kargo ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Buat dokumen B/L baru dengan tombol di atas.</p>
                  </td>
                </tr>
              ) : (
                filteredCargo.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition group">
                    {/* B/L & Container */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 font-mono">
                        {c.blNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>Box: {c.containerNumber}</span>
                        {c.hazardous && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                            DG HAZMAT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Shipper */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="font-semibold text-slate-800 truncate" title={c.shipperName}>
                        {c.shipperName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Voy: {c.voyageNumber}
                      </div>
                    </td>

                    {/* Consignee */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="font-semibold text-slate-800 truncate" title={c.consigneeName}>
                        {c.consigneeName}
                      </div>
                    </td>

                    {/* Commodity */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{c.commodityType}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.packageCount} {c.packageUnit}
                      </div>
                    </td>

                    {/* Gross Weight & Volume */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {c.grossWeightMt.toLocaleString('id-ID')} MT
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.volumeCbm > 0 ? `${c.volumeCbm} CBM` : '-'}
                      </div>
                    </td>

                    {/* Status & Customs */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          c.status === 'Loaded'
                            ? 'bg-blue-100 text-blue-800'
                            : c.status === 'In Transit'
                            ? 'bg-sky-100 text-sky-800'
                            : c.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Discharged'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[130px]" title={c.customsStatus}>
                        {c.customsStatus}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setBlPreviewCargo(c)}
                          title="Lihat / Cetak Bill of Lading"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          title="Ubah Data Kargo"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCargo(c)}
                          title="Hapus Manifes"
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
          <span>Menampilkan {filteredCargo.length} manifes kargo</span>
          <span className="font-medium text-slate-600">Database Persisten Server Terhubung</span>
        </div>
      </div>

      {/* CREATE / EDIT CARGO MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {formMode === 'create' ? 'Penerbitan Bill of Lading (B/L) Baru' : `Perbarui B/L: ${selectedCargo?.blNumber}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Catat pengirim, penerima, spesifikasi komoditas peti kemas, dan status kepabeanan.
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
                {/* B/L Number */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Bill of Lading (B/L) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.blNumber}
                    onChange={(e) => setFormData({ ...formData, blNumber: e.target.value.toUpperCase() })}
                    placeholder="BL-NSL-2026-00891"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.blNumber && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.blNumber}</p>
                  )}
                </div>

                {/* Container Number */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Peti Kemas (Container / Seal)
                  </label>
                  <input
                    type="text"
                    value={formData.containerNumber}
                    onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value.toUpperCase() })}
                    placeholder="SMLU-492104-8"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs uppercase focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Voyage Link */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pelayaran & Kapal Terkait
                  </label>
                  <select
                    value={formData.voyageId}
                    onChange={(e) => {
                      const v = voyages.find((x) => x.id === e.target.value);
                      setFormData({
                        ...formData,
                        voyageId: e.target.value,
                        voyageNumber: v?.voyageNumber || 'Umum',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="">-- Kargo Lepas / Belum Ditugaskan ke Pelayaran --</option>
                    {voyages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.voyageNumber} ({v.shipName} - {v.portOfLoading} → {v.portOfDischarge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shipper */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pengirim Barang (Shipper) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shipperName}
                    onChange={(e) => setFormData({ ...formData, shipperName: e.target.value })}
                    placeholder="PT Perusahaan Pengirim Tbk"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.shipperName && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.shipperName}</p>
                  )}
                </div>

                {/* Consignee */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Penerima Barang (Consignee) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.consigneeName}
                    onChange={(e) => setFormData({ ...formData, consigneeName: e.target.value })}
                    placeholder="PT Penerima Logistik Regional"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.consigneeName && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.consigneeName}</p>
                  )}
                </div>

                {/* Commodity */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Deskripsi Komoditas Barang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.commodityType}
                    onChange={(e) => setFormData({ ...formData, commodityType: e.target.value })}
                    placeholder="Contoh: Dry Container 40ft High Cube - Consumer Goods"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.commodityType && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.commodityType}</p>
                  )}
                </div>

                {/* Gross Weight */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Berat Kotor (Gross Weight - MT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.grossWeightMt}
                    onChange={(e) => setFormData({ ...formData, grossWeightMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.grossWeightMt && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.grossWeightMt}</p>
                  )}
                </div>

                {/* Volume */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Volume Muatan (CBM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.volumeCbm}
                    onChange={(e) => setFormData({ ...formData, volumeCbm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Package Count & Unit */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jumlah Kemasan (Packages)
                  </label>
                  <input
                    type="number"
                    value={formData.packageCount}
                    onChange={(e) => setFormData({ ...formData, packageCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Satuan Kemasan (Unit)
                  </label>
                  <input
                    type="text"
                    value={formData.packageUnit}
                    onChange={(e) => setFormData({ ...formData, packageUnit: e.target.value })}
                    placeholder="Contoh: Cartons, Pallets, Drums"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Kargo Saat Ini
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CargoStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="In Warehouse">Masuk Gudang / Depo (In Warehouse)</option>
                    <option value="Loaded">Telah Dimuat ke Kapal (Loaded)</option>
                    <option value="In Transit">Sedang Berlayar (In Transit)</option>
                    <option value="Discharged">Tiba di Pelabuhan Tujuan (Discharged)</option>
                    <option value="Delivered">Terkirim ke Penerima (Delivered)</option>
                  </select>
                </div>

                {/* Customs Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Kepabeanan (Customs)
                  </label>
                  <input
                    type="text"
                    value={formData.customsStatus}
                    onChange={(e) => setFormData({ ...formData, customsStatus: e.target.value })}
                    placeholder="Contoh: Clear (SPPB Released)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Hazardous checkbox */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hazardous"
                  checked={formData.hazardous}
                  onChange={(e) => setFormData({ ...formData, hazardous: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="hazardous" className="text-xs font-semibold text-amber-900 cursor-pointer">
                  Muatan Berbahaya (IMDG Dangerous Goods / Hazmat Classified)
                </label>
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
                  {submitting ? 'Menyimpan...' : formMode === 'create' ? 'Terbitkan B/L' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE BILL OF LADING MODAL */}
      {blPreviewCargo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Salinan Resmi Bill of Lading (B/L)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak B/L
                </button>
                <button
                  onClick={() => setBlPreviewCargo(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document sheet */}
            <div className="p-6 overflow-y-auto text-xs font-serif leading-relaxed text-slate-900 border border-slate-300 m-4 rounded-lg bg-amber-50/20">
              <div className="border-b-2 border-slate-900 pb-4 text-center font-sans">
                <h2 className="text-lg font-black tracking-widest uppercase">
                  PT JAVARA NUSANTARA TBK
                </h2>
                <p className="text-[10px] text-slate-600 tracking-normal font-medium">
                  Head Office: Javara Maritime Tower Lt. 18, Jl. Yos Sudarso, Tanjung Priok, Jakarta - INDONESIA
                </p>
                <h3 className="text-sm font-bold mt-2 tracking-wide uppercase underline">
                  OCEAN BILL OF LADING (SURAT MUATAN SAMUDERA)
                </h3>
                <p className="text-[11px] font-mono font-bold text-blue-900 mt-0.5">
                  B/L NO: {blPreviewCargo.blNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-400 py-3 font-sans text-[11px]">
                <div className="border-r border-slate-300 pr-3">
                  <span className="font-bold block uppercase text-[10px] text-slate-500">
                    SHIPPER / CONSIGNOR (PENGIRIM):
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">{blPreviewCargo.shipperName}</p>
                </div>
                <div>
                  <span className="font-bold block uppercase text-[10px] text-slate-500">
                    CONSIGNEE (PENERIMA):
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">{blPreviewCargo.consigneeName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-400 py-3 font-sans text-[11px]">
                <div className="border-r border-slate-300 pr-3">
                  <span className="font-bold block uppercase text-[10px] text-slate-500">
                    OCEAN VESSEL & VOYAGE NO:
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">{blPreviewCargo.voyageNumber}</p>
                </div>
                <div>
                  <span className="font-bold block uppercase text-[10px] text-slate-500">
                    CONTAINER NO / SEAL ID:
                  </span>
                  <p className="font-semibold font-mono text-slate-800 mt-0.5">{blPreviewCargo.containerNumber}</p>
                </div>
              </div>

              {/* Cargo Details */}
              <div className="py-3 font-sans text-[11px] border-b border-slate-400">
                <span className="font-bold block uppercase text-[10px] text-slate-500 mb-1">
                  PARTICULARS FURNISHED BY SHIPPER:
                </span>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="py-1">Marks & Numbers</th>
                      <th className="py-1">Description of Packages and Goods</th>
                      <th className="py-1 text-right">Gross Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 font-mono">{blPreviewCargo.containerNumber}</td>
                      <td className="py-2">
                        <div className="font-bold">{blPreviewCargo.commodityType}</div>
                        <div className="text-[10px] text-slate-500">
                          {blPreviewCargo.packageCount} {blPreviewCargo.packageUnit} ({blPreviewCargo.volumeCbm} CBM)
                        </div>
                        {blPreviewCargo.hazardous && (
                          <div className="text-rose-700 font-bold text-[10px] mt-0.5">
                            * IMO CLASSIFIED HAZARDOUS CARGO *
                          </div>
                        )}
                      </td>
                      <td className="py-2 text-right font-bold">
                        {blPreviewCargo.grossWeightMt.toLocaleString('id-ID')} MT
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legal Clauses & Signature */}
              <div className="pt-3 font-sans text-[10px] text-slate-500 space-y-2">
                <p>
                  Shipped in apparent good order and condition, unless otherwise stated herein, for transport subject to all terms and conditions on the front and back of this Bill of Lading and applicable maritime carrier conventions.
                </p>
                <div className="flex items-end justify-between pt-4">
                  <div>
                    <span className="block font-bold text-slate-700">Customs Clearance:</span>
                    <span>{blPreviewCargo.customsStatus}</span>
                  </div>
                  <div className="text-right">
                    <div className="w-36 border-b border-slate-700 mb-1"></div>
                    <span className="font-bold text-slate-800 block">FOR THE CARRIER</span>
                    <span className="text-[9px] text-slate-400">PT Javara Nusantara Tbk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmCargo && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">
              Hapus Dokumen B/L Kargo
            </h3>
            <p className="text-xs text-center text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus manifes kargo nomor <span className="font-bold text-slate-900">{deleteConfirmCargo.blNumber}</span> ({deleteConfirmCargo.shipperName})?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmCargo(null)}
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
                {submitting ? 'Menghapus...' : 'Ya, Hapus Manifes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
