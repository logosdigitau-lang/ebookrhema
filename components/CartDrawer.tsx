
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-rhema-dark/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-6 bg-rhema-dark text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rhema-primary">shopping_cart</span>
                <h2 className="text-xl font-black uppercase tracking-tight">Seu Carrinho</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <span className="material-symbols-outlined text-6xl">shopping_basket</span>
                  <p className="font-bold text-stone-500">Seu carrinho está vazio.</p>
                  <button 
                    onClick={() => { onClose(); navigate('/livros'); }}
                    className="text-rhema-primary font-bold underline"
                  >
                    Ver livros disponíveis
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 group">
                    <img 
                      src={item.coverUrl} 
                      alt={item.title} 
                      className="w-16 h-24 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-stone-800 line-clamp-1">{item.title}</h4>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white rounded-lg border border-stone-200 overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-1 hover:bg-stone-100 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">remove</span>
                          </button>
                          <span className="px-3 text-xs font-black">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-1 hover:bg-stone-100 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">add</span>
                          </button>
                        </div>
                        <p className="font-black text-rhema-primary">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-stone-500 text-sm font-medium">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
                    <span className="font-bold text-stone-800">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-500 text-sm font-medium">
                    <span className="flex items-center gap-2">
                      Frete <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">Digital</span>
                    </span>
                    <span className="text-green-600 font-bold">Grátis</span>
                  </div>
                  <div className="pt-3 border-t border-stone-200 flex justify-between items-center">
                    <span className="text-lg font-black text-stone-900">Total</span>
                    <span className="text-2xl font-black text-rhema-primary tracking-tight">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onClose();
                    navigate('/checkout/cart');
                  }}
                  className="w-full py-5 bg-rhema-primary text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">payments</span>
                  Finalizar Compra
                </button>
                
                <p className="text-center text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  Ambiente Seguro & Criptografado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
