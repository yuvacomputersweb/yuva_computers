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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10" /></div>;

  if (!product) return null;

  // Price determination based on active variant or base product
  const currentPrice = activeVariant?.final_price || product.price || 0;
  const productImage = product.primary_image || (product.images && product.images[0]?.image) || "https://www.yuvacomputers.in/favicon-32x32.png";
  const cleanDescription = (product.description || "").substring(0, 160).replace(/\n/g, " ");

  const productSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": productImage,
      "description": cleanDescription,
      "brand": {
        "@type": "Brand",
        "name": product.brand_name || "Yuva Computers"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://www.yuvacomputers.in/product/${slug}`,
        "priceCurrency": "INR",
        "price": currentPrice,
        "itemCondition": "https://schema.org/RefurbishedCondition",
        "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.yuvacomputers.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Products",
          "item": "https://www.yuvacomputers.in/products"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": product.name,
          "item": `https://www.yuvacomputers.in/product/${slug}`
        }
      ]
    }
  ];

  return (
    <>
      <SEO
        title={`${product.name} | Yuva Computers`}
        description={cleanDescription || `Buy ${product.name} at the best price with warranty at Yuva Computers.`}
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
            
            {/* Mobile Description Block (Matches Tab UI) */}
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

        {related.length > 0 && <section className="mt-16"><ProductCarousel products={related} title="You May Also Like" /></section>}
        <ReviewSection product={product} activeVariant={activeVariant} />
      </div>
    </>
  );
}