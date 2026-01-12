// src/components/home/Popular/index.tsx
"use client";

import styles from "./popular.module.css";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/utils/format";
import TransitionLink from "@/components/ui/TransitionLink"; 
import { ShopifyProduct } from "@/lib/shopify/types";

interface PopularProps {
  products: { node: ShopifyProduct }[];
}

export default function Popular({ products }: PopularProps) {
  // REMOVIDO: const { addItem, openCart } = useCartStore(); 
  // Não precisamos mais da lógica de carrinho aqui, o componente fica mais leve.

  if (!products || products.length === 0) return null;

  return (
    <section className={styles.popularSection}>
      <ScrollReveal className={styles.header}>
        <h2 className={styles.title}>Produtos em destaque</h2>
      </ScrollReveal>

      <ScrollReveal className={styles.gridContainer} stagger={0.1}>
        {products.map(({ node: product }) => {
          const image = product.images.edges[0]?.node;
          const firstVariant = product.variants.edges[0]?.node;
          
          const price = firstVariant?.price || product.priceRange.minVariantPrice;
          const isAvailable = firstVariant?.availableForSale;

          return (
            <div key={product.id} className={styles.card}>
              
              <TransitionLink 
                href={`/produtos/${product.handle}`} 
                className={styles.imageContainer}
              >
                 {image ? (
                    <img 
                      src={image.url} 
                      alt={image.altText || product.title} 
                      className={styles.productImg} 
                    />
                 ) : (
                    <div className={styles.productImg} style={{background: '#222', width: '100%', height: '100%'}} />
                 )}
              </TransitionLink>

              <div className={styles.info}>
                <h3 className={styles.productName}>{product.title}</h3>
                <p className={styles.price}>
                  {formatPrice(price.amount, price.currencyCode)}
                </p>
              </div>

              {/* MUDANÇA AQUI:
                  1. Trocamos <button> por <TransitionLink> para manter a animação de página.
                  2. Mantivemos className={styles.buyButton} para preservar 100% do visual.
                  3. Adicionamos estilos inline para garantir que o Link (que é um <a>)
                     se comporte visualmente igual a um botão (centralizado e bloco).
              */}
              <TransitionLink
                href={isAvailable ? `/produtos/${product.handle}` : '#'}
                className={styles.buyButton}
                onClick={(e) => {
                   // Previne a navegação se estiver indisponível
                   if (!isAvailable) e.preventDefault();
                }}
                style={{ 
                  opacity: isAvailable ? 1 : 0.5, 
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  display: 'flex',           // Garante comportamento de caixa
                  justifyContent: 'center',  // Centraliza texto horizontalmente
                  alignItems: 'center',      // Centraliza texto verticalmente
                  textDecoration: 'none',    // Remove sublinhado padrão de links
                  textAlign: 'center'
                }}
              >
                {isAvailable ? 'Comprar Agora' : 'Indisponível'}
              </TransitionLink>
              
            </div>
          );
        })}
      </ScrollReveal>
    </section>
  );
}


