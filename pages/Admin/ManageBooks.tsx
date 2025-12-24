
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';

export const ManageBooks: React.FC = () => {
  const { books, deleteBook } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm);

      const matchesStatus = statusFilter === 'Todos' ||
        (statusFilter === 'Ativo' && book.status === 'active') ||
        (statusFilter === 'Lançamento' && book.status === 'launch');

      return matchesSearch && matchesStatus;
    });
  }, [books, searchTerm, statusFilter]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Gerenciar Livros</h1>
          <p className="text-stone-500">Controle o catálogo de livros digitais em tempo real.</p>
        </div>
        <Link to="/admin/livros/novo" className="px-6 py-3 bg-rhema-primary text-white font-bold rounded-xl shadow-lg shadow-rhema-primary/20 flex items-center gap-2 hover:brightness-110 transition-all">
          <span className="material-symbols-outlined">add</span> Adicionar Livro
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">search</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-rhema-primary/20"
            placeholder="Buscar por título, autor ou ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-stone-50 border-none rounded-xl text-sm px-4 py-3 font-bold text-stone-600 focus:ring-2 focus:ring-rhema-primary/20"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Todos">Todos os Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Lançamento">Lançamento</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50/50 border-b border-stone-50 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <th className="p-6">Livro</th>
              <th className="p-6">ISBN</th>
              <th className="p-6">Preço</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.length > 0 ? filteredBooks.map(book => (
              <tr key={book.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-all">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={book.coverUrl} className="size-16 rounded shadow-sm object-cover bg-stone-100" />
                    <div>
                      <p className="font-bold text-stone-800">{book.title}</p>
                      <p className="text-xs text-stone-400">{book.author}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-xs text-stone-500 font-mono">{book.isbn}</td>
                <td className="p-6 font-bold text-stone-700">R$ {book.price.toFixed(2)}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${book.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {book.status === 'active' ? 'Ativo' : 'Lançamento'}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/livro/${book.id}`} target="_blank" className="p-2 text-stone-400 hover:text-rhema-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </Link>
                    <Link to={`/admin/livros/editar/${book.id}`} className="p-2 text-stone-400 hover:text-rhema-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </Link>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-stone-400 font-bold">Nenhum livro encontrado com esses filtros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
