
import React, { useState } from 'react';
import { BabyProfile } from '../types';
import { Baby, Sparkles, Heart } from 'lucide-react';

interface SetupProps {
  onComplete: (profile: BabyProfile) => void;
}

const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;
    onComplete({ name, birthDate });
  };

  const isFuture = birthDate ? new Date(birthDate) > new Date() : false;

  return (
    <div className="min-h-screen bg-[#fff9f7] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-rose-100 p-8 border border-rose-50">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-rose-50 rounded-2xl mb-4">
            {isFuture ? <Heart className="w-12 h-12 text-rose-500" /> : <Baby className="w-12 h-12 text-rose-500" />}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welkom bij BabyGids</h1>
          <p className="text-gray-500">
            {isFuture ? 'Bereid je voor op de komst van je kleintje.' : 'Laten we beginnen met de details van je baby.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Naam van je {isFuture ? 'kindje' : 'baby'}
            </label>
            <input 
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none text-gray-900"
              placeholder={isFuture ? "Bijv. Toekomstige Lucas" : "Bijv. Lucas"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {isFuture ? 'Uitgerekende datum' : 'Geboortedatum'}
            </label>
            <input 
              type="date"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none text-gray-900"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Dashboard</span>
            <Sparkles className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-8 text-xs text-center text-gray-400">
          De app past zich automatisch aan op basis van de datum.
        </p>
      </div>
    </div>
  );
};

export default Setup;
