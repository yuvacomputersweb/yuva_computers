// Two-question laptop finder that turns answers into a filtered product list.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, GraduationCap, Briefcase, Code2, Palette, Building2, ArrowLeft, MessageCircle } from "lucide-react";
import { BUDGET_RANGES, budgetHref, whatsappLink } from "@/lib/site";

const USES = [
  { slug: "students", label: "Studies & online classes", icon: GraduationCap },
  { slug: "office", label: "Office work & browsing", icon: Briefcase },
  { slug: "coding", label: "Coding & multitasking", icon: Code2 },
  { slug: "videographics", label: "Design, video & CAD", icon: Palette },
  { slug: "business", label: "Business & travel", icon: Building2 },
];

const HelpMeChoose = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const [use, setUse] = useState<(typeof USES)[number] | null>(null);

  if (!open) return null;

  const close = () => {
    setUse(null);
    onClose();
  };

  const finish = (min?: number, max?: number) => {
    const href = budgetHref(min, max);
    navigate(`${href}${href.endsWith("?") ? "" : "&"}usage=${use!.slug}`);
    close();
  };

  const option = "w-full flex items-center gap-3 rounded-2xl border border-border p-4 text-left font-semibold hover:border-brand-navy hover:bg-muted/50 transition-colors";

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div role="dialog" aria-modal="true" aria-labelledby="hmc-title" className="relative w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between gap-3">
          {use ? (
            <button onClick={() => setUse(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf-dark">Step 1 of 2</p>
          )}
          <button onClick={close} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 id="hmc-title" className="mt-3 font-display font-extrabold text-2xl tracking-tight">
          {use ? "What’s your budget?" : "What will you mostly use it for?"}
        </h2>

        <div className="mt-6 space-y-2.5">
          {!use
            ? USES.map((u) => (
                <button key={u.slug} onClick={() => setUse(u)} className={option}>
                  <span className="w-10 h-10 rounded-xl bg-brand-leaf/15 text-brand-leaf-dark grid place-items-center shrink-0">
                    <u.icon className="w-5 h-5" />
                  </span>
                  {u.label}
                </button>
              ))
            : BUDGET_RANGES.map((b) => (
                <button key={b.value} onClick={() => finish(b.min, b.max)} className={`${option} justify-between`}>
                  <span>{b.label === "Between" ? b.value : `${b.label} ${b.value}`}</span>
                  <span className="text-sm font-normal text-muted-foreground">{b.hint}</span>
                </button>
              ))}
        </div>

        <a
          href={whatsappLink("Hi Yuva Computers, can you help me choose a laptop? My budget is ")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="w-4 h-4 text-brand-leaf-dark" /> Rather talk to a person? Ask on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default HelpMeChoose;
