'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Download, ChevronRight, Clock, Zap } from 'lucide-react';

interface GroupStats {
  group: string;
  count: number;
}

const GROUPS = [
  {
    id: 'customers',
    label: 'Kampaň pro zákazníky',
    sublabel: 'Newsletter subscribers',
    description: 'Zákazníci přihlášení na newsletter z vašeho e-shopu. Ideální pro produktové novinky, slevy a sezónní akce.',
    icon: Users,
    href: '/admin/email-campaigns/group/customers',
  },
  {
    id: 'free',
    label: 'Kampaň pro FREE',
    sublabel: 'Free Download audience',
    description: 'Publikum z BeatStars – lidé, kteří si stáhli váš obsah zdarma. Zaměřeno na konverzi na platící zákazníky.',
    icon: Download,
    href: '/admin/email-campaigns/group/free',
  },
];

export default function EmailCampaignsPage() {
  const [groupStats, setGroupStats] = useState<GroupStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/newsletter/groups')
      .then((r) => r.json())
      .then((d) => setGroupStats(Array.isArray(d) ? d : []))
      .catch(() => setGroupStats([]))
      .finally(() => setLoading(false));
  }, []);

  const countForGroup = (id: string) =>
    groupStats.find((s) => s.group === id)?.count ?? 0;

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">E-mailové kampaně</h1>
          <p className="admin-sub">Vyberte skupinu zákazníků a spravujte sekvenci e-mailů</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {GROUPS.map((group) => {
          const Icon = group.icon;
          const count = countForGroup(group.id);
          return (
            <Link
              key={group.id}
              href={group.href}
              className="admin-card p-[28px] flex flex-col gap-[16px] border-2 border-black hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-black">
                      {group.label}
                    </h2>
                    <p className="text-[10px] uppercase tracking-wider text-[#666666] mt-0.5">
                      {group.sublabel}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#666666] group-hover:text-black transition-colors shrink-0 mt-1" />
              </div>

              <p className="text-xs text-[#444444] leading-relaxed">{group.description}</p>

              <div className="flex items-center gap-4 pt-2 border-t border-black/10">
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-[#666666]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {loading ? '…' : count.toLocaleString('cs-CZ')}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#666666]">příjemců</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-[#666666]" />
                  <span className="text-[10px] uppercase tracking-wider text-[#666666]">Sekvence e-mailů</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-start gap-3 p-4 border border-black/20 bg-[#fafafa]">
        <Clock size={14} className="text-[#666666] shrink-0 mt-0.5" />
        <p className="text-xs text-[#666666] leading-relaxed">
          Každá skupina má vlastní sekvenci e-mailů s nastavitelnými prodlevami.
          Kliknutím na skupinu otevřete editor sekvence, kde můžete přidávat e-maily,
          měnit prodlevy a odesílat testovací zprávy.
        </p>
      </div>
    </div>
  );
}
