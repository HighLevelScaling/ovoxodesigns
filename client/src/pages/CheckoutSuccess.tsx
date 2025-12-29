import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useSearch } from "wouter";
import { toast } from "sonner";
import { 
  Sparkles, CheckCircle, Loader2, ArrowRight, AlertCircle
} from "lucide-react";

export default function CheckoutSuccess() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearch();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const sid = params.get("session_id");
    if (sid) {
      setSessionId(sid);
    }
  }, [searchParams]);

  const { data: verifyData, isLoading: verifying, error } = trpc.checkout.verify.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId && isAuthenticated }
  );

  const generateMutation = trpc.logo.generate.useMutation({
    onSuccess: () => {
      toast.success("Logo generated successfully!");
      setIsGenerating(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate logo");
      setIsGenerating(false);
    },
  });

  const brandKitMutation = trpc.brandKit.generate.useMutation({
    onSuccess: () => {
      toast.success("Brand kit generated successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate brand kit");
    },
  });

  const handleGenerateLogo = () => {
    if (!verifyData?.logoData?.companyName) return;
    
    setIsGenerating(true);
    const variationCount = verifyData.productId === "basic" ? 1 : 3;
    
    generateMutation.mutate({
      companyName: verifyData.logoData.companyName,
      tagline: verifyData.logoData.tagline,
      industry: verifyData.logoData.industry,
      style: verifyData.logoData.style,
      colorScheme: verifyData.logoData.colorScheme,
      variationCount,
    });
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h3 className="font-semibold">Verifying your payment...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your purchase</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || (verifyData && !verifyData.success)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="font-semibold mb-2">Payment Verification Failed</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              We couldn't verify your payment. Please contact support if you believe this is an error.
            </p>
            <div className="flex gap-4">
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
              <Link href="/create">
                <Button>Try Again</Button>
              </Link>
            </div>
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
        </div>
      </header>

      <main className="container py-12 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your {verifyData?.productId} package is ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            {verifyData?.logoData && (
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium mb-3">Order Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Package:</span>
                  <span className="capitalize">{verifyData.productId}</span>
                  <span className="text-muted-foreground">Company:</span>
                  <span>{verifyData.logoData.companyName}</span>
                  {verifyData.logoData.tagline && (
                    <>
                      <span className="text-muted-foreground">Tagline:</span>
                      <span>{verifyData.logoData.tagline}</span>
                    </>
                  )}
                  {verifyData.logoData.style && (
                    <>
                      <span className="text-muted-foreground">Style:</span>
                      <span className="capitalize">{verifyData.logoData.style}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Generate Logo Button */}
            <div className="flex flex-col gap-4">
              {!generateMutation.isSuccess ? (
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handleGenerateLogo}
                  disabled={isGenerating || generateMutation.isPending}
                >
                  {isGenerating || generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Your Logo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate My Logo Now
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-600 mb-4">Logo Generated Successfully!</p>
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2">
                      View in Dashboard <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Note */}
            <p className="text-xs text-muted-foreground text-center">
              Logo generation typically takes 10-30 seconds. You can view and download your logos from your dashboard.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
