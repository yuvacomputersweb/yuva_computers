import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";
import { storeService } from "@/services/api";
import { SITE, SOCIAL_LINKS, whatsappLink } from "@/lib/site";
import BrandLogo from "./BrandLogo";

const FooterColumn = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="font-semibold text-xs uppercase tracking-widest mb-4 text-white/40">{title}</h4>
    <ul className="space-y-3 text-sm text-white/70">{children}</ul>
  </div>
);

const linkClass = "hover:text-white transition-colors";

const SOCIAL_ICONS = { Instagram, YouTube: Youtube, Facebook };

const Footer = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await storeService.getCategories?.();
        setCategories(res || []);
      } catch (err) {
        console.log("Category fetch failed");
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-brand-navy text-white">
      <div className="container mx-auto px-4 md:px-6 pt-14 md:pt-20 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 lg:gap-12">

          {/* BRAND */}
          <div className="col-span-2 lg:col-span-1">
            <BrandLogo dark />
            <p className="mt-5 text-white/60 text-sm leading-relaxed max-w-sm">
              Certified refurbished laptops & desktops, tested in our own workshop and sold with
              warranty since {SITE.since}.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/70">
              <a href={`tel:+91${SITE.phone}`} className={`flex items-center gap-3 ${linkClass}`}>
                <Phone className="w-4 h-4 text-brand-leaf" /> {SITE.phoneDisplay}
              </a>
              <a href={`mailto:${SITE.email}`} className={`flex items-center gap-3 ${linkClass}`}>
                <Mail className="w-4 h-4 text-brand-leaf" /> {SITE.email}
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-leaf shrink-0 mt-0.5" />
                <span>
                  <span className="block text-white/90">Head office</span>
                  {SITE.headOfficeAddress}
                  <span className="block text-white/50 mt-1">{SITE.hours}</span>
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-brand-leaf text-white text-sm font-semibold hover:brightness-110"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp us
              </a>
              {SOCIAL_LINKS.map(({ href, label, handle }) => {
                const Icon = SOCIAL_ICONS[label];
                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} ${handle}`}
                    title={`${label} ${handle}`}
                    className="w-10 h-10 grid place-items-center rounded-full border border-white/15 hover:bg-white/10"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* PRODUCTS (DYNAMIC SEO CATEGORY LINKS) */}
          <FooterColumn title="Shop">
            <li><Link to="/products" className={`${linkClass} font-medium text-white`}>All products</Link></li>
            {categories.map((cat: any) => (
              <li key={cat.id}>
                <Link to={`/products?category=${cat.slug}`} className={linkClass}>{cat.name}</Link>
              </li>
            ))}
            <li><Link to="/products?is_best_deal=true" className={linkClass}>Best deals</Link></li>
          </FooterColumn>

          {/* COMPANY */}
          <FooterColumn title="Company">
            <li><Link to="/company" className={linkClass}>About us</Link></li>
            <li><Link to="/stores" className={linkClass}>Store locations</Link></li>
            <li><Link to="/bulk-orders" className={linkClass}>Bulk orders</Link></li>
            <li><Link to="/contact" className={linkClass}>Contact us</Link></li>
          </FooterColumn>

          {/* SUPPORT */}
          <FooterColumn title="Help">
            <li><Link to="/faq" className={linkClass}>FAQ</Link></li>
            <li><Link to="/contact?type=complaint" className={linkClass}>Complaint / issue form</Link></li>
            <li><Link to="/returns-refund-policy" className={linkClass}>Return & refund policy</Link></li>
            <li><Link to="/shipping-policy" className={linkClass}>Shipping policy</Link></li>
            <li><Link to="/track-order" className={linkClass}>Track my order</Link></li>
          </FooterColumn>
        </div>

        {/* BOTTOM */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50 text-center">
          <p>© {new Date().getFullYear()} Yuva Computers. All rights reserved.</p>
          <p>
            GSTIN: <span className="font-mono text-white/70 select-all">{SITE.gstin}</span>
          </p>
          <p className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ href, label, handle }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {handle}
              </a>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
