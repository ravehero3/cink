'use client';

import { useState } from 'react';
import Link from 'next/link';
import NewsletterWindow from './NewsletterWindow';

export default function Footer() {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  return (
    <>
      <footer style={{ backgroundColor: '#aaaaad' }} className="w-full">
        <div 
          className="w-full grid grid-cols-6 divide-x divide-black border-t border-black"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.12px',
            wordSpacing: '0px',
            lineHeight: '17.6px',
            fontVariantLigatures: 'normal',
            margin: '0px',
            padding: '0px'
          }}
        >
          <div style={{ paddingTop: '4px', paddingLeft: '4px', paddingRight: '16px', paddingBottom: '24px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>NEWSLETTER</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px', padding: '0px', whiteSpace: 'nowrap' }}>Přihlašte se k odběru novinek</li>
            </ul>
          </div>

          <div style={{ paddingTop: '4px', paddingLeft: '4px', paddingRight: '16px', paddingBottom: '24px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>Zákaznický servis</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/obchodni-podminky" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Obchodní podmínky</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/reklamacni-rad" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Reklamační řád</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/ochrana-osobnich-udaju" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Ochrana osobních údajů</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/cookies" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Cookies</Link></li>
            </ul>
          </div>

          <div style={{ paddingTop: '4px', paddingLeft: '4px', paddingRight: '16px', paddingBottom: '24px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>Nákup</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/jak-nakupovat" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Jak nakupovat</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/platba" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Platba</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/doprava" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Doprava</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/vraceni-zbozi" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Vrácení zboží</Link></li>
            </ul>
          </div>

          <div style={{ paddingTop: '4px', paddingLeft: '4px', paddingRight: '16px', paddingBottom: '24px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>Kontakt</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px', padding: '0px' }}>Běloves 378</li>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px', padding: '0px' }}>547 01 Náchod</li>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px', padding: '0px' }}>+420 775 181 107</li>
              <li style={{ margin: '0px', padding: '0px' }}><a href="mailto:ufosport@mail.com" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>ufosport@mail.com</a></li>
            </ul>
          </div>

          <div style={{ paddingTop: '4px', paddingLeft: '4px', paddingRight: '16px', paddingBottom: '24px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>Můj účet</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/prihlaseni" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Přihlášení</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/registrace" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Registrace</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/ucet" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Můj účet</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/ucet" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Moje objednávky</Link></li>
            </ul>
          </div>

          <div style={{ paddingTop: '4px', paddingLeft: '4px', paddingRight: '16px', paddingBottom: '24px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>Sledujte nás</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li style={{ margin: '0px', padding: '0px' }}><a href="https://www.instagram.com/ufosport.cz/?hl=en" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Instagram</a></li>
              <li style={{ margin: '0px', padding: '0px' }}><a href="https://www.facebook.com/ufosports/?locale=cs_CZ" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors" style={{ fontSize: '12px', lineHeight: '17.6px', letterSpacing: '0.12px' }}>Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="w-full border-t border-black px-4 py-2" style={{ backgroundColor: '#aaaaad' }}>
          <p className="text-xs text-gray-500 text-center" style={{ fontFamily: '"Helvetica Neue Condensed Regular", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>© 2026 UFO SPORT</p>
        </div>
      </footer>

      <NewsletterWindow 
        isOpen={isNewsletterOpen} 
        onClose={() => setIsNewsletterOpen(false)} 
      />
    </>
  );
}
