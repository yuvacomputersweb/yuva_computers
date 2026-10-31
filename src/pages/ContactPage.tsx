import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Phone, MessageCircle, Mail, MapPin, Clock, AlertTriangle, Wrench, ShoppingCart, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitContactForm, submitComplaint, contentService } from "@/services/api";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { SITE, SOCIAL_LINKS } from "@/lib/site";
import { trackLead } from "@/lib/track";

const ICON_MAP: Record<string, any> = {
  wrench: Wrench,
  'shopping-cart': ShoppingCart,
  'message-square': MessageSquare,
  phone: Phone,
  mail: Mail,
};

const issueTypes = ["Technical Assistance", "Order Inquiry", "Warranty Claim", "Return Request", "Bulk Order", "Other"];
const complaintTypes = ["Product Quality", "Delivery Issue", "Wrong Item Received", "Refund Not Processed", "Warranty Claim Rejected", "Other"];

const sanitizePhone = (raw: string) => raw.replace(/\D/g, "").slice(0, 10);
const isPhoneValid = (val: string) => val.length === 10;

const PhoneInput = ({ value, onChange, error, bgClass = "bg-card" }: {
  value: string; onChange: (v: string) => void; error: string; bgClass?: string;
}) => (
  <div>
    <div className="flex mt-1.5">
      <span className={`${bgClass} rounded-l-xl px-3 h-11 text-sm text-muted-foreground border border-r-0 border-border select-none flex items-center`}>+91</span>
      <input
        value={value}
        onChange={e => onChange(sanitizePhone(e.target.value))}
        placeholder="00000 00000"
        maxLength={10}
        inputMode="numeric"
        className="flex-1 min-w-0 bg-background border border-border rounded-r-xl px-3 h-11 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
      />
    </div>
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

const DEFAULT_CONTENT = {
  hero_heading: "We're Here to Help.",
  hero_subtext: "Whether you're troubleshooting a workstation or planning a bulk deployment, our experts are ready.",
  whatsapp_number: "919709888456",
  email_support: "info@yuvacomputers.in",
  email_response_time: "Response within 2 working days.",
  grievance_officer_name: "Rajender Kumar",
  grievance_officer_email: "grievance@yuvacomputers.com",
  branch_name: "Dilshuknagar Main Branch",
  branch_address: "Metro Pillar No. 1519, Sai Towers, 204, 2nd Floor, above Tipsy Topsy Bakery, Dilsukhnagar, Hyderabad, TS 500060",
  branch_hours: "Daily: 10:00 AM - 08:30 PM",
  branch_maps_url: "https://maps.app.goo.gl/ChIJ3UKGZBCayzsRR8Nw_iIbU8g",
  branch_maps_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3808.0435987163013!2d78.5204646757657!3d17.373673403525235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9ad0648642dd%3A0xd8535b22fe70c347!2sYuva%20Computers%20-%20Dilshuknagar!5e0!3m2!1sen!2sin!4v1715712431642!5m2!1sen!2sin",
};

const DEFAULT_DEPARTMENTS = [
  { label: "For Service", number: "+91 9347145456", icon: "wrench" },
  { label: "For Sales", number: "+91 9709888456", icon: "shopping-cart" },
  { label: "For Complaints or Feedback", number: "+91 9030539456", icon: "message-square" },
];

const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"message" | "complaint">(searchParams.get("type") === "complaint" ? "complaint" : "message");
  const [pageContent, setPageContent] = useState<any>(DEFAULT_CONTENT);
  const [departments, setDepartments] = useState<any[]>(DEFAULT_DEPARTMENTS);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", orderId: "",
    issueType: "Technical Assistance", issueTypeOther: "", message: "",
  });
  const [formPhoneError, setFormPhoneError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [complaint, setComplaint] = useState({
    name: "", orderId: "", issueType: "Product Quality", issueTypeOther: "",
    description: "", email: "", phone: "",
  });
  const [complaintPhoneError, setComplaintPhoneError] = useState("");
  const [complaintLoading, setComplaintLoading] = useState(false);

  useEffect(() => {
    contentService.getContactContent()
      .then(data => {
        if (data.content) setPageContent(data.content);
        if (data.departments?.length > 0) setDepartments(data.departments);
      })
      .catch(console.error);
  }, []);

  const setF = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const setC = (k: keyof typeof complaint, v: string) => setComplaint(p => ({ ...p, [k]: v }));

  const handleContactSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.message) {
      toast.error("Please fill in all required fields."); return;
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      toast.error("Enter a valid email address."); return;
    }
    if (!isPhoneValid(form.phone)) { toast.error("Enter a valid 10-digit phone number."); return; }
    if (form.issueType === "Other" && !form.issueTypeOther.trim()) {
      toast.error("Please specify your issue type."); return;
    }
    setFormLoading(true);
    try {
      const res = await submitContactForm({
        name: form.name, email: form.email, phone: form.phone,
        order_id: form.orderId,
        issue_type: form.issueType === "Other" ? form.issueTypeOther : form.issueType,
        message: form.message,
      });
      toast.success(res.data.detail);
      trackLead("contact_form");
      setForm({ name: "", email: "", phone: "", orderId: "", issueType: "Technical Assistance", issueTypeOther: "", message: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally { setFormLoading(false); }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.name || !complaint.orderId || !complaint.email || !complaint.phone || !complaint.description) {
      toast.error("Please fill in all required fields."); return;
    }
    if (!isPhoneValid(complaint.phone)) { toast.error("Enter a valid 10-digit phone number."); return; }
    if (complaint.issueType === "Other" && !complaint.issueTypeOther.trim()) {
      toast.error("Please specify your complaint type."); return;
    }
    setComplaintLoading(true);
    try {
      const res = await submitComplaint({
        name: complaint.name, order_id: complaint.orderId,
        issue_type: complaint.issueType === "Other" ? complaint.issueTypeOther : complaint.issueType,
        email: complaint.email, phone: complaint.phone, description: complaint.description,
      });
      toast.success(res.data.detail);
      setComplaint({ name: "", orderId: "", issueType: "Product Quality", issueTypeOther: "", description: "", email: "", phone: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally { setComplaintLoading(false); }
  };

  const c = pageContent;
  const inputCls = "w-full mt-1.5 bg-background border border-border rounded-xl px-4 h-11 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10";
  const surfaceInputCls = inputCls;
  const labelCls = "text-sm font-medium text-foreground";
  const textareaCls = `${inputCls} h-auto py-3 resize-none`;

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Yuva Computers - Dilshuknagar Main Branch",
    "image": "https://www.yuvacomputers.in/favicon-32x32.png",
    "telephone": "+919709888456",
    "email": c.email_support,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Metro Pillar No. 1519, Sai Towers, 204, 2nd Floor, Dilsukhnagar",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "postalCode": "500060",
      "addressCountry": "IN"
    },
    "url": "https://www.yuvacomputers.in/contact"
  };

  return (
    <>
      <SEO
        title="Contact Us & Customer Support | Yuva Computers"
        description="Get technical support, sales assistance, or visit Yuva Computers Dilshuknagar branch. Phone, WhatsApp, and service desk contact information."
        canonical="/contact"
        jsonLd={contactSchema}
      />

      <PageHero
        eyebrow="Contact & support"
        title={c.hero_heading}
        text={c.hero_subtext}
        crumbs={[{ label: "Contact" }]}
      />

      {/* Quick contacts */}
      <section className="relative -mt-8 md:-mt-10 z-10">
        <div className="container mx-auto px-4 md:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {departments.map((dept: any) => {
            const Icon = ICON_MAP[dept.icon] || Phone;
            return (
              <a
                key={dept.label}
                href={`tel:${dept.number.replace(/\s/g, "")}`}
                className="rounded-2xl bg-card border border-border shadow-lg shadow-black/[0.04] p-5 hover:border-primary/30 transition-colors"
              >
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="w-5 h-5" /></span>
                <p className="mt-3 text-sm text-muted-foreground">{dept.label}</p>
                <p className="font-display font-bold text-lg">{dept.number}</p>
              </a>
            );
          })}
          <a
            href={`https://wa.me/${c.whatsapp_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-brand-leaf text-white shadow-lg shadow-brand-leaf/20 p-5 hover:brightness-110 transition"
          >
            <span className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center"><MessageCircle className="w-5 h-5" /></span>
            <p className="mt-3 text-sm text-white/80">Fastest reply</p>
            <p className="font-display font-bold text-lg">Chat on WhatsApp →</p>
          </a>
        </div>
      </section>

      {/* Forms + info */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-14 items-start">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <div role="tablist" className="inline-flex p-1 rounded-full bg-muted mb-8">
              {([
                ["message", "Send a message", "Message"],
                ["complaint", "Register a complaint", "Complaint"],
              ] as const).map(([key, label, short]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`h-10 px-4 sm:px-5 rounded-full text-sm font-semibold transition-colors ${tab === key ? "bg-brand-navy text-white" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{short}</span>
                </button>
              ))}
            </div>

            {tab === "message" ? (
              <div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Your name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email address</label>
                    <input type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="you@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone number</label>
                    <PhoneInput
                      value={form.phone}
                      onChange={v => { setF("phone", v); setFormPhoneError(v.length > 0 && !isPhoneValid(v) ? "Enter a valid 10-digit number." : ""); }}
                      error={formPhoneError}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Order ID <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <input value={form.orderId} onChange={e => setF("orderId", e.target.value)} placeholder="#YUVA-0000" className={inputCls} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={labelCls}>What can we help with?</label>
                  <select value={form.issueType} onChange={e => setF("issueType", e.target.value)} className={inputCls}>
                    {issueTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {form.issueType === "Other" && (
                  <div className="mt-4">
                    <label className={labelCls}>Specify issue</label>
                    <input value={form.issueTypeOther} onChange={e => setF("issueTypeOther", e.target.value)} placeholder="Briefly describe your issue..." className={inputCls} autoFocus />
                  </div>
                )}

                <div className="mt-4">
                  <label className={labelCls}>Message</label>
                  <textarea value={form.message} onChange={e => setF("message", e.target.value)} rows={4} placeholder="Tell us what you need…" className={textareaCls} />
                </div>
                <button
                  onClick={handleContactSubmit}
                  disabled={formLoading}
                  className="w-full mt-6 bg-brand-navy text-white h-12 rounded-full font-semibold hover:bg-brand-navy-soft transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <p className="flex items-start gap-2 text-sm text-muted-foreground rounded-xl bg-muted/70 p-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  We take every concern seriously. Include your order ID so we can resolve it quickly.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full name *</label>
                    <input required value={complaint.name} onChange={e => setC("name", e.target.value)} placeholder="Your name" className={surfaceInputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Order ID *</label>
                    <input required value={complaint.orderId} onChange={e => setC("orderId", e.target.value)} placeholder="#YUVA-0000" className={surfaceInputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Issue type *</label>
                  <select required value={complaint.issueType} onChange={e => setC("issueType", e.target.value)} className={surfaceInputCls}>
                    {complaintTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {complaint.issueType === "Other" && (
                  <div>
                    <label className={labelCls}>Specify issue *</label>
                    <input value={complaint.issueTypeOther} onChange={e => setC("issueTypeOther", e.target.value)} placeholder="Describe the type of issue..." className={surfaceInputCls} autoFocus />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input required type="email" value={complaint.email} onChange={e => setC("email", e.target.value)} placeholder="you@example.com" className={surfaceInputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone *</label>
                    <PhoneInput
                      value={complaint.phone}
                      onChange={v => { setC("phone", v); setComplaintPhoneError(v.length > 0 && !isPhoneValid(v) ? "Enter a valid 10-digit number." : ""); }}
                      error={complaintPhoneError}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description *</label>
                  <textarea required value={complaint.description} onChange={e => setC("description", e.target.value)} rows={5} placeholder="Please describe the issue in detail..." className={textareaCls} />
                </div>

                <button
                  type="submit"
                  disabled={complaintLoading}
                  className="w-full bg-brand-navy text-white h-12 rounded-full font-semibold hover:bg-brand-navy-soft transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {complaintLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit complaint"}
                </button>
              </form>
            )}
          </div>

          {/* Info column */}
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden border border-border bg-card">
              <div className="aspect-[4/3] bg-muted">
                {c.branch_maps_embed && (
                  <iframe
                    src={c.branch_maps_embed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Yuva Computers head office location"
                  />
                )}
              </div>
              <div className="p-6 space-y-3">
                <h2 className="font-display font-bold text-xl">{c.branch_name}</h2>
                <p className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-brand-leaf-dark mt-0.5 shrink-0" /> {c.branch_address}
                </p>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-brand-leaf-dark shrink-0" /> {c.branch_hours}
                </p>
                <a
                  href={c.branch_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center h-10 px-5 rounded-full bg-brand-navy text-white text-sm font-semibold"
                >
                  Get directions
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email support</h3>
              <a href={`mailto:${c.email_support}`} className="mt-1 block font-semibold text-primary">{c.email_support}</a>
              <p className="text-sm text-muted-foreground">{c.email_response_time}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SOCIAL_LINKS.map(({ label, handle, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="h-9 px-3.5 inline-flex items-center rounded-full bg-muted text-xs font-semibold hover:bg-muted/70">
                    {label} {handle.startsWith("@") ? handle : ""}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-muted/70 p-6 text-sm">
              <h3 className="font-display font-bold text-foreground">Grievance redressal</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                In accordance with the Information Technology Act, escalated concerns can be sent to our grievance officer.
              </p>
              <p className="mt-3"><span className="text-muted-foreground">Officer:</span> <strong>{c.grievance_officer_name}</strong></p>
              <p><span className="text-muted-foreground">Email:</span> <strong>{c.grievance_officer_email}</strong></p>
              <p className="mt-3 text-muted-foreground">GSTIN: <span className="font-mono text-foreground">{SITE.gstin}</span></p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;