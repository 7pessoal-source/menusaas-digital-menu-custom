import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Image, LayoutGrid, Tag, Sparkles, Smartphone } from "lucide-react";
import foodBurger from "@/assets/food-burger.jpg";
import foodPizza from "@/assets/food-pizza.jpg";
import foodCocktail from "@/assets/food-cocktail.jpg";

const features = [
  {
    icon: Image,
    title: "Fotos em destaque",
    description: "Imagens grandes que despertam apetite",
  },
  {
    icon: LayoutGrid,
    title: "Organização inteligente",
    description: "Categorias que guiam a escolha",
  },
  {
    icon: Tag,
    title: "Categorias separadas",
    description: "Fácil de encontrar cada prato",
  },
  {
    icon: Sparkles,
    title: "Visual profissional",
    description: "Design limpo e elegante",
  },
  {
    icon: Smartphone,
    title: "Perfeito no celular",
    description: "Funciona em qualquer dispositivo",
  },
];

const SolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Food Images Grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="space-y-4"
              >
                <img
                  src={foodBurger}
                  alt="Burger apetitoso"
                  className="food-image w-full aspect-square object-cover"
                />
                <img
                  src={foodCocktail}
                  alt="Cocktail refrescante"
                  className="food-image w-full aspect-[4/3] object-cover"
                />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="pt-8"
              >
                <img
                  src={foodPizza}
                  alt="Pizza deliciosa"
                  className="food-image w-full aspect-[3/4] object-cover"
                />
              </motion.div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-4 -right-4 bg-card border border-primary/30 p-4 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Não é só cardápio</div>
                  <div className="font-semibold text-foreground">É vitrine de comida</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
              A solução
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-6">
              Um cardápio que{" "}
              <span className="text-gradient">vende sozinho</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Seu cardápio deixa de ser informativo e passa a ser{" "}
              <span className="text-foreground font-medium">persuasivo</span>.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
