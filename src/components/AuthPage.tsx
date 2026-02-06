import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const authSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Mindestens 6 Zeichen erforderlich'),
});

type AuthForm = z.infer<typeof authSchema>;

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthForm) => {
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Ungültige Anmeldedaten');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Erfolgreich angemeldet');
      } else {
        const { error } = await signUp(data.email, data.password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Diese E-Mail ist bereits registriert');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail.');
        setMode('login');
        reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold">Buchsammlung</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Ihre Bücher einfach und übersichtlich
          </p>
        </div>

        {/* Form */}
        <div className="glass-panel p-6">
          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === 'login' ? 'default' : 'outline'}
              onClick={() => setMode('login')}
              className="flex-1"
            >
              Anmelden
            </Button>
            <Button
              variant={mode === 'signup' ? 'default' : 'outline'}
              onClick={() => setMode('signup')}
              className="flex-1"
            >
              Registrieren
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="ihre@email.de"
                  className="pl-10 input-library"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="pl-10 input-library"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full btn-library"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Anmelden...' : 'Registrieren...'}
                </>
              ) : (
                mode === 'login' ? 'Anmelden' : 'Registrieren'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button 
                onClick={() => setMode('signup')}
                className="text-primary hover:underline"
              >
                Jetzt registrieren
              </button>
            </>
          ) : (
            <>
              Bereits registriert?{' '}
              <button 
                onClick={() => setMode('login')}
                className="text-primary hover:underline"
              >
                Jetzt anmelden
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
