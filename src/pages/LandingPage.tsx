import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@components/common';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-3xl mb-6">
            <Store className="text-white" size={40} />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight">
            MenuSaaS
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-600 font-medium max-w-2xl mx-auto">
            Plataforma digital de cardápios para restaurantes modernos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              icon={<Sparkles size={24} />}
            >
              Começar Agora
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/menu/demo')}
              icon={<ExternalLink size={24} />}
            >
              Ver Demo
            </Button>
          </div>

          <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Fácil de Usar', desc: 'Interface intuitiva e moderna' },
              { title: 'IA Integrada', desc: 'Descrições automáticas com AI' },
              { title: 'Sempre Online', desc: 'Seu cardápio 24/7 disponível' },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-white rounded-3xl shadow-lg">
                <h3 className="font-black text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
