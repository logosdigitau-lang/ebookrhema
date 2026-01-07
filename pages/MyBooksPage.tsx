import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { supabase } from '../services/supabaseClient';
import { Book } from '../types';

export const MyBooksPage: React.FC = () => {
    const { sales, books } = useData();
    const [email, setEmail] = useState('');
    const [searched, setSearched] = useState(false);
    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        // Filter sales by email (Frontend filtering for MVP/No-Auth)
        // In a real app with Auth, this would be `useSales()` fetching only user's orders.
        const userSales = sales.filter(s =>
            s.customerEmail.toLowerCase().trim() === email.toLowerCase().trim() &&
            s.status !== 'Cancelado'
        );

        const purchasedBookTitles = new Set<string>();
        userSales.forEach(sale => {
            sale.items.forEach(item => {
                purchasedBookTitles.add(item.title); // Linking by Title is weak, but `items` often don't have IDs in simplified systems. 
                // If possible, linking by ID is better. Assuming `title` consistency for now as IDs might be missing in SaleItem interface locally.
            });
        });

        const ownedBooks = books.filter(b =>
            purchasedBookTitles.has(b.title) &&
            b.format === 'digital'
        );

        setMyBooks(ownedBooks);
        setSearched(true);
        setLoading(false);
    };

    const handleDownload = async (book: Book) => {
        if (!book.pdfUrl) {
            alert("Erro: Arquivo não encontrado.");
            return;
        }

        try {
            // Generate Signed URL valid for 60 seconds
            const { data, error } = await supabase.storage
                .from('ebooks')
                .createSignedUrl(book.pdfUrl, 60);

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Erro ao gerar link de download.');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 py-24 px-4 font-display">
            <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-stone-800 tracking-tight">Meus Livros 📚</h1>
                    <p className="text-stone-500">Digite o e-mail utilizado na compra para acessar seus ebooks.</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        <label className="text-sm font-bold text-stone-700">E-mail de Compra</label>
                        <div className="flex gap-4">
                            <input
                                type="email"
                                required
                                placeholder="seu@email.com"
                                className="flex-1 p-4 bg-stone-50 border-none rounded-xl"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-rhema-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all"
                            >
                                {loading ? 'Buscando...' : 'Acessar'}
                            </button>
                        </div>
                    </form>
                </div>

                {searched && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <h2 className="text-2xl font-black text-stone-800 px-2">
                            {myBooks.length > 0 ? `Encontramos ${myBooks.length} livro(s)` : 'Nenhum ebook encontrado.'}
                        </h2>

                        <div className="grid gap-4">
                            {myBooks.map(book => (
                                <div key={book.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-6">
                                    <div className="w-16 h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-stone-800 leading-tight mb-1">{book.title}</h3>
                                        <p className="text-xs text-stone-400 uppercase font-bold tracking-widest">Digital Ebook</p>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(book)}
                                        className="size-12 bg-rhema-primary/10 text-rhema-primary rounded-full flex items-center justify-center hover:bg-rhema-primary hover:text-white transition-colors"
                                        title="Baixar Agora"
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                    </button>
                                </div>
                            ))}

                            {myBooks.length === 0 && (
                                <div className="text-center py-10 bg-stone-100 rounded-3xl border border-dashed border-stone-300">
                                    <p className="text-stone-500 font-medium">Verifique se digitou o e-mail corretamente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
