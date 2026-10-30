import { useState, useEffect } from "react";
import { storeService, contentService } from "@/services/api";
import type { ApiProduct } from "@/types/product";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid, BudgetSection, ProductShowcase } from "@/components/home/ShopSections";
import { WhyYuva, StoresSection, BulkOrderCta } from "@/components/home/BrandSections";
import { PartnersSection } from "@/components/home/PartnersSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { BlogsSection } from "@/components/home/BlogsSection";
import { SEO } from "@/components/SEO";

const HomePage = () => {
  const [storeData, setStoreData] = useState<{
    new_arrivals: ApiProduct[];
    best_sellers: ApiProduct[];
    trending: ApiProduct[];
    best_deals: ApiProduct[];
    categories: any[];
  }>({
    new_arrivals: [],
    best_sellers: [],
    trending: [],
    best_deals: [],
    categories: [],
  });
  const [productsLoading, setProductsLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]);

  const [content, setContent] = useState<{
    hero_slides: any[];
    stats: any[];
    reviews: any[];
    about: any;
  }>({
    hero_slides: [],
    stats: [],
    reviews: [],
    about: null,
  });

  useEffect(() => {
    storeService
      .getHomeData()
      .then(setStoreData)
      .catch(console.error)
      .finally(() => setProductsLoading(false));
    contentService.getHomeContent().then(setContent).catch(console.error);
    contentService
      .getStoresContent()
      .then((data) => setStores(data.stores || []))
      .catch(console.error);
  }, []);

  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Yuva Computers",
      "url": "https://www.yuvacomputers.in/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.yuvacomputers.in/products?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Yuva Computers",
      "url": "https://www.yuvacomputers.in/",
      "logo": "https://www.yuvacomputers.in/favicon-32x32.png"
    }
  ];

  return (
    <>
      <SEO
        title="Yuva Computers | Refurbished Laptops & Enterprise IT Hardware"
        description="Shop certified refurbished laptops, desktops, and enterprise IT computing solutions at Yuva Computers. Best warranties and nationwide support in India."
        canonical="/"
        jsonLd={homeSchema}
      />
      <div className="bg-background">
        <HeroSection
          stats={content.stats}
          featured={storeData.best_deals[0] || storeData.best_sellers[0]}
          storeCount={stores.length}
        />

        <CategoryGrid categories={storeData.categories} />

        <ProductShowcase
          loading={productsLoading}
          tabs={[
            { key: "best", label: "Best sellers", products: storeData.best_sellers, link: "/products?is_best_seller=true" },
            { key: "trending", label: "Trending", products: storeData.trending, link: "/products?is_trending=true" },
            { key: "deals", label: "Best deals", products: storeData.best_deals, link: "/products?is_best_deal=true" },
            { key: "new", label: "New arrivals", products: storeData.new_arrivals, link: "/products?is_new_arrival=true" },
          ]}
        />

        <BudgetSection />
        <WhyYuva about={content.about} />
        <StoresSection stores={stores} />
        <ReviewsSection />
        <BulkOrderCta />
        <BlogsSection />
        <PartnersSection />
      </div>
    </>
  );
};

export default HomePage;