
import React from 'react';
import { Button } from '../components/Button';
import { UserPlan } from '../types';

export const Pricing: React.FC = () => {
  const plans = [
    {
      id: UserPlan.BASE,
      name: 'BASE',
      price: 'R$ 29,90',
      period: '/mês',
      features: ['15 posts mensais', '30 roteiros (45 seg)', 'Tendências IA básico', 'Suporte prioritário'],
      recommended: false
    },
    {
      id: UserPlan.PRO,
      name: 'PRO ⭐',
      price: 'R$ 49,90',
      period: '/mês',
      features: ['Posts ILIMITADOS', 'Roteiros ILIMITADOS (1 min+)', 'Estratégia avançada', 'Análise de fotos ilimitada', 'Suporte 24/7'],
      recommended: true
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Escolha seu plano 💎</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Invista na sua carreira de criador com as melhores ferramentas de IA do mercado.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className={`relative p-10 rounded-[40px] border-2 transition-all ${
                plan.recommended ? 'border-purple-500 bg-white shadow-2xl scale-105' : 'border-gray-100 bg-white'
            }`}
          >
            {plan.recommended && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-alurio-gradient text-white px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">MELHOR ESCOLHA</span>
            )}
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            <div className="flex items-baseline gap-2 mb-10">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-gray-400 font-medium">{plan.period}</span>
            </div>
            
            <ul className="space-y-5 mb-12">
                {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-4 text-sm font-medium text-gray-600">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                        {f}
                    </li>
                ))}
            </ul>

            <Button fullWidth variant={plan.recommended ? 'primary' : 'tertiary'} className="h-16 text-lg font-bold">
                {plan.recommended ? 'Começar Agora' : 'Assinar Plano'}
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center space-y-4 pt-10">
          <p className="text-xs font-bold text-gray-400 flex items-center justify-center gap-3 uppercase tracking-widest">
            🔒 Pagamento Seguro via Stripe • ✓ Cancele a qualquer momento
          </p>
      </div>
    </div>
  );
};
