import { ChevronRight, Calendar, User, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { blogArticles } from "@/data/blog-posts";
import SEO from "@/components/SEO";


const Blog = () => (
    <>
      <SEO 
        title="Blog e Notizie: Guida al Soggiorno San Raffaele" 
        description="Consigli, guide e notizie utili per chi cerca un alloggio vicino al San Raffaele. Scopri come muoverti a Milano 2 e dove dormire vicino all'ospedale." 
      />
      <div className="min-h-screen bg-background text-foreground">

      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl text-primary-foreground mb-6">Blog & Notizie</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Resta aggiornato sulle ultime novità, consigli per il tuo soggiorno e guide utili sulla zona di Milano 2.
          </p>
        </div>
      </section>

      <div className="container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Index - Left Side */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit order-2 lg:order-1">
            <div className="bg-accent/30 rounded-[2.5rem] p-8 border border-primary/5">
              <h3 className="font-display text-xl text-primary mb-6 flex items-center gap-2">
                <ChevronRight className="w-5 h-5" />
                Indice Articoli
              </h3>
              <nav className="space-y-2">
                {blogArticles.map((article, index) => (
                  <a
                    key={article.id}
                    href={`#${article.id}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors group"
                  >
                    <span className="text-xs font-bold text-primary/40 mt-1 min-w-[1.5rem]">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors leading-tight">
                      {article.title}
                    </span>
                  </a>
                ))}
              </nav>
              
              <div className="mt-10 pt-8 border-t border-primary/10">
                <div className="bg-primary/5 rounded-2xl p-6">
                  <h4 className="font-display text-sm font-bold text-primary mb-2 uppercase tracking-wider">Hai bisogno di aiuto?</h4>
                  <p className="text-xs text-muted-foreground mb-4">Per informazioni sui nostri appartamenti o prenotazioni, non esitare a contattarci.</p>
                  <Link to="/contatti" className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-colors">
                    Contattaci
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Right Side */}
          <main className="lg:col-span-8 space-y-16 order-1 lg:order-2">
            {blogArticles.map((article) => (
              <article 
                key={article.id} 
                id={article.id} 
                className="group relative bg-card rounded-[2rem] overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 scroll-mt-24 cursor-pointer"
              >
                <Link to={`/blog/${article.id}`} className="block">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-full overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full text-primary">
                          <Calendar className="w-3.5 h-3.5" />
                          {article.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {article.author}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl text-primary mb-4 group-hover:text-primary transition-colors leading-tight">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-8">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-primary font-bold group/btn w-fit">
                        Leggi di più 
                        <ArrowUpRight className="w-4 h-4 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </main>
        </div>
      </div>
    </div>
  </>
);

export default Blog;
