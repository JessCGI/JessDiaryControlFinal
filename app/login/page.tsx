'use client';

import { useState } from 'react';
import { login, signup } from './actions';
import { FormInput } from '@/components/FormInput';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        let result;
        if (isLogin) {
            result = await login(formData);
        } else {
            result = await signup(formData);
        }

        if (result?.error) {
            setError(translateError(result.error));
            setLoading(false);
        }
        // Note: on success, the server action automatically redirects
    };

    const translateError = (err: string) => {
        if (err.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
        if (err.includes('User already registered')) return 'Este email já está cadastrado.';
        if (err.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
        return 'Ocorreu um erro inesperado. Tente novamente.';
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-purple/20 blur-[100px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="mb-10 text-center">
                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5 border border-primary/20">
                        <ShieldCheck size={32} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tighter uppercase font-display">Jess Diary</h1>
                    <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">Painel de Controle</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">
                        {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />

                        <FormInput
                            label="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            required
                        />

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium p-3 rounded-lg flex items-start gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Entrar' : 'Cadastrar'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-400">
                            {isLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                                className="text-primary hover:text-primary-purple ml-2 font-bold transition-colors"
                                type="button"
                            >
                                {isLogin ? 'Criar conta' : 'Fazer login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
