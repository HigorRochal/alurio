
import React, { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { analyzeImageAndGenerateCaption } from '../services/geminiService';
import { UserProfile, PostContent, ContentStatus } from '../types';

export const CreatePost: React.FC<{ user: UserProfile; onSave: (post: PostContent) => void; onNavigate: (path: string) => void }> = ({ user, onSave, onNavigate }) => {
  const [step, setStep] = useState<'setup' | 'loading' | 'result'>('setup');
  const [isCarousel, setIsCarousel] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ data: string, mimeType: string }[]>([]);
  const [postResult, setPostResult] = useState<PostContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playPlim = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); 
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("Áudio não disponível.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Explicitly cast to File[] to ensure the compiler recognizes the properties like .type
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    // Limite de 10 fotos para carrossel, ou 1 para post único
    const maxFiles = isCarousel ? 10 : 1;
    const allowedFiles = files.slice(0, maxFiles);

    const loadFiles = allowedFiles.map(file => {
      return new Promise<{ data: string, mimeType: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({ 
            data: event.target?.result as string, 
            mimeType: file.type 
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loadFiles).then(results => {
      setSelectedFiles(results);
    });
  };

  const handleGenerate = async () => {
    if (selectedFiles.length === 0) {
      alert("Selecione ao menos uma imagem.");
      return;
    }

    setIsLoading(true);
    setStep('loading');
    try {
      const post = await analyzeImageAndGenerateCaption(selectedFiles, user, description, isCarousel);
      setPostResult(post);
      playPlim();
      onSave(post);
      setStep('result');
    } catch (error) {
      alert("Erro ao analisar post.");
      setStep('setup');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'loading') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-pulse">
          <div className="w-24 h-24 bg-alurio-gradient rounded-[32px] flex items-center justify-center text-white text-4xl animate-bounce shadow-alurio">✨</div>
          <div>
              <h2 className="text-2xl font-bold text-alurio-gradient">
                {isCarousel ? 'Estruturando seu Carrossel...' : 'Analisando sua foto...'}
              </h2>
              <p className="text-gray-500 mt-2">IA detectando elementos visuais e gerando ganchos viscerais.</p>
          </div>
        </div>
      );
  }

  if (step === 'result' && postResult) {
    return (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 py-12 animate-in zoom-in-95 duration-500">
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-[40px] shadow-2xl aspect-square border-8 border-white overflow-hidden relative">
                    <img 
                      src={postResult.imageUrl} 
                      alt="Primeira Imagem" 
                      className="w-full h-full object-cover rounded-[32px]" 
                    />
                    {postResult.isCarousel && (
                      <div className="absolute top-8 right-8 bg-black/60 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md">
                        Carrossel • {postResult.imageUrls?.length} imagens
                      </div>
                    )}
                </div>
                
                {postResult.isCarousel && postResult.slides && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Conteúdo por Slide</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {postResult.slides.map((slide) => (
                        <div key={slide.slideNumber} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase">Slide {slide.slideNumber}</span>
                          </div>
                          <p className="text-gray-900 font-bold leading-relaxed">{slide.text}</p>
                          <p className="text-xs text-gray-500 italic">Dica Visual: {slide.visualAdvice}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="secondary" fullWidth onClick={() => {
                     const link = document.createElement('a');
                     link.href = postResult.imageUrl || '';
                     link.download = 'alurio-post.png';
                     link.click();
                  }} className="h-14">📥 Baixar Imagem Principal</Button>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
                    <section>
                        <h2 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3 bg-purple-50 w-fit px-2 py-1 rounded">Legenda Estratégica</h2>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed font-medium text-lg">{postResult.caption}</p>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3"># Hashtags</h2>
                        <div className="flex flex-wrap gap-2">
                            {postResult.hashtags.map((h, i) => (
                                <span key={i} className="text-[10px] px-3 py-2 bg-gray-50 text-gray-500 rounded-xl font-bold border border-gray-100">#{h}</span>
                            ))}
                        </div>
                    </section>

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                        <section>
                            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">🎵 Áudios Recomendados</h2>
                            <ul className="space-y-2">
                                {postResult.musicSuggestions.map((m, i) => (
                                    <li key={i} className="text-xs text-gray-600 font-medium p-2 bg-blue-50 rounded-lg">✨ {m}</li>
                                ))}
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">💡 Próximos Conteúdos</h2>
                            <ul className="space-y-2">
                                {postResult.nextImageTips.map((t, i) => (
                                    <li key={i} className="text-xs text-gray-600 font-medium p-2 bg-emerald-50 rounded-lg">👉 {t}</li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button onClick={() => onNavigate('dashboard')} className="flex-1 h-16 shadow-xl text-lg font-bold">Finalizar e Voltar</Button>
                    <Button onClick={() => onNavigate('library')} variant="tertiary" className="flex-1 h-16 border-gray-200">Ver Biblioteca</Button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-10 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Análise de Post Viral</h1>
        <p className="text-gray-500">IA especialista para criar posts e carrosséis magnéticos que convertem.</p>
      </div>

      <div className="bg-white p-10 md:p-12 rounded-[48px] shadow-xl border border-gray-100 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
          <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Tipo de Conteúdo</label>
              <div className="flex gap-4 p-1 bg-gray-50 rounded-[24px] border border-gray-100">
                  <button 
                    onClick={() => { setIsCarousel(false); setSelectedFiles([]); }}
                    className={`flex-1 py-4 rounded-[20px] text-sm font-bold transition-all ${!isCarousel ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}
                  >
                    Imagem Única
                  </button>
                  <button 
                    onClick={() => { setIsCarousel(true); setSelectedFiles([]); }}
                    className={`flex-1 py-4 rounded-[20px] text-sm font-bold transition-all ${isCarousel ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}
                  >
                    Carrossel 📚
                  </button>
              </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 p-6 rounded-[32px] text-center">
              <span className="text-3xl mb-2 block">{isCarousel ? '📚' : '📸'}</span>
              <p className="text-purple-900 font-bold text-sm">Formato Ideal: 1:1 (Quadrado)</p>
              <p className="text-purple-600 text-xs mt-1">
                {isCarousel ? 'Selecione até 10 imagens para um carrossel completo.' : 'Fotos quadradas geram melhor alcance no feed.'}
              </p>
          </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                Qual a ideia principal do post?
              </label>
              <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: 5 erros que te impedem de emagrecer..."
                  className="w-full h-32 p-8 rounded-[32px] bg-gray-50 border border-transparent outline-none focus:border-purple-500 transition-all font-medium text-gray-700 text-lg placeholder:text-gray-300 resize-none"
              />
           </div>
           
          <div className="space-y-6 text-center">
            <input 
              type="file" 
              accept="image/*" 
              multiple={isCarousel}
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden"
            />
            
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md relative">
                    <img src={file.data} className="w-full h-full object-cover" />
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-[8px] w-4 h-4 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button 
              variant="secondary"
              onClick={() => fileInputRef.current?.click()} 
              fullWidth 
              className="h-16 text-lg font-bold border-dashed"
            >
              {selectedFiles.length > 0 ? `Alterar Fotos (${selectedFiles.length})` : '📁 Selecionar Imagem(ns)'}
            </Button>

            <Button 
              onClick={handleGenerate} 
              isLoading={isLoading} 
              fullWidth 
              disabled={selectedFiles.length === 0}
              className="h-18 text-xl font-bold shadow-alurio"
            >
              🚀 Criar {isCarousel ? 'Carrossel' : 'Post'} Estratégico
            </Button>
          </div>
           
           <button onClick={() => onNavigate('dashboard')} className="w-full text-[10px] font-black text-gray-400 hover:text-purple-600 uppercase tracking-widest transition-colors py-4">
             ← Voltar ao Início
           </button>
      </div>
    </div>
  );
};
