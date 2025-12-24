
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Define User Interface
interface UserProfile {
    id: string;
    full_name: string;
    email: string; // Note: We might not get email from profiles if not stored there, but we can try or just show name/role
    role: 'admin' | 'secretary' | 'customer';
    created_at: string;
}

export const ManageTeam: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New User Form State
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'secretary'
    });
    const [isCreating, setIsCreating] = useState(false);

    // Edit Mode State
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    // Open Modal for Editing
    const handleEditClick = (user: UserProfile) => {
        setEditingUser(user);
        setNewUser({
            name: user.full_name || '',
            email: user.email || '', // Note: This might be empty if we didn't fetch it, but we can't change it anyway
            password: '',
            role: user.role
        });
        setShowModal(true);
    };

    // Open Modal for Creating
    const handleNewClick = () => {
        setEditingUser(null);
        setNewUser({ name: '', email: '', password: '', role: 'secretary' });
        setShowModal(true);
    };

    // Fetch Users
    const fetchUsers = async () => {
        setLoading(true);
        // We need to fetch profiles. 
        // Since we updated RLS, we should be able to see all profiles.
        // Note: profiles table might not have email if it's only in auth.users. 
        // If email is not in profiles, we can't show it easily without an Edge Function.
        // For now, let's assume we can at least show name and role.
        // Ideally, we should store email in profiles for easy access.
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            alert('Erro ao carregar usuários.');
        } else {
            setUsers(data as any[]); // Casting for simplicity
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // 1. Initialize Secondary Client (No Session Persistence)
            // This prevents the admin from being logged out
            const tempSupabase = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false,
                        storage: { // CRITICAL: Use memory storage to avoid touching localStorage
                            getItem: () => null,
                            setItem: () => { },
                            removeItem: () => { },
                        }
                    }
                }
            );

            // 2. Sign Up the new user
            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.name,
                        role: newUser.role // We can pass metadata here
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 3. Update the Profile (if needed)
                // The trigger usually handles profile creation on insert to auth.users if set up.
                // But we often need to ensure the role is set correctly in public.profiles.
                // Let's manually ensure the profile is updated with the correct role.

                // Wait a moment for trigger (if any) or upsert manually
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        full_name: newUser.name,
                        role: newUser.role,
                        // If we want to store email in profiles for display:
                        // email: newUser.email (Add this column to profiles if it doesn't exist? Assuming for now we rely on existing schema)
                    });

                if (profileError) {
                    console.error('Profile update error:', profileError);
                    // Non-blocking, but good to know
                }

                alert('Usuário criado com sucesso!');
                setShowModal(false);
                setNewUser({ name: '', email: '', password: '', role: 'secretary' });
                fetchUsers();
            }

        } catch (err: any) {
            console.error('Error creating user:', err);
            alert('Erro ao criar usuário: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsCreating(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: newUser.name,
                    role: newUser.role
                })
                .eq('id', editingUser.id);

            if (error) throw error;

            alert('Usuário atualizado com sucesso!');
            setShowModal(false);
            setEditingUser(null);
            fetchUsers();

        } catch (err: any) {
            console.error('Error updating user:', err);
            alert('Erro ao atualizar: ' + err.message);
        } finally {
            setIsCreating(false);
        }
    };

    // Delete User (Only from profiles, deleting from auth requires admin API)
    // For now, removing from profiles effectively disables them in our app logic if we check profile existence.
    const handleDeleteUser = async (id: string) => {
        if (window.confirm('Tem certeza? Isso removerá o acesso administrativo deste usuário.')) {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) alert('Erro ao remover usuário.');
            else fetchUsers();
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-stone-800 tracking-tight">Gerenciar Equipe</h1>
                    <p className="text-stone-500">Adicione secretárias e administradores ao sistema.</p>
                </div>
                <button
                    onClick={handleNewClick}
                    className="px-6 py-3 bg-rhema-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    Novo Membro
                </button>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-stone-50/50 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                            <th className="p-6">Nome</th>
                            <th className="p-6">Função</th>
                            <th className="p-6">Data de Entrada</th>
                            <th className="p-6 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-stone-400">Carregando...</td></tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-all">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-stone-100 rounded-full flex items-center justify-center font-bold text-rhema-primary">
                                            {user.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-800">{user.full_name || 'Sem Nome'}</p>
                                            <p className="text-xs text-stone-400">ID: {user.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'secretary' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'
                                        }`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td className="p-6 text-sm text-stone-500">
                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-6 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Remover Acesso"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="p-2 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all mr-2"
                                        title="Editar Membro"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-rhema-dark p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingUser ? 'Editar Membro' : 'Novo Membro'}</h3>
                            <button onClick={() => setShowModal(false)} className="size-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Nome Completo</label>
                                <input
                                    required
                                    className="w-full p-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rhema-primary/20 outline-none"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">E-mail de Acesso</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full p-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rhema-primary/20 outline-none"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                            )}

                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Senha Provisória</label>
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        className="w-full p-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rhema-primary/20 outline-none"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Função</label>
                                <select
                                    className="w-full p-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rhema-primary/20 outline-none"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                                >
                                    <option value="secretary">Secretária (Acesso a Vendas/Leads)</option>
                                    <option value="admin">Administrador (Acesso Total)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full py-4 mt-2 bg-rhema-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2"
                            >
                                {isCreating ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : (editingUser ? 'Salvar Alterações' : 'Criar Conta')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
