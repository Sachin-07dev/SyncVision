import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free', price: '$0', description: 'Perfect for trying out ExceliBoard', popular: false, cta: 'Get Started',
    features: ['1 collaborative board', 'Basic drawing tools', 'Up to 3 participants', '24-hour session history', 'Community support'],
  },
  {
    name: 'Pro', price: '$12', description: 'For individuals and small teams', popular: true, cta: 'Start Pro Trial',
    features: ['Unlimited boards', 'All drawing tools + templates', 'Up to 15 participants', 'HD video conferencing', 'AI code analysis', '30-day session history', 'Priority support', 'Export to PDF/PNG'],
  },
  {
    name: 'Enterprise', price: '$49', description: 'For large teams and organizations', popular: false, cta: 'Contact Sales',
    features: ['Everything in Pro', 'Unlimited participants', 'Advanced AI features', 'Custom integrations', 'SSO & advanced security', 'Unlimited history', 'Dedicated support', 'Custom training', 'SLA guarantee'],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">Simple, Transparent{' '}<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Pricing</span></h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Choose the plan that works best for you. All plans include a 14-day free trial.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative ${plan.popular ? 'border-primary shadow-glow scale-105 md:scale-110' : 'border-primary/10'} bg-card/50 backdrop-blur transition-all hover:scale-105`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="bg-gradient-primary px-4 py-1 rounded-full text-sm font-semibold shadow-glow">Most Popular</span></div>}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <div className="mb-6"><span className="text-5xl font-bold">{plan.price}</span><span className="text-muted-foreground ml-2">/month</span></div>
                  <Link href="/auth?mode=signup"><Button className={`w-full mb-6 ${plan.popular ? 'bg-gradient-primary shadow-glow' : 'bg-primary/10 hover:bg-primary/20'}`}>{plan.cta}</Button></Link>
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (<li key={idx} className="flex items-start gap-3"><Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" /><span className="text-sm">{feature}</span></li>))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: 'Can I change plans later?', a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences." },
                { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) and offer annual billing with a 20% discount.' },
                { q: 'Is there a free trial?', a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.' },
              ].map((faq, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur border-primary/10"><CardContent className="p-6"><h3 className="text-lg font-semibold mb-2">{faq.q}</h3><p className="text-muted-foreground">{faq.a}</p></CardContent></Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
