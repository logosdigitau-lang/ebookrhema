
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, signOut, loading } = useAuth(); // Import loading
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && (role === 'admin' || role === 'secretary')) {
      navigate('/admin');
    }
  }, [user, role, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rhema-dark flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-white text-4xl">progress_activity</span>
      </div>
    );
  }

  // Se estiver logado mas NÃO for admin, mostra opção de sair
  if (user && role !== 'admin' && role !== 'secretary') {
    return (
      <div className="min-h-screen bg-rhema-dark flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] p-12 text-center max-w-md w-full shadow-2xl">
          <div className="size-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-stone-400">person</span>
          </div>
          <h2 className="text-2xl font-black text-stone-800 mb-2">Conta Conectada</h2>
          <p className="text-stone-500 mb-8">
            Você está logado como <b className="text-stone-800">{user.email}</b>, mas esta conta não tem acesso administrativo.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition-colors"
            >
              Voltar para o site
            </button>
            <button
              onClick={async () => {
                await signOut();
                // O estado mudará e o form de login aparecerá automaticamente
              }}
              className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sair e trocar de conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);

      // Force immediate check and navigation
      if (data?.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'secretary') {
          // Small delay to show success animation
          setTimeout(() => navigate('/admin'), 1000);
        } else {
          // Let the useEffect handle the 'Access Denied' view
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : 'Erro ao tentar fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rhema-dark flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="hidden lg:flex w-1/2 bg-cover bg-center relative p-12 flex-col justify-between" style={{ backgroundImage: "url('https://picsum.photos/seed/login/800/1200')" }}>
          <div className="absolute inset-0 bg-rhema-dark/60 backdrop-blur-[2px]"></div>
          <div className="relative z-10 flex items-center gap-3">
            <span className="material-symbols-outlined text-rhema-primary text-3xl">menu_book</span>
            <h2 className="text-white text-xl font-bold">Ebook Rhema</h2>
          </div>
          <div className="relative z-10 text-white">
            <h3 className="text-3xl font-black mb-4">Gerencie sua biblioteca digital com facilidade.</h3>
            <p className="opacity-80">Acesso seguro aos dados de vendas, estoque e configurações do sistema.</p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 bg-rhema-light p-12 lg:p-20 flex flex-col justify-center">
          <h1 className="text-3xl font-black mb-2">Painel Administrativo</h1>
          <p className="text-stone-500 mb-10">Entre com suas credenciais de administrador.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Feedback Messages */}
            {error && (
              <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm flex items-center gap-3 rounded-r-xl animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-red-500">error</span>
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700 text-sm flex items-center gap-3 rounded-r-xl animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Acesso autorizado! Carregando painel...
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">E-mail</label>
              <input
                className="w-full p-4 rounded-xl border-2 border-stone-200 bg-white focus:border-rhema-primary outline-none transition-all"
                placeholder="msig12@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || success}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Senha</label>
              <input
                className="w-full p-4 rounded-xl border-2 border-stone-200 bg-white focus:border-rhema-primary outline-none transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || success}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" className="rounded text-rhema-primary" /> Lembrar-me
              </label>
              <a href="#" className="text-sm text-rhema-primary font-bold">Esqueceu a senha?</a>
            </div>
            <button
              disabled={isLoading || success}
              className={`w-full py-4 font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 ${isLoading || success
                ? 'bg-stone-400 cursor-not-allowed text-stone-100'
                : 'bg-rhema-primary text-white hover:-translate-y-1'
                }`}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Validando...
                </>
              ) : success ? (
                <>
                  <span className="material-symbols-outlined">check</span>
                  Sucesso
                </>
              ) : (
                'Entrar no Dashboard'
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/')}
              disabled={isLoading}
              className="text-stone-500 text-sm flex items-center justify-center gap-2 mx-auto hover:text-rhema-primary transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar para o site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
