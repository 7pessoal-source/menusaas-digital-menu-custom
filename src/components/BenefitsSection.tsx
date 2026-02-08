import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const benefits = [
  {
    emoji: "🍔",
    title: "Dá fome de olhar",
    description: "Fotos profissionais que despertam o apetite instantaneamente",
  },
  {
    emoji: "👀",
    title: "Prende atenção",
    description: "Design que mantém o cliente explorando seus pratos",
  },
  {
    emoji: "💳",
    title: "Facilita a decisão",
    description: "Organização clara que acelera a escolha do cliente",
  },
  {
    emoji: "📲",
    title: "Cliente escolhe mais rápido",
    description: "Menos tempo decidindo, mais tempo pedindo",
  },
  {
    emoji: "💰",
    title: "Mais pedidos, naturalmente",
    description: "Aumento nas vendas sem esforço extra",
  },
];

const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative bg-card/50">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
            Benefícios
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-6">
            O que você ganha com um{" "}
            <span className="text-gradient">cardápio irresistível</span>
          </h2>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className={`card-glow p-8 border border-border hover:border-primary/30 transition-all duration-300 group ${
                index === 4 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
                className="text-5xl mb-6"
              >
                {benefit.emoji}
              </motion.div>
              <h3 className="font-display text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
