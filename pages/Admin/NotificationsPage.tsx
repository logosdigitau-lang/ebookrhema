
import React from 'react';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-stone-800 tracking-tight">Notificações Push</h1>
        <p className="text-stone-500">Engaje seus leitores enviando notificações diretamente para seus dispositivos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-8">
            {/* Fixed: Changed class to className */}
            <h3 className="font-bold flex items-center gap-2"><span className="material-symbols-outlined text-rhema-primary">send</span> Nova Notificação</h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Título da Mensagem</label>
                  <input className="w-full p-4 bg-stone-50 border-none rounded-xl" placeholder="Ex: Novo Ebook Disponível!" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Conteúdo</label>
                  <textarea rows={4} className="w-full p-4 bg-stone-50 border-none rounded-xl" placeholder="Escreva sua mensagem aqui..." />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Link de Ação</label>
                  <input className="w-full p-4 bg-stone-50 border-none rounded-xl" placeholder="https://ebookrhema.com/promo" />
               </div>
               <div className="flex gap-4 pt-6">
                  <button className="px-8 py-4 bg-stone-50 text-stone-500 font-bold rounded-xl border border-stone-100">Salvar Rascunho</button>
                  <button className="flex-1 px-8 py-4 bg-rhema-primary text-white font-bold rounded-xl shadow-xl">Enviar Notificação</button>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
               <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 text-center">Preview em tempo real</h4>
               <div className="relative mx-auto w-64 h-[450px] bg-stone-900 border-[10px] border-stone-800 rounded-[2.5rem] shadow-2xl overflow-hidden pt-12 px-4" style={{backgroundImage: "url('https://picsum.photos/seed/phone/400/800')", backgroundSize: 'cover'}}>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-stone-800 rounded-full"></div>
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl animate-bounce">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="size-4 bg-rhema-primary rounded-sm flex items-center justify-center text-white text-[8px] font-bold">R</div>
                        <span className="text-[8px] font-bold text-stone-800 uppercase">Ebook Rhema</span>
                        <span className="text-[8px] text-stone-400 ml-auto">Agora</span>
                     </div>
                     <h5 className="text-[10px] font-bold text-stone-900 mb-1">Título da Notificação</h5>
                     <p className="text-[9px] text-stone-600 line-clamp-2">Aqui aparecerá o conteúdo que você escrever no formulário ao lado.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
