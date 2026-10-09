'use client';

import Link from 'next/link';
import styles from './CartLineItem.module.css';

interface CartLineItemProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  color?: string;
  size: string;
  quantity: number;
  category?: string;
  onUpdateQuantity: (productId: string, size: string, newQuantity: number) => void;
  onRemove: (productId: string, name: string, size: string) => void;
  onSaveForLater: (productId: string, size: string) => void;
  onClose: () => void;
}

export default function CartLineItem({
  productId,
  name,
  price,
  image,
  slug,
  color,
  size,
  quantity,
  category,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
  onClose,
}: CartLineItemProps) {
  const formatPrice = (priceNum: number) => {
    return priceNum.toLocaleString('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0,
    }).replace('Kč', '').trim() + ' Kč';
  };

  const isCDCategory = category?.toUpperCase() === 'CD';

  return (
    <article className={styles.cartItem}>
      {/* Product Image */}
      <div className={styles.media}>
        {image && (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Product Info */}
      <div className={styles.info}>
        <Link
          href={`/produkty/${slug}`}
          onClick={onClose}
          className={styles.name}
          style={{ textDecoration: 'none', color: '#000' }}
        >
          {name}
        </Link>

        <div className={styles.price}>{formatPrice(price)}</div>

        {/* Attributes - only show for non-CD products */}
        {!isCDCategory && (
          <>
            <div className={styles.attr}>Barva: {color}</div>
            <div className={styles.attr}>Velikost: {size}</div>
          </>
        )}

        {/* Quantity Control */}
        <div className={styles.qty}>
          <span>Množství:</span>
          <button
            className={styles.qtyButton}
            onClick={() => {
              if (quantity > 1) {
                onUpdateQuantity(productId, size, quantity - 1);
              }
            }}
            aria-label="Snížit množství"
          >
            −
          </button>
          <output className={styles.qtyOutput}>{quantity}</output>
          <button
            className={styles.qtyButton}
            onClick={() => onUpdateQuantity(productId, size, quantity + 1)}
            aria-label="Zvýšit množství"
          >
            +
          </button>
        </div>
      </div>

      {/* Actions Row */}
      <div className={styles.actions}>
        <button
          className={styles.actionButton}
          onClick={() => onSaveForLater(productId, size)}
          type="button"
        >
          Uložit na později
        </button>
        <div className={styles.actionsRight}>
          <Link
            href={`/produkty/${slug}`}
            onClick={onClose}
            className={styles.actionButton}
            style={{ textDecoration: 'underline' }}
          >
            Upravit
          </Link>
          <button
            className={styles.actionButton}
            onClick={() => onRemove(productId, name, size)}
            type="button"
          >
            Smazat
          </button>
        </div>
      </div>
    </article>
  );
}
