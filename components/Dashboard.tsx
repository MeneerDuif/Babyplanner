
import React, { useState, useEffect } from 'react';
import { BabyProfile, ChecklistItem, AgendaEvent, AIResponse } from '../types';
import { generateAgenda, askBabyQuestion } from '../services/geminiService';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ChevronRight, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Send,
  Heart,
  ArrowRight,
  Clock
} from 'lucide-react';

interface DashboardProps {
  activeTab: string;
  profile: BabyProfile;
  checklist: ChecklistItem[];
  onUpdateChecklist: (list: ChecklistItem[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, profile, checklist, onUpdateChecklist }) => {
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [isAgendaLoading, setIsAgendaLoading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState<AIResponse | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(4);

  const birthDate = new Date(profile.birthDate);
  const now = new Date();
  const isPregnant = birthDate > now;

  const getStatusDisplay = () => {
    if (isPregnant) {
      const diffTime = birthDate.getTime() - now.getTime();
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      const weeksPregnant = 40 - diffWeeks;
      return { 
        current: weeksPregnant,
        label: `${weeksPregnant} weken zwanger`, 
        sub: `Nog ongeveer ${diffWeeks} weken tot de uitgerekende datum`,
        icon: <Heart className="themed-accent-text" size={20} />
      };
    } else {
      const diffTime = now.getTime() - birthDate.getTime();
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      return { 
        current: diffWeeks,
        label: `${diffWeeks} weken oud`, 
        sub: `Geboren op ${birthDate.toLocaleDateString('nl-NL')}`,
        icon: <Calendar className="themed-accent-text" size={20} />
      };
    }
  };

  const status = getStatusDisplay();

  const handleGenerateAgenda = async () => {
    setIsAgendaLoading(true);
    const result = await generateAgenda(profile.birthDate, selectedDuration);
    setAgenda(result);
    localStorage.setItem('baby_agenda', JSON.stringify(result));
    localStorage.setItem('baby_agenda_duration', selectedDuration.toString());
    setIsAgendaLoading(false);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;
    setIsChatLoading(true);
    const result = await askBabyQuestion(chatQuestion, profile.birthDate);
    setChatResponse(result);
    setIsChatLoading(false);
  };

  useEffect(() => {
    const savedAgenda = localStorage.getItem('baby_agenda');
    const savedDuration = localStorage.getItem('baby_agenda_duration');
    if (savedAgenda) setAgenda(JSON.parse(savedAgenda));
    if (savedDuration) setSelectedDuration(parseInt(savedDuration));
  }, []);

  const toggleChecklist = (id: string) => {
    const newList = checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateChecklist(newList);
  };

  if (activeTab === 'dashboard') {
    return (
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {isPregnant ? `Bijna zover, ${profile.name}! ✨` : `Hallo, ouder van ${profile.name}! 👋`}
            </h2>
            <p className="themed-text-muted mt-1">Status: <span className="themed-accent-text font-bold">{status.label}</span></p>
          </div>
          <div className="themed-card px-4 py-2 shadow-sm flex items-center space-x-2">
            {status.icon}
            <span className="text-sm font-medium themed-text-muted italic">{status.sub}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="themed-card p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">To-do Lijst</h3>
              <span className="text-xs themed-accent-soft-bg themed-accent-text px-2 py-1 rounded-full font-bold">
                {checklist.filter(i => i.completed).length} / {checklist.length}
              </span>
            </div>
            <div className="space-y-3 flex-1">
              {checklist.slice(0, 4).map(item => (
                <button 
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-center space-x-3 w-full text-left p-2 rounded-xl hover:themed-accent-soft-bg transition-colors group"
                >
                  {item.completed ? (
                    <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                  ) : (
                    <Circle className="themed-text-muted group-hover:themed-accent-text shrink-0" size={20} />
                  )}
                  <span className={`text-sm ${item.completed ? 'themed-text-muted line-through' : 'font-medium'}`}>{item.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="themed-card p-6 shadow-sm themed-accent-soft-bg/30">
            <div className="flex items-center space-x-2 mb-4">
              <div className="themed-accent-bg p-2 rounded-lg">
                <Sparkles className="text-white" size={18} />
              </div>
              <h3 className="font-bold text-lg">AI Advies</h3>
            </div>
            <p className="text-sm themed-text-muted mb-6">
              {isPregnant 
                ? "Vraag over zwangerschapskwaaltjes of de vluchttas?" 
                : "Vraag over slaap, voeding of ontwikkeling?"}
            </p>
          </div>

          <div className="themed-card p-6 shadow-sm">
             <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{isPregnant ? "Plan" : "Komende Weken"}</h3>
              <Calendar className="themed-text-muted opacity-50" size={20} />
            </div>
            {agenda.length > 0 ? (
               <div className="space-y-4">
                 {agenda.slice(0, 2).map((event, idx) => (
                   <div key={idx} className="border-l-2 themed-accent-text pl-4 py-1">
                      <p className="text-xs font-bold themed-accent-text uppercase tracking-wider">Week {event.week}</p>
                      <h4 className="text-sm font-bold">{event.title}</h4>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-sm themed-text-muted mb-3 italic">Geen planning gegenereerd</p>
                <button onClick={handleGenerateAgenda} className="text-xs themed-accent-bg text-white px-4 py-2 rounded-full font-bold shadow-sm">Maak planning</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'checklist') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="themed-card p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
             <CheckCircle2 className="mr-2 themed-accent-text" /> {isPregnant ? 'Voorbereiding Checklist' : 'Jouw Checklist'}
          </h2>
          <div className="space-y-4">
            {checklist.map(item => (
               <div 
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`flex items-center p-4 cursor-pointer transition-all border ${
                  item.completed ? 'themed-accent-soft-bg opacity-70' : 'themed-card shadow-sm hover:themed-accent-soft-bg'
                }`}
                style={{ borderRadius: 'var(--radius-card)', borderWidth: 'var(--border-width)' }}
              >
                {item.completed ? (
                  <CheckCircle2 className="text-green-500 mr-4 shrink-0" size={24} />
                ) : (
                  <Circle className="themed-accent-text opacity-40 mr-4 shrink-0" size={24} />
                )}
                <span className={`text-lg ${item.completed ? 'themed-text-muted line-through' : 'font-medium'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t themed-border">
             <form className="flex space-x-2" onSubmit={(e) => {
               e.preventDefault();
               const form = e.target as HTMLFormElement;
               const input = form.elements.namedItem('task') as HTMLInputElement;
               if (input.value) {
                 onUpdateChecklist([...checklist, { id: Date.now().toString(), text: input.value, completed: false }]);
                 input.value = '';
               }
             }}>
               <input 
                name="task"
                type="text" 
                placeholder="Voeg item toe..." 
                className="flex-1 px-4 py-3 rounded-xl themed-card outline-none"
               />
               <button type="submit" className="themed-accent-bg text-white px-6 py-2 rounded-xl font-bold">Voeg toe</button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'agenda') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="themed-card p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold">{isPregnant ? 'Zwangerschap Planning' : 'Agenda'}</h2>
            <div className="flex items-center justify-center md:justify-start mt-2 space-x-3 themed-text-muted">
               <span className="font-bold themed-accent-text">Nu: Week {status.current}</span>
               <ArrowRight size={16} />
               <span className="themed-accent-soft-bg px-3 py-1 rounded-lg text-sm font-semibold themed-accent-text">
                 Tot Week {status.current + selectedDuration}
               </span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex bg-gray-100 p-1 rounded-2xl themed-card">
              {[4, 6, 8].map(weeks => (
                <button
                  key={weeks}
                  onClick={() => setSelectedDuration(weeks)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedDuration === weeks 
                      ? 'themed-accent-bg text-white shadow-md' 
                      : 'themed-text-muted hover:bg-white/50'
                  }`}
                >
                  {weeks} Weken
                </button>
              ))}
            </div>
            <button 
              onClick={handleGenerateAgenda} 
              disabled={isAgendaLoading}
              className={`w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all ${
                isAgendaLoading ? 'bg-gray-400 cursor-not-allowed' : 'themed-accent-bg hover:scale-105 active:scale-95'
              }`}
            >
              <div className="flex items-center justify-center">
                {isAgendaLoading ? 'Genereren...' : (
                  <>
                    <Sparkles size={18} className="mr-2" />
                    {agenda.length > 0 ? 'Update Planning' : 'Maak Planning'}
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agenda.map((item, idx) => (
            <div key={idx} className="themed-card p-8 shadow-sm hover:themed-accent-soft-bg transition-all relative overflow-hidden group min-h-[220px] flex flex-col">
               <div className="absolute -top-4 -right-4 w-24 h-24 themed-accent-soft-bg rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
               
               <div className="relative">
                 <div className="mb-4 inline-flex items-center px-4 py-1.5 themed-accent-bg text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-sm">
                    Week {item.week}
                 </div>
                 <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                 <p className="themed-text-muted text-base mb-8 leading-relaxed flex-1">{item.description}</p>
                 
                 <div className="pt-6 border-t themed-border flex items-center justify-between">
                   <a 
                     href={item.sourceUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center text-sm font-bold themed-accent-text hover:underline group/link"
                   >
                     Bekijk op {item.source} 
                     <ExternalLink size={14} className="ml-2" />
                   </a>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'chat') {
    return (
      <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
        <div className="themed-card p-6 rounded-t-3xl shadow-sm border-b-0">
          <h2 className="text-2xl font-bold flex items-center">
            <Sparkles className="mr-2 themed-accent-text" /> AI-Expert {isPregnant ? '(Zwangerschap)' : '(Baby)'}
          </h2>
          <p className="text-[10px] themed-text-muted mt-1 uppercase tracking-widest font-bold">Betrouwbare Bronnen</p>
        </div>

        <div className="flex-1 themed-card border-y-0 rounded-none overflow-y-auto p-6 space-y-6">
          {chatResponse ? (
            <div className="space-y-4">
              <div className="themed-accent-soft-bg themed-accent-text rounded-2xl p-4 font-medium self-end ml-12">
                {chatQuestion}
              </div>
              <div className="themed-card p-6 shadow-sm mr-12 relative">
                <div className="prose prose-sm leading-relaxed whitespace-pre-wrap">
                  {chatResponse.answer}
                </div>
                <div className="mt-6 pt-4 border-t themed-border space-y-2">
                  <p className="text-xs font-bold themed-text-muted uppercase">Bronnen:</p>
                  {chatResponse.sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center themed-accent-text text-sm hover:underline"
                    >
                      <ExternalLink size={14} className="mr-2" /> {s.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
               <MessageSquare size={64} className="themed-text-muted opacity-20" />
               <p className="themed-text-muted italic">
                 {isPregnant 
                   ? 'Vraag iets over je zwangerschap...' 
                   : 'Vraag iets over je baby...'}
               </p>
            </div>
          )}
        </div>

        <div className="p-4 themed-card rounded-b-3xl border-t-0 shadow-sm">
           <form onSubmit={handleAskQuestion} className="relative">
              <input 
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Stel je vraag..."
                className="w-full pl-4 pr-14 py-4 rounded-2xl themed-card bg-gray-50/10 focus:ring-2 focus:ring-rose-500 outline-none"
              />
              <button 
                type="submit"
                disabled={isChatLoading || !chatQuestion.trim()}
                className={`absolute right-2 top-2 p-3 rounded-xl ${
                  isChatLoading || !chatQuestion.trim() ? 'themed-text-muted' : 'themed-accent-bg text-white shadow-lg'
                }`}
              >
                <Send size={20} />
              </button>
           </form>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
