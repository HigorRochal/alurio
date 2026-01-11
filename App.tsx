
import React, { useState, useEffect } from 'react';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { CreateScript } from './views/CreateScript';
import { CreatePost } from './views/CreatePost';
import { Library } from './views/Library';
import { Pricing } from './views/Pricing';
import { Layout } from './components/Layout';
import { UserProfile, UserPlan, LibraryItem, ContentType, ScriptContent, PostContent } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('alurio_user');
    const savedLibrary = localStorage.getItem('alurio_library');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedLibrary) setLibraryItems(JSON.parse(savedLibrary));
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('alurio_user', JSON.stringify(profile));
  };

  const handleSaveToLibrary = (content: ScriptContent | PostContent) => {
    const type = 'hook' in content ? ContentType.SCRIPT : ContentType.POST;
    const newItem = { ...content, type } as LibraryItem;
    
    setLibraryItems(prev => {
      // Evitar duplicatas caso o auto-save dispare múltiplas vezes
      if (prev.find(i => i.id === newItem.id)) return prev;
      const updated = [newItem, ...prev];
      localStorage.setItem('alurio_library', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleUsed = (id: string) => {
    const updated = libraryItems.map(item => 
      item.id === id ? { ...item, isUsed: !item.isUsed } : item
    );
    setLibraryItems(updated);
    localStorage.setItem('alurio_library', JSON.stringify(updated));
  };

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard':
        return <Dashboard user={user} libraryItems={libraryItems} onNavigate={setCurrentPath} />;
      case 'script':
        return <CreateScript user={user} onSave={handleSaveToLibrary} onNavigate={setCurrentPath} />;
      case 'post':
        return <CreatePost user={user} onSave={handleSaveToLibrary} onNavigate={setCurrentPath} />;
      case 'library':
        return <Library items={libraryItems} onToggleUsed={handleToggleUsed} />;
      case 'pricing':
        return <Pricing />;
      default:
        return <Dashboard user={user} libraryItems={libraryItems} onNavigate={setCurrentPath} />;
    }
  };

  return (
    <Layout user={user} currentPath={currentPath} onNavigate={setCurrentPath}>
      {renderContent()}
    </Layout>
  );
};

export default App;
