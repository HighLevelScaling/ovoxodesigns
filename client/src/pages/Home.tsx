import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Sparkles, Zap, Shield, Download, Palette, FileText, CreditCard, Folder,
  Check, ArrowRight, Star
} from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">OvoxoDesigns</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
                <Link href="/create"><Button>Create Logo</Button></Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}><Button variant="ghost">Sign In</Button></a>
                <a href={getLoginUrl()}><Button>Get Started</Button></a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                <Zap className="w-3 h-3 mr-1" /> AI-Powered Logo Generation
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
                Create Stunning Logos in <span className="text-primary">Seconds</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl mb-8 max-w-2xl mx-auto">
                Professional AI-generated logos with transparent backgrounds, multiple variations, 
                and complete brand kits. Starting at just <strong>$5</strong> — the lowest price in the market.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link href="/create"><Button size="lg" className="gap-2">Create Your Logo <ArrowRight className="w-4 h-4" /></Button></Link>
                ) : (
                  <a href={getLoginUrl()}><Button size="lg" className="gap-2">Start Creating <ArrowRight className="w-4 h-4" /></Button></a>
                )}
                <a href="#pricing"><Button size="lg" variant="outline">View Pricing</Button></a>
              </div>
              
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
                <div className="flex items-center gap-2"><Shield className="w-5 h-5" /><span className="text-sm">Commercial License</span></div>
                <div className="flex items-center gap-2"><Download className="w-5 h-5" /><span className="text-sm">Instant Download</span></div>
                <div className="flex items-center gap-2"><Star className="w-5 h-5" /><span className="text-sm">Full Ownership</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">From simple logos to complete brand identities, we've got you covered.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Sparkles, title: "AI Logo Generation", desc: "Advanced AI creates unique, professional logos tailored to your brand in seconds." },
                { icon: Palette, title: "Multiple Variations", desc: "Get up to 3 unique logo variations with different styles to choose from." },
                { icon: Download, title: "Transparent Backgrounds", desc: "All logos come with transparent backgrounds, ready to use anywhere." },
                { icon: FileText, title: "Email Signatures", desc: "Professional email signature templates featuring your brand." },
                { icon: CreditCard, title: "Business Cards", desc: "Front and back business card designs that make an impression." },
                { icon: Folder, title: "Complete Brand Kit", desc: "Letterheads, folders, and all the assets you need for a cohesive brand." },
              ].map((feature, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">The lowest prices in the market. No subscriptions, no hidden fees. Pay once, own forever.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Basic */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Logo</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                  <div className="mt-4"><span className="text-4xl font-bold">$5</span><span className="text-muted-foreground ml-2">one-time</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {["1 AI-generated logo", "PNG format (1024x1024)", "Transparent background", "3 regeneration attempts", "Commercial license"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span>{f}</span></li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isAuthenticated ? (
                    <Link href="/create?package=basic" className="w-full"><Button variant="outline" className="w-full">Choose Basic</Button></Link>
                  ) : (
                    <a href={getLoginUrl()} className="w-full"><Button variant="outline" className="w-full">Get Started</Button></a>
                  )}
                </CardFooter>
              </Card>

              {/* Premium */}
              <Card className="relative border-primary shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary">Most Popular</Badge></div>
                <CardHeader>
                  <CardTitle>Premium Logo</CardTitle>
                  <CardDescription>Best value for professionals</CardDescription>
                  <div className="mt-4"><span className="text-4xl font-bold">$9</span><span className="text-muted-foreground ml-2">one-time</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {["3 logo variations", "PNG & JPEG formats", "Transparent backgrounds", "Unlimited regenerations", "Commercial license", "Full ownership rights"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span>{f}</span></li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isAuthenticated ? (
                    <Link href="/create?package=premium" className="w-full"><Button className="w-full">Choose Premium</Button></Link>
                  ) : (
                    <a href={getLoginUrl()} className="w-full"><Button className="w-full">Get Started</Button></a>
                  )}
                </CardFooter>
              </Card>

              {/* Brand Kit */}
              <Card>
                <CardHeader>
                  <CardTitle>Brand Kit</CardTitle>
                  <CardDescription>Complete brand identity</CardDescription>
                  <div className="mt-4"><span className="text-4xl font-bold">$19</span><span className="text-muted-foreground ml-2">one-time</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {["Everything in Premium", "Email signature template", "Business card (front & back)", "Letterhead design", "Folder design", "All formats included"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span>{f}</span></li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isAuthenticated ? (
                    <Link href="/create?package=brandkit" className="w-full"><Button variant="outline" className="w-full">Choose Brand Kit</Button></Link>
                  ) : (
                    <a href={getLoginUrl()} className="w-full"><Button variant="outline" className="w-full">Get Started</Button></a>
                  )}
                </CardFooter>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground"><strong>Save up to 86%</strong> compared to competitors like Looka ($65) and Canva Pro ($110/year)</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Create your professional logo in three simple steps.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { num: "1", title: "Enter Your Details", desc: "Tell us your company name, industry, and preferred style." },
                { num: "2", title: "AI Generates Options", desc: "Our AI creates unique logo variations based on your input." },
                { num: "3", title: "Download & Use", desc: "Choose your favorite, download instantly, and start using it." },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{step.num}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Loved by Businesses Worldwide</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">See what our customers have to say about their experience with OvoxoDesigns.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Sarah Mitchell",
                  role: "Founder, TechStart",
                  avatar: "SM",
                  rating: 5,
                  text: "I was blown away by the quality of the logo I received. Within minutes, I had a professional brand identity that would have cost me hundreds elsewhere. The $9 premium package was an absolute steal!"
                },
                {
                  name: "Marcus Johnson",
                  role: "CEO, GreenLeaf Co.",
                  avatar: "MJ",
                  rating: 5,
                  text: "The brand kit exceeded all my expectations. Business cards, letterheads, email signatures - everything was perfectly cohesive. My clients now comment on how professional our materials look."
                },
                {
                  name: "Emily Chen",
                  role: "Creative Director, Artisan Studio",
                  avatar: "EC",
                  rating: 5,
                  text: "As a designer myself, I was skeptical of AI-generated logos. But OvoxoDesigns proved me wrong. The transparent backgrounds and high-resolution files are exactly what professionals need."
                },
                {
                  name: "David Rodriguez",
                  role: "Owner, Fresh Bites Cafe",
                  avatar: "DR",
                  rating: 5,
                  text: "Starting a small business on a tight budget, I couldn't afford a design agency. OvoxoDesigns gave me a logo I'm proud to display on my storefront and menus. Best $5 I ever spent!"
                },
                {
                  name: "Jennifer Park",
                  role: "Marketing Manager, Elevate Inc.",
                  avatar: "JP",
                  rating: 5,
                  text: "We needed logos for multiple sub-brands quickly. The regeneration feature let us explore dozens of options until we found the perfect fit for each. Incredible value and speed."
                },
                {
                  name: "Alex Thompson",
                  role: "Freelance Consultant",
                  avatar: "AT",
                  rating: 5,
                  text: "The commercial license included with every purchase is a game-changer. I use my logo everywhere - website, social media, merchandise - without worrying about licensing fees."
                }
              ].map((testimonial, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Your Logo?</h2>
              <p className="text-muted-foreground mb-8">Join thousands of businesses who trust OvoxoDesigns for their branding needs.</p>
              {isAuthenticated ? (
                <Link href="/create"><Button size="lg" className="gap-2">Start Creating <ArrowRight className="w-4 h-4" /></Button></Link>
              ) : (
                <a href={getLoginUrl()}><Button size="lg" className="gap-2">Get Started Free <ArrowRight className="w-4 h-4" /></Button></a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">OvoxoDesigns</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} OvoxoDesigns. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
