import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@components/common';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-black text-gray-900">404</h1>
        <p className="text-2xl text-gray-600">Página não encontrada</p>
        <Button onClick={() => navigate('/')} icon={<Home />}>
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
