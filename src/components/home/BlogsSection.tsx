import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { contentService } from "@/services/api";
import { ArrowRight, Calendar } from "lucide-react";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  cover_image: string;
  excerpt: string;
  created_at: string;
}

export const BlogCard = ({ blog }: { blog: Blog }) => (
  <Link
                  to={`/blogs/${blog.slug}`}
    className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300"
  >
    {/* Cover */}
    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
      <img
        src={blog.cover_image}
        alt={blog.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    </div>

    {/* Body */}
    <div className="flex flex-col flex-1 p-5 gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar size={12} />
        <span>
          {new Date(blog.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <h3 className="font-display font-bold text-foreground text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {blog.title}
      </h3>

      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
        {blog.excerpt}
      </p>

      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-1">
        Read more <ArrowRight size={13} />
      </span>
    </div>
  </Link>
);

export const BlogsSection = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    contentService.getBlogsContent(3).then(setBlogs).catch(console.error);
  }, []);

  if (!blogs.length) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf-dark mb-3">
              From Our Desk
            </p>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl text-foreground tracking-tight">
              Guides & tips
            </h2>
          </div>
          <Link to="/blogs" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border text-sm font-semibold shrink-0 hover:border-foreground">
            All articles <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
        </div>

      </div>
    </section>
  );
};