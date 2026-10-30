import { useState, useEffect } from "react";
import { authService } from "@/services/api";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Star, Edit2, Check } from "lucide-react";

interface Address {
  id: number;
  label: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  landmark: string;
  is_default: boolean;
}

const emptyForm = {
  label: 'Home',
  first_name: '',
  last_name: '',
  address: '',
  apartment: '',
  city: '',
  state: 'Telangana',
  zip_code: '',
  country: 'India',
  phone: '',
  landmark: '',
};

interface Props {
  /** If provided, renders in "select" mode for checkout */
  onSelect?: (addr: Address) => void;
  /** The currently selected address id (checkout mode) */
  selectedId?: number | null;
}

export default function AddressManager({ onSelect, selectedId }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const isCheckoutMode = !!onSelect;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await authService.getSavedAddresses();
      const list: Address[] = Array.isArray(data) ? data : data.results || [];
      setAddresses(list);
      // Auto-select default in checkout mode
      if (onSelect) {
        const def = list.find(a => a.is_default) || list[0];
        if (def) onSelect(def);
      }
    } catch { setAddresses([]); }
    finally { setLoading(false); }
  };
  useEffect(() => {
  if (!onSelect) return;
  if (addresses.length === 0) return;

  const defaultAddr = addresses.find(a => a.is_default) || addresses[0];

   // optional (if you track it locally)
  onSelect(defaultAddr);
}, [addresses]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      label: addr.label,
      first_name: addr.first_name,
      last_name: addr.last_name,
      address: addr.address,
      apartment: addr.apartment,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zip_code,
      country: addr.country,
      phone: addr.phone,
      landmark: addr.landmark,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.address || !form.city || !form.zip_code || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = editing ? { ...form, id: editing.id } : form;
      await authService.saveAddress(payload);
      await load();
      setShowForm(false);
      toast.success(editing ? 'Address updated!' : 'Address saved!');
    } catch (err: any) {
      toast.error(err?.non_field_errors?.[0] || 'Failed to save address');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
  // REMOVE: if (!confirm('Delete this address?')) return;
  
  // OPTION A: Delete immediately
  try {
    await authService.deleteAddress(id);
    await load();
    toast.success('Address removed');
  } catch { 
    toast.error('Failed to delete'); 
  }
};
  const handleSetDefault = async (id: number) => {
    try {
      await authService.setDefaultAddress(id);
      await load();
      toast.success('Default address updated');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground py-4">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-foreground">
          {isCheckoutMode ? 'Shipping Address' : 'Saved Addresses'}
        </h3>
        {addresses.length < 3 && !showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {/* Address Cards */}
      {addresses.length === 0 && !showForm && (
  <div className="text-center py-6 space-y-3">
    <MapPin className="w-6 h-6 mx-auto text-muted-foreground" />

    <p className="text-sm text-muted-foreground">
      No saved address found
    </p>

    <p className="text-xs text-muted-foreground">
      Please add a shipping address to continue checkout
    </p>

    <button
      onClick={openNew}
      className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
    >
      Add Shipping Address
    </button>
  </div>
)}
      <div className="space-y-3">
        {addresses.map((addr) => {
          const isSelected = isCheckoutMode
            ? selectedId === addr.id
            : addr.is_default;

          return (
            <div
              key={addr.id}
              onClick={() => isCheckoutMode && onSelect(addr)}
              className={`relative border rounded-xl p-4 transition-all ${
                isCheckoutMode ? 'cursor-pointer' : ''
              } ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-border'
              }`}
            >
              {/* Selection indicator (checkout mode) */}
              {isCheckoutMode && (
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              )}

              {/* Default badge (profile mode) */}
              {!isCheckoutMode && addr.is_default && (
                <span className="absolute top-3 right-3 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Default
                </span>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {addr.label}
                  </p>
                  <p className="font-semibold text-sm text-foreground">
                    {addr.first_name} {addr.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {addr.address}
                    {addr.apartment ? `, ${addr.apartment}` : ''}
                  </p>
                  {addr.landmark && (
                    <p className="text-xs text-muted-foreground">Near: {addr.landmark}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {addr.city}, {addr.state} — {addr.zip_code}
                  </p>
                  <p className="text-sm text-muted-foreground">📞 {addr.phone}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-3 pl-7">
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(addr); }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      // Logic: If user clicks once, show "Confirm?". If clicked again, delete.
                      if (deletingId === addr.id) {
                          handleDelete(addr.id);
                          setDeletingId(null);
                      } else {
                          setDeletingId(addr.id);
                          // Optional: auto-reset after 3 seconds
                          setTimeout(() => setDeletingId(null), 3000);
                      }
                    }}
                    className={`flex items-center gap-1 text-xs font-medium hover:underline ${
                      deletingId === addr.id ? 'text-destructive font-bold' : 'text-destructive'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" /> 
                    {deletingId === addr.id ? 'Confirm?' : 'Delete'}
                  </button>
                {!addr.is_default && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:underline font-medium"
                  >
                    <Star className="w-3 h-3" /> Set Default
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="border border-border rounded-xl p-5 space-y-4 bg-muted/20">
          <h4 className="font-semibold text-sm text-foreground">
            {editing ? 'Edit Address' : 'New Address'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                Label
              </label>
              <select
                value={form.label}
                onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Home</option>
                <option>Office</option>
                <option>Other</option>
              </select>
            </div>

            {[
              { key: 'first_name', label: 'First Name *' },
              { key: 'last_name', label: 'Last Name' },
              { key: 'phone', label: 'Phone *' },
              { key: 'address', label: 'Street Address *', full: true },
              { key: 'apartment', label: 'Apartment / Floor' },
              { key: 'landmark', label: 'Landmark' },
              { key: 'city', label: 'City *' },
              { key: 'state', label: 'State *' },
              { key: 'zip_code', label: 'ZIP Code *' },
              { key: 'country', label: 'Country' },
            ].map(({ key, label, full }) => (
              <div key={key} className={full ? 'sm:col-span-2' : ''}>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-navy text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-60 transition"
            >
              {saving ? 'Saving...' : editing ? 'Update Address' : 'Save Address'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm text-muted-foreground border border-border hover:bg-muted transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}