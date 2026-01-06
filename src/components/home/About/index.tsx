"use client";

import { useRef } from "react";
// Removemos o import de Link pois não vamos mais usar navegação interna aqui
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./about.module.css";
import { getWhatsAppLink, SITE_CONFIG } from "@/config/site";

// --- CONFIGURAÇÃO WHATSAPP ---
const WHATSAPP_NUMBER = "5535999521044"; 
const WHATSAPP_MSG = encodeURIComponent("Olá! Gostaria de saber mais sobre a Packon.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;


gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function ScrollReveal({ 
  children, 
  className = "", 
  stagger = 0, 
  delay = 0 
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.children;

    gsap.fromTo(elements, 
      { 
        y: 30, 
        opacity: 0, 
        filter: "blur(4px)" 
      },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
        stagger: stagger,
        delay: delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (imageRef.current) {
      gsap.fromTo(imageRef.current, 
        { y: -50, scale: 1.1 }, 
        {
          y: 50, 
          scale: 1.1, 
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1 
          }
        }
      );
    }
  }, { scope: containerRef });

  return (
    <section className={styles.section} ref={containerRef} id="quem-somos">
      <div className={styles.contentContainer}>
        <div className={styles.grid}>
          {/* Coluna 1: Título */}
          <div className={styles.colLeft}>
             <ScrollReveal>
                <span className={styles.label}>Sobre a Packon</span>
                <h2 className={styles.title}>
                  Inovação que envolve o <span className={styles.highlight}>seu produto.</span>
                </h2>
             </ScrollReveal>
          </div>

          {/* Coluna 2: Texto Descritivo + Botão */}
          <div className={styles.colRight}>
            <ScrollReveal delay={0.2}>
              <p className={styles.description}>
                Nascemos para transformar o mercado de embalagens flexíveis. 
                Combinamos tecnologia de ponta com um design inteligente para criar 
                soluções que não apenas protegem, mas agregam valor real à sua marca.
              </p>
              <p className={styles.description}>
                Do conceito à entrega, nosso processo é focado em agilidade, 
                qualidade extrema e compromisso com o resultado do seu negócio.
              </p>
              
              {/* MUDANÇA AQUI: Link para WhatsApp */}
              <a 
  href={getWhatsAppLink(SITE_CONFIG.whatsapp.aboutMessage)} // Mensagem personalizada para "Sobre"
  target="_blank"
  rel="noopener noreferrer"
  className={styles.linkButton}
>
  Entre em Contato <ArrowRight size={20} />
</a>
            </ScrollReveal>
          </div>
        </div>

      </div>
    </section>
  );
}