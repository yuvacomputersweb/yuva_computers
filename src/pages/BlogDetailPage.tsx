import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { contentService } from "@/services/api";
import { ArrowLeft, Calendar } from "lucide-react";
import { SEO } from "@/components/SEO";

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    contentService
      .getBlogBySlug(slug)
      .then(setBlog)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <>
        <SEO title="Blog Not Found | Yuva Computers" noindex={true} />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <p className="text-lg font-semibold">Blog not found.</p>
          <Link to="/blogs" className="text-primary underline text-sm">← Back to blogs</Link>
        </div>
      </>
    );
  }

  const firstPara = Array.isArray(blog.paragraphs) && blog.paragraphs.length > 0 ? blog.paragraphs[0] : "";
  const cleanDescription = (firstPara || "").substring(0, 160);

  const blogSchema = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "image": blog.cover_image,
      "datePublished": blog.created_at,
      "author": {
        "@type": "Organization",
        "name": "Yuva Computers"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Yuva Computers",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.yuvacomputers.in/favicon-32x32.png"
        }
      },
      "description": cleanDescription
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
          "name": "Blogs",
          "item": "https://www.yuvacomputers.in/blogs"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": blog.title,
          "item": `https://www.yuvacomputers.in/blogs/${slug}`
        }
      ]
    }
  ];

  return (
    <>
      <SEO
        title={`${blog.title} | Yuva Computers Tech Insights`}
        description={cleanDescription || blog.title}
        canonical={`/blogs/${slug}`}
        ogType="article"
        ogImage={blog.cover_image}
        jsonLd={blogSchema}
      />
      <main className="bg-background min-h-screen pb-20">
        {/* Cover */}
        <div className="w-full h-64 md:h-[420px] overflow-hidden bg-surface-low">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 max-w-3xl mt-10">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft size={14} /> Back to blogs
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar size={12} />
            <span>
              {new Date(blog.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-2xl md:text-4xl text-foreground tracking-tight mb-6">
            {blog.title}
          </h1>

          <div className="flex flex-col gap-5">
            {Array.isArray(blog.paragraphs) &&
              blog.paragraphs.map((para: string, i: number) => (
                <p key={i} className="text-base text-foreground/80 leading-relaxed">
                  {para}
                </p>
              ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default BlogDetailPage;