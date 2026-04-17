import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { Loader2 } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold mb-2">AutoFlow AI</h1>
          <p className="text-sm text-gray-500 mb-6">Inicie sessão para guardar suas credenciais da API com segurança (necessário para deploys no Vercel).</p>
          <button onClick={login} className="w-full bg-[#111827] text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 transition-colors">
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
