
import React, { useState, useEffect } from 'react';
import { BabyProfile, ChecklistItem, AppTheme, UserSettings } from './types';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import SettingsModal from './components/SettingsModal';
import { 
  Baby, 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  MessageSquare,
  Settings as SettingsIcon,
  X
} from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist' | 'agenda' | 'chat'>('dashboard');
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'standard',
    apiKey: '',
    preferredModel: 'gemini-3-flash-preview'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('baby_profile');
    const savedChecklist = localStorage.getItem('baby_checklist');
    const savedSettings = localStorage.getItem('baby_settings');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      document.body.setAttribute('data-theme', parsedSettings.theme);
    }
    
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    } else {
      const initialList = [
        { id: '1', text: 'Geboorteaangifte doen', completed: false },
        { id: '2', text: 'Kraamzorg regelen', completed: false },
        { id: '3', text: 'Hielprik en gehoortest', completed: false },
        { id: '4', text: 'Verzekering aanpassen', completed: false },
      ];
      setChecklist(initialList);
    }
    setIsLoading(false);
  }, []);

  const handleUpdateProfile = (newProfile: BabyProfile) => {
    setProfile(newProfile);
    localStorage.setItem('baby_profile', JSON.stringify(newProfile));
  };

  const handleUpdateChecklist = (newList: ChecklistItem[]) => {
    setChecklist(newList);
    localStorage.setItem('baby_checklist', JSON.stringify(newList));
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('baby_settings', JSON.stringify(newSettings));
    document.body.setAttribute('data-theme', newSettings.theme);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center themed-accent-text font-bold">Laden...</div>;

  if (!profile) {
    return <Setup onComplete={handleUpdateProfile} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <nav className="hidden md:flex flex-col w-64 themed-sidebar p-6 space-y-4">
        <div className="flex items-center space-x-2 mb-8">
          <div className="themed-accent-soft-bg p-2 rounded-xl">
            <Baby className="w-8 h-8 themed-accent-text" />
          </div>
          <h1 className="text-2xl font-bold">BabyGids</h1>
        </div>
        
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={<LayoutDashboard />}
          label="Dashboard"
        />
        <NavButton 
          active={activeTab === 'checklist'} 
          onClick={() => setActiveTab('checklist')}
          icon={<CheckSquare />}
          label="Checklist"
        />
        <NavButton 
          active={activeTab === 'agenda'} 
          onClick={() => setActiveTab('agenda')}
          icon={<Calendar />}
          label="4-Weken Agenda"
        />
        <NavButton 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')}
          icon={<MessageSquare />}
          label="AI Advies"
        />
        
        <div className="mt-auto pt-6 border-t border-gray-100">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center space-x-3 themed-text-muted hover:themed-accent-text transition-colors w-full px-4 py-2"
          >
            <SettingsIcon size={20} />
            <span className="font-medium text-sm">Instellingen</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <Dashboard 
          activeTab={activeTab} 
          profile={profile} 
          checklist={checklist}
          onUpdateChecklist={handleUpdateChecklist}
        />
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          settings={settings} 
          onSave={handleUpdateSettings} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white themed-card border-t flex justify-around py-3 px-2 z-50">
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} />
        <MobileNavButton active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')} icon={<CheckSquare />} />
        <MobileNavButton active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} icon={<Calendar />} />
        <MobileNavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare />} />
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 themed-text-muted"><SettingsIcon size={24} /></button>
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'themed-accent-bg text-white shadow-lg' : 'themed-text-muted hover:themed-accent-soft-bg'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    <span className="font-semibold">{label}</span>
  </button>
);

const MobileNavButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-full transition-colors ${
      active ? 'themed-accent-text themed-accent-soft-bg' : 'themed-text-muted'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 24 })}
  </button>
);

export default App;
