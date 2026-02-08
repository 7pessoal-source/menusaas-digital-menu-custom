import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check } from "lucide-react";

const BeliefBreakSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-6">
            O cliente não escolhe só pelo{" "}
            <span className="text-muted-foreground line-through">preço</span>.
          </h2>
          <p className="text-xl sm:text-2xl text-primary font-display">
            Ele escolhe pelo que dá mais vontade.
          </p>
        </motion.div>

        {/* Contrast Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Bad Menu Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-glow p-8 border border-destructive/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-display text-xl text-muted-foreground">
                Cardápio comum
              </h3>
            </div>
            <ul className="space-y-4">
              {[
                "Cliente indeciso",
                "Fotos pequenas ou sem foto",
                "Difícil de navegar",
                "Parece amador",
                "Não gera vontade",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive/50" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive/80 italic">
                "Deixa eu ver outro restaurante..."
              </p>
            </div>
          </motion.div>

          {/* Good Menu Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card-glow p-8 border border-primary/30 relative overflow-hidden"
          >
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground">
                  Cardápio que vende
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Desejo imediato",
                  "Fotos grandes e apetitosas",
                  "Navegação fluida",
                  "Visual profissional",
                  "Cliente quer pedir",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary italic">
                  "Quero esse, esse e aquele também!"
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeliefBreakSection;
