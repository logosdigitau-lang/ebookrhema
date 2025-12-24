
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const BooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { books } = useData();
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(books.map(b => b.category)))];
  
  const activeBooks = books.filter(b => b.status !== 'inactive');
  const filteredBooks = activeCategory === 'Todos' 
    ? activeBooks 
    : activeBooks.filter(b => b.category === activeCategory);

  return (
    <div className="bg-[#fbfaf8] min-h-screen pb-20">
      <section className="py-16 lg:py-24 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl lg:text-7xl font-black mb-6 text-stone-800 tracking-tight">Biblioteca Digital</h1>
        <p className="text-stone-500 text-xl leading-relaxed">Literatura selecionada para edificar, inspirar e transformar sua jornada espiritual com profundidade e propósito.</p>
      </section>

      {/* Filtros por Categoria */}
      <div className="max-w-[1200px] mx-auto px-4 mb-12 flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeCategory === cat 
                ? 'bg-rhema-primary text-white shadow-lg' 
                : 'bg-white text-stone-400 border border-stone-100 hover:border-rhema-primary/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filteredBooks.length > 0 ? filteredBooks.map(book => (
            <div key={book.id} className="flex flex-col md:flex-row bg-white rounded-[2.5rem] overflow-hidden border border-rhema-primary/10 shadow-xl group hover:shadow-2xl transition-all duration-500">
              <div className="md:w-1/2 p-8 lg:p-12 bg-rhema-light/30 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-rhema-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <img 
                    src={book.coverUrl} 
                    className="w-40 lg:w-48 h-60 lg:h-72 object-cover shadow-2xl rounded-r-2xl transform group-hover:scale-105 group-hover:-rotate-2 transition-all duration-700 relative z-10" 
                    alt={book.title} 
                 />
                 {book.status === 'launch' && (
                   <span className="absolute top-6 left-6 px-4 py-1.5 bg-rhema-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                     Lançamento
                   </span>
                 )}
              </div>
              <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-rhema-primary text-sm fill-1">verified</span>
                     <p className="text-rhema-primary font-black text-[10px] uppercase tracking-[0.2em]">{book.category}</p>
                   </div>
                   <h3 className="text-2xl lg:text-3xl font-black text-stone-800 leading-tight group-hover:text-rhema-primary transition-colors">{book.title}</h3>
                   <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">{book.description}</p>
                </div>
                <div className="mt-8 pt-8 border-t border-stone-50 flex items-center justify-between">
                   <div className="flex flex-col">
                     {book.oldPrice && <span className="text-stone-400 text-[10px] line-through mb-1 uppercase font-bold">De R$ {book.oldPrice.toFixed(2)}</span>}
                     <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-stone-400">R$</span>
                        <span className="text-3xl font-black text-stone-900">{book.price.toFixed(2)}</span>
                     </div>
                   </div>
                   <button 
                    onClick={() => navigate(`/livro/${book.id}`)}
                    className="px-6 py-4 bg-rhema-primary text-white font-black rounded-2xl shadow-2xl shadow-rhema-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 text-sm"
                   >
                     Explorar
                     <span className="material-symbols-outlined text-lg">arrow_forward</span>
                   </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center space-y-4">
               <span className="material-symbols-outlined text-6xl text-stone-200">menu_book</span>
               <p className="text-stone-400 font-bold uppercase tracking-widest">Nenhum livro disponível nesta categoria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
