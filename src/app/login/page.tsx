
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Tv2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const createFormSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t('emailValidation') }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
});

export default function LoginPage() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const formSchema = createFormSchema(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const user = await signIn(values.email, values.password);
    if (user) {
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: 'Email ou senha incorretos. Por favor, tente novamente.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Tv2 className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl">IPTV Manager Pro</CardTitle>
          </div>
          <CardDescription>{t('welcomeMessage')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailAddress')}</FormLabel>
                    <FormControl>
                      <Input placeholder="nome@exemplo.com" {...field} />
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
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg">
                Entrar
              </Button>
              <div className="text-center text-sm">
                Não tem uma conta?{' '}
                <Button variant="link" className="p-0 h-auto" type="button" onClick={() => router.push('/signup')}>
                  Crie uma agora
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
