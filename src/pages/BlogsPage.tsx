import { useEffect, useState } from "react";
import { contentService } from "@/services/api";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { BlogCard, type Blog } from "@/components/home/BlogsSection";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentService
      .getBlogsContent()
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Laptop Buying Guides & Tips | Yuva Computers Blog"
        description="Guides on choosing, using and caring for refurbished laptops, from the Yuva Computers team."
        canonical="/blogs"
      />
      <PageHero
        eyebrow="From our desk"
        title="Guides & tips"
        text="Practical advice on choosing, using and caring for refurbished laptops."
        crumbs={[{ label: "Blog" }]}
      />
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">New articles are coming soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
          </div>
        )}
      </section>
    </>
  );
};

export default BlogsPage;
