import { useState, FormEvent } from 'react';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { updatePassword, signOut } from '../services/auth.service';

interface ResetPasswordScreenProps {
  onDone: () => void;
}

export const ResetPasswordScreen = ({ onDone }: ResetPasswordScreenProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    // Force a fresh sign-in with the new password rather than keeping the
    // one-time recovery session alive.
    await signOut();
    onDone();
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
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

          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900">Contraseña actualizada</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={handleContinue}
                className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-98"
              >
                Ir a iniciar sesión
              </button>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Crea una nueva contraseña</h2>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Este enlace de recuperación te ha identificado. Elige una contraseña nueva para tu cuenta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    Nueva contraseña
                  </label>
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

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Guardar contraseña</span>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
