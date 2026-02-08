import React from 'react';
import { Clock, Mail, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const PendingApproval: React.FC = () => {
  const { user, signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center">
          <div className="w-20 h-20 bg-amber-400/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Clock className="text-amber-400" size={40} />
          </div>

          <h1 className="text-3xl font-black text-white mb-4">
            Aguardando Aprovação
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            Olá, <span className="text-white font-bold">{user?.email}</span>! 👋
            <br /><br />
            Sua conta foi criada com sucesso, mas precisa ser aprovada.
            <br /><br />
            <span className="text-amber-400 font-bold">
              Você receberá um e-mail quando liberarmos seu acesso.
            </span>
          </p>

          <div className="bg-black/50 border border-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-3 text-left">
              <Mail className="text-gray-500 mt-1 shrink-0" size={20} />
              <div className="text-sm">
                <p className="text-gray-500 mb-2">
                  Geralmente leva <span className="text-white font-bold">até 24 horas</span>.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
