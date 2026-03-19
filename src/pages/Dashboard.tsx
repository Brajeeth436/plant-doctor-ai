import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Upload, Camera, Loader2, Bug, Droplets, Sprout, MessageCircle, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    disease: string;
    confidence: string;
    description: string;
    solution: string;
    fertilizer: string;
    prevention: string;
  } | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-plant', {
        body: { image: selectedImage },
      });
      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      toast({ title: 'Analysis failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">PlantGuard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/chatbot')}>
              <MessageCircle className="w-4 h-4 mr-1" /> Ask AI
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Plant Disease Detection</h1>
          <p className="text-muted-foreground">Upload a photo of your plant to identify diseases and get treatment solutions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="card-natural animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Camera className="w-5 h-5 text-primary" /> Upload Plant Image
              </CardTitle>
              <CardDescription>Take a clear photo of the affected leaf or plant part</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

              {selectedImage ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={selectedImage} alt="Selected plant" className="w-full h-64 object-cover" />
                  <button onClick={() => { setSelectedImage(null); setSelectedFile(null); setResult(null); }}
                    className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-foreground/90 transition-colors">
                    ✕
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Click to upload</p>
                    <p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p>
                  </div>
                </button>
              )}

              <Button variant="hero" className="w-full" size="lg" disabled={!selectedImage || analyzing} onClick={analyzeImage}>
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Bug className="w-4 h-4 mr-2" /> Detect Disease</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {result ? (
              <>
                <Card className="card-natural border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <Bug className="w-5 h-5 text-destructive" /> Disease Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold text-foreground">{result.disease}</h3>
                    <span className="inline-block mt-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {result.confidence} confidence
                    </span>
                    <p className="mt-3 text-muted-foreground text-sm">{result.description}</p>
                  </CardContent>
                </Card>

                <Card className="card-natural border-l-4 border-l-leaf">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <Droplets className="w-5 h-5 text-leaf" /> Treatment & Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{result.solution}</p>
                  </CardContent>
                </Card>

                <Card className="card-natural border-l-4 border-l-earth">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <Sprout className="w-5 h-5 text-earth" /> Recommended Fertilizer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{result.fertilizer}</p>
                  </CardContent>
                </Card>

                <Card className="card-natural">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display">🛡️ Prevention Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{result.prevention}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 py-12">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse-leaf">
                    <Leaf className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Ready to Analyze</h3>
                    <p className="text-sm text-muted-foreground mt-1">Upload a plant image to get started</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
