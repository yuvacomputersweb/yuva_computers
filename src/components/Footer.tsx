import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  Heart,
} from "lucide-react";
import { storeService } from "@/services/api";

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
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>
            <img
              src="/logo.png"
              alt="Yuva Computers"
              className="h-20 w-auto mb-6 object-contain"
            />
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Certified refurbished laptops & desktops built for performance and reliability.
            </p>
          </div>

          {/* QUICK LINKS (SEO NAVIGATION) */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest mb-4 text-primary-foreground/40">
              Quick Links
            </h4>

            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/bulk-orders" className="hover:text-white">Bulk Orders</Link></li>
              <li><Link to="/company" className="hover:text-white">Company</Link></li>
              <li><Link to="/stores" className="hover:text-white">Stores</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* PRODUCTS (DYNAMIC SEO CATEGORY LINKS) */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest mb-4 text-primary-foreground/40">
              Products
            </h4>

            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li>
                <Link to="/products" className="hover:text-white font-medium">
                  All Products
                </Link>
              </li>

              {categories.length > 0 ? (
                categories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link
                      to={`/products?category=${cat.slug}`}
                      className="hover:text-white"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs opacity-50">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* SUPPORT / ACTIONS */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest mb-4 text-primary-foreground/40">
              Support
            </h4>

            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li>
                <Link to="/contact?type=bulk" className="hover:text-white">
                  Bulk Order Request
                </Link>
              </li>
              <li>
                <Link to="/contact?type=complaint" className="hover:text-white">
                  Complaint / Issue Form
                </Link>
              </li>
              <li>
                <Link to="/returns-refund-policy" className="hover:text-white">
                  Return and Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>

            {/* CONTACT */}
            <div className="mt-6 space-y-3 text-sm text-primary-foreground/60">

              <div className="flex gap-3">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Dilsukhnagar, Hyderabad, Telangana</span>
              </div>

              <div className="flex gap-3">
                <Phone className="w-4 h-4" />
                <a href="tel:9709888456" className="hover:text-white">
                  9709888456
                </a>
              </div>

              <div className="flex gap-3">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@yuvacomputers.in" className="hover:text-white">
                  info@yuvacomputers.in
                </a>
              </div>
            </div>

            {/* SOCIAL */}
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/share/1ZcCzs87wv/" target="_blank">
                <Facebook />
              </a>
              <a href="https://www.instagram.com/yuva.computers" target="_blank">
                <Instagram />
              </a>
              <a href="https://youtube.com/@yuvacomputers" target="_blank">
                <Youtube />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center space-y-3">

          <p className="text-xs text-primary-foreground/40">
            © 2024 Yuva Computers. All rights reserved.
          </p>

          {/* STAFFARC CREDIT */}
          <div className="flex justify-center items-center gap-1 text-xs">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by
            <a
              href="https://staffarc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-500 hover:underline"
            >
              <img
                src="https://www.staffarc.in/images/Staffarc-logo.png"
                className="h-4 w-4"
                alt="StaffArc"
              />
              StaffArc
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;