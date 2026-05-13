'use client';

import { useState, useEffect } from 'react';

const DEFAULT_TEMPLATES = {
  ORDER_CONFIRMATION: {
    name: 'Potvrzení objednávky',
    subject: 'Vaše objednávka {{orderNumber}} byla přijata - UFO Sport',
    body: `<div style="text-align: center; margin-bottom: 40px;">
  <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1d1d1f;">Děkujeme za vaši objednávku!</h1>
  <p style="margin: 8px 0 0 0; font-size: 17px; color: #86868b;">Právě jsme ji přijali a brzy se pustíme do jejího zpracování.</p>
</div>

<div style="background-color: #f5f5f7; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
  <h2 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #86868b;">Shrnutí objednávky {{orderNumber}}</h2>
  {{itemsHtml}}
  <div style="border-top: 1px solid #d2d2d7; margin: 16px 0; padding-top: 16px; display: flex; justify-content: space-between; font-weight: 600; font-size: 17px; color: #1d1d1f;">
    <span>Celkem:</span>
    <span>{{totalPrice}} Kč</span>
  </div>
</div>

<div style="margin-bottom: 32px; padding: 0 24px;">
  <h2 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #86868b;">Doprava a doručení</h2>
  {{shippingInfoHtml}}
</div>

<p style="font-size: 15px; color: #1d1d1f; line-height: 1.5; text-align: center;">O dalším průběhu vás budeme informovat e-mailem.</p>`
  },
  PAYMENT_SUCCESS: {
    name: 'Platba přijata',
    subject: 'Platba k objednávce {{orderNumber}} byla úspěšně přijata - UFO Sport',
    body: `<div style="text-align: center; margin-bottom: 40px;">
  <div style="display: inline-block; width: 64px; height: 64px; background-color: #000; border-radius: 50%; margin-bottom: 24px; line-height: 64px; font-size: 24px; color: white;">✓</div>
  <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1d1d1f;">Platba přijata</h1>
  <p style="margin: 8px 0 0 0; font-size: 17px; color: #86868b;">Děkujeme za vaši platbu k objednávce {{orderNumber}}.</p>
</div>

<p style="font-size: 15px; color: #1d1d1f; line-height: 1.6; text-align: center; max-width: 400px; margin: 0 auto;">
  Vše je v pořádku. Nyní začínáme s přípravou vašich produktů. O odeslání zásilky vás budeme informovat v dalším e-mailu.
</p>`
  },
  SHIPPING_NOTIFICATION: {
    name: 'Zásilka na cestě',
    subject: 'Vaše objednávka {{orderNumber}} je na cestě k vám! - UFO Sport',
    body: `<div style="text-align: center; margin-bottom: 40px;">
  <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1d1d1f;">Zásilka je na cestě</h1>
  <p style="margin: 8px 0 0 0; font-size: 17px; color: #86868b;">Váš balíček k objednávce {{orderNumber}} jsme právě předali dopravci.</p>
</div>

<div style="text-align: center; margin-bottom: 32px; padding: 32px; background-color: #f5f5f7; border-radius: 12px;">
  <p style="font-size: 15px; color: #1d1d1f; margin-bottom: 24px; font-weight: 500;">Svoji zásilku můžete sledovat online:</p>
  <a href="{{trackingUrl}}" style="display: inline-block; background-color: #000; color: #fff; padding: 18px 36px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">Sledovat zásilku</a>
</div>

<p style="font-size: 13px; color: #86868b; line-height: 1.5; text-align: center;">
  Děkujeme, že nakupujete u UFO Sport. Doufáme, že budete s produkty spokojeni.
</p>`
  },
  ABANDONED_CART: {
    name: 'Zapomenutý košík',
    subject: 'Nezapomněli jste něco v košíku? - UFO Sport',
    body: `<div style="text-align: center; margin-bottom: 40px;">
  <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1d1d1f;">Váš košík na vás čeká</h1>
  <p style="margin: 8px 0 0 0; font-size: 17px; color: #86868b;">Všimli jsme si, že jste u nás nechali rozpracovaný výběr.</p>
</div>

<div style="margin-bottom: 32px; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px;">
  {{itemsHtml}}
</div>

<div style="text-align: center; padding: 32px; background-color: #000; color: #fff; border-radius: 12px;">
  <p style="font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.5;">
    Dokončete svoji objednávku dříve, než se vybrané kousky vyprodají!
  </p>
  <a href="{{websiteUrl}}/kosik" style="display: inline-block; background-color: #fff; color: #000; padding: 18px 36px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Vrátit se do košíku</a>
</div>`
  }
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');

  const replaceVariables = (html: string) => {
    if (!html) return '';
    return html
      .replace(/{{orderNumber}}/g, 'UFO20240001')
      .replace(/{{customerName}}/g, 'Jan Novák')
      .replace(/{{totalPrice}}/g, '1 250')
      .replace(/{{itemsHtml}}/g, `
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
          <div style="display: flex; gap: 12px;">
            <div style="width: 50px; height: 50px; background: #eee; border-radius: 4px;"></div>
            <div>
              <div style="font-weight: 600;">UFO Oversized T-Shirt</div>
              <div style="font-size: 13px; color: #86868b;">Velikost: L | Barva: Černá</div>
            </div>
          </div>
          <div style="font-weight: 600;">850 Kč</div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px;">
          <div style="display: flex; gap: 12px;">
            <div style="width: 50px; height: 50px; background: #eee; border-radius: 4px;"></div>
            <div>
              <div style="font-weight: 600;">UFO Socks</div>
              <div style="font-size: 13px; color: #86868b;">Velikost: UNI</div>
            </div>
          </div>
          <div style="font-weight: 600;">400 Kč</div>
        </div>
      `)
      .replace(/{{shippingInfoHtml}}/g, `
        <div style="font-size: 15px; color: #1d1d1f; line-height: 1.5; background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #eee;">
          <div style="font-weight: 600; margin-bottom: 4px;">Doručení na adresu:</div>
          <div>Vodičkova 123, 110 00 Praha 1</div>
        </div>
      `)
      .replace(/{{websiteUrl}}/g, 'https://ufosport.cz')
      .replace(/{{trackingUrl}}/g, 'https://tracking.packeta.com/cs/UFO123456789');
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (type: string) => {
    const existing = templates.find(t => t.type === type);
    if (existing) {
      setSelectedTemplate({ ...existing });
    } else {
      // Create from default
      setSelectedTemplate({
        type,
        name: DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES].name,
        subject: DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES].subject,
        body: DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES].body
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = selectedTemplate.id ? 'PATCH' : 'POST';
      const url = selectedTemplate.id 
        ? `/api/admin/email-templates/${selectedTemplate.id}`
        : '/api/admin/email-templates';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate),
      });

      if (response.ok) {
        await fetchTemplates();
        setIsEditing(false);
        setSelectedTemplate(null);
        alert('Šablona byla uložena');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (!selectedTemplate) return;
    const defaults = DEFAULT_TEMPLATES[selectedTemplate.type as keyof typeof DEFAULT_TEMPLATES];
    if (defaults) {
      setSelectedTemplate({
        ...selectedTemplate,
        subject: defaults.subject,
        body: defaults.body
      });
    }
  };

  if (loading) return <div className="p-8 tracking-widest uppercase text-xs">Načítání...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest">E-mailové Šablony</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          {Object.keys(DEFAULT_TEMPLATES).map((type) => (
            <button
              key={type}
              onClick={() => handleSelectTemplate(type)}
              className={`w-full text-left p-4 border border-black uppercase text-[10px] font-bold tracking-widest transition-colors ${
                selectedTemplate?.type === type ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES].name}
              {templates.find(t => t.type === type) && (
                <span className="ml-2 opacity-50 font-normal">(Upraveno)</span>
              )}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-white border border-black p-8 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold uppercase text-sm tracking-widest">{selectedTemplate.name}</h2>
                <button 
                  onClick={handleResetToDefault}
                  className="text-[10px] uppercase underline tracking-tighter hover:opacity-60"
                >
                  Obnovit profesionální vzor
                </button>
              </div>

              <div className="flex border-b border-black">
                <button
                  onClick={() => setPreviewMode('EDIT')}
                  className={`flex-1 p-3 text-[10px] uppercase font-bold tracking-widest transition-colors ${previewMode === 'EDIT' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setPreviewMode('PREVIEW')}
                  className={`flex-1 p-3 text-[10px] uppercase font-bold tracking-widest transition-colors ${previewMode === 'PREVIEW' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                >
                  Náhled
                </button>
              </div>

              <div className="space-y-4">
                {previewMode === 'EDIT' ? (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-1">Předmět e-mailu</label>
                      <input
                        type="text"
                        value={selectedTemplate.subject}
                        onChange={e => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                        className="w-full border border-black p-2 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-1">Obsah (HTML)</label>
                      <textarea
                        value={selectedTemplate.body}
                        onChange={e => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                        className="w-full border border-black p-2 text-sm font-mono h-[450px] focus:outline-none"
                      />
                      <div className="mt-2 p-2 bg-gray-50 border border-black/5 text-[10px] uppercase tracking-tighter text-gray-500">
                        Dostupné proměnné: {"{{orderNumber}}, {{customerName}}, {{totalPrice}}, {{itemsHtml}}, {{shippingInfoHtml}}, {{websiteUrl}}, {{trackingUrl}}"}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-1">Předmět e-mailu (Náhled)</label>
                      <div className="p-3 border border-black bg-gray-50 text-sm font-medium">
                        {selectedTemplate.subject.replace('{{orderNumber}}', 'UFO20240001')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-1">Obsah e-mailu (Náhled)</label>
                      <div 
                        className="border border-black bg-white overflow-hidden rounded-sm"
                        style={{ minHeight: '600px' }}
                      >
                        {/* Apple-style Email Shell */}
                        <div className="p-4 sm:p-8 md:p-12 bg-gray-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '0 0 40px 0', textAlign: 'center' }}>
                              <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '0.1em', color: '#000' }}>UFO SPORT</span>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: replaceVariables(selectedTemplate.body) }} />
                            <div style={{ padding: '40px 0 0 0', borderTop: '1px solid #d2d2d7', marginTop: '40px', textAlign: 'center' }}>
                              <p style={{ margin: '0', fontSize: '12px', color: '#86868b' }}>
                                &copy; {new Date().getFullYear()} UFO Sport. Všechna práva vyhrazena.
                              </p>
                              <div style={{ marginTop: '16px' }}>
                                <a href="#" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '12px', margin: '0 8px' }}>Podmínky užití</a>
                                <a href="#" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '12px', margin: '0 8px' }}>Ochrana soukromí</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-black text-white p-4 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving ? 'Ukládání...' : 'Uložit šablonu'}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setSelectedTemplate(null); }}
                    className="px-8 border border-black p-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-black border-dashed h-full flex items-center justify-center p-12 text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Vyberte šablonu vlevo pro úpravu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
