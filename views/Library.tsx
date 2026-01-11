
import React, { useState } from 'react';
import { LibraryItem, ContentType, ScriptContent, PostContent } from '../types';
import { jsPDF } from 'jspdf';
import { Button } from '../components/Button';

interface LibraryProps {
  items: LibraryItem[];
  onToggleUsed: (id: string) => void;
}

export const Library: React.FC<LibraryProps> = ({ items, onToggleUsed }) => {
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const downloadScriptPDF = (script: ScriptContent) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(139, 92, 246); // Purple
    doc.text('alurio.io', margin, y);
    
    y += 15;
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39); // Gray 900
    doc.text(script.title, margin, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray 500
    doc.text(`Duração: ${script.duration}s | Formato: ${script.length}`, margin, y);
    
    y += 15;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, 190, y);
    
    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 92, 246);
    doc.text('GANCHO (HOOK):', margin, y);
    
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    const hookLines = doc.splitTextToSize(`Fala: ${script.hook.text}`, 170);
    doc.text(hookLines, margin, y);
    y += (hookLines.length * 6) + 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Ação: ${script.hook.action}`, margin, y);

    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 92, 246);
    doc.text('DESENVOLVIMENTO:', margin, y);
    
    script.development.forEach((block, index) => {
      y += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text(`Bloco #${index + 1}`, margin, y);
      
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      const devLines = doc.splitTextToSize(`Fala: ${block.text}`, 170);
      doc.text(devLines, margin, y);
      y += (devLines.length * 6) + 2;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Ação: ${block.action}`, margin, y);

      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 92, 246);
    doc.text('FECHAMENTO (CTA):', margin, y);
    
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    const ctaLines = doc.splitTextToSize(`Fala: ${script.cta.text}`, 170);
    doc.text(ctaLines, margin, y);
    y += (ctaLines.length * 6) + 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Ação: ${script.cta.action}`, margin, y);

    y += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text('DICAS DE GRAVAÇÃO:', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    script.tips.forEach(tip => {
      const tipLines = doc.splitTextToSize(`• ${tip}`, 170);
      doc.text(tipLines, margin, y);
      y += (tipLines.length * 6);
    });

    doc.save(`alurio-roteiro-${script.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">📚 Biblioteca</h1>
        <div className="flex items-center gap-2">
            <div className="bg-white border rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm focus-within:ring-2 ring-purple-500/20 transition-all w-full md:w-auto">
                <span className="text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    className="outline-none text-sm w-full md:w-64 bg-transparent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-[20px] w-fit border border-gray-200">
        {['all', ContentType.SCRIPT, ContentType.POST].map(f => (
            <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-8 py-3 rounded-[16px] text-sm font-bold capitalize transition-all ${
                    filter === f ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {f === 'all' ? 'Todos' : (f === ContentType.SCRIPT ? 'Roteiros' : 'Posts')}
            </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-gray-100">
              <span className="text-7xl mb-8 block">📂</span>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Sua biblioteca está vazia</h3>
              <p className="text-gray-400 mb-10 max-w-xs mx-auto">Transforme suas ideias em conteúdos virais e eles aparecerão aqui!</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map(item => (
                  <div key={item.id} className={`bg-white rounded-[32px] p-8 border-2 transition-all shadow-sm hover:shadow-2xl flex flex-col ${item.isUsed ? 'border-green-100 opacity-75' : 'border-transparent'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                                {item.type === ContentType.SCRIPT ? '🎬' : '📱'}
                            </span>
                            {item.isUsed && (
                                <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Publicado</span>
                            )}
                        </div>
                        <button 
                            onClick={() => onToggleUsed(item.id)}
                            className={`text-[10px] font-black px-4 py-2 rounded-full border transition-all uppercase tracking-widest ${
                                item.isUsed ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:border-purple-500 hover:text-purple-500'
                            }`}
                        >
                            {item.isUsed ? '✓ Usado' : 'Marcar Usado'}
                        </button>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 mb-2 truncate leading-tight text-xl">
                        {item.title}
                        {item.type === ContentType.POST && (item as PostContent).isCarousel && ' 📚'}
                      </h4>
                      <p className="text-[10px] text-gray-400 mb-6 uppercase font-black tracking-widest">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
                      
                      {item.type === ContentType.POST && (item as PostContent).imageUrl && (
                          <div className="aspect-square rounded-[24px] overflow-hidden mb-6 bg-gray-50 border border-gray-100 shadow-inner relative">
                             <img src={(item as PostContent).imageUrl} alt="Conteúdo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                             {(item as PostContent).isCarousel && (
                                <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg text-[10px] font-bold backdrop-blur-sm">Carrossel</div>
                             )}
                          </div>
                      )}

                      <div className="mt-auto flex gap-2">
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className="flex-1 text-xs font-bold py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            Visualizar
                          </button>
                          {item.type === ContentType.SCRIPT && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    downloadScriptPDF(item as ScriptContent);
                                }}
                                className="px-4 py-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors"
                                title="Baixar PDF"
                            >
                                <span className="text-sm font-bold">PDF</span>
                            </button>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Modal de Visualização */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto">
           <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all z-10"
              >
                ✕
              </button>
              
              <div className="p-8 md:p-12 overflow-y-auto">
                 {selectedItem.type === ContentType.SCRIPT ? (
                   <div className="space-y-8">
                     <div className="text-center">
                        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">Roteiro Viral</span>
                        <h2 className="text-3xl font-bold text-gray-900">{selectedItem.title}</h2>
                        <p className="text-sm text-gray-400 mt-2">Duração estimada: {(selectedItem as ScriptContent).duration}s</p>
                     </div>

                     <div className="space-y-6">
                        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
                           <h3 className="text-xs font-black text-purple-600 uppercase mb-3">🪝 Gancho (Hook)</h3>
                           <p className="text-lg font-medium text-purple-950">{(selectedItem as ScriptContent).hook.text}</p>
                           <p className="text-xs text-purple-400 mt-2 italic font-medium">Ação: "{(selectedItem as ScriptContent).hook.action}"</p>
                        </div>

                        <div className="space-y-4">
                           <h3 className="text-xs font-black text-gray-400 uppercase ml-2">📝 Desenvolvimento</h3>
                           {(selectedItem as ScriptContent).development.map((block, i) => (
                             <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <p className="font-medium text-gray-800">{block.text}</p>
                                <p className="text-xs text-amber-600 mt-2 italic font-medium">Ação: "{block.action}"</p>
                             </div>
                           ))}
                        </div>

                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                           <h3 className="text-xs font-black text-amber-600 uppercase mb-3">🎯 Fechamento (CTA)</h3>
                           <p className="font-medium text-amber-950">{(selectedItem as ScriptContent).cta.text}</p>
                           <p className="text-xs text-amber-400 mt-2 italic font-medium">Ação: "{(selectedItem as ScriptContent).cta.action}"</p>
                        </div>
                     </div>
                   </div>
                 ) : (
                   <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="aspect-square rounded-[32px] overflow-hidden bg-gray-100 shadow-inner">
                           <img src={(selectedItem as PostContent).imageUrl} className="w-full h-full object-cover" />
                        </div>
                        
                        {(selectedItem as PostContent).isCarousel && (selectedItem as PostContent).slides && (
                          <div className="space-y-3">
                             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Estrutura do Carrossel</h3>
                             <div className="space-y-2">
                                {(selectedItem as PostContent).slides?.map(slide => (
                                  <div key={slide.slideNumber} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-purple-600 mb-1">Slide {slide.slideNumber}</p>
                                    <p className="text-xs font-bold text-gray-900">{slide.text}</p>
                                    <p className="text-[9px] text-gray-400 italic mt-1">{slide.visualAdvice}</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                         <div>
                            <h3 className="text-xs font-black text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest mb-4">Legenda Gerada</h3>
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{(selectedItem as PostContent).caption}</p>
                         </div>
                         <div>
                            <h3 className="text-xs font-black text-gray-400 uppercase mb-3"># Hashtags</h3>
                            <div className="flex flex-wrap gap-2">
                               {(selectedItem as PostContent).hashtags.map((h, i) => (
                                 <span key={i} className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-500 rounded-lg">#{h}</span>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-8 border-t bg-gray-50 rounded-b-[40px] flex gap-4">
                 {selectedItem.type === ContentType.SCRIPT && (
                    <Button 
                        onClick={() => downloadScriptPDF(selectedItem as ScriptContent)} 
                        fullWidth 
                        className="h-14 font-bold"
                    >
                        📥 Baixar Roteiro como PDF
                    </Button>
                 )}
                 <Button variant="tertiary" fullWidth onClick={() => setSelectedItem(null)} className="h-14 font-bold">Fechar</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
