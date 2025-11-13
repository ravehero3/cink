'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  content: string | React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, content, isOpen, onToggle }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border-b border-black">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-6 text-left hover:bg-gray-50 transition-colors"
        style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
      >
        <span>{title}</span>
        <ChevronDown 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
          strokeWidth={2}
        />
      </button>
      
      <div
        style={{
          height: `${height}px`,
          overflow: 'hidden',
          transition: 'height 0.3s ease-in-out'
        }}
      >
        <div ref={contentRef} className="px-6 pb-4">
          <div
            style={{
              fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '1.6'
            }}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: Array<{
    title: string;
    content: string | React.ReactNode;
  }>;
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border-t border-black">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          content={item.content}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
