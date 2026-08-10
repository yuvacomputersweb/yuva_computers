import React, { useState, useEffect } from "react";
import { Truck, Settings, Shield, CheckCircle, Loader2, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { submitBulkOrder, contentService } from "@/services/api";
import { SEO } from "@/components/SEO";

const ICON_MAP: Record<string, any> = {
  truck: Truck, settings: Settings, shield: Shield,
  check: CheckCircle, star: Star, zap: Zap,
};

const DEFAULT_BENEFITS = [
  { title: "Dedicated Account Manager", description: "Personalized support tailored to your procurement cycle.", icon: "truck" },
  { title: "Custom Configurations", description: "Upgrade RAM, storage, or software pre-installs to meet specific needs.", icon: "settings" },
  { title: "Extended Warranty Options", description: "Enterprise-grade warranty extensions and priority repair services.", icon: "shield" },
];

const DEFAULT_INVENTORY = [
  { device_type: "Workstation Laptops", units_available: "500+ Units" },
  { device_type: "Compact Mini PCs", units_available: "200+ Units" },
  { device_type: "Enterprise Desktops", units_available: "150+ Units" },
];

const DEVICE_TYPES = ["Laptops", "Desktops", "Mini PCs", "Monitors", "Other"];

const sanitizePhone = (raw: string) => raw.replace(/\D/g, "").slice(0, 10);
const isPhoneValid = (val: string) => val.length === 10;

type FormState = {
  name: string; company: string; email: string; phone: string;
  deviceType: string; deviceTypeOther: string; quantity: string; requirements: string;
};

const BulkOrdersPage = () => {
  const [form, setForm] = useState<FormState>({
    name: "", company: "", email: "", phone: "",
    deviceType: "Laptops", deviceTypeOther: "", quantity: "", requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [pageContent, setPageContent] = useState<any>(null);

  const [scalePoints, setScalePoints] = useState<string[]>([
    "Priority PAN-India Logistics",
    "Bulk Discount Pricing Tiers",
    "Full GST Compliance Support",
  ]);

  useEffect(() => {
    contentService.getBulkOrderContent()
      .then(data => {
        setPageContent(data);
        if (data.scale_points?.length > 0) {
          setScalePoints(data.scale_points.map((p: any) => p.text));
        }
      })
      .catch(console.error);
  }, []);

  const c = pageContent?.content || {};
  const benefits = pageContent?.benefits?.length > 0 ? pageContent.benefits : DEFAULT_BENEFITS;
  const inventory = pageContent?.inventory?.length > 0 ? pageContent.inventory : DEFAULT_INVENTORY;

  const heroTitle = c.hero_title || "Equip Your Workspace.";
  const heroHighlight = c.hero_title_highlight || "Smartly.";
  const heroSubtitle = c.hero_subtitle || "Transform your team's productivity with certified refurbished devices.";
  const heroImage = c.hero_image || null;
  const sectionHeading = c.section_heading || "Scale Your Infrastructure Without Compromise.";
  const sectionText = c.section_text || "Our enterprise team will build a custom quote within 2 working days.";
  const inventoryImage = c.inventory_image || null;
  const inventoryHeading = c.inventory_heading || "Ready for Deployment.";
  const inventoryText = c.inventory_text || "We maintain ready stock so your new hires start on day one.";

  const set = (key: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handlePhone = (raw: string) => {
    const digits = sanitizePhone(raw);
    set("phone", digits);
    setPhoneError(digits.length > 0 && !isPhoneValid(digits) ? "Enter a valid 10-digit number." : "");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.company || !form.email || !form.phone || !form.quantity) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!form.email.includes("@")) { toast.error("Enter a valid email."); return; }
    if (!isPhoneValid(form.phone)) { toast.error("Enter a valid 10-digit phone number."); return; }
    if (form.deviceType === "Other" && !form.deviceTypeOther.trim()) {
      toast.error("Please specify the device type."); return;
    }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 5) { toast.error("Minimum order quantity is 5 units."); return; }

    setLoading(true);
    try {
      const res = await submitBulkOrder({
        name: form.name, company: form.company, email: form.email, phone: form.phone,
        device_type: form.deviceType === "Other" ? form.deviceTypeOther : form.deviceType,
        quantity: qty, requirements: form.requirements,
      });
      toast.success(res.data.detail);
      setForm({ name: "", company: "", email: "", phone: "", deviceType: "Laptops", deviceTypeOther: "", quantity: "", requirements: "" });
    } catch (err: any) {
      const errors = err?.response?.data;
      if (errors && typeof errors === "object") {
        const firstKey = Object.keys(errors)[0];
        toast.error(errors[firstKey]?.[0] || "Invalid input");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full mt-1.5 bg-input rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-body";
  const labelCls = "text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider";

  return (
    <>
      <SEO
        title="Corporate Bulk Orders & Enterprise IT | Yuva Computers"
        description="Equip your office with refurbished workstations, mini PCs, and desktops. Get custom corporate pricing, GST invoices, and dedicated support."
        canonical="/bulk-orders"
      />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[400px]">
        {heroImage ? (
          <img src={heroImage} alt="Enterprise workspace" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-foreground" />
        )}
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <span className="text-xs font-display font-semibold text-primary-foreground/60 uppercase tracking-[0.2em]">
            Yuva Computers for Business
          </span>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-primary-foreground mt-4 leading-tight tracking-tight max-w-lg">
            {heroTitle} <span className="text-primary">{heroHighlight}</span>
          </h1>
          <p className="text-primary-foreground/70 mt-4 max-w-md">{heroSubtitle}</p>
          <div className="mt-8 flex gap-4 flex-wrap">
            <a href="#quote-form" className="gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-display font-semibold text-sm">
              Request a Quote
            </a>
            <a href="#inventory" className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 px-6 py-3 rounded-lg font-display font-semibold text-sm backdrop-blur-sm">
              View Catalogue
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b: any) => {
              const Icon = ICON_MAP[b.icon] || CheckCircle;
              return (
                <div key={b.title} className="text-left">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg">{b.title}</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote-form" className="py-16 lg:py-24 bg-surface-low">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-display font-extrabold text-3xl text-foreground tracking-tight">
                {sectionHeading}
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{sectionText}</p>
              <ul className="mt-6 space-y-3">
                {scalePoints.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-success" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-ambient">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Company Name</label>
                  <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company Ltd." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Work Email</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <div className="flex mt-1.5">
                    <span className="bg-input rounded-l-lg px-3 py-2.5 text-sm text-muted-foreground border-r border-border/40 flex items-center select-none">+91</span>
                    <input
                      value={form.phone} onChange={(e) => handlePhone(e.target.value)}
                      placeholder="00000 00000" maxLength={10} inputMode="numeric"
                      className="flex-1 bg-input rounded-r-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
                </div>

                <div className={form.deviceType === "Other" ? "col-span-2" : ""}>
                  <label className={labelCls}>Device Type</label>
                  <select value={form.deviceType} onChange={(e) => set("deviceType", e.target.value)} className={inputCls}>
                    {DEVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {form.deviceType === "Other" && (
                  <div className="col-span-2">
                    <label className={labelCls}>Specify Device Type</label>
                    <input value={form.deviceTypeOther} onChange={(e) => set("deviceTypeOther", e.target.value)} placeholder="e.g. All-in-One PCs" className={inputCls} autoFocus />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Quantity</label>
                  <input value={form.quantity} onChange={(e) => set("quantity", e.target.value.replace(/\D/g, ""))} placeholder="Min. 5 units" inputMode="numeric" className={inputCls} />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelCls}>Specific Requirements</label>
                <textarea value={form.requirements} onChange={(e) => set("requirements", e.target.value)} rows={3} placeholder="E.g., MacBook Air M2 16GB RAM..." className={`${inputCls} resize-none`} />
              </div>

              <button
                onClick={handleSubmit} disabled={loading}
                className="w-full mt-6 gradient-primary text-primary-foreground py-3.5 rounded-lg font-display font-bold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Request Custom Quote ▸"}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                100% TAX COMPLIANT · PAN-INDIA DELIVERY · SLA GUARANTEED
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section id="inventory" className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="rounded-xl overflow-hidden aspect-[4/3] shadow-ambient bg-surface-low">
              {inventoryImage ? (
                <img src={inventoryImage} alt="Inventory" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  Inventory Image
                </div>
              )}
            </div>
            <div>
              <span className="text-xs font-display font-semibold text-primary uppercase tracking-[0.2em]">
                Inventory Focus
              </span>
              <h2 className="font-display font-extrabold text-3xl text-foreground tracking-tight mt-2">
                {inventoryHeading}
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{inventoryText}</p>
              <div className="mt-6 space-y-3">
                {inventory.map((item: any) => (
                  <div key={item.device_type} className="flex justify-between items-center bg-card rounded-lg p-4 shadow-ambient">
                    <span className="text-sm font-display font-semibold text-foreground">{item.device_type}</span>
                    <span className="text-sm font-display font-bold text-primary">{item.units_available}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BulkOrdersPage;