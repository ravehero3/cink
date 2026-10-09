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
  onClose?: () => void;
  layout?: 'modal' | 'page';
  isFirstItem?: boolean;
  isSavingForLater?: boolean;
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
  layout = 'modal',
  isFirstItem = false,
  isSavingForLater = false,
}: CartLineItemProps) {
  const handleNavigate = () => {
    if (onClose) onClose();
  };

  const formatPrice = (priceNum: number) => {
    return priceNum.toLocaleString('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0,
    }).replace('Kč', '').trim() + ' Kč';
  };

  const isCDCategory = category?.toUpperCase() === 'CD';

  // Modal layout: 143px grid
  if (layout === 'modal') {
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
            onClick={handleNavigate}
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
              onClick={handleNavigate}
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

  // Page layout: Full width with side-by-side image and content
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '143px 1fr',
        gridTemplateRows: 'auto auto',
        border: '1px solid #000',
        backgroundColor: '#fff',
      }}
    >
      {/* Product Image */}
      <div
        style={{
          backgroundColor: '#d9d9d9',
          width: '143px',
          height: '143px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          margin: 0,
        }}
      >
        {image && (
          <img
            src={image}
            alt={name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Product Info */}
      <div
        style={{
          padding: '23px 15px 0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <Link
          href={`/produkty/${slug}`}
          onClick={handleNavigate}
          style={{
            margin: '0 0 5px 0',
            fontSize: '15.3px',
            lineHeight: '17px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            color: '#000',
            textDecoration: 'none',
          }}
        >
          {name}
        </Link>

        <div
          style={{
            fontSize: '16.5px',
            lineHeight: '19px',
            margin: '0 0 10px 0',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            color: '#000',
          }}
        >
          {formatPrice(price)}
        </div>

        {/* Attributes */}
        {!isCDCategory && (
          <>
            <div
              style={{
                fontSize: '16.5px',
                lineHeight: '23px',
                margin: 0,
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                color: '#000',
              }}
            >
              Barva: {color}
            </div>
            <div
              style={{
                fontSize: '16.5px',
                lineHeight: '23px',
                margin: 0,
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                color: '#000',
              }}
            >
              Velikost: {size}
            </div>
          </>
        )}

        {/* Quantity Control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            fontSize: '16.5px',
            lineHeight: '23px',
            margin: 0,
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            color: '#000',
          }}
        >
          <span>Množství:</span>
          <button
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              width: '14px',
              font: 'inherit',
              fontSize: '19px',
              lineHeight: '23px',
              cursor: 'pointer',
              color: '#000',
              textAlign: 'center',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
            onClick={() => {
              if (quantity > 1) {
                onUpdateQuantity(productId, size, quantity - 1);
              }
            }}
            aria-label="Snížit množství"
          >
            −
          </button>
          <output
            style={{
              minWidth: '8px',
              textAlign: 'center',
            }}
          >
            {quantity}
          </output>
          <button
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              width: '14px',
              font: 'inherit',
              fontSize: '19px',
              lineHeight: '23px',
              cursor: 'pointer',
              color: '#000',
              textAlign: 'center',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
            onClick={() => onUpdateQuantity(productId, size, quantity + 1)}
            aria-label="Zvýšit množství"
          >
            +
          </button>
        </div>
      </div>

      {/* Actions Row */}
      <div
        style={{
          gridColumn: '1 / -1',
          alignSelf: 'end',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '23px 17px 15px 17px',
          fontSize: '16.5px',
          lineHeight: '19px',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          color: '#000',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 0,
            padding: 0,
            font: 'inherit',
            color: '#000',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            cursor: isSavingForLater ? 'not-allowed' : 'pointer',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '16.5px',
            lineHeight: '19px',
            opacity: isSavingForLater ? 0.6 : 1,
          }}
          onClick={() => onSaveForLater(productId, size)}
          disabled={isSavingForLater}
          type="button"
        >
          {isSavingForLater ? 'Ukládám...' : 'Uložit na později'}
        </button>
        <div style={{ display: 'flex', gap: '21px' }}>
          <Link
            href={`/produkty/${slug}`}
            onClick={handleNavigate}
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              font: 'inherit',
              color: '#000',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '16.5px',
              lineHeight: '19px',
            }}
          >
            Upravit
          </Link>
          <button
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              font: 'inherit',
              color: '#000',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              cursor: 'pointer',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '16.5px',
              lineHeight: '19px',
            }}
            onClick={() => onRemove(productId, name, size)}
            type="button"
          >
            Smazat
          </button>
        </div>
      </div>
    </div>
  );
}
