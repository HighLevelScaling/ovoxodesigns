import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { 
  Sparkles, ArrowLeft, ArrowRight, Loader2, Check, CreditCard
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

  // Parse package from URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const pkg = params.get("package") as PackageType;
    if (pkg && PACKAGES[pkg]) {
      setSelectedPackage(pkg);
    }
  }, [searchParams]);

  const checkoutMutation = trpc.checkout.create.useMutation({
    onSuccess: (data) => {
      toast.success("Redirecting to checkout...");
      window.open(data.checkoutUrl, "_blank");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

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
            <span className="font-bold text-xl">LogoForge</span>
          </Link>
          
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
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
                <Button onClick={() => setStep(3)}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Package Selection & Checkout */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose your package</CardTitle>
              <CardDescription>Select the package that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  {formData.industry && (
                    <>
                      <span className="text-muted-foreground">Industry:</span>
                      <span>{formData.industry}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Style:</span>
                  <span className="capitalize">{formData.style}</span>
                  <span className="text-muted-foreground">Colors:</span>
                  <span className="capitalize">{formData.colorScheme}</span>
                </div>
              </div>

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
                          <div className={`w-4 h-4 rounded-full border-2 ${
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
                <Button variant="ghost" onClick={() => setStep(2)}>
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
