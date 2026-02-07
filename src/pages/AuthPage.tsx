import React from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../components/features/Auth';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/admin');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Auth 
      onAuthSuccess={handleAuthSuccess}
      onBack={handleBack}
    />
  );
};

export default AuthPage;
