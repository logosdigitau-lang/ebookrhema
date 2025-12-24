
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  coverUrl: string;
  status: 'active' | 'launch' | 'inactive';
  format: 'digital' | 'physical';
  stock?: number;
  isbn: string;
  longDescription?: string;
  benefits?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
}

export interface SaleItem {
  title: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerZip: string;
  date: string;
  method: 'Pix' | 'Cartão' | 'Boleto' | 'Mercado Pago';
  status: 'Pago' | 'Aguardando' | 'Cancelado';
  amount: number;
  shippingCost?: number;
  shippingMethod?: string;
  items: SaleItem[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  status: 'Pendente' | 'Notificado';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
