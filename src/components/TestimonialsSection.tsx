import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Os clientes elogiam o cardápio antes mesmo de pedir. Mudou o jogo do meu restaurante.",
    author: "Maria",
    business: "Pizzaria Bella",
    avatar: "🍕",
  },
  {
    quote: "Depois que organizei, vendo mais e explico menos. O cardápio fala por si só.",
    author: "João",
    business: "Burger House",
    avatar: "🍔",
  },
  {
    quote: "Meus clientes ficam impressionados. Parece um cardápio de restaurante de luxo.",
    author: "Ana",
    business: "Bar da Ana",
    avatar: "🍸",
  },
];

const TestimonialsSection = () => {
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
            Quem já usa
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-6">
            O que dizem os donos de{" "}
            <span className="text-gradient">restaurantes</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * index }}
              className="card-glow p-8 border border-border hover:border-primary/30 transition-colors relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary/20">
                <Quote className="w-8 h-8" />
              </div>

              <div className="text-4xl mb-6">{testimonial.avatar}</div>

              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">
                    {testimonial.author[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.business}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
