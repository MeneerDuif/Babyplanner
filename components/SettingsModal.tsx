
import React, { useState } from 'react';
import { UserSettings, AppTheme } from '../types';
import { X, Moon, Palette, Shield, Cpu, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    if(confirm('Weet je zeker dat je alle gegevens wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="themed-card w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:themed-accent-soft-bg rounded-full themed-text-muted transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <Shield className="mr-3 themed-accent-text" /> Instellingen
        </h2>

        <div className="space-y-8">
          {/* Theme Selector */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest themed-text-muted mb-4 flex items-center">
              <Palette size={16} className="mr-2" /> Visuele Stijl
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <ThemeOption 
                active={localSettings.theme === 'standard'} 
                onClick={() => setLocalSettings({...localSettings, theme: 'standard'})} 
                label="Standard"
                color="#f43f5e"
              />
              <ThemeOption 
                active={localSettings.theme === 'amoled'} 
                onClick={() => setLocalSettings({...localSettings, theme: 'amoled'})} 
                label="Amoled"
                color="#000000"
              />
              <ThemeOption 
                active={localSettings.theme === 'mondriaan'} 
                onClick={() => setLocalSettings({...localSettings, theme: 'mondriaan'})} 
                label="Mondriaan"
                color="#e61919"
              />
            </div>
          </section>

          {/* AI Config */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest themed-text-muted mb-4 flex items-center">
              <Cpu size={16} className="mr-2" /> AI Configuratie
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold themed-text-muted mb-2 uppercase">Google Gemini API Key</label>
                <input 
                  type="password"
                  placeholder="Voer je eigen API key in..."
                  className="w-full px-4 py-3 rounded-xl themed-card bg-gray-50/50 focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                  value={localSettings.apiKey}
                  onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
                />
                <p className="mt-1 text-[10px] themed-text-muted italic">Laat leeg om de standaard sleutel te gebruiken.</p>
              </div>

              <div>
                <label className="block text-xs font-bold themed-text-muted mb-2 uppercase">Model Keuze</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl themed-card bg-gray-50/50 focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                  value={localSettings.preferredModel}
                  onChange={(e) => setLocalSettings({...localSettings, preferredModel: e.target.value as any})}
                >
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Snel & Efficiënt)</option>
                  <option value="gemini-3-pro-preview">Gemini 3 Pro (Slimmer & Gedetailleerder)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="pt-6 border-t border-gray-100">
            <button 
              onClick={handleReset}
              className="flex items-center space-x-2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
            >
              <RefreshCw size={14} />
              <span>Reset alle app-gegevens</span>
            </button>
          </section>
        </div>

        <div className="mt-10 flex space-x-3">
          <button 
            onClick={handleSave}
            className="flex-1 themed-accent-bg text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            Instellingen Opslaan
          </button>
        </div>
      </div>
    </div>
  );
};

const ThemeOption = ({ active, onClick, label, color }: { active: boolean, onClick: () => void, label: string, color: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
      active ? 'border-rose-500 themed-accent-soft-bg' : 'border-gray-100 hover:border-gray-300'
    }`}
  >
    <div className="w-8 h-8 rounded-full mb-2 shadow-inner" style={{ backgroundColor: color }}></div>
    <span className="text-xs font-bold">{label}</span>
  </button>
);

export default SettingsModal;
