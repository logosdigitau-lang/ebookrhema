
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChatBot } from './components/ChatBot';
import { BackToTop } from './components/BackToTop';
import { CartDrawer } from './components/CartDrawer';
import { LandingPage } from './pages/LandingPage';
import { BooksPage } from './pages/BooksPage';
import { AuthorPage } from './pages/AuthorPage';
import { LoginPage } from './pages/LoginPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { DashboardOverview } from './pages/Admin/DashboardOverview';
import { ManageBooks } from './pages/Admin/ManageBooks';
import { AddBook } from './pages/Admin/AddBook';
import { SalesPage } from './pages/Admin/SalesPage';
import { LaunchesPage } from './pages/Admin/LaunchesPage';
import { NotificationsPage } from './pages/Admin/NotificationsPage';
import { SettingsPage } from './pages/Admin/SettingsPage';
import { ManageTeam } from './pages/Admin/ManageTeam';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, role } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-rhema-dark text-white sticky top-0 z-[100] shadow-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="material-symbols-outlined text-rhema-primary text-3xl transition-transform group-hover:scale-110">menu_book</span>
              <h1 className="text-white text-xl font-bold tracking-tight">Ebook Rhema</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/livros" className="text-gray-300 hover:text-rhema-primary text-sm font-medium transition-colors">Livros</Link>
              <Link to="/autor" className="text-gray-300 hover:text-rhema-primary text-sm font-medium transition-colors">Sobre o Autor</Link>
              <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative group focus:outline-none"
                >
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-rhema-primary transition-colors">shopping_cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rhema-primary text-white text-[10px] font-black size-5 rounded-full flex items-center justify-center animate-in zoom-in">
                      {totalItems}
                    </span>
                  )}
                </button>

                {user ? (
                  <div className="flex items-center gap-4">
                    <Link to="/meus-pedidos" className="text-sm font-bold text-white hover:text-rhema-primary transition-colors">Meus Pedidos</Link>
                    {(role === 'admin' || role === 'secretary') && (
                      <Link to="/admin" className="px-4 py-2 bg-rhema-primary text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all">Admin</Link>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-bold hover:bg-white/20 transition-all">Entrar</Link>
                )}
              </div>
            </nav>
            <div className="flex items-center gap-4 md:hidden">
              <button onClick={() => setIsCartOpen(true)} className="relative focus:outline-none">
                <span className="material-symbols-outlined text-gray-300">shopping_cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rhema-primary text-white text-[10px] font-black size-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button className="text-gray-300" onClick={() => setIsMobileMenuOpen(true)}>
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-rhema-dark text-white pt-16 pb-8 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-rhema-primary">Ebook Rhema</h3>
              <p className="text-gray-400 text-sm">Espalhando a palavra e o conhecimento através de livros digitais que edificam o espírito.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Loja</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/livros" className="hover:text-rhema-primary transition-colors">Lançamentos</Link></li>
                <li><Link to="/livros" className="hover:text-rhema-primary transition-colors">Mais Vendidos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://curt.link/livro21DIE" target="_blank" rel="noopener noreferrer" className="hover:text-rhema-primary transition-colors">WhatsApp</a></li>
                <li><a href="mailto:msig12@gmail.com" className="hover:text-rhema-primary transition-colors text-[12px]">msig12@gmail.com</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Receba Novidades</h4>
              <div className="flex flex-col gap-2">
                <input className="bg-white/10 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-rhema-primary outline-none" placeholder="Seu melhor e-mail" />
                <button className="bg-rhema-primary px-4 py-3 rounded-lg text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all">Assinar</button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2024 Ebook Rhema. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-white transition-colors">Login Admin</Link>
            </div>
          </div>
        </div>
      </footer>
      <ChatBot />
      <BackToTop />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/livros', label: 'Livros', icon: 'menu_book' },
    { path: '/admin/vendas', label: 'Vendas', icon: 'payments' },
    { path: '/admin/equipe', label: 'Equipe', icon: 'group' },
    { path: '/admin/lancamentos', label: 'Lançamentos', icon: 'rocket_launch' },
    { path: '/admin/notificacoes', label: 'Notificações', icon: 'notifications' },
    { path: '/admin/configuracoes', label: 'Configurações', icon: 'settings' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="w-64 bg-rhema-dark text-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <span className="material-symbols-outlined text-rhema-primary">menu_book</span>
          <span className="font-black text-lg tracking-tight">Rhema Admin</span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-rhema-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-white w-full px-4 py-3">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-bold text-sm">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white border-b border-stone-100 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-50">
          <h2 className="font-black text-stone-800 uppercase tracking-widest text-xs">Sistema de Gestão Rhema</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black">Admin Rhema</p>
              <p className="text-[10px] text-stone-400">Administrador</p>
            </div>
            <div className="size-10 bg-rhema-primary rounded-full flex items-center justify-center text-white font-black shadow-lg">A</div>
          </div>
        </header>
        <main className="p-6 lg:p-12 overflow-y-auto flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/livros" element={<PublicLayout><BooksPage /></PublicLayout>} />
              <Route path="/livro/:id" element={<PublicLayout><BookDetailsPage /></PublicLayout>} />
              <Route path="/autor" element={<PublicLayout><AuthorPage /></PublicLayout>} />
              <Route path="/checkout/:bookId" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/meus-pedidos" element={<ProtectedRoute><PublicLayout><MyOrdersPage /></PublicLayout></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout><DashboardOverview /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/livros" element={<ProtectedRoute requireAdmin={true}><AdminLayout><ManageBooks /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/livros/novo" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AddBook /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/livros/editar/:id" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AddBook /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/vendas" element={<ProtectedRoute requireAdmin={true}><AdminLayout><SalesPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/lancamentos" element={<ProtectedRoute requireAdmin={true}><AdminLayout><LaunchesPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/notificacoes" element={<ProtectedRoute requireAdmin={true}><AdminLayout><NotificationsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/equipe" element={<ProtectedRoute requireAdmin={true}><AdminLayout><ManageTeam /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/configuracoes" element={<ProtectedRoute requireAdmin={true}><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  );
}
