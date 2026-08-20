import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Check,
  Sparkles,
  Users,
  Building2,
  Rocket,
  Star,
  HelpCircle,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Percent,
  Clock,
} from "lucide-react";

const Pricing = () => {
  const individualPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out SyncVision",
      icon: Rocket,
      color: "text-emerald-500",
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
      features: [
        "1 collaborative board",
        "Basic drawing tools",
        "Up to 3 participants",
        "24-hour session history",
        "Community support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$12",
      description: "For individuals and small teams",
      icon: Star,
      color: "text-violet-500",
      bg: "bg-gradient-to-br from-violet-500/20 to-violet-600/5 border-violet-500/20",
      features: [
        "Unlimited boards",
        "All drawing tools + templates",
        "Up to 15 participants",
        "HD video conferencing",
        "AI code analysis",
        "30-day session history",
        "Priority support",
        "Export to PDF/PNG",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$49",
      description: "For large teams and organizations",
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20",
      features: [
        "Everything in Pro",
        "Unlimited participants",
        "Advanced AI features",
        "Custom integrations",
        "SSO & advanced security",
        "Unlimited history",
        "Dedicated support",
        "Custom training",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqItems = [
    {
      icon: RefreshCw,
      question: "Can I change plans later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.",
      color: "text-blue-500",
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20",
    },
    {
      icon: CreditCard,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) and offer annual billing with a 20% discount.",
      color: "text-violet-500",
      bg: "bg-gradient-to-br from-violet-500/20 to-violet-600/5 border-violet-500/20",
    },
    {
      icon: Clock,
      question: "Is there a free trial?",
      answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start.",
      color: "text-emerald-500",
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    },
    {
      icon: ShieldCheck,
      question: "Is my data secure?",
      answer: "Absolutely. All data is encrypted at rest and in transit. Enterprise plans include SSO, audit logs, and compliance support.",
      color: "text-amber-500",
      bg: "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/20",
    },
    {
      icon: Percent,
      question: "Do you offer discounts?",
      answer: "We offer 20% off annual billing, special pricing for educational institutions, and volume discounts for large teams.",
      color: "text-pink-500",
      bg: "bg-gradient-to-br from-pink-500/20 to-pink-600/5 border-pink-500/20",
    },
    {
      icon: Users,
      question: "Can I add more team members?",
      answer: "Pro and Enterprise plans let you invite additional members at any time. Enterprise plans have no cap on team size.",
      color: "text-cyan-500",
      bg: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
    },
  ];

  const planTags = ["14-Day Trial", "No Lock-in", "Annual Discount", "Educational Pricing", "Instant Setup", "24/7 Support"];
  const faqTags = ["Flexible Billing", "Enterprise Ready", "Data Privacy", "Cancel Anytime", "Volume Discounts", "Priority Support"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/30 text-primary">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Simple Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Simple, Transparent{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-secondary bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you. All plans include a 14-day free trial — no credit card required.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="plans" className="w-full">
            <div className="flex justify-center mb-10">
              <TabsList className="bg-muted/40 border border-border/50 rounded-2xl p-1.5 h-auto gap-1">
                <TabsTrigger
                  value="plans"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl px-6 py-3 text-base font-medium gap-2 transition-all"
                >
                  <CreditCard className="w-4.5 h-4.5" />
                  Plans
                </TabsTrigger>
                <TabsTrigger
                  value="faq"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl px-6 py-3 text-base font-medium gap-2 transition-all"
                >
                  <HelpCircle className="w-4.5 h-4.5" />
                  FAQ
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="plans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {individualPlans.map((plan, index) => {
                  const Icon = plan.icon;
                  return (
                    <Card
                      key={index}
                      className={`group border bg-card/50 hover:shadow-lg transition-all duration-300 relative ${
                        plan.popular
                          ? "border-primary/40 shadow-md scale-[1.03]"
                          : "border-border/60 hover:bg-accent/40 hover:border-primary/25"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                          <span className="bg-gradient-to-r from-primary to-secondary px-4 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${plan.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${plan.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                        <div className="mb-5">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground ml-1">/month</span>
                        </div>
                        <Link to="/auth?mode=signup">
                          <Button
                            className={`w-full mb-5 ${
                              plan.popular
                                ? "bg-gradient-to-r from-primary to-secondary shadow-md hover:shadow-lg"
                                : ""
                            }`}
                            variant={plan.popular ? "default" : "outline"}
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Plans Showcase */}
              <Card className="border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-background to-blue-500/5 overflow-hidden">
                <CardContent className="p-10 sm:p-12 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_60%)]" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                      Start Free, Scale When Ready
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                      Every plan grows with your team. No hidden fees, no surprises — just the tools you need to collaborate effectively.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {planTags.map((tag) => (
                        <span key={tag} className="px-3.5 py-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {faqItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={index}
                      className="group border border-border/60 bg-card/50 hover:bg-accent/40 hover:border-primary/25 hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* FAQ Showcase */}
              <Card className="border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-blue-500/5 overflow-hidden">
                <CardContent className="p-10 sm:p-12 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)]" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                      <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                      Still Have Questions?
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                      Our support team is here to help. Reach out any time and we'll get back to you within 24 hours.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {faqTags.map((tag) => (
                        <span key={tag} className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
