
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UserProfile, UserPlan } from '../types';
import { Logo } from '../constants';

export const Onboarding: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: 'usuario@exemplo.com',
    plan: UserPlan.PRO,
    niche: '',
    objective: '',
    tone: '',
    onboardingCompleted: true
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const niches = ['Marketing Digital', 'Desenvolvimento Pessoal', 'Saúde & Fitness', 'Finanças', 'Empreendedorismo', 'Beleza & Moda'];
  const objectives = ['Crescer em seguidores', 'Monetizar meu conteúdo', 'Construir autoridade', 'Vender infoprodutos'];
  const tones = ['Enérgico e Motivador', 'Calmo e Reflexivo', 'Educativo e Didático', 'Inspirador e Criativo'];

  const handleFinish = () => onComplete(profile);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
            <Logo size={56} showText={false} />
            <div className="flex items-center gap-2 mt-6">
                {[1,2,3,4].map(s => (
                    <div key={s} className={`h-2 w-10 rounded-full transition-all duration-300 ${s <= step ? 'bg-alurio-gradient' : 'bg-gray-100'}`} />
                ))}
            </div>
            <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Passo {step} de 4</p>
        </div>

        {step === 1 && (
          <div className="space-y-8 text-center animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold">Bem-vindo ao Alurio! 🚀</h1>
            <p className="text-gray-500 font-medium">Vamos personalizar sua jornada para criar conteúdos que dominam o feed.</p>
            <div className="space-y-6">
                <input 
                    type="text" 
                    placeholder="Como você se chama?" 
                    className="w-full p-6 rounded-[24px] bg-gray-50 border border-transparent outline-none focus:border-purple-500 text-lg font-medium"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
                <Button fullWidth onClick={nextStep} disabled={!profile.name} className="h-16 text-lg font-bold">Começar Agora →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Qual é o seu nicho?</h2>
                <p className="text-sm text-gray-500 font-medium">Isso personaliza nossas sugestões estratégicas.</p>
            </div>
            
            <div className="space-y-6">
                <input 
                    type="text" 
                    placeholder="Digite seu nicho (ex: Nutrição...)" 
                    className="w-full p-6 rounded-[24px] bg-gray-50 border outline-none focus:border-purple-500 text-lg font-medium"
                    value={profile.niche}
                    onChange={(e) => setProfile({...profile, niche: e.target.value})}
                />
                
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sugestões Populares:</p>
                    <div className="flex flex-wrap gap-2">
                        {niches.map(n => (
                            <button 
                                key={n}
                                onClick={() => setProfile({...profile, niche: n})}
                                className={`px-5 py-3 rounded-full text-xs font-bold transition-all ${
                                    profile.niche === n ? 'bg-purple-600 text-white shadow-xl scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-6">
                <Button variant="tertiary" fullWidth onClick={prevStep} className="h-14">Voltar</Button>
                <Button fullWidth onClick={nextStep} disabled={!profile.niche.trim()} className="h-14">Continuar</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-center">Qual seu maior objetivo?</h2>
            <div className="space-y-3">
                {objectives.map(o => (
                    <button 
                        key={o}
                        onClick={() => setProfile({...profile, objective: o})}
                        className={`w-full text-left p-6 rounded-[24px] border-2 transition-all font-bold text-sm ${
                            profile.objective === o ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-50 hover:border-gray-200 text-gray-500'
                        }`}
                    >
                        {o}
                    </button>
                ))}
            </div>
            <div className="flex gap-3 pt-6">
                <Button variant="tertiary" fullWidth onClick={prevStep} className="h-14">Voltar</Button>
                <Button fullWidth onClick={nextStep} disabled={!profile.objective} className="h-14">Continuar</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Como quer se comunicar?</h2>
                <p className="text-sm text-gray-500 font-medium">Descreva seu estilo ou escolha uma base.</p>
            </div>
            
            <div className="space-y-6">
                <textarea 
                    placeholder="Descreva detalhadamente seu tom de voz (ex: Gosto de ser engraçado mas com autoridade, usando gírias do marketing...)" 
                    className="w-full h-32 p-6 rounded-[24px] bg-gray-50 border border-transparent outline-none focus:border-purple-500 text-sm font-medium resize-none"
                    value={profile.tone}
                    onChange={(e) => setProfile({...profile, tone: e.target.value})}
                />

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estilos de Base:</p>
                    <div className="flex flex-wrap gap-2">
                        {tones.map(t => (
                            <button 
                                key={t}
                                onClick={() => setProfile({...profile, tone: t})}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${
                                    profile.tone === t ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-6">
                <Button variant="tertiary" fullWidth onClick={prevStep} className="h-14">Voltar</Button>
                <Button fullWidth onClick={handleFinish} disabled={!profile.tone.trim()} className="h-14 shadow-alurio">Finalizar ✨</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
