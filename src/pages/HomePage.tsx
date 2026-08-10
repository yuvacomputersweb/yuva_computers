import { useState, useEffect } from "react";
import { storeService, contentService } from "@/services/api";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { TrendingSection } from "@/components/home/TrendingSection";
import { ProductGridSection } from "@/components/home/ProductGridSection";
import { TechJourney } from "@/components/home/TechJourney";
import { AboutSnapshot } from "@/components/home/AboutSnapshot";
import { PartnersSection } from "@/components/home/PartnersSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { BlogsSection } from "@/components/home/BlogsSection";
import { SEO } from "@/components/SEO";

const HomePage = () => {
  const [storeData, setStoreData] = useState({
    new_arrivals: [],
    best_sellers: [],
    trending: [],
    best_deals: [],
    categories: [],
  });

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
    storeService.getHomeData().then(setStoreData).catch(console.error);
    contentService.getHomeContent().then(setContent).catch(console.error);
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
      <main className="bg-background">
        <HeroSection slides={content.hero_slides} />
        <StatsBar stats={content.stats} />

        <TrendingSection
          title="Trending This Week"
          products={storeData.trending}
          link="/products?is_trending=true"
        />

        <TechJourney categories={storeData.categories} />

        <ProductGridSection
          title="Best Sellers"
          products={storeData.best_sellers}
          link="/products?is_best_seller=true"
        />

        <AboutSnapshot data={content.about} />

        <ProductGridSection
          title="Best Deals on Budget"
          products={storeData.best_deals}
          link="/products?is_best_deal=true"
        />

        <TrendingSection
          title="New Arrivals"
          products={storeData.new_arrivals}
          link="/products?is_new_arrival=true"
        />

        <BlogsSection />

        <PartnersSection />
        <ReviewsSection />
      </main>
    </>
  );
};

export default HomePage;