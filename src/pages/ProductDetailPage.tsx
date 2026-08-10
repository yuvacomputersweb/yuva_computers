import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, FileText, CheckCircle } from "lucide-react";
import { storeService } from "@/services/api";
import { toast } from "sonner";
import ImageGallery from "@/components/product/ImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCarousel from "@/components/ProductCarousel";
import ReviewSection from "@/components/product/ReviewsSection";
import TrustBadges from "@/components/product/TrustBadges";
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (!product) return null;

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
      },
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
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <ImageGallery product={product} />
          <div className="space-y-6">
            <ProductInfo product={product} onVariantChange={setActiveVariant} />
            <TrustBadges product={product} />

            {/* Mobile Description Block */}
            <div className="lg:hidden space-y-8 pt-4">
              <div className="prose max-w-none text-muted-foreground">
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-2 text-sm">
                  <FileText className="w-5 h-5 text-primary" /> Overview
                </h4>
                <p className="whitespace-pre-line text-sm">{product.description}</p>
              </div>

              {product.highlights_list?.length > 0 && (
                <div>
                  <h4 className="font-bold text-foreground mb-4 text-sm">Key Highlights</h4>
                  <div className="grid gap-3">
                    {product.highlights_list.map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-card p-3 rounded-lg border">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="block">
          <ProductTabs product={product} slug={slug!} />
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <ProductCarousel products={related} title="You May Also Like" />
          </section>
        )}
        <ReviewSection product={product} activeVariant={activeVariant} />
      </div>
    </>
  );
}