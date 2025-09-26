import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Logo } from './Logo';
import { toast } from 'sonner@2.0.3';

import { UserRole } from './types';

interface LoginPageProps {
  onLogin: (username: string, role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    // Mock authentication - En un caso real esto sería validado por el backend
    if (password === 'corp123') {
      onLogin(username, 'corporativo');
    } else if (password === 'corpplus123') {
      onLogin(username, 'corporativo-plus');
    } else if (password === 'tienda123') {
      onLogin(username, 'personal-tienda');
    } else if (password === 'super123') {
      onLogin(username, 'supervisor');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  const handleForgotPassword = () => {
    toast.info('Recuperación de contraseña', {
      description: 'En un sistema real, se enviaría un enlace de recuperación al correo electrónico asociado a tu cuenta.'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1699570044128-b61ef113b72e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N1bWVudCUyMG1hbmFnZW1lbnQlMjBvZmZpY2V8ZW58MXx8fHwxNzU2NzAwNTM3fDA&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center opacity-5"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo centrado */}
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Inicio de Sesión</CardTitle>
            <CardDescription>
              Accede al sistema de documentos
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
          
          {/* Enlace de recuperación de contraseña */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Credenciales de prueba:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Corporativo: cualquier usuario + "corp123"</p>
              <p>Corporativo+: cualquier usuario + "corpplus123"</p>
              <p>Personal Tienda: cualquier usuario + "tienda123"</p>
              <p>Supervisor: cualquier usuario + "super123"</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}