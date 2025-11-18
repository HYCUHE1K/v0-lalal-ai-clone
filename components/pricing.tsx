import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const plans = [
  {
    name: 'Lite',
    price: '$15',
    period: '/month',
    description: 'Perfect for hobbyists',
    features: [
      '90 minutes of processing',
      'Up to 5 stem separation',
      'Standard quality output',
      'Email support',
    ],
  },
  {
    name: 'Plus',
    price: '$25',
    period: '/month',
    description: 'For serious creators',
    features: [
      '300 minutes of processing',
      'Up to 10 stem separation',
      'Lossless quality output',
      'Batch processing',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Pro',
    price: '$45',
    period: '/month',
    description: 'For professionals',
    features: [
      '900 minutes of processing',
      'Up to 10 stem separation',
      'Lossless quality output',
      'Batch processing',
      'API access',
      'Priority support',
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="container mx-auto px-4 py-24 bg-muted/30">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-muted-foreground">
          Choose the plan that fits your needs. No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`p-8 bg-card border-2 ${
              plan.popular ? 'border-accent shadow-lg scale-105' : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <Button
              className={`w-full mb-6 ${
                plan.popular
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
              }`}
            >
              Get Started
            </Button>
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  )
}
