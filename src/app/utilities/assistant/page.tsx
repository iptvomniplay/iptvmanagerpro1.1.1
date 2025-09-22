'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Send, User, KeyRound } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const ASSISTANT_PASSWORD = "pro"; // Senha de acesso

export default function AssistantPage() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ASSISTANT_PASSWORD) {
        setIsAuthenticated(true);
        setError('');
    } else {
        setError(t('incorrectPassword'));
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const modelMessage: Message = { role: 'model', content: data.message };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages(prev => [
        ...prev,
        { role: 'model', content: t('errorProcessingRequest') },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="flex items-center justify-center h-[70vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <KeyRound className="h-7 w-7"/>
                        {t('assistantAccess')}
                    </CardTitle>
                    <CardDescription>{t('assistantPasswordPrompt')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('password')}
                            autoComplete="off"
                        />
                         {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full">
                            {t('enter')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh]">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            {t('virtualAssistant')}
          </CardTitle>
          <CardDescription>{t('virtualAssistantChatDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : '')}>
                  {message.role === 'model' && (
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                      'max-w-prose p-4 rounded-lg prose dark:prose-invert prose-p:my-0 prose-headings:my-2',
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                    <Markdown>{message.content}</Markdown>
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-4">
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-prose p-4 rounded-lg bg-muted flex items-center">
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 ml-1 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 ml-1 bg-muted-foreground rounded-full animate-pulse"></span>
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={t('askSomething')}
              autoComplete="off"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
              <span className="sr-only">{t('send')}</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
