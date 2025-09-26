import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { DocumentCatalog } from './components/DocumentCatalog';
import { Toaster } from './components/ui/sonner';
import { User } from './components/types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (username: string, role: User['role']) => {
    setUser({ username, role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <DocumentCatalog user={user} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}