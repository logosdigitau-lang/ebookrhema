
import { Book, Sale, Lead, Testimonial } from './types';

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'A Jornada da Fé',
    author: 'Messias Tavares',
    category: 'Vida Cristã',
    format: 'physical',
    stock: 50,
    description: 'Um guia prático para fortalecer seus passos diários na caminhada espiritual.',
    longDescription: 'Neste livro, Messias Tavares explora as profundezas da fé cristã em um mundo moderno e acelerado.',
    benefits: ['Capa Dura Premium', 'Marcador Exclusivo', 'Princípios bíblicos'],
    price: 59.90,
    isbn: '978-85-1234-567-8',
    status: 'active',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    title: 'Caminhos de Luz',
    author: 'Messias Tavares',
    category: 'Teologia',
    format: 'digital',
    description: 'Estudos profundos sobre a iluminação bíblica nos dias atuais.',
    longDescription: 'Uma análise teológica acessível sobre a luz de Cristo manifestada na história.',
    benefits: ['Acesso imediato', 'Leitura offline', 'PDF/ePub'],
    price: 24.90,
    isbn: '978-65-8765-432-1',
    status: 'active',
    coverUrl: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?auto=format&fit=crop&q=80&w=400'
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Oliveira',
    role: 'Líder de Pequeno Grupo',
    content: 'O livro "A Jornada da Fé" mudou completamente a forma como eu conduzo meus estudos. Prático e profundamente bíblico.',
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    id: '2',
    name: 'Ricardo Mendes',
    role: 'Seminarista',
    content: 'A didática do Messias Tavares é impressionante. Ele consegue transformar conceitos teológicos complexos em algo aplicável ao dia a dia.',
    avatarUrl: 'https://i.pravatar.cc/150?u=ricardo'
  }
];

export const MOCK_SALES: Sale[] = [
  { 
    id: '1024', 
    customerName: 'João Silva', 
    customerEmail: 'joao.silva@email.com', 
    customerPhone: '(11) 98888-7777',
    customerAddress: 'Rua das Flores, 123, Bairro Jardim',
    customerCity: 'São Paulo',
    customerZip: '01234-567',
    date: '24/10/2023', 
    method: 'Pix', 
    status: 'Pago', 
    amount: 59.90,
    items: [{ title: 'A Jornada da Fé', quantity: 1, price: 59.90 }]
  }
];

export const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@example.com', registeredAt: '12 Out, 2023', status: 'Pendente' }
];
