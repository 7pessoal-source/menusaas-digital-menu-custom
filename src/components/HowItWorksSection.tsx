import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { PenLine, FolderOpen, Share2, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    number: "01",
    title: "Você monta seu cardápio",
    description: "Adicione seus pratos de forma simples e rápida",
  },
  {
    icon: FolderOpen,
    number: "02",
    title: "Organiza seus pratos",
    description: "Separe por categorias e destaque os melhores",
  },
  {
    icon: Share2,
    number: "03",
    title: "Compartilha o link",
    description: "Envie para seus clientes pelo WhatsApp ou redes",
  },
  {
    icon: ShoppingBag,
    number: "04",
    title: "O cliente sente vontade e pede",
    description: "Mais pedidos chegando naturalmente",
  },
];

const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
            Como funciona
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-6">
            Simples assim.{" "}
            <span className="text-muted-foreground">Sem complicação.</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

            <div className="space-y-8 lg:space-y-0">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                  className={`relative lg:flex items-center gap-8 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content Card */}
                  <div className={`lg:w-5/12 ${index % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                    <div className="card-glow p-6 border border-border hover:border-primary/30 transition-colors inline-block text-left">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <step.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg mb-2 text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Number */}
                  <div className="hidden lg:flex lg:w-2/12 justify-center">
                    <div className="relative z-10 w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                      <span className="font-display text-xl text-primary">{step.number}</span>
                    </div>
                  </div>

                  {/* Empty Space */}
                  <div className="hidden lg:block lg:w-5/12" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
