import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { 
  Sparkles, ArrowLeft, ArrowRight, Loader2, Check, CreditCard, RefreshCw, Image
} from "lucide-react";

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Retail", 
  "Food & Beverage", "Real Estate", "Consulting", "Creative Agency",
  "Fitness", "Travel", "Entertainment", "Non-Profit", "Other"
];

const STYLES = [
  { id: "modern", label: "Modern & Minimal", desc: "Clean lines, simple shapes" },
  { id: "bold", label: "Bold & Dynamic", desc: "Strong, impactful design" },
  { id: "elegant", label: "Elegant & Sophisticated", desc: "Refined, premium feel" },
  { id: "playful", label: "Playful & Fun", desc: "Friendly, approachable" },
  { id: "classic", label: "Classic & Traditional", desc: "Timeless, established" },
];

const COLOR_SCHEMES = [
  { id: "blue", label: "Professional Blue", colors: ["#1e40af", "#3b82f6", "#93c5fd"] },
  { id: "green", label: "Natural Green", colors: ["#166534", "#22c55e", "#86efac"] },
  { id: "purple", label: "Creative Purple", colors: ["#7c3aed", "#a78bfa", "#c4b5fd"] },
  { id: "red", label: "Bold Red", colors: ["#dc2626", "#ef4444", "#fca5a5"] },
  { id: "orange", label: "Energetic Orange", colors: ["#ea580c", "#f97316", "#fdba74"] },
  { id: "teal", label: "Modern Teal", colors: ["#0d9488", "#14b8a6", "#5eead4"] },
  { id: "monochrome", label: "Monochrome", colors: ["#000000", "#525252", "#a3a3a3"] },
];

const PACKAGES = {
  basic: { name: "Basic Logo", price: "$5", features: ["1 logo", "PNG format", "3 regenerations"] },
  premium: { name: "Premium Logo", price: "$9", features: ["3 variations", "PNG & JPEG", "Unlimited regenerations"] },
  brandkit: { name: "Brand Kit", price: "$19", features: ["3 variations", "Email signature", "Business cards", "Letterhead", "Folder"] },
};

type PackageType = keyof typeof PACKAGES;

interface LogoPreview {
  index: number;
  imageUrl: string;
  prompt: string;
}

