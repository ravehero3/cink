'use client';

import { useState } from 'react';
import Link from 'next/link';
import NewsletterWindow from './NewsletterWindow';

export default function Footer() {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  return (
    <>
      <footer style={{ backgroundColor: '#aaaaad' }} className="w-full relative z-0">
        <div 
          className="w-full grid grid-cols-6 divide-x divide-black border-t border-black"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            letterSpacing: '0.12px',
            wordSpacing: '0px',
            lineHeight: '23.6px',
            textAlign: 'start',
            fontVariantLigatures: 'normal',
            margin: '0px',
            padding: '0px',
            minHeight: 'calc(33.33vh - 60px)'
          }}
        >
          <div style={{ paddingTop: '16px', paddingLeft: '12px', paddingRight: '16px', paddingBottom: '48px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>ODBĚR NOVINEK</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li style={{ margin: '0px', padding: '0px' }}>
                <button
                  onClick={() => setIsNewsletterOpen(true)}
                  className="text-gray-500 hover:text-black transition-colors underline"
                  style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', textAlign: 'start', background: 'none', border: 'none', cursor: 'pointer', padding: '0px' }}
                >
                  Přihlaste se k odběru novinek
                </button>
              </li>
            </ul>
          </div>

          <div style={{ paddingTop: '16px', paddingLeft: '12px', paddingRight: '16px', paddingBottom: '48px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>ZÁKAZNICKÝ SERVIS</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/faq" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Často kladené dotazy</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/sledovani-objednavky" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Sledování objednávky</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/vraceni-zbozi" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Vrácení zboží</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/doruceni" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Doručení</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/platba" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Platba</Link></li>
            </ul>
          </div>

          <div style={{ paddingTop: '16px', paddingLeft: '12px', paddingRight: '16px', paddingBottom: '48px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>O SPOLEČNOSTI</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/pravni-informace" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Právní informace</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/ochrana-osobnich-udaju" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Zásady ochrany osobních údajů</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/cookies" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Zásady používání souborů cookie</Link></li>
              <li style={{ margin: '0px', padding: '0px' }}><Link href="/nastaveni-cookies" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Nastavení cookies</Link></li>
            </ul>
          </div>

          <div style={{ paddingTop: '16px', paddingLeft: '12px', paddingRight: '16px', paddingBottom: '48px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>SLEDUJTE NÁS</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li style={{ margin: '0px', padding: '0px' }}><a href="https://www.facebook.com/ufosports/?locale=cs_CZ" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Facebook</a></li>
              <li style={{ margin: '0px', padding: '0px' }}><a href="https://www.instagram.com/ufosport.cz/?hl=en" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Instagram</a></li>
              <li style={{ margin: '0px', padding: '0px' }}><a href="#" className="text-gray-500 hover:text-black hover:underline transition-colors" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px' }}>Tiktok</a></li>
            </ul>
          </div>

          <div style={{ paddingTop: '16px', paddingLeft: '12px', paddingRight: '16px', paddingBottom: '48px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>TEAM UFO SPORT</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px', padding: '0px' }}>Země / Region: Česká republika</li>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px', padding: '0px' }}>Jazyk: Čeština</li>
            </ul>
          </div>

          <div style={{ paddingTop: '16px', paddingLeft: '12px', paddingRight: '16px', paddingBottom: '48px' }}>
            <h3 className="uppercase mb-3 text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 12px 0px', padding: '0px' }}>KONTAKTUJTE NÁS</h3>
            <ul className="space-y-0" style={{ margin: '0px', padding: '0px' }}>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 8px 0px', padding: '0px' }}>Naši poradci jsou vám k dispozici Po–Pá od 9:30 do 19:00</li>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 8px 0px', padding: '0px' }}>WhatsApp: <a href="https://wa.me/420775181107" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors underline">+420 775 181 107</a></li>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px 0px 8px 0px', padding: '0px' }}>Telefon: <a href="tel:+420775181107" className="text-gray-500 hover:text-black transition-colors underline">+420 775 181 107</a></li>
              <li className="text-gray-500" style={{ fontSize: '12px', lineHeight: '23.6px', letterSpacing: '0.12px', margin: '0px', padding: '0px' }}>E-mail: <a href="mailto:ufosport@mail.com" className="text-gray-500 hover:text-black transition-colors underline">Napište nám</a></li>
            </ul>
          </div>
        </div>

        <div className="w-full border-t border-black" style={{ backgroundColor: '#aaaaad', paddingTop: '7px', paddingBottom: '7px', paddingLeft: '16px', paddingRight: '16px' }}>
          <p className="text-gray-500 text-center" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '12px', fontWeight: 400, lineHeight: '15.6px', letterSpacing: '0.12px' }}>© 2026 UFO SPORT</p>
        </div>
      </footer>

      <NewsletterWindow 
        isOpen={isNewsletterOpen} 
        onClose={() => setIsNewsletterOpen(false)} 
      />
    </>
  );
}
