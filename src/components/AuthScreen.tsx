import { useState, FormEvent } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { signIn, signUp, requestPasswordReset } from '../services/auth.service';

type Mode = 'signin' | 'signup' | 'forgot';

export const AuthScreen = () => {
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSignupSuccess(false);
    setResetEmailSent(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, fullName || undefined);
        setSignupSuccess(true);
      } else {
        await requestPasswordReset(email);
        setResetEmailSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la operación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-widest shadow-xs">
              A
            </div>
            <div>
              <span className="font-semibold tracking-tight text-zinc-900 text-base block leading-tight">
                AURA
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 block leading-tight">
                Design & Store
              </span>
            </div>
          </div>

          {mode === 'forgot' ? (
            <>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a iniciar sesión</span>
              </button>

              {resetEmailSent ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h2 className="text-sm font-bold text-zinc-900">Revisa tu correo</h2>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Te hemos enviado un enlace a <strong>{email}</strong> para restablecer tu contraseña. Ábrelo desde
                    este mismo dispositivo.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">¿Olvidaste tu contraseña?</h2>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Introduce tu email y te enviaremos un enlace para crear una nueva.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@email.com"
                          className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm pl-9 pr-3 py-2.5 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                    </div>

                    {error && <p className="text-xs text-rose-600">{error}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Enviar enlace de recuperación</span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
              {/* Mode tabs */}
              <div className="flex border-b border-zinc-200 gap-6">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`pb-3 text-sm font-semibold transition-all relative ${
                    mode === 'signin' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Iniciar sesión
                  {mode === 'signin' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`pb-3 text-sm font-semibold transition-all relative ${
                    mode === 'signup' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Crear cuenta
                  {mode === 'signup' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
                  )}
                </button>
              </div>

              {signupSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="text-sm font-bold text-zinc-900">¡Cuenta creada!</h2>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Ya puedes iniciar sesión con tu email y contraseña.
                  </p>
                  <button
                    onClick={() => switchMode('signin')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:underline"
                  >
                    <span>Ir a iniciar sesión</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === 'signup' && (
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                        Nombre completo
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm pl-9 pr-3 py-2.5 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm pl-9 pr-3 py-2.5 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-600 block">Contraseña</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm pl-9 pr-3 py-2.5 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs text-rose-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}</span>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
