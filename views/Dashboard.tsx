
import React from 'react';
import { UserProfile, LibraryItem, ContentType } from '../types';
import { Button } from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: UserProfile;
  libraryItems: LibraryItem[];
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, libraryItems, onNavigate }) => {
  const scriptsCount = libraryItems.filter(i => i.type === ContentType.SCRIPT).length;
  const postsCount = libraryItems.filter(i => i.type === ContentType.POST).length;
  const publishedCount = libraryItems.filter(i => i.isUsed).length;

  const stats = [
    { label: 'Roteiros', value: scriptsCount, icon: '📝' },
    { label: 'Posts', value: postsCount, icon: '📱' },
    { label: 'Publicados', value: publishedCount, icon: '✅' },
    { label: 'Total Criado', value: libraryItems.length, icon: '📊' },
  ];

  const getLast4WeeksData = () => {
    const weeks = [
      { name: 'Sem 1', value: 0 },
      { name: 'Sem 2', value: 0 },
      { name: 'Sem 3', value: 0 },
      { name: 'Hoje', value: 0 },
    ];

    const now = new Date();
    libraryItems.forEach(item => {
      const createdDate = new Date(item.createdAt);
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) weeks[3].value++;
      else if (diffDays <= 14) weeks[2].value++;
      else if (diffDays <= 21) weeks[1].value++;
      else if (diffDays <= 28) weeks[0].value++;
    });

    return weeks;
  };

  const chartData = getLast4WeeksData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Olá, {user.name}! 👋</h1>
          <p className="text-gray-500 mt-1">Sua central estratégica de conteúdo.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Plano {user.plan}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-2xl mb-2 block">{stat.icon}</span>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-6">Sua Produção Semanal</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f3f4f6'}} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#8B5CF6' : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-alurio-gradient p-8 rounded-2xl text-white shadow-alurio relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Pronto para viralizar?</h3>
                <p className="text-white/80 text-sm mb-6 max-w-[200px]">Crie conteúdos viscerais que param o scroll.</p>
                <div className="flex gap-3">
                    <Button onClick={() => onNavigate('script')} className="bg-white text-purple-600 border-none hover:bg-gray-100 text-xs py-2 px-4">Novo Roteiro</Button>
                    <Button onClick={() => onNavigate('post')} className="bg-white/20 border-white/40 text-white hover:bg-white/30 text-xs py-2 px-4">Novo Post</Button>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recentes</h3>
              <button onClick={() => onNavigate('library')} className="text-xs text-purple-600 font-medium">Ver biblioteca</button>
            </div>
            <div className="space-y-3">
              {libraryItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                   <div className="flex items-center gap-3">
                      <span className="text-lg">{item.type === ContentType.SCRIPT ? '🎬' : '📱'}</span>
                      <div className="max-w-[150px]">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.isUsed ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {item.isUsed ? '✓ Usado' : 'Novo'}
                   </span>
                </div>
              ))}
              {libraryItems.length === 0 && <p className="text-xs text-gray-400 text-center py-4 italic">Nenhum conteúdo criado.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
