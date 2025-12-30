// src/components/product/productView/OptionSelector.tsx
"use client";

import { useState, useRef, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./productView.module.css";

interface OptionSelectorProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  isOptionValid: (optionName: string, value: string) => boolean;
}

export default function OptionSelector({ 
  label, 
  options, 
  selected, 
  onChange,
  isOptionValid 
}: OptionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  // --- LÓGICA DE ORDENAÇÃO INTELIGENTE (Natural Sort) ---
  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;

      if (numA > 0 && numB > 0) {
        if (numA !== numB) return numA - numB;
      }
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [options]);

  // --- ANIMAÇÃO E CONTROLE DE Z-INDEX ---
  useGSAP(() => {
    if (!listRef.current || !iconRef.current || !containerRef.current) return;

    if (isOpen) {
      // 1. AO ABRIR: Subimos o z-index IMEDIATAMENTE para ele ficar por cima de tudo
      gsap.set(containerRef.current, { zIndex: 100 });

      gsap.to(listRef.current, {
        height: "auto",
        autoAlpha: 1,
        duration: 0.4,
        ease: "power3.out"
      });
      
      gsap.to(iconRef.current, { rotation: 180, duration: 0.3 });

    } else {
      // 2. AO FECHAR: Animamos a altura...
      gsap.to(listRef.current, {
        height: 0,
        autoAlpha: 0,
        duration: 0.3,
        ease: "power3.in",
        // 3. ... e SÓ baixamos o z-index quando a animação terminar completamente.
        // Isso impede que o menu "corte" passando por trás do item de baixo.
        onComplete: () => {
             gsap.set(containerRef.current, { zIndex: 1 });
        }
      });
      
      gsap.to(iconRef.current, { rotation: 0, duration: 0.3 });
    }
  }, { scope: containerRef, dependencies: [isOpen] });

  return (
    <div 
      className={styles.selectorContainer} 
      ref={containerRef}
    >
      
      {/* Cabeçalho */}
      <button 
        className={`${styles.selectorHeader} ${isOpen ? styles.selectorHeaderActive : ''}`} 
        onClick={toggleOpen}
        type="button" // Boa prática para evitar submits acidentais em forms
      >
        <div className={styles.selectorLabelInfo}>
          <span className={styles.selectorLabelTitle}>{label}</span>
          <span className={styles.selectorCurrentValue}>{selected}</span>
        </div>
        <div ref={iconRef} className={styles.iconWrapper}>
          <ChevronDown size={20} color="#FFDA45" />
        </div>
      </button>

      {/* Lista Dropdown */}
      <div className={styles.selectorListWrapper} ref={listRef}>
        <div className={styles.selectorGrid}>
          {sortedOptions.map((value) => { 
            const isValid = isOptionValid(label, value);
            const isSelected = selected === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  onChange(value);
                  setIsOpen(false);
                }}
                disabled={!isValid && !isSelected}
                className={`
                  ${styles.optionItem} 
                  ${isSelected ? styles.optionSelected : ''}
                  ${!isValid ? styles.optionUnavailable : ''}
                `}
                title={!isValid ? "Indisponível nesta combinação" : ""}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}