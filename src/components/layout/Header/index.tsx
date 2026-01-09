// src/components/layout/header/index.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link"; 
import Image from "next/image";
import styles from "./header.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCartStore } from "@/store/cartStore";
import CartContent from "./CartContent";
import SearchBox from "./SearchBox";
import MobileSearchResults from "./MobileSearchResults";
import TransitionLink from "@/components/ui/TransitionLink";
import { useLenis } from "@/components/ui/SmoothScroll"; 
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const lenis = useLenis(); 
  const pathname = usePathname();
  const router = useRouter();

  // Refs e States
  const mobileContentRef = useRef<HTMLDivElement>(null); 
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileCartRef = useRef<HTMLDivElement>(null);
  const cartContentRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  
  // 🔥 CORREÇÃO: Ref para guardar a altura anterior do header e evitar o "pulo"
  const previousHeightRef = useRef<number | "auto">("auto");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isOpen: isCartOpen, openCart, closeCart, cart } = useCartStore();
  
  // Timelines do GSAP
  const mobileTl = useRef<gsap.core.Timeline | null>(null);
  const cartTl = useRef<gsap.core.Timeline | null>(null);
  
  // Dados para monitoramento
  const cartLines = cart?.lines?.edges || [];
  const totalItems = cartLines.length; // Quantidade de LINHAS (produtos diferentes)
  const totalQuantity = cart?.totalQuantity || 0;

  // --- 1. Sincroniza abertura/fechamento do Carrinho ---
  useEffect(() => {
    if (!cartTl.current) return;

    if (isCartOpen) {
      if (isMobileMenuOpen) toggleMobileMenu(); 
      cartTl.current.play();
      // Ao abrir, salvamos a altura atual como referência inicial
      if (headerRef.current) previousHeightRef.current = headerRef.current.offsetHeight;
    } else {
      cartTl.current.reverse();
    }
  }, [isCartOpen]); 

  // --- 2. Animação de Entrada Inicial e Configuração das Timelines ---
  const { contextSafe } = useGSAP(() => {
      // Entrada do Header
      gsap.set(headerRef.current, { xPercent: -50, y: -150, autoAlpha: 0 });
      gsap.to(headerRef.current, { y: 0, autoAlpha: 1, duration: 1.2, ease: "power4.out", delay: 0.2 });
      
      // Timeline Menu Mobile
      const mTl = gsap.timeline({ paused: true });
      if (headerRef.current && mobileContentRef.current && line1Ref.current) {
        mTl.set(mobileContentRef.current, { display: 'flex', autoAlpha: 0, y: -20 });
        mTl.to(line2Ref.current, { scaleX: 0, opacity: 0, duration: 0.2 }, 0)
           .to(line1Ref.current, { y: 9, rotate: 45, duration: 0.3 }, 0)
           .to(line3Ref.current, { y: -9, rotate: -45, duration: 0.3 }, 0);
        mTl.to(headerRef.current, { height: "auto", borderRadius: "32px", backgroundColor: "rgba(20,20,20, 0.6)", duration: 0.9, ease: "expo.inOut" }, 0);
        mTl.to(mobileContentRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");
        mTl.set(mobileMenuRef.current, { autoAlpha: 1, display: 'flex' }, 0);
        mTl.set(mobileCartRef.current, { autoAlpha: 0, display: 'none' }, 0);
      }
      mobileTl.current = mTl;

      // Timeline Carrinho Desktop
      const cTl = gsap.timeline({ paused: true });
      if (headerRef.current && cartContentRef.current) {
        cTl.set(cartContentRef.current, { display: 'flex', autoAlpha: 0, y: -20 })
           .to(headerRef.current, { height: "auto", borderRadius: "32px", backgroundColor: "rgba(20,20,20,0.6)", duration: 0.9, ease: "expo.inOut" })
           .to(cartContentRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");
      }
      cartTl.current = cTl;

  }, { scope: headerRef });

  // --- 3. 🔥 CORREÇÃO: Animação Fluida ao Adicionar/Remover Itens ---
  // Monitoramos apenas 'totalItems'. Se mudar, forçamos o efeito "grow".
  useGSAP(() => {
    // Só anima se o carrinho estiver visível E se tivermos uma referência válida
    if (isCartOpen && headerRef.current && typeof previousHeightRef.current === 'number') {
        
        // O React já renderizou, então 'headerRef.current.offsetHeight' é a NOVA altura (grande)
        const newHeight = headerRef.current.offsetHeight;
        const oldHeight = previousHeightRef.current;

        // Se a altura mudou, fazemos a animação manual (fromTo)
        if (newHeight !== oldHeight) {
            gsap.fromTo(headerRef.current, 
                { height: oldHeight }, // Começa visualmente da altura antiga
                { 
                  height: "auto", // Vai até a altura automática (que é a nova)
                  duration: 0.4, 
                  ease: "power2.out", // Curva suave
                  overwrite: "auto", // Garante que não brigue com outras animações
                  onComplete: () => {
                     // Garante que fique "auto" no final para responsividade
                     gsap.set(headerRef.current, { height: "auto" });
                  }
                }
            );
        }
        
        // Atualiza a referência para a próxima mudança
        previousHeightRef.current = newHeight;
    } else if (headerRef.current) {
        // Se o carrinho estiver fechado ou abrindo agora, apenas atualizamos a ref silenciosamente
        previousHeightRef.current = headerRef.current.offsetHeight;
    }
  }, { 
    scope: headerRef, 
    dependencies: [totalItems] // 🔥 Só dispara quando o número de itens na lista muda
  });


  // --- Funções Auxiliares (Sem alterações de layout) ---
  const switchMobileView = contextSafe((target: 'cart' | 'menu') => {
    if (!mobileMenuRef.current || !mobileCartRef.current) return;
    if (target === 'cart') {
      gsap.to(mobileMenuRef.current, { autoAlpha: 0, duration: 0.3, onComplete: () => {
          gsap.set(mobileMenuRef.current, { display: 'none' });
          gsap.set(mobileCartRef.current, { display: 'block' });
          gsap.fromTo(mobileCartRef.current, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.4 });
      }});
    } else {
      gsap.to(mobileCartRef.current, { autoAlpha: 0, duration: 0.3, onComplete: () => {
          gsap.set(mobileCartRef.current, { display: 'none' });
          gsap.set(mobileMenuRef.current, { display: 'flex' });
          gsap.fromTo(mobileMenuRef.current, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.4 });
      }});
    }
  });

  useEffect(() => {
    if (!lenis) return;
    if (isCartOpen || isMobileMenuOpen) {
      lenis.stop(); 
      document.body.style.overflow = 'hidden'; 
    } else {
      lenis.start();
      document.body.style.overflow = '';
    }
    return () => {
      lenis.start(); 
      document.body.style.overflow = '';
    };
  }, [isCartOpen, isMobileMenuOpen, lenis]);

  const toggleMobileMenu = contextSafe(() => {
    if (!mobileTl.current) return;
    if (!isMobileMenuOpen) {
        if (isCartOpen) closeCart(); 
        setIsMobileMenuOpen(true);
        mobileTl.current.play();
        gsap.set(mobileMenuRef.current, { display: 'flex', autoAlpha: 1, x: 0 });
        gsap.set(mobileCartRef.current, { display: 'none', autoAlpha: 0 });
    } else {
        setIsMobileMenuOpen(false);
        mobileTl.current.reverse();
    }
  });

  const handleCartClick = () => {
      if (isCartOpen) closeCart();
      else openCart();
  };

  const handleScrollTo = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    if (pathname !== "/") {
      if (isMobileMenuOpen) toggleMobileMenu();
      router.push("/");
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 800);
      return;
    }
    if (!lenis) {
       const element = document.getElementById(targetId);
       if (element) element.scrollIntoView({ behavior: 'smooth' });
       return;
    }
    if (isMobileMenuOpen) {
      toggleMobileMenu();
      lenis.start();
      document.body.style.overflow = '';
      setTimeout(() => {
        lenis.scrollTo(`#${targetId}`, { offset: -100, duration: 1.5, lock: true, force: true });
      }, 300);
    } else {
      lenis.scrollTo(`#${targetId}`, { offset: -100, duration: 1.5 });
    }
  };

  return (
    <header className={styles.header} ref={headerRef}>
      
      <div className={styles.navBar}>
          <TransitionLink href="/" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
              <Image src="/logo2.svg" alt="Packon" fill priority sizes="120px" style={{ objectFit: 'contain' }} />
            </div>
          </TransitionLink>

          <nav className={styles.desktopNav}>
             <TransitionLink href="/" className={styles.navLink}>Início</TransitionLink>
             <TransitionLink href="/produtos" className={styles.navLink}>Catálogo</TransitionLink>
             <a href="#quem-somos" onClick={(e) => handleScrollTo(e, 'quem-somos')} className={styles.navLink}>Quem somos</a>
             <a href="#contato" onClick={(e) => handleScrollTo(e, 'contato')} className={styles.navLink}>Contato</a>
          </nav>

          <div className={styles.desktopActions}>
            <SearchBox />
            <button className={styles.cartButton} onClick={handleCartClick}>
              <ShoppingCart className={styles.cartIcon} size={26} />
              {totalQuantity > 0 && <span className={styles.badge}>{totalQuantity}</span>}
            </button>
          </div>

          <button className={styles.hamburger} onClick={toggleMobileMenu}>
              <span ref={line1Ref} className={styles.line}></span>
              <span ref={line2Ref} className={styles.line}></span>
              <span ref={line3Ref} className={styles.line}></span>
          </button>
      </div>
      
      <div className={styles.cartContainer} ref={cartContentRef}>
          <CartContent />
      </div>

      <div className={styles.mobileContent} ref={mobileContentRef}>
          <div className={styles.mobileNavWrapper} ref={mobileMenuRef}>
             <div className={styles.mobileSearchSection}>
                <SearchBox isMobile={true} />
                <MobileSearchResults onLinkClick={toggleMobileMenu} />
             </div>
             <button className={styles.mobileCartBtn} onClick={() => switchMobileView('cart')}>
                <ShoppingCart size={32} />
                <span>Carrinho ({totalQuantity})</span>
             </button>
             <nav className={styles.mobileNav}>
               <TransitionLink href="/" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Início</TransitionLink>
               <TransitionLink href="/produtos" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Catálogo</TransitionLink>
               <a href="#quem-somos" onClick={(e) => handleScrollTo(e, 'quem-somos')} className={styles.mobileNavLink}>Quem somos</a>
               <a href="#contato" onClick={(e) => handleScrollTo(e, 'contato')} className={styles.mobileNavLink}>Contato</a>
             </nav>
          </div>
          <div className={styles.mobileCartWrapper} ref={mobileCartRef} style={{ display: 'none', opacity: 0 }}>
             <CartContent onBack={() => switchMobileView('menu')} />
          </div>
      </div>
    </header>
  );
}