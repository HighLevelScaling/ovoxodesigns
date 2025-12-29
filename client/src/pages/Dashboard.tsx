import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Sparkles, Plus, Download, Image, Palette, FileText, 
  CreditCard, Folder, Loader2, Package, Clock, CheckCircle
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: logos, isLoading: logosLoading } = trpc.logo.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: brandKits, isLoading: brandKitsLoading } = trpc.brandKit.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: purchases, isLoading: purchasesLoading } = trpc.dashboard.purchases.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <a href={getLoginUrl()} className="w-full">
              <Button className="w-full">Sign In</Button>
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
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user?.name || user?.email || "User"}
            </span>
            <Link href="/create">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" /> Create Logo
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.totalLogos || 0}</p>
                  <p className="text-sm text-muted-foreground">Logos Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.totalBrandKits || 0}</p>
                  <p className="text-sm text-muted-foreground">Brand Kits</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.totalPurchases || 0}</p>
                  <p className="text-sm text-muted-foreground">Purchases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="logos">My Logos</TabsTrigger>
            <TabsTrigger value="brandkits">Brand Kits</TabsTrigger>
            <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          </TabsList>

          {/* Logos Tab */}
          <TabsContent value="logos">
            {logosLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : logos && logos.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {logos.map((logo) => (
                  <Card key={logo.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted/50 flex items-center justify-center p-4">
                      {logo.imageUrl ? (
                        <img 
                          src={logo.imageUrl} 
                          alt={logo.companyName} 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Image className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold">{logo.companyName}</h3>
                      {logo.tagline && (
                        <p className="text-sm text-muted-foreground">{logo.tagline}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {logo.style || "Modern"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {logo.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {logo.imageUrl && (
                          <a href={logo.imageUrl} download target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" /> Download
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Image className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No logos yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Create your first logo to get started</p>
                  <Link href="/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Create Logo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Brand Kits Tab */}
          <TabsContent value="brandkits">
            {brandKitsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : brandKits && brandKits.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {brandKits.map((kit) => (
                  <Card key={kit.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        {kit.name}
                      </CardTitle>
                      <CardDescription>
                        Created {format(new Date(kit.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {kit.emailSignatureUrl && (
                          <a href={kit.emailSignatureUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                            <FileText className="w-4 h-4" /> Email Signature
                          </a>
                        )}
                        {kit.businessCardFrontUrl && (
                          <a href={kit.businessCardFrontUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                            <CreditCard className="w-4 h-4" /> Business Card
                          </a>
                        )}
                        {kit.letterheadUrl && (
                          <a href={kit.letterheadUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                            <FileText className="w-4 h-4" /> Letterhead
                          </a>
                        )}
                        {kit.folderUrl && (
                          <a href={kit.folderUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                            <Folder className="w-4 h-4" /> Folder
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Palette className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No brand kits yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Purchase a Brand Kit package to get started</p>
                  <Link href="/create?package=brandkit">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Create Brand Kit
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases">
            {purchasesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : purchases && purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          purchase.status === "completed" ? "bg-green-100 text-green-600" : 
                          purchase.status === "pending" ? "bg-yellow-100 text-yellow-600" : 
                          "bg-red-100 text-red-600"
                        }`}>
                          {purchase.status === "completed" ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{purchase.packageType} Package</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(purchase.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${purchase.amount}</p>
                        <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                          {purchase.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Your purchase history will appear here</p>
                  <Link href="/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Create Your First Logo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
