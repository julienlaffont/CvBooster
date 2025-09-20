import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email non valide'),
  password: z.string().min(1, 'Mot de passe requis')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', data);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la connexion');
      }

      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${result.user?.firstName || 'sur CVBooster'} !`,
      });

      // Invalidate auth cache
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      // Check for redirect parameters
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      const plan = urlParams.get('plan');
      
      if (redirect === 'subscribe' && plan) {
        setLocation(`/subscribe?plan=${plan}`);
      } else {
        setLocation('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Erreur lors de la connexion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" data-testid="link-back-home">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Se connecter</h1>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Connexion à CVBooster</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Connectez-vous pour accéder à vos CV et lettres de motivation
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse e-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type="email" 
                            placeholder="votre@email.com"
                            className="pl-10"
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type="password" 
                            placeholder="Votre mot de passe"
                            className="pl-10"
                            data-testid="input-password"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas encore de compte ?{' '}
                <Link to={`/register${window.location.search || ''}`} data-testid="link-register">
                  <Button variant="ghost" className="p-0 h-auto">
                    Créer un compte
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Mot de passe oublié ? Contactez notre support pour le réinitialiser.
          </p>
        </div>
      </div>
    </div>
  );
}