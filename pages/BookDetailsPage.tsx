
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books } = useData();
  const { items, addToCart } = useCart();
  const [isShared, setIsShared] = useState(false);
  
  const book = useMemo(() => books.find(b => b.id === id), [id, books]);
  const cartItem = useMemo(() => items.find(item => item.id === id), [items, id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!book) return;
    const message = `Graça e Paz! Olhe este livro que encontrei na Ebook Rhema: *${book.title}*\n\nConfira aqui: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleBuyNow = () => {
    if (!book) return;
    addToCart(book);
    navigate(`/checkout/${book.id}`);
  };

  if (!book) return <div className="p-20 text-center font-bold">Livro não encontrado</div>;

  return (
    <div className="bg-white">
      <main className="py-12 lg:py-24 max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="relative group">
            <img src={book.coverUrl} className="relative z-10 w-full max-w-md mx-auto aspect-[3/4.5] object-cover rounded-[2rem] shadow-2xl border-8 border-white" alt={book.title} />
            <div className="absolute -bottom-6 -right-6 z-20 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-stone-100">
              <div className={`size-12 rounded-full flex items-center justify-center ${book.format === 'digital' ? 'bg-orange-100 text-orange-600' : 'bg-stone-900 text-white'}`}>
                <span className="material-symbols-outlined">{book.format === 'digital' ? 'bolt' : 'local_shipping'}</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-stone-400">Entrega</p>
                <p className="text-sm font-bold text-stone-800">{book.format === 'digital' ? 'Envio Imediato' : 'Frete a combinar'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                book.format === 'digital' ? 'bg-orange-100 text-orange-600' : 'bg-stone-900 text-white'
              }`}>
                {book.format === 'digital' ? 'Ebook Digital' : 'Livro Físico'}
              </span>
              <h1 className="text-4xl lg:text-6xl font-black text-stone-900 leading-tight">{book.title}</h1>
              <p className="text-lg text-stone-500 font-medium">Por {book.author}</p>
            </div>

            <p className="text-stone-600 leading-relaxed text-lg">{book.description}</p>

            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-stone-900">R$ {book.price.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleBuyNow}
                className="w-full py-5 bg-rhema-primary text-white font-black rounded-2xl shadow-2xl shadow-rhema-primary/20 transition-all text-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">shopping_cart_checkout</span>
                Comprar Agora
              </button>

              <button 
                onClick={() => addToCart(book)}
                className={`w-full py-4 font-bold rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                  cartItem 
                    ? 'border-green-600 text-green-600 bg-green-50' 
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="material-symbols-outlined">{cartItem ? 'check_circle' : 'add_shopping_cart'}</span>
                {cartItem ? `No Carrinho (${cartItem.quantity})` : 'Adicionar ao Carrinho'}
              </button>
              
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={handleCopyLink} 
                  className="flex-1 py-4 border-2 border-stone-100 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 transition-colors hover:bg-stone-50"
                  title="Copiar link do livro"
                >
                  <span className="material-symbols-outlined text-stone-600">{isShared ? 'check' : 'content_copy'}</span>
                  <span className="text-[10px] uppercase tracking-widest text-stone-500">{isShared ? 'Copiado' : 'Link'}</span>
                </button>
                
                <a 
                  href="https://curt.link/livro21DIE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-[#25D366]/20 hover:brightness-105 transition-all"
                  title="Suporte via WhatsApp"
                >
                  <span className="material-symbols-outlined">support_agent</span>
                  <span className="text-[10px] uppercase tracking-widest">Suporte</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
