'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
  variables: any;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/email-templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedTemplate.subject,
          body: selectedTemplate.body,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error updating template:', error);
    } finally {
      setSaving(false);
    }
  };

  const templateTypes = [
    { value: 'ORDER_CONFIRMATION', label: 'Potvrzení objednávky' },
    { value: 'PAYMENT_SUCCESS', label: 'Platba přijata' },
    { value: 'SHIPPING_NOTIFICATION', label: 'Objednávka odeslána' },
    { value: 'NEWSLETTER_WELCOME', label: 'Uvítání v newsletteru' },
    { value: 'ADMIN_ORDER_NOTIFICATION', label: 'Notifikace pro admina' },
    { value: 'PASSWORD_RESET', label: 'Obnovení hesla' },
    { value: 'ABANDONED_CART', label: 'Opuštěný košík' },
  ];

  if (loading) return <div className="p-8">Načítání...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest">Správa e-mailových šablon</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          {templateTypes.map(type => {
            const template = templates.find(t => t.type === type.value);
            return (
              <button
                key={type.value}
                onClick={() => {
                  if (template) {
                    setSelectedTemplate(template);
                    setIsEditing(false);
                  } else {
                    // Create if not exists
                    setSelectedTemplate({
                      id: '',
                      type: type.value,
                      subject: '',
                      body: '',
                      variables: {}
                    });
                    setIsEditing(true);
                  }
                }}
                className={`w-full text-left p-4 border border-black uppercase text-xs tracking-widest transition-colors ${
                  selectedTemplate?.type === type.value ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                {type.label}
                {!template && <span className="ml-2 text-[10px] opacity-50">(Nenastaveno)</span>}
              </button>
            );
          })}
        </div>

        <div className="md:col-span-2 border border-black p-6 bg-white min-h-[400px]">
          {selectedTemplate ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold uppercase">{templateTypes.find(t => t.value === selectedTemplate.type)?.label}</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 border border-black text-xs uppercase hover:bg-black hover:text-white transition-colors"
                >
                  {isEditing ? 'Zrušit' : 'Upravit'}
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold mb-1">Předmět e-mailu</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={selectedTemplate.subject}
                    onChange={e => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold mb-1">Obsah (HTML)</label>
                  <textarea
                    disabled={!isEditing}
                    value={selectedTemplate.body}
                    onChange={e => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                    className="w-full border border-black p-2 text-sm font-mono h-[300px] focus:outline-none disabled:bg-gray-50"
                  />
                  <div className="mt-2 p-2 bg-gray-50 border border-black/5 text-[10px] uppercase tracking-tighter text-gray-500">
                    Dostupné proměnné: {"{{orderNumber}}, {{customerName}}, {{totalPrice}}, {{itemsHtml}}, {{shippingInfoHtml}}, {{websiteUrl}}"}
                  </div>
                </div>

                {isEditing && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-black text-white p-3 text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? 'Ukládání...' : 'Uložit šablonu'}
                  </button>
                )}
              </form>

              {!isEditing && selectedTemplate.body && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-[10px] uppercase font-bold mb-2 opacity-50">Náhled (Bez stylu obálky)</h3>
                  <div 
                    className="border border-gray-200 p-4 rounded bg-gray-50 text-sm overflow-auto"
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.body.replace(/{{[a-zA-Z0-9]+}}/g, '...') }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs uppercase opacity-50">
              Vyberte šablonu pro úpravu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
