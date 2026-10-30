import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";

/** Cosmetic grades used on every product (Product.condition). */
export const GRADES = [
  {
    key: "like_new",
    name: "Like New",
    tag: "Looks unused",
    marks: 0,
    body: "No visible scratches or marks on the lid, keyboard deck or screen. Hard to tell apart from a new laptop.",
    points: ["No visible marks", "Clean, even keyboard", "Flawless display"],
  },
  {
    key: "excellent",
    name: "Excellent",
    tag: "Very light signs of use",
    marks: 2,
    body: "A few very light marks you only notice up close or at an angle. Screen and keyboard in great shape.",
    points: ["Faint marks only up close", "Keys look even", "Flawless display"],
  },
  {
    key: "good",
    name: "Good",
    tag: "Light, visible wear",
    marks: 5,
    body: "Light scratches or scuffs on the lid or base that you can see at arm’s length. No cracks or broken parts.",
    points: ["Light scratches or scuffs", "Some shine on keys or touchpad", "No cracks, no dead pixels"],
  },
  {
    key: "value",
    name: "Value",
    tag: "Clear wear, best price",
    marks: 9,
    body: "Visible wear like deeper scratches, small dents or faded key letters. Works exactly like the other grades — just costs less.",
    points: ["Visible scratches or small dents", "Keys may look faded", "Fully working, best price"],
  },
];

// Deterministic "scratch" positions so the illustration doesn't change on re-render.
const SCRATCHES = [
  [30, 30, 58, 26], [120, 40, 150, 52], [70, 80, 104, 74], [40, 110, 64, 120], [140, 100, 170, 92],
  [96, 30, 112, 44], [150, 70, 168, 78], [24, 64, 44, 58], [110, 112, 140, 118],
];

const LidIllustration = ({ marks }: { marks: number }) => (
  <svg viewBox="0 0 200 150" className="w-full h-auto" aria-hidden="true">
    <rect x="8" y="8" width="184" height="134" rx="12" fill="#e9eef5" stroke="#c8d2df" strokeWidth="2" />
    <circle cx="100" cy="75" r="14" fill="none" stroke="#c8d2df" strokeWidth="2" />
    {SCRATCHES.slice(0, marks).map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a98ab" strokeWidth={i > 5 ? 2.4 : 1.4} strokeLinecap="round" />
    ))}
    {marks >= 9 && <circle cx="160" cy="120" r="6" fill="#cfd8e3" stroke="#8a98ab" strokeWidth="1.5" />}
  </svg>
);

const ConditionGuidePage = () => (
  <>
    <SEO
      title="Refurbished Laptop Condition Grades Explained | Yuva Computers"
      description="What Like New, Excellent, Good and Value mean on Yuva Computers. Grades describe looks only — every laptop passes the same 50-point check."
      canonical="/condition-guide"
    />
    <PageHero
      eyebrow="Condition guide"
      title="What our grades mean"
      text="The grade only describes how the laptop looks. Every grade passes the same 50-point check and gets the same 15-day replacement."
      crumbs={[{ label: "Condition guide" }]}
    />

    <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GRADES.map((g) => (
          <article key={g.key} id={g.key} className="scroll-mt-40 rounded-3xl border border-border bg-card p-5 target:ring-2 target:ring-brand-leaf">
            <div className="rounded-2xl bg-muted/60 p-4">
              <LidIllustration marks={g.marks} />
            </div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-brand-leaf-dark">{g.tag}</p>
            <h2 className="font-display font-extrabold text-2xl">{g.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{g.body}</p>
            <ul className="mt-4 space-y-1.5">
              {g.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-brand-leaf-dark shrink-0" /> {p}
                </li>
              ))}
            </ul>
            <Link
              to={`/products?condition=${g.key}`}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Shop {g.name} <ArrowRight className="w-4 h-4" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-brand-navy text-white p-6 md:p-8 grid md:grid-cols-[auto_1fr] gap-5 items-center">
        <span className="w-12 h-12 rounded-2xl bg-brand-leaf/20 grid place-items-center">
          <BadgeCheck className="w-6 h-6 text-brand-leaf" />
        </span>
        <div>
          <h2 className="font-display font-bold text-xl">Same checks for every grade</h2>
          <p className="mt-1 text-white/70 text-sm leading-relaxed">
            Battery, display, keyboard, ports, speakers, webcam, Wi-Fi and thermals are tested on every laptop, and each
            one gets a fresh OS install. Want to see the exact unit? Ask us on WhatsApp for photos or a video.
          </p>
        </div>
      </div>
    </section>
  </>
);

export default ConditionGuidePage;
