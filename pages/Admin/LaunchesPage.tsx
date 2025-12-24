
import React, { useState, useEffect } from 'react';
import { MOCK_LEADS } from '../../constants';
// [NEW] Import context
import { useData } from '../../context/DataContext';

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export const LaunchesPage: React.FC = () => {
  // [NEW] Get books and settings from context
  const { books, settings, updateSettings } = useData();

  // Estados para as configurações (inicializados com valores do context)
  const [releaseDate, setReleaseDate] = useState(settings.launchDate || '2025-12-25T14:00');
  const [isPreLaunch, setIsPreLaunch] = useState(settings.isPreLaunch || false);
  const [launchBookId, setLaunchBookId] = useState(settings.launchBookId || '');
  const [launchPrice, setLaunchPrice] = useState(settings.launchPrice || '');

  // Update local state when settings invoke
  useEffect(() => {
    if (settings.launchDate) setReleaseDate(settings.launchDate);
    if (settings.isPreLaunch !== undefined) setIsPreLaunch(settings.isPreLaunch);
    if (settings.launchBookId) setLaunchBookId(settings.launchBookId);
    if (settings.launchPrice) setLaunchPrice(settings.launchPrice);
  }, [settings]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estado para o cronômetro
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  // Lógica do Cronômetro
  useEffect(() => {
    const calculateTime = () => {
      // ... (existing logic)
      const difference = +new Date(releaseDate) - +new Date();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          days: days.toString().padStart(2, '0'),
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });
      } else {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [releaseDate]);

  const handleSaveSettings = () => {
    setIsSaving(true);

    // Save to Context/Supabase
    updateSettings({
      launchDate: releaseDate,
      isPreLaunch: isPreLaunch,
      launchBookId: launchBookId,
      launchPrice: launchPrice
    });

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-10 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Gerenciamento de Lançamentos</h1>
          <p className="text-stone-500">Configure pré-lançamentos, metas e gerencie sua lista de espera.</p>
        </div>
        {saveSuccess && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Configurações salvas com sucesso!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-rhema-primary">tune</span>
              Configurações
            </h3>
            <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${isPreLaunch ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
              {isPreLaunch ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <div
            onClick={() => setIsPreLaunch(!isPreLaunch)}
            className={`p-6 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${isPreLaunch ? 'bg-rhema-primary/5 border-rhema-primary/20' : 'bg-stone-50 border-stone-100'
              }`}
          >
            <div>
              <p className="font-bold">Modo Pré-lançamento</p>
              <p className="text-xs text-stone-400">Habilita página de captura e oculta venda direta.</p>
            </div>
            <div className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isPreLaunch ? 'bg-rhema-primary shadow-rhema-primary/20' : 'bg-stone-300'
              }`}>
              <span className="material-symbols-outlined">{isPreLaunch ? 'check' : 'close'}</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Livro de Lançamento</label>
              <select
                className="w-full p-4 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rhema-primary/20"
                value={launchBookId}
                onChange={(e) => setLaunchBookId(e.target.value)}
              >
                <option value="">Selecione um livro...</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Preço de Lançamento</label>
              <input
                className="w-full p-4 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rhema-primary/20"
                placeholder="0,00"
                value={launchPrice}
                onChange={(e) => setLaunchPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Data de Liberação</label>
              <input
                type="datetime-local"
                className="w-full p-4 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rhema-primary/20"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full py-4 bg-rhema-primary text-white font-bold rounded-xl shadow-lg shadow-rhema-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-rhema-dark p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-between h-full">
          <div className="absolute top-0 right-0 p-20 bg-rhema-primary/10 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-rhema-primary uppercase tracking-widest mb-2">Visão do Usuário</p>
            <h3 className="text-2xl font-black">O Grande Lançamento</h3>
            <p className="text-gray-400 text-xs mt-1">Contagem regressiva no site principal.</p>
          </div>

          <div className="flex gap-2 relative z-10 mt-10">
            <div className="flex-1 bg-white/5 backdrop-blur-md p-4 rounded-xl text-center border border-white/5">
              <p className="text-2xl font-black text-rhema-primary">{timeLeft.days}</p>
              <p className="text-[8px] uppercase font-bold text-stone-500">Dias</p>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-md p-4 rounded-xl text-center border border-white/5">
              <p className="text-2xl font-black text-rhema-primary">{timeLeft.hours}</p>
              <p className="text-[8px] uppercase font-bold text-stone-500">Horas</p>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-md p-4 rounded-xl text-center border border-white/5">
              <p className="text-2xl font-black text-rhema-primary">{timeLeft.minutes}</p>
              <p className="text-[8px] uppercase font-bold text-stone-500">Minutos</p>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-md p-4 rounded-xl text-center border border-white/5">
              <p className="text-2xl font-black text-rhema-primary animate-pulse">{timeLeft.seconds}</p>
              <p className="text-[8px] uppercase font-bold text-stone-500">Seg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-8 border-b border-stone-50 flex justify-between items-center">
          <h3 className="font-bold">Lista de Espera <span className="text-stone-300 font-normal ml-2">{MOCK_LEADS.length} interessados</span></h3>
          <button className="px-6 py-2 bg-rhema-primary text-white text-xs font-bold rounded-lg shadow-lg hover:brightness-110 transition-all">Notificar Todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                <th className="p-6">Nome</th>
                <th className="p-6">Email</th>
                <th className="p-6">Data</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADS.map(lead => (
                <tr key={lead.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-all">
                  <td className="p-6 font-bold text-stone-800">{lead.name}</td>
                  <td className="p-6 text-sm text-stone-500">{lead.email}</td>
                  <td className="p-6 text-sm text-stone-500">{lead.registeredAt}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${lead.status === 'Pendente' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-stone-400 hover:text-rhema-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
