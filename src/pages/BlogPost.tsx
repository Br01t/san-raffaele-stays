import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, User, ChevronLeft } from "lucide-react";
import { blogArticles } from "@/data/blog-posts";
import SEO from "@/components/SEO";


const BlogPost = () => {
  const { id } = useParams();
  const currentIndex = blogArticles.findIndex((a) => a.id === id);
  const article = blogArticles[currentIndex];

  if (!article) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-display text-primary">Articolo non trovato</h1>
        <Link to="/blog" className="mt-4 text-primary hover:underline flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Torna al blog
        </Link>
      </div>
    );
  }

  const prevArticle = currentIndex > 0 ? blogArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < blogArticles.length - 1 ? blogArticles[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title={article.title} 
        description={article.excerpt} 
      />

      {/* Article Header */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Torna al Blog
          </Link>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-primary-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-primary-foreground/80 font-medium">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author}
              </span>
            </div>
          </div>
        </div>
      </section>

      <article className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-white/20">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-auto aspect-video object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-primary mx-auto max-w-none">
            <p className="text-xl text-muted-foreground leading-relaxed italic mb-8 border-l-4 border-primary/20 pl-6">
              {article.excerpt}
            </p>
            <div 
              className="space-y-6 text-muted-foreground leading-loose"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Post Navigation */}
          <hr className="my-16 border-primary/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left">
              {prevArticle && (
                <Link to={`/blog/${prevArticle.id}`} className="group flex flex-col gap-2 p-6 rounded-2xl bg-accent/30 border border-primary/5 hover:bg-primary/5 transition-all">
                  <span className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Precedente
                  </span>
                  <span className="font-display text-lg text-muted-foreground group-hover:text-primary transition-colors leading-tight">
                    {prevArticle.title}
                  </span>
                </Link>
              )}
            </div>
            <div className="text-right">
              {nextArticle && (
                <Link to={`/blog/${nextArticle.id}`} className="group flex flex-col gap-2 p-6 rounded-2xl bg-accent/30 border border-primary/5 hover:bg-primary/5 transition-all items-end">
                  <span className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                    Successivo <ArrowRight className="w-4 h-4" />
                  </span>
                  <span className="font-display text-lg text-muted-foreground group-hover:text-primary transition-colors leading-tight">
                    {nextArticle.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
