import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles, Check } from "lucide-react";

const FinalCTASection = ({ onStartNow }: { onStartNow: () => void; }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8"
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>

          {/* Headline */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-6">
            Seu restaurante merece um cardápio que{" "}
            <span className="text-gradient">dê vontade de pedir.</span>
          </h2>

          {/* Subtext */}
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Não é só um cardápio. É uma vitrine de comida que transforma olhares
            em pedidos.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button onClick={onStartNow} className="btn-hero text-lg sm:text-xl group">
              Criar meu cardápio agora
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Subtext below CTA */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-muted-foreground mt-6"
          >
            Leva poucos minutos.{" "}
            <span className="text-foreground">O impacto é imediato.</span>
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Sem necessidade de conhecimento técnico</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Visual profissional garantido</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Funciona em qualquer celular</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
