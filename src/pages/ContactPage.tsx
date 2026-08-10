import { useState, useEffect } from "react";
import { Phone, MessageCircle, Mail, MapPin, Clock, AlertTriangle, Wrench, ShoppingCart, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitContactForm, submitComplaint, contentService } from "@/services/api";
import { SEO } from "@/components/SEO";

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
      <span className={`${bgClass} rounded-l-lg px-3 py-2.5 text-sm text-muted-foreground border-r border-border/40 font-body select-none flex items-center`}>+91</span>
      <input
        value={value}
        onChange={e => onChange(sanitizePhone(e.target.value))}
        placeholder="00000 00000"
        maxLength={10}
        inputMode="numeric"
        className={`flex-1 ${bgClass} rounded-r-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-body`}
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
  const inputCls = "w-full mt-1.5 bg-card rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-body";
  const surfaceInputCls = "w-full mt-1.5 bg-surface-low rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-body";
  const labelCls = "text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider";

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

      {/* Hero */}
      <section className="py-16 lg:py-24 bg-surface-low">
        <div className="container mx-auto px-6">
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-foreground tracking-tight max-w-lg">
            {c.hero_heading}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg">{c.hero_subtext}</p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Left: contact info */}
            <div className="space-y-8">
              <div className="space-y-5">
                {departments.map((dept: any) => {
                  const Icon = ICON_MAP[dept.icon] || Phone;
                  return (
                    <div key={dept.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground">{dept.label}</h3>
                        <a
                          href={`tel:${dept.number.replace(/\s/g, "")}`}
                          className="text-primary font-display font-semibold text-lg mt-0.5 block"
                        >
                          {dept.number}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-success-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">Instant technical guidance.</p>
                  <a
                    href={`https://wa.me/${c.whatsapp_number}`}
                    className="text-primary font-display font-semibold text-sm mt-1 inline-flex items-center gap-1"
                  >
                    Start Chat →
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Email Support</h3>
                  <p className="text-sm text-muted-foreground">{c.email_response_time}</p>
                  <a href={`mailto:${c.email_support}`} className="text-primary font-display font-semibold text-sm">
                    {c.email_support}
                  </a>
                </div>
              </div>

              {/* Grievance */}
              <div className="bg-surface-low rounded-xl p-6">
                <h4 className="font-display font-bold text-foreground">Grievance Redressal</h4>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  In accordance with the Information Technology Act, please find our designated grievance officer details for escalated concerns.
                </p>
                <p className="text-sm text-foreground mt-3">
                  <strong>Officer:</strong> {c.grievance_officer_name}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Email:</strong> {c.grievance_officer_email}
                </p>
              </div>
            </div>

            {/* Right: contact form */}
            <div className="bg-surface-low rounded-xl p-8">
              <h3 className="font-display font-bold text-foreground text-lg mb-6">Send us a Message</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="John Doe" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="john@company.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <PhoneInput
                    value={form.phone}
                    onChange={v => { setF("phone", v); setFormPhoneError(v.length > 0 && !isPhoneValid(v) ? "Enter a valid 10-digit number." : ""); }}
                    error={formPhoneError}
                  />
                </div>
                <div>
                  <label className={labelCls}>Order ID (Optional)</label>
                  <input value={form.orderId} onChange={e => setF("orderId", e.target.value)} placeholder="#YUVA-0000" className={inputCls} />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelCls}>Issue Type</label>
                <select value={form.issueType} onChange={e => setF("issueType", e.target.value)} className={inputCls}>
                  {issueTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {form.issueType === "Other" && (
                <div className="mt-4">
                  <label className={labelCls}>Specify Issue</label>
                  <input value={form.issueTypeOther} onChange={e => setF("issueTypeOther", e.target.value)} placeholder="Briefly describe your issue..." className={inputCls} autoFocus />
                </div>
              )}

              <div className="mt-4">
                <label className={labelCls}>Message</label>
                <textarea value={form.message} onChange={e => setF("message", e.target.value)} rows={4} placeholder="How can our engineers assist you today?" className={`${inputCls} resize-none`} />
              </div>
              <button
                onClick={handleContactSubmit}
                disabled={formLoading}
                className="w-full mt-6 gradient-primary text-primary-foreground py-3.5 rounded-lg font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint Form */}
      <section className="py-16 lg:py-24 bg-surface-low">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-2xl text-foreground tracking-tight">Register a Complaint / Feedback</h2>
              <p className="text-sm text-muted-foreground">We take every concern seriously. Fill in the details below.</p>
            </div>
          </div>

          <form onSubmit={handleComplaintSubmit} className="bg-card rounded-xl p-8 shadow-ambient space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input required value={complaint.name} onChange={e => setC("name", e.target.value)} placeholder="Your name" className={surfaceInputCls} />
              </div>
              <div>
                <label className={labelCls}>Order ID *</label>
                <input required value={complaint.orderId} onChange={e => setC("orderId", e.target.value)} placeholder="#YUVA-0000" className={surfaceInputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Issue Type *</label>
              <select required value={complaint.issueType} onChange={e => setC("issueType", e.target.value)} className={surfaceInputCls}>
                {complaintTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {complaint.issueType === "Other" && (
              <div>
                <label className={labelCls}>Specify Issue *</label>
                <input value={complaint.issueTypeOther} onChange={e => setC("issueTypeOther", e.target.value)} placeholder="Describe the type of issue..." className={surfaceInputCls} autoFocus />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email *</label>
                <input required type="email" value={complaint.email} onChange={e => setC("email", e.target.value)} placeholder="your@email.com" className={surfaceInputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <PhoneInput
                  value={complaint.phone}
                  bgClass="bg-surface-low"
                  onChange={v => { setC("phone", v); setComplaintPhoneError(v.length > 0 && !isPhoneValid(v) ? "Enter a valid 10-digit number." : ""); }}
                  error={complaintPhoneError}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea required value={complaint.description} onChange={e => setC("description", e.target.value)} rows={5} placeholder="Please describe the issue in detail..." className={`${surfaceInputCls} resize-none`} />
            </div>

            <button
              type="submit"
              disabled={complaintLoading}
              className="w-full gradient-primary text-primary-foreground py-3.5 rounded-lg font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {complaintLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Complaint"}
            </button>
          </form>
        </div>
      </section>

      {/* Branch + Map */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-card rounded-xl p-8 shadow-ambient">
              <h2 className="font-display font-extrabold text-2xl text-foreground tracking-tight">
                Visit Our Main Branch
              </h2>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">{c.branch_name}</p>
                    <p className="text-sm text-muted-foreground">{c.branch_address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">{c.branch_hours}</p>
                </div>
              </div>
              
              <a
                href={c.branch_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg font-display font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Get Directions
              </a>
            </div>

            <div className="bg-surface-high rounded-xl overflow-hidden aspect-[4/3] shadow-ambient">
              {c.branch_maps_embed ? (
                <iframe
                  src={c.branch_maps_embed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Yuva Computers Location"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  Map not configured
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;