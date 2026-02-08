import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, MessageCircleQuestion, ImageOff, AlertCircle, ShieldX } from "lucide-react";

const problems = [
  {
    icon: Clock,
    text: "Cliente demora pra escolher",
  },
  {
    icon: MessageCircleQuestion,
    text: "Pergunta tudo no WhatsApp",
  },
  {
    icon: ImageOff,
    text: "Cardápio não valoriza os pratos",
  },
  {
    icon: AlertCircle,
    text: "Parece amador",
  },
  {
    icon: ShieldX,
    text: "Não passa confiança",
  },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative bg-card/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
            O problema real
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-6">
            Você reconhece algum desses problemas?
          </h2>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card-glow p-6 text-center group hover:border-primary/30 border border-transparent transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                <problem.icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {problem.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Impact Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="card-glow p-8 sm:p-10 border border-primary/20 text-center relative overflow-hidden">
            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
            
            <blockquote className="relative z-10">
              <p className="font-display text-xl sm:text-2xl lg:text-3xl text-foreground">
                "Se o cardápio não impressiona,{" "}
                <span className="text-primary">o cliente pula pro próximo.</span>"
              </p>
            </blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
