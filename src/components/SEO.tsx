import React from "react";
import { Helmet } from "react-helmet-async";

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DOMAIN = "https://www.yuvacomputers.in";
const DEFAULT_TITLE = "Yuva Computers | Refurbished Laptops & IT Hardware Store";
const DEFAULT_DESC =
  "Explore top-quality refurbished laptops, desktops, and enterprise IT hardware at Yuva Computers. Best prices and warranties across India.";
const DEFAULT_OG_IMAGE = `${DOMAIN}/favicon-32x32.png`;

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}) => {
  const safeTitle =
    title && !title.includes("undefined") ? title : DEFAULT_TITLE;

  const currentUrl = canonical ? `${DOMAIN}${canonical}` : DOMAIN;

  return (
    <Helmet prioritizeSeoTags>
      <title>{safeTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Yuva Computers" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;