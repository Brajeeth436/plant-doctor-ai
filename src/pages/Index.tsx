import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Leaf, Shield, Sprout, MessageCircle, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleGetStarted = () => {
    if (user) navigate('/dashboard');
    else navigate('/login');
  };

  const features = [
    { icon: Shield, title: 'Disease Detection', desc: 'Upload plant photos to instantly identify diseases using AI analysis' },
    { icon: Sprout, title: 'Fertilizer Guide', desc: 'Get personalized fertilizer recommendations for your specific plants' },
    { icon: MessageCircle, title: 'AI Assistant', desc: 'Chat with our plant expert AI for care tips from planting to harvest' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">PlantGuard</span>
        </div>
        {!loading && (
          user ? (
            <Button variant="hero" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
              <Button variant="hero" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
            </div>
          )
        )}
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Leaf className="w-4 h-4" /> AI-Powered Plant Protection
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight text-balance">
            Detect Plant Diseases <br />
            <span className="bg-clip-text text-transparent hero-gradient bg-[length:200%_200%]" style={{ backgroundImage: 'linear-gradient(135deg, hsl(142 55% 30%), hsl(80 45% 45%))' }}>
              Before It's Too Late
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Upload a photo of your plant, get instant disease diagnosis, treatment solutions, and fertilizer recommendations — all powered by AI.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button variant="hero" size="lg" onClick={handleGetStarted} className="text-base px-8">
              Start Detecting <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/register')} className="text-base">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <div key={f.title} className="card-natural rounded-2xl p-6 text-center space-y-4 animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 PlantGuard. Protecting plants with AI.</p>
      </footer>
    </div>
  );
};

export default Index;
