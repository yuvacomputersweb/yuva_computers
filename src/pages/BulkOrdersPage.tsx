import React, { useState, useEffect } from "react";
import { Truck, Settings, Shield, CheckCircle, Loader2, Star, Zap, FileText, Repeat, Phone, MessageCircle, GraduationCap, Building2, Rocket, Headset } from "lucide-react";
import { toast } from "sonner";
import { submitBulkOrder, contentService } from "@/services/api";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { SITE, whatsappLink } from "@/lib/site";

const ICON_MAP: Record<string, any> = {
  truck: Truck, settings: Settings, shield: Shield,
  check: CheckCircle, star: Star, zap: Zap, file: FileText, repeat: Repeat,
};

// Defaults only describe services listed in the site FAQ.
const DEFAULT_BENEFITS = [
  { title: "Volume pricing", description: "Better per-unit prices for teams, labs and offices ordering five or more devices.", icon: "star" },
  { title: "RAM & SSD upgrades", description: "Tell us the configuration you need and we upgrade machines before delivery.", icon: "settings" },
  { title: "GST invoice", description: "Share your GSTIN and registered business name and we bill your company directly.", icon: "file" },
  { title: "Corporate rentals", description: "Need laptops for a project or a batch? Ask about our laptop rental plans.", icon: "repeat" },
];

const DEFAULT_SCALE_POINTS = [
  "Quote within 2 working days",
  "Every unit 50-point quality checked",
  "Delivery, or pickup from any Yuva branch",
];

const CUSTOMERS = [
  { icon: Rocket, label: "Startups" },
  { icon: GraduationCap, label: "Training institutes" },
  { icon: Headset, label: "BPOs & call centres" },
  { icon: Building2, label: "Enterprises" },
];

// Ignore half-filled CMS entries (e.g. "good" / "good") so the page never shows placeholders.
const isRealBenefit = (b: any) => b?.title?.trim().length > 3 && b?.description?.trim().length > 15;

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

  const [scalePoints, setScalePoints] = useState<string[]>(DEFAULT_SCALE_POINTS);

  useEffect(() => {
    contentService.getBulkOrderContent()
      .then(data => {
        setPageContent(data);
        const points = (data.scale_points || []).map((p: any) => p.text).filter((t: string) => t?.trim().length > 8);
        if (points.length > 0) setScalePoints(points);
      })
      .catch(console.error);
  }, []);

  const c = pageContent?.content || {};
  const cmsBenefits = (pageContent?.benefits || []).filter(isRealBenefit);
  const benefits = cmsBenefits.length > 0 ? cmsBenefits : DEFAULT_BENEFITS;
  const inventory: any[] = pageContent?.inventory || [];

  const heroTitle = c.hero_title || "Equip Your Workspace.";
  const heroHighlight = c.hero_title_highlight || "Smartly.";
  const heroSubtitle = c.hero_subtitle || "Transform your team's productivity with certified refurbished devices.";
  const heroImage = c.hero_image || undefined;
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

  const inputCls = "w-full mt-1.5 bg-background border border-border rounded-xl px-4 h-11 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10";
  const labelCls = "text-sm font-medium text-foreground";

  return (
    <>
      <SEO
        title="Corporate Bulk Orders & Enterprise IT | Yuva Computers"
        description="Equip your office with refurbished workstations, mini PCs, and desktops. Get custom corporate pricing, GST invoices, and dedicated support."
        canonical="/bulk-orders"
      />

      <PageHero
        eyebrow="Yuva Computers for Business"
        title={<>{heroTitle} <span className="text-brand-leaf">{heroHighlight}</span></>}
        text={heroSubtitle}
        image={heroImage}
        crumbs={[{ label: "Bulk orders" }]}
      >
        <div className="flex gap-3 flex-wrap">
          <a href="#quote-form" className="inline-flex items-center h-12 px-6 rounded-full bg-brand-leaf text-white font-semibold hover:brightness-110">
            Request a quote
          </a>
          <a href={`tel:+91${SITE.phone}`} className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/25 font-semibold hover:bg-white/10">
            <Phone className="w-4 h-4" /> {SITE.phoneDisplay}
          </a>
        </div>
      </PageHero>

      {/* Who we serve */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <span className="text-muted-foreground font-medium">Trusted by</span>
          {CUSTOMERS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-2 font-semibold">
              <Icon className="w-4 h-4 text-brand-leaf-dark" /> {label}
            </span>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b: any) => {
              const Icon = ICON_MAP[b.icon] || CheckCircle;
              return (
                <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="w-11 h-11 bg-brand-leaf/15 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-brand-leaf-dark" />
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
      <section id="quote-form" className="py-14 md:py-20 bg-muted/60 scroll-mt-40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf-dark mb-3">Get a quote</p>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground tracking-tight">
                {sectionHeading}
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{sectionText}</p>
              <ul className="mt-6 space-y-3">
                {scalePoints.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-brand-leaf-dark" /> {item}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink("Hi Yuva Computers, I'd like a bulk quote for ")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border bg-card text-sm font-semibold hover:border-foreground/40"
              >
                <MessageCircle className="w-4 h-4 text-brand-leaf-dark" /> Prefer WhatsApp? Message us
              </a>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl shadow-black/[0.03]">
              <div className="grid sm:grid-cols-2 gap-4">
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
                    <span className="bg-muted rounded-l-xl px-3 h-11 text-sm text-muted-foreground border border-r-0 border-border flex items-center select-none">+91</span>
                    <input
                      value={form.phone} onChange={(e) => handlePhone(e.target.value)}
                      placeholder="00000 00000" maxLength={10} inputMode="numeric"
                      className="flex-1 min-w-0 bg-background border border-border rounded-r-xl px-3 h-11 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                  {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
                </div>

                <div className={form.deviceType === "Other" ? "sm:col-span-2" : ""}>
                  <label className={labelCls}>Device Type</label>
                  <select value={form.deviceType} onChange={(e) => set("deviceType", e.target.value)} className={inputCls}>
                    {DEVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {form.deviceType === "Other" && (
                  <div className="sm:col-span-2">
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
                <textarea value={form.requirements} onChange={(e) => set("requirements", e.target.value)} rows={3} placeholder="E.g., MacBook Air M2 16GB RAM..." className={`${inputCls} h-auto py-3 resize-none`} />
              </div>

              <button
                onClick={handleSubmit} disabled={loading}
                className="w-full mt-6 bg-brand-navy text-white h-12 rounded-full font-semibold hover:bg-brand-navy-soft disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Request my quote"}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Minimum 5 units · We reply within 2 working days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory — shown only when the admin lists ready stock */}
      {inventory.length > 0 && (
        <section id="inventory" className="py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {inventoryImage && (
                <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-muted">
                  <img src={inventoryImage} alt="Ready stock" className="w-full h-full object-cover" />
                </div>
              )}
              <div className={inventoryImage ? "" : "lg:col-span-2 max-w-3xl"}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf-dark mb-3">Ready stock</p>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground tracking-tight">{inventoryHeading}</h2>
                <p className="text-muted-foreground mt-4 leading-relaxed">{inventoryText}</p>
                <div className="mt-6 space-y-3">
                  {inventory.map((item: any) => (
                    <div key={item.device_type} className="flex justify-between items-center rounded-2xl border border-border p-4">
                      <span className="text-sm font-semibold">{item.device_type}</span>
                      <span className="text-sm font-bold text-brand-leaf-dark">{item.units_available}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default BulkOrdersPage;