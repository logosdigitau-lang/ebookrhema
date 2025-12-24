
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Book, Sale, Lead } from '../types';
import { MOCK_BOOKS, MOCK_SALES, MOCK_LEADS } from '../constants';

interface AppSettings {
  googleSheetsWebhookUrl: string;
  isSheetsEnabled: boolean;
  supportEmail: string;
  // Launch Settings
  launchBookId?: string;
  launchPrice?: string;
  launchDate?: string;
  isPreLaunch?: boolean;
}

interface DataContextType {
  books: Book[];
  sales: Sale[];
  leads: Lead[];
  settings: AppSettings;
  addBook: (book: Book) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  addLead: (name: string, email: string) => void;
  addSale: (sale: Sale, userId?: string) => Promise<void>;
  updateSale: (id: string, updates: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);

  // Carregar Livros do Supabase
  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Erro ao buscar livros:', error);
    else setBooks(mapSupabaseToBook(data));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = async () => {
    // Only fetch if admin (checked by RLS) or user's own orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
    } else if (orders) {
      const mappedSales: Sale[] = orders.map(order => ({
        id: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone || '',
        customerAddress: order.customer_address || '',
        customerCity: order.customer_city || '',
        customerZip: order.customer_zip || '',
        date: new Date(order.created_at).toLocaleDateString('pt-BR'),
        method: order.payment_method || 'Desconhecido',
        status: order.status,
        amount: Number(order.amount),
        shippingCost: Number(order.shipping_cost || 0),
        shippingMethod: order.shipping_method,
        items: order.items.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          price: Number(item.price)
        }))
      }));
      setSales(mappedSales);
    }
  };

  useEffect(() => {
    fetchSales();
    // Subscribe to realtime updates if needed
  }, [books]); // Re-fetch when books change (optional dependency)

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('rhema_leads');
    return saved ? JSON.parse(saved) : MOCK_LEADS;
  });

  // Fetch Settings
  const [settings, setSettings] = useState<AppSettings>({
    googleSheetsWebhookUrl: '',
    isSheetsEnabled: false,
    supportEmail: 'msig12@gmail.com',
    launchBookId: '',
    launchPrice: '',
    launchDate: '',
    isPreLaunch: false
  });

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      const newSettings: any = { ...settings };
      data.forEach((row: any) => {
        if (row.key === 'rhema_launch_book_id') newSettings.launchBookId = row.value;
        if (row.key === 'rhema_launch_price') newSettings.launchPrice = row.value;
        if (row.key === 'rhema_launch_date') newSettings.launchDate = row.value;
        if (row.key === 'rhema_prelaunch_mode') newSettings.isPreLaunch = row.value === 'true';
        if (row.key === 'rhema_sheets_url') newSettings.googleSheetsWebhookUrl = row.value;
        if (row.key === 'rhema_sheets_enabled') newSettings.isSheetsEnabled = row.value === 'true';
      });
      setSettings(newSettings);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    // Map to DB keys
    const updates = [];
    if (newSettings.launchBookId !== undefined) updates.push({ key: 'rhema_launch_book_id', value: newSettings.launchBookId });
    if (newSettings.launchPrice !== undefined) updates.push({ key: 'rhema_launch_price', value: newSettings.launchPrice });
    if (newSettings.launchDate !== undefined) updates.push({ key: 'rhema_launch_date', value: newSettings.launchDate });
    if (newSettings.isPreLaunch !== undefined) updates.push({ key: 'rhema_prelaunch_mode', value: String(newSettings.isPreLaunch) });
    if (newSettings.googleSheetsWebhookUrl !== undefined) updates.push({ key: 'rhema_sheets_url', value: newSettings.googleSheetsWebhookUrl });
    if (newSettings.isSheetsEnabled !== undefined) updates.push({ key: 'rhema_sheets_enabled', value: String(newSettings.isSheetsEnabled) });

    if (updates.length > 0) {
      const { error } = await supabase.from('app_settings').upsert(updates);
      if (error) console.error('Error saving settings:', error);
    }
  };

  const addSale = async (sale: Sale, userId?: string) => {
    // Insert Order
    // Prepare data for RPC
    const orderData = {
      user_id: userId || null,
      customer_name: sale.customerName,
      customer_email: sale.customerEmail,
      customer_phone: sale.customerPhone,
      customer_address: sale.customerAddress,
      customer_city: sale.customerCity,
      customer_zip: sale.customerZip,
      customer_state: '', // Add if available in Sale type, otherwise map from city string
      amount: sale.amount,
      status: sale.status,
      payment_method: sale.method === 'Pix' ? 'Pix' : 'Credit Card',
      shipping_method: sale.shippingMethod,
      shipping_cost: sale.shippingCost
    };

    const itemsData = sale.items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      price: item.price
    }));

    const { data: result, error } = await supabase.rpc('create_full_order', {
      order_data: orderData,
      items_data: itemsData
    });

    if (error) {
      console.error('Error creating order via RPC:', error);
      alert('Erro ao processar pedido: ' + error.message);
      return;
    }

    // Refresh local list
    // Refresh local list
    fetchSales();

    // Trigger Webhook (Fire and forget)
    if (settings.isSheetsEnabled && settings.googleSheetsWebhookUrl) {
      try {
        const payload = {
          id: result, // ID returned from RPC
          customerName: sale.customerName,
          customerEmail: sale.customerEmail,
          customerPhone: sale.customerPhone,
          amount: sale.amount,
          status: sale.status,
          items: sale.items,
          date: new Date().toISOString()
        };

        // Use no-cors to avoid CORS errors (opaque response is fine for fire-and-forget)
        fetch(settings.googleSheetsWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }).catch(err => console.error('Webhook error:', err));
      } catch (err) {
        console.error('Error preparing webhook:', err);
      }
    }
  };
  const addBook = async (book: Book) => {
    // Adapter para formato do banco (snake_case)
    const dbBook = {
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      price: book.price,
      old_price: book.oldPrice,
      cover_url: book.coverUrl,
      status: book.status,
      format: book.format,
      stock: book.stock,
      isbn: book.isbn,
      long_description: book.longDescription,
      benefits: book.benefits
    };

    const { data, error } = await supabase.from('books').insert([dbBook]).select();

    if (error) {
      console.error('Erro ao adicionar livro:', error);
      alert('Erro ao salvar livro no banco de dados.');
    } else {
      fetchBooks(); // Recarrega a lista
    }
  };

  const updateBook = async (id: string, updatedBook: Partial<Book>) => {
    // Transform fields if necessary (camelCase to snake_case)
    const dbUpdate: any = { ...updatedBook };
    if (updatedBook.oldPrice !== undefined) dbUpdate.old_price = updatedBook.oldPrice;
    if (updatedBook.coverUrl !== undefined) dbUpdate.cover_url = updatedBook.coverUrl;
    if (updatedBook.longDescription !== undefined) dbUpdate.long_description = updatedBook.longDescription;

    // Remove undefined fields and camelCase keys that don't match columns
    delete dbUpdate.id; // ID shouldn't be updated
    delete dbUpdate.oldPrice;
    delete dbUpdate.coverUrl;
    delete dbUpdate.longDescription;

    const { error } = await supabase.from('books').update(dbUpdate).eq('id', id);

    if (error) {
      console.error('Erro ao atualizar livro:', error);
      alert('Erro ao atualizar livro.');
    } else {
      fetchBooks();
    }
  };

  const deleteBook = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este livro?')) {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) {
        console.error('Erro ao deletar livro:', error);
        alert('Erro ao deletar livro.');
      } else {
        fetchBooks();
      }
    }
  };

  // Helper para mapear dados do banco de volta para o tipo da aplicação
  const mapSupabaseToBook = (data: any[]): Book[] => {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      author: item.author,
      category: item.category,
      description: item.description,
      price: Number(item.price),
      oldPrice: item.old_price ? Number(item.old_price) : undefined,
      coverUrl: item.cover_url,
      status: item.status,
      format: item.format,
      stock: item.stock,
      isbn: item.isbn,
      longDescription: item.long_description,
      benefits: item.benefits
    }));
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    // Map Sale fields to DB columns
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.method) dbUpdates.payment_method = updates.method;

    const { error } = await supabase.from('orders').update(dbUpdates).eq('id', id);

    if (error) {
      console.error('Erro ao atualizar venda:', error);
      alert('Erro ao atualizar venda.');
    } else {
      fetchSales();
    }
  };

  const deleteSale = async (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar este registro de venda? Esta ação não pode ser desfeita.')) {
      // Delete order items first (cascade usually handles this, but safe to check)
      // Assuming cascade delete is set up on DB
      const { error } = await supabase.from('orders').delete().eq('id', id);

      if (error) {
        console.error('Erro ao deletar venda:', error);
        alert('Erro ao deletar venda.');
      } else {
        fetchSales();
      }
    }
  };

  const addLead = (name: string, email: string) => {
    const newLead: Lead = {
      id: Date.now().toString(),
      name,
      email,
      registeredAt: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente'
    };
    setLeads(prev => [newLead, ...prev]);
  };



  return (
    <DataContext.Provider value={{ books, sales, leads, settings, addBook, updateBook, deleteBook, addLead, addSale, updateSale, deleteSale, updateSettings }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
