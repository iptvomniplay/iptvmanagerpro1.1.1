
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Tv2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const createFormSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t('emailValidation') }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function SignupPage() {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const formSchema = createFormSchema(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const user = await signUp(values.email, values.password);
    if (user) {
      toast({
        title: 'Conta Criada!',
        description: 'Sua conta foi criada com sucesso. Você será redirecionado.',
      });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Falha no Cadastro',
        description: 'Não foi possível criar a conta. O email já pode estar em uso.',
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
          <CardDescription>Crie sua conta para começar a gerenciar</CardDescription>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg">
                Criar Conta
              </Button>
              <div className="text-center text-sm">
                Já tem uma conta?{' '}
                <Button variant="link" className="p-0 h-auto" type="button" onClick={() => router.push('/login')}>
                  Faça login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
