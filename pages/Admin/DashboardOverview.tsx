import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';

import { Sale } from '../../types';

export const DashboardOverview: React.FC = () => {
   const { books, sales, settings, updateSale, deleteSale } = useData();
   const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

   const stats = useMemo(() => {
      // Only count 'Pago' (Paid) sales for revenue
      const totalRevenue = sales.reduce((acc, sale) => acc + (sale.status === 'Pago' ? sale.amount : 0), 0);
      const totalSales = sales.length;

      // Active books count
      const activeBooks = books.filter(b => b.status === 'active').length;

      // Check if there is an active launch configured in settings OR books with 'launch' status
      // Use a Set to avoid double counting if the configured launch also has 'launch' status
      const launchBookIds = new Set(books.filter(b => b.status === 'launch').map(b => b.id));
      if (settings.launchBookId) {
         launchBookIds.add(settings.launchBookId);
      }
      const launchCount = launchBookIds.size;

      return [
         {
            label: 'Receita Total',
            value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} `,
            icon: 'payments',
            trend: '',
            color: 'bg-green-500'
         },
         {
            label: 'Vendas Totais',
            value: totalSales.toString(),
            icon: 'shopping_bag',
            trend: '',
            color: 'bg-rhema-primary'
         },
         {
            label: 'Livros Ativos',
            value: activeBooks.toString(),
            icon: 'menu_book',
            trend: '',
            color: 'bg-blue-500'
         },
         {
            label: 'Lançamentos',
            value: launchCount.toString(),
            icon: 'rocket_launch',
            trend: settings.isPreLaunch ? 'Em Pré-lançamento' : '',
            color: 'bg-purple-500'
         },
      ];
   }, [books, sales, settings]);

   // Calculate performance per book (Sales + Stock)
   const bookPerformance = useMemo(() => {
      const salesMap: Record<string, { quantity: number, revenue: number }> = {};

      // Aggregate sales by title
      sales.forEach(sale => {
         if (sale.status === 'Pago') {
            sale.items.forEach(item => {
               if (!salesMap[item.title]) {
                  salesMap[item.title] = { quantity: 0, revenue: 0 };
               }
               salesMap[item.title].quantity += item.quantity;
               salesMap[item.title].revenue += item.price * item.quantity;
            });
         }
      });

      // Merge with books to get stock info
      return books
         .map(book => {
            const stats = salesMap[book.title] || { quantity: 0, revenue: 0 };
            return {
               id: book.id,
               title: book.title,
               coverUrl: book.coverUrl,
               stock: book.stock,
               format: book.format,
               sold: stats.quantity,
               revenue: stats.revenue
            };
         })
         .sort((a, b) => b.sold - a.sold); // Sort by sold quantity desc
   }, [sales, books]);

   return (
      <div className="space-y-10 animate-in fade-in duration-500">
         <div>
            <h1 className="text-3xl font-black text-stone-800">Visão Geral do Painel</h1>
            <p className="text-stone-500">Bem-vindo de volta, Admin. Veja o que está acontecendo na Rhema hoje.</p>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
               <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                     <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{s.label}</p>
                        <h3 className="text-2xl font-black mt-1">{s.value}</h3>
                     </div>
                     <div className={`size-12 rounded-xl flex items-center justify-center text-white ${s.color}`}>
                        <span className="material-symbols-outlined">{s.icon}</span>
                     </div>
                  </div>
                  {s.trend && <p className="mt-4 text-xs font-bold text-green-600 flex items-center gap-1">
                     <span className="material-symbols-outlined text-sm">trending_up</span> {s.trend}
                  </p>}
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-stone-100 min-h-[400px]">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="font-bold text-lg">Desempenho e Estoque</h3>
               </div>

               <div className="space-y-6">
                  {bookPerformance.length > 0 ? (
                     bookPerformance.map((book, i) => (
                        <div key={book.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                           <div className="flex items-center gap-4">
                              <div className="size-12 rounded-xl shadow-sm overflow-hidden border border-stone-200">
                                 <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                              </div>
                              <div>
                                 <p className="font-bold text-stone-800 line-clamp-1">{book.title}</p>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-stone-500 inline-flex items-center gap-1">
                                       <span className="material-symbols-outlined text-[10px]">shopping_cart</span>
                                       {book.sold} vendidos
                                    </span>
                                    {book.format === 'physical' && (
                                       <span className={`text-xs font-bold inline-flex items-center gap-1 ${(book.stock || 0) < 10 ? 'text-red-500' : 'text-stone-500'
                                          }`}>
                                          <span className="material-symbols-outlined text-[10px]">inventory_2</span>
                                          {book.stock || 0} em estoque
                                       </span>
                                    )}
                                    {book.format === 'digital' && (
                                       <span className="text-[10px] font-black uppercase text-stone-400 bg-stone-200 px-2 py-0.5 rounded-full">
                                          Digital
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <span className="font-black text-rhema-primary whitespace-nowrap">R$ {book.revenue.toFixed(2)}</span>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-12 text-stone-400">
                        <span className="material-symbols-outlined text-4xl mb-2">menu_book</span>
                        <p className="text-sm font-bold">Nenhum livro cadastrado</p>
                     </div>
                  )}
               </div>
            </div>
            <div className="space-y-6">
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                  <h3 className="font-bold text-lg mb-6">Ações Rápidas</h3>
                  <div className="space-y-4">
                     <Link to="/admin/livros/novo" className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-rhema-primary/5 rounded-2xl group transition-all">
                        <div className="flex items-center gap-3 text-left">
                           <span className="material-symbols-outlined text-rhema-primary">add_box</span>
                           <div>
                              <p className="text-sm font-bold">Novo Livro</p>
                              <p className="text-[10px] text-stone-500">Adicionar ebook ao catálogo</p>
                           </div>
                        </div>
                        <span className="material-symbols-outlined text-stone-300 group-hover:text-rhema-primary">chevron_right</span>
                     </Link>
                     <Link to="/admin/notificacoes" className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-rhema-primary/5 rounded-2xl group transition-all">
                        <div className="flex items-center gap-3 text-left">
                           <span className="material-symbols-outlined text-rhema-primary">notifications_active</span>
                           <div>
                              <p className="text-sm font-bold">Notificar Leads</p>
                              <p className="text-[10px] text-stone-500">Enviar push de lançamento</p>
                           </div>
                        </div>
                        <span className="material-symbols-outlined text-stone-300 group-hover:text-rhema-primary">chevron_right</span>
                     </Link>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 overflow-x-auto">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold text-lg">Vendas Recentes</h3>
               <button className="text-rhema-primary font-bold text-sm">Ver tudo</button>
            </div>
            <table className="w-full">
               <thead>
                  <tr className="text-left border-b border-stone-50 text-stone-400 text-[10px] uppercase tracking-widest font-bold">
                     <th className="pb-4">Pedido</th>
                     <th className="pb-4">Cliente</th>
                     <th className="pb-4">Data</th>
                     <th className="pb-4">Status</th>
                     <th className="pb-4 text-right">Valor</th>
                     <th className="pb-4 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {sales.slice(0, 5).map(sale => (
                     <tr key={sale.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-all">
                        <td className="py-4">
                           <span title={sale.id} className="font-mono text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded">
                              #{sale.id.slice(0, 8)}...
                           </span>
                        </td>
                        <td className="py-4">
                           <div className="flex items-center gap-3">
                              <div className="size-8 bg-stone-100 rounded-full flex items-center justify-center text-xs font-bold text-rhema-primary">
                                 {sale.customerName.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-bold">{sale.customerName}</p>
                                 <p className="text-[10px] text-stone-400">{sale.customerEmail}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 text-stone-500">{sale.date}</td>
                        <td className="py-4">
                           <span className={`px - 2 py - 1 rounded - full text - [10px] font - bold ${sale.status === 'Pago' ? 'bg-green-100 text-green-700' :
                              sale.status === 'Aguardando' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                              } `}>
                              {sale.status}
                           </span>
                        </td>

                        <td className="py-4 text-right font-bold">R$ {sale.amount.toFixed(2)}</td>
                        <td className="py-4 text-right">
                           <div className="flex items-center justify-end gap-1">
                              <button
                                 onClick={() => setSelectedSale(sale)}
                                 title="Visualizar Detalhes"
                                 className="p-2 text-stone-400 hover:text-rhema-primary bg-stone-50 hover:bg-rhema-primary/10 rounded-lg transition-all"
                              >
                                 <span className="material-symbols-outlined text-lg">visibility</span>
                              </button>
                              {/* Quick Edit (Toggle Paid) */}
                              {sale.status !== 'Pago' && (
                                 <button
                                    onClick={async (e) => {
                                       e.stopPropagation();
                                       if (window.confirm('Marcar este pedido como PAGO?')) {
                                          await updateSale(sale.id, { status: 'Pago' });
                                       }
                                    }}
                                    title="Marcar como Pago"
                                    className="p-2 text-stone-400 hover:text-green-600 bg-stone-50 hover:bg-green-50 rounded-lg transition-all"
                                 >
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                 </button>
                              )}
                              <button
                                 onClick={async (e) => {
                                    e.stopPropagation();
                                    await deleteSale(sale.id);
                                 }}
                                 title="Excluir Pedido"
                                 className="p-2 text-stone-400 hover:text-red-500 bg-stone-50 hover:bg-red-50 rounded-lg transition-all"
                              >
                                 <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  {sales.length === 0 && (
                     <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400 text-xs font-bold uppercase tracking-widest">
                           Nenhuma venda registrada ainda.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Modal de Detalhes do Pedido */}
         {selectedSale && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedSale(null)}></div>
               <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="bg-rhema-dark p-8 text-white flex justify-between items-center">
                     <div>
                        <h3 className="text-2xl font-black" title={selectedSale.id}>Pedido #{selectedSale.id.slice(0, 8)}...</h3>
                        <p className="text-xs text-rhema-primary font-bold uppercase tracking-widest mt-1">Detalhes da Venda</p>
                     </div>
                     <button onClick={() => setSelectedSale(null)} className="size-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                        <span className="material-symbols-outlined">close</span>
                     </button>
                  </div>

                  <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b pb-2">Cliente</h4>
                           <div className="space-y-2">
                              <p className="text-sm font-bold text-stone-800">{selectedSale.customerName}</p>
                              <p className="text-sm text-stone-500 flex items-center gap-2">
                                 <span className="material-symbols-outlined text-xs">mail</span> {selectedSale.customerEmail}
                              </p>
                              <p className="text-sm text-stone-500 flex items-center gap-2">
                                 <span className="material-symbols-outlined text-xs">phone</span> {selectedSale.customerPhone}
                              </p>
                           </div>
                        </section>
                     </div>

                     <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b pb-2">Itens</h4>
                        <div className="space-y-3">
                           {selectedSale.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
                                 <div>
                                    <p className="text-sm font-bold text-stone-800">{item.title}</p>
                                    <p className="text-[10px] text-stone-400">Qtd: {item.quantity}</p>
                                 </div>
                                 <p className="font-black text-stone-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                           ))}
                        </div>
                     </section>

                     <div className="pt-6 border-t flex justify-between items-center">
                        <div>
                           <p className="text-[10px] font-bold text-stone-400 uppercase">Status</p>
                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedSale.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {selectedSale.status}
                           </span>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-stone-400 uppercase">Total</p>
                           <p className="text-3xl font-black text-rhema-primary">R$ {selectedSale.amount.toFixed(2)}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div >
   );
};
