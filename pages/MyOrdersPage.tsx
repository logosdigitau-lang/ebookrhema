import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

interface OrderItem {
    id: string;
    title: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    created_at: string;
    status: string;
    amount: number;
    items: OrderItem[];
}

export const MyOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyOrders();
        }
    }, [user]);

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*, items:order_items(*)')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f7f6] pt-32 pb-20 px-6 flex items-center justify-center">
                <div className="size-12 border-4 border-rhema-primary/20 border-t-rhema-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f7f6] pt-32 pb-20 font-display">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-3xl font-black text-stone-800 mb-2">Meus Pedidos</h1>
                <p className="text-stone-500 mb-10">Acompanhe seu histórico de compras e downloads.</p>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <span className="material-symbols-outlined text-6xl text-stone-200 mb-4">shopping_bag</span>
                        <h3 className="text-xl font-bold text-stone-800 mb-2">Você ainda não tem pedidos</h3>
                        <p className="text-stone-500 mb-8 max-w-md mx-auto">Explore nossa coleção de livros transformadores e faça seu primeiro pedido hoje mesmo.</p>
                        <Link to="/" className="inline-block px-8 py-4 bg-rhema-primary text-white font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-rhema-primary/20">
                            Ir para a Loja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <div className="p-6 bg-stone-50 border-b border-stone-100 flex flex-wrap gap-6 justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Data do Pedido</p>
                                        <p className="font-bold text-stone-800">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Status</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${order.status === 'Pago' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Aguardando' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Total</p>
                                        <p className="font-bold text-stone-800">R$ {order.amount.toFixed(2)}</p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <span className="text-xs font-bold text-stone-400">#{order.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 bg-rhema-primary/10 text-rhema-primary rounded-lg flex items-center justify-center font-bold">
                                                        {item.quantity}x
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-stone-800">{item.title}</p>
                                                        <p className="text-xs text-stone-500">R$ {item.price.toFixed(2)} un.</p>
                                                    </div>
                                                </div>
                                                {/* If we had download links or specific item actions they would go here */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
