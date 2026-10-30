import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight, PackageSearch } from "lucide-react";
import { storeService } from "@/services/api";
import { toast } from "sonner";
import ImageGallery from "@/components/product/ImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCarousel from "@/components/ProductCarousel";
import ReviewSection from "@/components/product/ReviewsSection";
import TrustBadges from "@/components/product/TrustBadges";
import ProductVideo from "@/components/product/ProductVideo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_SECTIONS } from "@/data/faqs";
import { SEO } from "@/components/SEO";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);
  const [activeVariant, setActiveVariant] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await storeService.getProductBySlug(slug!);
        setProduct(data);
        const rel = await storeService.getProducts({ category: data.category_name?.toLowerCase() });
        setRelated(rel.filter((p: any) => p.id !== data.id));
      } catch {
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 grid lg:grid-cols-2 gap-10">
        <div className="aspect-square rounded-3xl bg-muted animate-pulse" />
        <div className="space-y-4">
          <div className="h-6 w-32 rounded-full bg-muted animate-pulse" />
          <div className="h-10 w-3/4 rounded-xl bg-muted animate-pulse" />
          <div className="h-28 rounded-2xl bg-muted animate-pulse" />
          <div className="h-40 rounded-2xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <span className="mx-auto w-14 h-14 rounded-2xl bg-muted grid place-items-center text-muted-foreground">
          <PackageSearch className="w-7 h-7" />
        </span>
        <h1 className="mt-5 font-display font-extrabold text-2xl">This product isn’t available</h1>
        <p className="mt-2 text-muted-foreground">It may have just been sold. Have a look at what’s in stock now.</p>
        <Link to="/products" className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-brand-navy text-white font-semibold">
          Browse laptops <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Safe evaluations after product loading is confirmed
  const productName = product.name || product.title || product.product_name || "Refurbished Laptop";
  const currentPrice = activeVariant?.final_price || product.price || 0;
  const productImage =
    product.primary_image ||
    (product.images && product.images[0]?.image) ||
    "https://www.yuvacomputers.in/favicon-32x32.png";

  // Strip HTML and clean whitespace
  const strippedText = (product.description || product.short_description || "")
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Create description from text, highlights, or hardware specs
  let metaDescription = "";
  if (strippedText.length > 10) {
    metaDescription = strippedText.substring(0, 155) + "...";
  } else if (Array.isArray(product.highlights_list) && product.highlights_list.length > 0) {
    metaDescription = product.highlights_list.join(", ").substring(0, 155);
  } else {
    const specParts = [product.processor, product.ram, product.storage].filter(Boolean).join(" / ");
    metaDescription = `Buy certified refurbished ${productName}${specParts ? ` (${specParts})` : ""} at Yuva Computers with warranty and fast shipping.`;
  }

  const productSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productName,
      "image": productImage,
      "description": metaDescription,
      "brand": {
        "@type": "Brand",
        "name": product.brand_name || "Yuva Computers",
      },
      "offers": {
        "@type": "Offer",
        "url": `https://www.yuvacomputers.in/product/${slug}`,
        "priceCurrency": "INR",
        "price": currentPrice,
        "itemCondition": "https://schema.org/RefurbishedCondition",
        "availability": product.in_stock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "seller": { "@type": "Organization", "name": "Yuva Computers" },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "IN" },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
            "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 7, "unitCode": "DAY" },
          },
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "IN",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 15,
        },
      },
      ...(product.sku ? { "sku": product.sku } : {}),
      ...(product.review_count > 0
        ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.average_rating,
              "reviewCount": product.review_count,
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.yuvacomputers.in/",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Products",
          "item": "https://www.yuvacomputers.in/products",
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": productName,
          "item": `https://www.yuvacomputers.in/product/${slug}`,
        },
      ],
    },
  ];

  return (
    <>
      <SEO
        title={`${productName} | Yuva Computers`}
        description={metaDescription}
        canonical={`/product/${slug}`}
        ogType="product"
        ogImage={productImage}
        jsonLd={productSchema}
      />
      <div className="container mx-auto px-4 md:px-6 pt-5 pb-24 lg:pb-16 space-y-12 md:space-y-16">
        <div>
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-5 overflow-hidden" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground shrink-0">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link to="/products" className="hover:text-foreground shrink-0">Shop</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate text-foreground">{productName}</span>
          </nav>

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 items-start">
            <div className="lg:sticky lg:top-40">
              <ImageGallery product={product} />
              <ProductVideo product={product} />
            </div>
            <div className="space-y-6">
              <ProductInfo product={product} onVariantChange={setActiveVariant} />
              <TrustBadges product={product} />
            </div>
          </div>
        </div>

        <ProductTabs product={product} slug={slug!} variant={activeVariant} />

        <div id="reviews" className="scroll-mt-40">
          <ReviewSection product={product} activeVariant={activeVariant} />
        </div>

        {related.length > 0 && (
          <section>
            <ProductCarousel products={related} title="You may also like" />
          </section>
        )}

        {/* FAQ Section */}
        <section>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground tracking-tight">
                  Questions about buying refurbished
                </h2>
                <p className="text-sm text-muted-foreground">
                  Common questions about buying refurbished laptops from Yuva Computers.
                </p>
              </div>
            </div>

            <div className="space-y-10">
              {FAQ_SECTIONS.slice(0, 2).map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf-dark mb-2">
                    {section.title}
                  </h3>
                  <Accordion type="single" collapsible>
                    {section.items.map((item, i) => (
                      <AccordionItem
                        key={item.question}
                        value={`${section.title}-${i}`}
                      >
                        <AccordionTrigger className="text-left font-display font-semibold text-foreground">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
            <Link to="/faq" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              See all FAQs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}