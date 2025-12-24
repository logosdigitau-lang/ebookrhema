
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Sale } from '../../types';

export const SalesPage: React.FC = () => {
   const { sales, updateSale, deleteSale } = useData();
   const [filter, setFilter] = useState('Todos');
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

   const filteredSales = useMemo(() => {
      return sales.filter(sale => {
         const matchesFilter = filter === 'Todos' || sale.status === filter;
         const matchesSearch =
            sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.id.includes(searchTerm) ||
            sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
         return matchesFilter && matchesSearch;
      });
   }, [sales, filter, searchTerm]);

   const stats = useMemo(() => {
      const total = sales.reduce((acc, s) => acc + s.amount, 0);
      const pending = sales.filter(s => s.status === 'Aguardando').length;
      return { total, pending };
   }, [sales]);

   const exportToCSV = () => {
      const headers = [
         'ID Pedido', 'Cliente', 'Email', 'Telefone', 'Endereço', 'Cidade', 'CEP', 'Data', 'Método', 'Status', 'Valor Total', 'Itens'
      ];

      // Função para escapar campos (aspas duplas e ponto-e-vírgula)
      const escapeCSV = (value: any) => {
         if (value === null || value === undefined) return '""';
         const stringValue = String(value);
         // Escapa aspas duplas internas duplicando-as e envolve todo o valor em aspas duplas
         return `"${stringValue.replace(/"/g, '""')}"`;
      };

      const rows = filteredSales.map(sale => [
         escapeCSV(sale.id),
         escapeCSV(sale.customerName),
         escapeCSV(sale.customerEmail),
         escapeCSV(sale.customerPhone),
         escapeCSV(sale.customerAddress),
         escapeCSV(sale.customerCity),
         escapeCSV(sale.customerZip),
         escapeCSV(sale.date),
         escapeCSV(sale.method),
         escapeCSV(sale.status),
         escapeCSV(sale.amount.toFixed(2)),
         escapeCSV(sale.items.map(i => `${i.title} (x${i.quantity})`).join(' | '))
      ]);

      const csvContent = [
         headers.map(escapeCSV).join(';'),
         ...rows.map(r => r.join(';'))
      ].join('\n');

      // Adiciona BOM (Byte Order Mark) para garantir que o Excel reconheça como UTF-8 (acentos e R$)
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `vendas_rhema_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black text-stone-800 tracking-tight">Relatório de Vendas</h1>
               <p className="text-stone-500">Acompanhe detalhadamente cada transação e cliente.</p>
            </div>
            <button
               onClick={exportToCSV}
               className="px-6 py-3 bg-rhema-primary text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
               <span className="material-symbols-outlined">download</span> Exportar Dados Filtrados (CSV)
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Receita Acumulada (Total)</p>
               <h3 className="text-2xl font-black mt-1">R$ {stats.total.toFixed(2)}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pedidos Pendentes</p>
               <h3 className="text-2xl font-black mt-1">{stats.pending} Pedidos</h3>
            </div>
         </div>

         <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-6 border-b border-stone-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
               <div className="flex bg-stone-50 p-1 rounded-xl">
                  {['Todos', 'Pago', 'Aguardando'].map(f => (
                     <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-black transition-all ${filter === f ? 'bg-white text-rhema-primary shadow-sm' : 'text-stone-400'}`}
                     >
                        {f}
                     </button>
                  ))}
               </div>
               <div className="relative w-full md:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
                  <input
                     className="w-full pl-10 pr-4 py-2 bg-stone-50 border-none rounded-lg focus:ring-2 focus:ring-rhema-primary/20"
                     placeholder="Buscar cliente ou pedido..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-stone-50/50 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                        <th className="p-6">Pedido</th>
                        <th className="p-6">Cliente</th>
                        <th className="p-6">Data</th>
                        <th className="p-6">Status</th>
                        <th className="p-6 text-right">Ações</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredSales.map(sale => (
                        <tr key={sale.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-all cursor-pointer group">
                           <td className="p-6 font-bold text-rhema-primary" title={sale.id}>#{sale.id.slice(0, 8)}...</td>
                           <td className="p-6">
                              <p className="text-sm font-bold text-stone-800">{sale.customerName}</p>
                              <p className="text-[10px] text-stone-400">{sale.customerEmail}</p>
                           </td>
                           <td className="p-6 text-sm text-stone-500">{sale.date}</td>
                           <td className="p-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${sale.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                 {sale.status}
                              </span>
                           </td>
                           <td className="p-6 text-right">
                              <button
                                 onClick={() => setSelectedSale(sale)}
                                 title="Visualizar Detalhes"
                                 className="p-2 bg-stone-100 hover:bg-rhema-primary hover:text-white rounded-lg transition-all"
                              >
                                 <span className="material-symbols-outlined text-sm">visibility</span>
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
                                    className="p-2 ml-2 bg-stone-100 hover:bg-green-100 text-stone-400 hover:text-green-600 rounded-lg transition-all"
                                 >
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                 </button>
                              )}
                              <button
                                 onClick={async (e) => {
                                    e.stopPropagation();
                                    await deleteSale(sale.id);
                                 }}
                                 title="Excluir Pedido"
                                 className="p-2 ml-2 bg-stone-100 hover:bg-red-100 text-stone-400 hover:text-red-500 rounded-lg transition-all"
                              >
                                 <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                           </td>
                        </tr>
                     ))}
                     {filteredSales.length === 0 && (
                        <tr>
                           <td colSpan={5} className="p-20 text-center text-stone-400 font-bold uppercase tracking-widest text-xs">
                              Nenhuma venda encontrada para os filtros aplicados.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Modal de Detalhes do Cliente */}
         {selectedSale && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedSale(null)}></div>
               <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="bg-rhema-dark p-8 text-white flex justify-between items-center">
                     <div>
                        <h3 className="text-2xl font-black" title={selectedSale.id}>Pedido #{selectedSale.id.slice(0, 8)}...</h3>
                        <p className="text-xs text-rhema-primary font-bold uppercase tracking-widest mt-1">Dossiê do Cliente</p>
                     </div>
                     <button onClick={() => setSelectedSale(null)} className="size-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                        <span className="material-symbols-outlined">close</span>
                     </button>
                  </div>

                  <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b pb-2">Informações de Contato</h4>
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

                        <section className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b pb-2">Endereço de Entrega/Fatura</h4>
                           <div className="space-y-2">
                              <p className="text-sm text-stone-800 font-medium">{selectedSale.customerAddress}</p>
                              <p className="text-sm text-stone-500">{selectedSale.customerCity} - CEP: {selectedSale.customerZip}</p>
                           </div>
                        </section>
                     </div>

                     <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b pb-2">Itens Adquiridos</h4>
                        <div className="space-y-3">
                           {selectedSale.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
                                 <div>
                                    <p className="text-sm font-bold text-stone-800">{item.title}</p>
                                    <p className="text-[10px] text-stone-400">Quantidade: {item.quantity}</p>
                                 </div>
                                 <p className="font-black text-stone-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                           ))}
                        </div>
                     </section>

                     <div className="pt-6 border-t flex justify-between items-center">
                        <div>
                           <p className="text-[10px] font-bold text-stone-400 uppercase">Método de Pagamento</p>
                           <p className="font-bold text-stone-800">{selectedSale.method}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-stone-400 uppercase">Total Geral</p>
                           <p className="text-3xl font-black text-rhema-primary">R$ {selectedSale.amount.toFixed(2)}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
