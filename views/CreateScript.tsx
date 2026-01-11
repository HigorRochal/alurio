
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/Button';
import { generateScript } from '../services/geminiService';
import { UserProfile, ScriptContent, ScriptSegment } from '../types';

export const CreateScript: React.FC<{ user: UserProfile; onSave: (script: ScriptContent) => void; onNavigate: (path: string) => void }> = ({ user, onSave, onNavigate }) => {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [length, setLength] = useState<'Curto' | 'Médio' | 'Longo'>('Médio');
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<ScriptContent | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const handleGenerate = async () => {
    setStep('loading');
    try {
      const script = await generateScript(idea, user, length);
      setResult(script);
      onSave(script); // Auto-save persistido no App.tsx
      setStep('result');
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar roteiro. Tente novamente.");
      setStep('input');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.onstop = () => {
        setIdea("Transcrição de áudio sobre " + user.niche);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      alert("Microfone bloqueado.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ScriptSegmentUI: React.FC<{ label: string; segment: ScriptSegment; index?: number; isHook?: boolean }> = ({ label, segment, index, isHook }) => (
    <div className={`p-6 rounded-[24px] border-2 transition-all ${isHook ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100'} shadow-sm space-y-4`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${isHook ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
          {label} {index !== undefined ? `#${index + 1}` : ''}
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">🗣️ Fala:</p>
          <p className={`font-medium leading-relaxed ${isHook ? 'text-xl text-purple-900' : 'text-gray-900'}`}>{segment.text}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">🎭 Gesto/Ação:</p>
          <p className="text-amber-900 text-sm font-semibold italic">"{segment.action}"</p>
        </div>
      </div>
    </div>
  );

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-alurio-gradient rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-4 bg-alurio-gradient rounded-full animate-pulse flex items-center justify-center text-white">
                <svg className="w-12 h-12 animate-spin" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-alurio-gradient">✨ Roteirizando seu sucesso...</h2>
            <p className="text-gray-500 mt-2">Criando ganchos viscerais e gestos magnéticos.</p>
        </div>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95 duration-300 pb-20">
        <div className="flex items-center justify-between">
           <button onClick={() => setStep('input')} className="text-sm font-medium text-gray-400 hover:text-gray-900 flex items-center gap-2">
             ← Voltar
           </button>
           <div className="text-center">
             <h1 className="text-2xl font-bold text-gray-900">{result.title}</h1>
             <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">{result.length} • {result.duration} seg</p>
           </div>
           <div className="w-10"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ScriptSegmentUI label="Gancho Visceral" segment={result.hook} isHook />
            
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Desenvolvimento</h3>
              {result.development.map((seg, i) => (
                <ScriptSegmentUI key={i} label="Bloco" segment={seg} index={i} />
              ))}
            </div>

            <ScriptSegmentUI label="Fechamento (CTA)" segment={result.cta} />

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-xl">📈</span> Estratégia de Alcance
                </h3>
                <div className="grid gap-3">
                    {result.reachTips.map((tip, idx) => (
                        <div key={idx} className="flex gap-4 p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50 text-sm text-purple-900 font-medium">
                           <span className="font-black text-purple-300">0{idx + 1}</span>
                           <p>{tip}</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm sticky top-8">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-xl">🎥</span> Dicas de Gravação
                </h3>
                <div className="space-y-4">
                    {result.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                           <div className="w-6 h-6 rounded-full bg-purple-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-purple-600">{idx + 1}</div>
                           <p className="text-xs text-gray-600 leading-snug">{tip}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Próximos Temas</h3>
                  <div className="space-y-3">
                    {result.nextThemes.map((theme, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-purple-50 border border-purple-100 group">
                        <p className="text-xs font-bold text-purple-900 group-hover:text-purple-600 transition-colors">{theme.title}</p>
                        <p className="text-[10px] text-purple-500 mt-1">{theme.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 flex gap-4">
            <Button onClick={() => onNavigate('dashboard')} fullWidth className="h-16 shadow-2xl">Finalizar e Voltar</Button>
            <Button onClick={() => onNavigate('library')} variant="secondary" className="h-16 bg-white border-purple-200 text-purple-600">Ir para Biblioteca</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-10 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Roteirista Viral</h1>
        <p className="text-gray-500">Gere ganchos magnéticos e roteiros estruturados para viralizar.</p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl border border-gray-100 space-y-8">
        <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Duração do Conteúdo</label>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-[20px] border">
                {(['Curto', 'Médio', 'Longo'] as const).map(l => (
                    <button 
                        key={l}
                        onClick={() => setLength(l)}
                        className={`flex-1 py-4 rounded-[16px] text-sm font-bold transition-all ${
                            length === l ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {l}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex gap-4">
            <button 
                onClick={() => setMode('text')}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[24px] border-2 transition-all ${
                    mode === 'text' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 bg-gray-50 text-gray-400'
                }`}
            >
                <span className="text-2xl">✍️</span>
                <span className="font-bold text-[10px] uppercase tracking-widest">Texto</span>
            </button>
            <button 
                onClick={() => setMode('audio')}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[24px] border-2 transition-all ${
                    mode === 'audio' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 bg-gray-50 text-gray-400'
                }`}
            >
                <span className="text-2xl">🎤</span>
                <span className="font-bold text-[10px] uppercase tracking-widest">Áudio</span>
            </button>
        </div>

        {mode === 'text' ? (
            <textarea 
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ex: Como viralizar no Instagram sem dancinha..."
                className="w-full h-44 p-6 rounded-[24px] bg-gray-50 border border-transparent outline-none focus:border-purple-500 transition-all text-gray-700 font-medium placeholder:text-gray-300"
                maxLength={500}
            />
        ) : (
            <div className="flex flex-col items-center space-y-6 py-10 border-2 border-dashed border-purple-100 rounded-[32px] bg-purple-50/20">
                {isRecording && <div className="text-red-500 font-mono text-3xl font-bold animate-pulse">{formatTime(recordingTime)}</div>}
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording ? 'bg-red-500 shadow-2xl scale-110' : 'bg-alurio-gradient shadow-alurio'
                    }`}
                >
                    {isRecording ? <div className="w-10 h-10 bg-white rounded-lg" /> : <span className="text-4xl text-white">🎤</span>}
                </button>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isRecording ? 'Gravando voz...' : 'Toque para falar'}</p>
            </div>
        )}

        <Button onClick={handleGenerate} disabled={isRecording || idea.length < 5} fullWidth className="h-18 text-lg font-bold">
            🚀 Gerar Roteiro Estratégico
        </Button>
      </div>
    </div>
  );
};