export default function Create() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    tagline: "",
    industry: "",
    style: "modern",
    colorScheme: "blue",
  });
  const [selectedPackage, setSelectedPackage] = useState<PackageType>("premium");
  const [logoPreviews, setLogoPreviews] = useState<LogoPreview[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);

  // Parse package from URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const pkg = params.get("package") as PackageType;
    if (pkg && PACKAGES[pkg]) {
      setSelectedPackage(pkg);
    }
  }, [searchParams]);

  const previewMutation = trpc.logo.preview.useMutation({
    onSuccess: (data) => {
      if (data.success && data.previews) {
        setLogoPreviews(data.previews);
        setSelectedPreviewIndex(0);
        toast.success("Logo previews generated!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate logo previews");
    },
  });

  const checkoutMutation = trpc.checkout.create.useMutation({
    onSuccess: (data) => {
      toast.success("Redirecting to checkout...");
      window.open(data.checkoutUrl, "_blank");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const handleGeneratePreview = () => {
    if (!formData.companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }

    previewMutation.mutate({
      companyName: formData.companyName,
      tagline: formData.tagline || undefined,
      industry: formData.industry || undefined,
      style: formData.style,
      colorScheme: formData.colorScheme,
    });
  };

  const handleSubmit = () => {
    if (!formData.companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }

    checkoutMutation.mutate({
      productId: selectedPackage,
      logoData: {
        companyName: formData.companyName,
        tagline: formData.tagline || undefined,
        industry: formData.industry || undefined,
        style: formData.style,
        colorScheme: formData.colorScheme,
      },
    });
  };

  const goToPreviewStep = () => {
    setStep(3);
    // Auto-generate previews when entering the preview step
    if (logoPreviews.length === 0) {
      handleGeneratePreview();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to create your logo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <a href={getLoginUrl()} className="w-full">
              <Button className="w-full">Sign In to Continue</Button>
            </a>
            <Link href="/">
              <Button variant="ghost" className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">OvoxoDesigns</span>
          </Link>
          
          {/* Progress indicator - now 4 steps */}
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && <div className={`w-8 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        {/* Step 1: Company Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your brand</CardTitle>
              <CardDescription>We'll use this information to create the perfect logo for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline (optional)</Label>
                <Input
                  id="tagline"
                  placeholder="Your company's tagline or slogan"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!formData.companyName.trim()}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Style Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose your style</CardTitle>
              <CardDescription>Select the design direction for your logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Style Selection */}
              <div className="space-y-4">
                <Label>Logo Style</Label>
                <RadioGroup value={formData.style} onValueChange={(v) => setFormData({ ...formData, style: v })}>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {STYLES.map((style) => (
                      <div key={style.id}>
                        <RadioGroupItem value={style.id} id={style.id} className="peer sr-only" />
                        <Label
                          htmlFor={style.id}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <span className="font-medium">{style.label}</span>
                          <span className="text-xs text-muted-foreground">{style.desc}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Color Scheme */}
              <div className="space-y-4">
                <Label>Color Scheme</Label>
                <RadioGroup value={formData.colorScheme} onValueChange={(v) => setFormData({ ...formData, colorScheme: v })}>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {COLOR_SCHEMES.map((scheme) => (
                      <div key={scheme.id}>
                        <RadioGroupItem value={scheme.id} id={`color-${scheme.id}`} className="peer sr-only" />
                        <Label
                          htmlFor={`color-${scheme.id}`}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <div className="flex gap-1 mb-2">
                            {scheme.colors.map((color, i) => (
                              <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <span className="text-sm">{scheme.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={goToPreviewStep}>
                  Generate Previews <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Logo Preview */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Your Logos</CardTitle>
              <CardDescription>
                Here are your AI-generated logo concepts. Select your favorite or regenerate for new options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {previewMutation.isPending ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-4 text-lg font-medium">Creating your logos...</p>
                  <p className="text-sm text-muted-foreground">This usually takes 10-30 seconds</p>
                </div>
              ) : logoPreviews.length > 0 ? (
                <>
                  {/* Main selected preview */}
                  <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted border-2 border-primary">
                    <img 
                      src={logoPreviews[selectedPreviewIndex]?.imageUrl} 
                      alt={`Logo preview ${selectedPreviewIndex + 1}`}
                      className="w-full h-full object-contain p-8"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Option {selectedPreviewIndex + 1}
                    </div>
                  </div>

                  {/* Thumbnail selection */}
                  <div className="flex justify-center gap-4">
                    {logoPreviews.map((preview, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPreviewIndex(index)}
                        className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedPreviewIndex === index 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <img 
                          src={preview.imageUrl} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-contain p-2 bg-muted/30"
                        />
                        {selectedPreviewIndex === index && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <Check className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Regenerate button */}
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={handleGeneratePreview}
                      disabled={previewMutation.isPending}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate New Options
                    </Button>
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium mb-2">Your Logo Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Company:</span>
                      <span>{formData.companyName}</span>
                      {formData.tagline && (
                        <>
                          <span className="text-muted-foreground">Tagline:</span>
                          <span>{formData.tagline}</span>
                        </>
                      )}
                      <span className="text-muted-foreground">Style:</span>
                      <span className="capitalize">{formData.style}</span>
                      <span className="text-muted-foreground">Colors:</span>
                      <span className="capitalize">{formData.colorScheme}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Image className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No previews generated yet</p>
                  <Button className="mt-4" onClick={handleGeneratePreview}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Previews
                  </Button>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={logoPreviews.length === 0 || previewMutation.isPending}
                >
                  Continue to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Package Selection & Checkout */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose your package</CardTitle>
              <CardDescription>Select the package that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Logo Preview */}
              {logoPreviews[selectedPreviewIndex] && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-background border">
                    <img 
                      src={logoPreviews[selectedPreviewIndex].imageUrl} 
                      alt="Selected logo"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{formData.companyName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.style.charAt(0).toUpperCase() + formData.style.slice(1)} style • {formData.colorScheme.charAt(0).toUpperCase() + formData.colorScheme.slice(1)} colors
                    </p>
                    <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setStep(3)}>
                      Change selection
                    </Button>
                  </div>
                </div>
              )}

              {/* Package Selection */}
              <RadioGroup value={selectedPackage} onValueChange={(v) => setSelectedPackage(v as PackageType)}>
                <div className="grid gap-4">
                  {(Object.entries(PACKAGES) as [PackageType, typeof PACKAGES.basic][]).map(([id, pkg]) => (
                    <div key={id}>
                      <RadioGroupItem value={id} id={`pkg-${id}`} className="peer sr-only" />
                      <Label
                        htmlFor={`pkg-${id}`}
                        className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 peer-data-[state=checked]:border-primary ${
                          id === "premium" ? "border-primary/50" : "border-muted"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedPackage === id ? "border-primary bg-primary" : "border-muted"
                          }`}>
                            {selectedPackage === id && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {pkg.name}
                              {id === "premium" && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Popular</span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pkg.features.join(" • ")}
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold">{pkg.price}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={checkoutMutation.isPending}>
                  {checkoutMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" /> Proceed to Checkout</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
