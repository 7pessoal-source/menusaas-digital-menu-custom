const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-display text-xl">Cardápio Digital</span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()} Todos os direitos reservados.
            <br className="sm:hidden" />
            <span className="sm:ml-2">Feito com 🧡 para restaurantes.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
