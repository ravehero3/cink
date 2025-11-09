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
          className="w-full grid grid-cols-6 divide-x divide-black"
          style={{
            letterSpacing: '0.12px',
            wordSpacing: '0px',
            lineHeight: '15.6px',
            fontVariantLigatures: 'normal'
          }}
        >
          <div className="px-4 py-6">
            <h3 className="text-xs uppercase mb-3 text-gray-500">O nás</h3>
            <ul className="space-y-0">
              <li><Link href="/o-nas" className="text-xs text-gray-500 hover:text-black transition-colors">O společnosti</Link></li>
              <li><Link href="/kontakt" className="text-xs text-gray-500 hover:text-black transition-colors">Kontakt</Link></li>
              <li><Link href="/kariera" className="text-xs text-gray-500 hover:text-black transition-colors">Kariéra</Link></li>
              <li><Link href="/pobocky" className="text-xs text-gray-500 hover:text-black transition-colors">Pobočky</Link></li>
            </ul>
          </div>

          <div className="px-4 py-6">
            <h3 className="text-xs uppercase mb-3 text-gray-500">Zákaznický servis</h3>
            <ul className="space-y-0">
              <li><Link href="/obchodni-podminky" className="text-xs text-gray-500 hover:text-black transition-colors">Obchodní podmínky</Link></li>
              <li><Link href="/reklamacni-rad" className="text-xs text-gray-500 hover:text-black transition-colors">Reklamační řád</Link></li>
              <li><Link href="/ochrana-osobnich-udaju" className="text-xs text-gray-500 hover:text-black transition-colors">Ochrana osobních údajů</Link></li>
              <li><Link href="/cookies" className="text-xs text-gray-500 hover:text-black transition-colors">Cookies</Link></li>
            </ul>
          </div>

          <div className="px-4 py-6">
            <h3 className="text-xs uppercase mb-3 text-gray-500">Nákup</h3>
            <ul className="space-y-0">
              <li><Link href="/jak-nakupovat" className="text-xs text-gray-500 hover:text-black transition-colors">Jak nakupovat</Link></li>
              <li><Link href="/platba" className="text-xs text-gray-500 hover:text-black transition-colors">Platba</Link></li>
              <li><Link href="/doprava" className="text-xs text-gray-500 hover:text-black transition-colors">Doprava</Link></li>
              <li><Link href="/vraceni-zbozi" className="text-xs text-gray-500 hover:text-black transition-colors">Vrácení zboží</Link></li>
            </ul>
          </div>

          <div className="px-4 py-6">
            <h3 className="text-xs uppercase mb-3 text-gray-500">Kontakt</h3>
            <ul className="space-y-0">
              <li className="text-xs text-gray-500">Běloves 378</li>
              <li className="text-xs text-gray-500">547 01 Náchod</li>
              <li className="text-xs text-gray-500">+420 774 292 158</li>
              <li className="text-xs text-gray-500">+420 608 111 827</li>
              <li><a href="mailto:info@ufosport.cz" className="text-xs text-gray-500 hover:text-black transition-colors">info@ufosport.cz</a></li>
            </ul>
          </div>

          <div className="px-4 py-6">
            <h3 className="text-xs uppercase mb-3 text-gray-500">Můj účet</h3>
            <ul className="space-y-0">
              <li><Link href="/prihlaseni" className="text-xs text-gray-500 hover:text-black transition-colors">Přihlášení</Link></li>
              <li><Link href="/registrace" className="text-xs text-gray-500 hover:text-black transition-colors">Registrace</Link></li>
              <li><Link href="/ucet" className="text-xs text-gray-500 hover:text-black transition-colors">Můj účet</Link></li>
              <li><Link href="/ucet" className="text-xs text-gray-500 hover:text-black transition-colors">Moje objednávky</Link></li>
            </ul>
          </div>

          <div className="px-4 py-6">
            <h3 className="text-xs uppercase mb-3 text-gray-500">Newsletter</h3>
            <ul className="space-y-0">
              <li><button onClick={() => setIsNewsletterOpen(true)} className="text-xs text-gray-500 hover:text-black transition-colors text-left">Přihlásit k odběru</button></li>
              <li className="text-xs text-gray-500 mt-3">Sledujte nás</li>
              <li><a href="https://www.instagram.com/ufosport" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-black transition-colors">Instagram</a></li>
              <li><a href="https://www.facebook.com/ufosport" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-black transition-colors">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="w-full border-t border-black px-4 py-2" style={{ backgroundColor: '#aaaaad' }}>
          <p className="text-xs font-semibold text-gray-500 text-center">© 2026 UFO SPORT</p>
        </div>
      </footer>

      <NewsletterWindow 
        isOpen={isNewsletterOpen} 
        onClose={() => setIsNewsletterOpen(false)} 
      />
    </>
  );
}
