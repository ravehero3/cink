'use client';

import { useState } from 'react';

export type SizeChartType = 'TSHIRT' | 'HOODIE' | 'CREWNECK' | 'ITEM' | null;

export interface SizeChartData {
  sizes: string[];
  measurements: {
    label: string;
    labelCz: string;
    values: Record<string, string>;
  }[];
}

export const DEFAULT_TSHIRT_SIZES: SizeChartData = {
  sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  measurements: [
    {
      label: 'A - Body Width',
      labelCz: 'A - Šířka',
      values: { 'S': '46', 'M': '51', 'L': '56', 'XL': '61', '2XL': '66', '3XL': '71' }
    },
    {
      label: 'B - Body Length',
      labelCz: 'B - Délka',
      values: { 'S': '71', 'M': '74', 'L': '76', 'XL': '79', '2XL': '81', '3XL': '84' }
    },
    {
      label: 'C - Sleeve Length',
      labelCz: 'C - Délka rukávu',
      values: { 'S': '20', 'M': '21', 'L': '22', 'XL': '23', '2XL': '24', '3XL': '25' }
    }
  ]
};

export const DEFAULT_HOODIE_SIZES: SizeChartData = {
  sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  measurements: [
    {
      label: 'A - Body Width',
      labelCz: 'A - Šířka',
      values: { 'S': '50', 'M': '55', 'L': '60', 'XL': '65', '2XL': '70', '3XL': '75' }
    },
    {
      label: 'B - Body Length',
      labelCz: 'B - Délka',
      values: { 'S': '68', 'M': '71', 'L': '74', 'XL': '77', '2XL': '80', '3XL': '83' }
    },
    {
      label: 'C - Sleeve Length',
      labelCz: 'C - Délka rukávu',
      values: { 'S': '62', 'M': '64', 'L': '66', 'XL': '68', '2XL': '70', '3XL': '72' }
    }
  ]
};

export const DEFAULT_CREWNECK_SIZES: SizeChartData = {
  sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  measurements: [
    {
      label: 'A - Body Width',
      labelCz: 'A - Šířka',
      values: { 'S': '50', 'M': '55', 'L': '60', 'XL': '65', '2XL': '70', '3XL': '75' }
    },
    {
      label: 'B - Body Length',
      labelCz: 'B - Délka',
      values: { 'S': '66', 'M': '69', 'L': '72', 'XL': '75', '2XL': '78', '3XL': '81' }
    },
    {
      label: 'C - Sleeve Length',
      labelCz: 'C - Délka rukávu',
      values: { 'S': '60', 'M': '62', 'L': '64', 'XL': '66', '2XL': '68', '3XL': '70' }
    }
  ]
};

export const DEFAULT_ITEM_DIMENSIONS: SizeChartData = {
  sizes: ['One Size'],
  measurements: [
    {
      label: 'Length',
      labelCz: 'Délka',
      values: { 'One Size': '' }
    },
    {
      label: 'Height',
      labelCz: 'Výška',
      values: { 'One Size': '' }
    },
    {
      label: 'Depth',
      labelCz: 'Hloubka',
      values: { 'One Size': '' }
    }
  ]
};

const TShirtSVG = () => (
  <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path 
      d="M60 10 L80 10 Q100 25 120 10 L140 10 L180 50 L160 70 L145 55 L145 200 L55 200 L55 55 L40 70 L20 50 L60 10 Z" 
      stroke="black" 
      strokeWidth="1" 
      fill="white"
    />
    <line x1="55" y1="90" x2="145" y2="90" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="150" y="93" fontSize="10" fill="black">A</text>
    <line x1="100" y1="10" x2="100" y2="200" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="103" y="195" fontSize="10" fill="black">B</text>
    <line x1="145" y1="55" x2="180" y2="50" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="165" y="45" fontSize="10" fill="black">C</text>
  </svg>
);

const HoodieSVG = () => (
  <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path 
      d="M60 20 L75 20 Q100 0 125 20 L140 20 L180 60 L160 80 L150 70 L150 220 L50 220 L50 70 L40 80 L20 60 L60 20 Z" 
      stroke="black" 
      strokeWidth="1" 
      fill="white"
    />
    <path 
      d="M75 20 Q85 45 100 50 Q115 45 125 20" 
      stroke="black" 
      strokeWidth="1" 
      fill="none"
    />
    <rect x="80" y="100" width="40" height="50" stroke="black" strokeWidth="0.5" fill="none" />
    <line x1="50" y1="100" x2="150" y2="100" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="155" y="103" fontSize="10" fill="black">A</text>
    <line x1="100" y1="20" x2="100" y2="220" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="103" y="215" fontSize="10" fill="black">B</text>
    <line x1="150" y1="70" x2="180" y2="60" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="170" y="55" fontSize="10" fill="black">C</text>
  </svg>
);

const CrewneckSVG = () => (
  <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path 
      d="M60 20 L80 20 Q100 35 120 20 L140 20 L180 60 L160 80 L150 70 L150 220 L50 220 L50 70 L40 80 L20 60 L60 20 Z" 
      stroke="black" 
      strokeWidth="1" 
      fill="white"
    />
    <ellipse cx="100" cy="25" rx="20" ry="8" stroke="black" strokeWidth="1" fill="none" />
    <line x1="50" y1="100" x2="150" y2="100" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="155" y="103" fontSize="10" fill="black">A</text>
    <line x1="100" y1="20" x2="100" y2="220" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="103" y="215" fontSize="10" fill="black">B</text>
    <line x1="150" y1="70" x2="180" y2="60" stroke="black" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="170" y="55" fontSize="10" fill="black">C</text>
  </svg>
);

const ItemDimensionsSVG = () => (
  <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="40" y="40" width="120" height="100" stroke="black" strokeWidth="1" fill="white" />
    <line x1="40" y1="155" x2="160" y2="155" stroke="black" strokeWidth="1" />
    <line x1="40" y1="150" x2="40" y2="160" stroke="black" strokeWidth="1" />
    <line x1="160" y1="150" x2="160" y2="160" stroke="black" strokeWidth="1" />
    <text x="95" y="170" fontSize="10" fill="black">Délka</text>
    <line x1="175" y1="40" x2="175" y2="140" stroke="black" strokeWidth="1" />
    <line x1="170" y1="40" x2="180" y2="40" stroke="black" strokeWidth="1" />
    <line x1="170" y1="140" x2="180" y2="140" stroke="black" strokeWidth="1" />
    <text x="182" y="95" fontSize="10" fill="black" transform="rotate(90 182 95)">Výška</text>
    <line x1="40" y1="40" x2="25" y2="25" stroke="black" strokeWidth="1" />
    <text x="10" y="20" fontSize="10" fill="black">Hloubka</text>
  </svg>
);

interface SizeChartProps {
  type: SizeChartType;
  data?: SizeChartData;
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeChart({ type, data, isOpen, onClose }: SizeChartProps) {
  if (!isOpen || !type) return null;

  const getDefaultData = (): SizeChartData => {
    switch (type) {
      case 'TSHIRT':
        return DEFAULT_TSHIRT_SIZES;
      case 'HOODIE':
        return DEFAULT_HOODIE_SIZES;
      case 'CREWNECK':
        return DEFAULT_CREWNECK_SIZES;
      case 'ITEM':
        return DEFAULT_ITEM_DIMENSIONS;
      default:
        return DEFAULT_TSHIRT_SIZES;
    }
  };

  const chartData = data || getDefaultData();

  const getTitle = () => {
    switch (type) {
      case 'TSHIRT':
      case 'HOODIE':
      case 'CREWNECK':
        return 'TABULKA VELIKOSTÍ';
      case 'ITEM':
        return 'ROZMĚRY PRODUKTU';
      default:
        return 'TABULKA VELIKOSTÍ';
    }
  };

  const getSVG = () => {
    switch (type) {
      case 'TSHIRT':
        return <TShirtSVG />;
      case 'HOODIE':
        return <HoodieSVG />;
      case 'CREWNECK':
        return <CrewneckSVG />;
      case 'ITEM':
        return <ItemDimensionsSVG />;
      default:
        return <TShirtSVG />;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black z-40 transition-opacity duration-300"
        style={{ opacity: 0.5 }}
        onClick={onClose}
      />

      <div
        className="fixed top-0 right-0 h-full bg-white border-l border-black z-50 overflow-y-auto"
        style={{ width: 'min(500px, 90vw)' }}
      >
        <div className="h-full flex flex-col">
          <div className="bg-white border-b border-black relative flex items-center justify-center px-6" style={{ height: '44px', minHeight: '44px' }}>
            <h2 
              className="uppercase tracking-wider"
              style={{ 
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '14px', 
                fontWeight: 700, 
                fontStretch: 'condensed' 
              }}
            >
              {getTitle()}
            </h2>
            <button
              onClick={onClose}
              className="absolute hover:opacity-70 transition-opacity"
              style={{ 
                width: '22px', 
                height: '22px', 
                top: '50%', 
                right: '8px', 
                transform: 'translateY(-50%)', 
                padding: '0', 
                border: 'none', 
                background: 'none' 
              }}
              aria-label="Close"
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-center mb-8" style={{ height: '200px' }}>
              {getSVG()}
            </div>

            <p 
              className="text-center mb-6"
              style={{ 
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '12px',
                color: '#666'
              }}
            >
              {type === 'ITEM' ? 'Všechny rozměry jsou v centimetrech (cm)' : 'Všechny míry jsou v centimetrech (cm)'}
            </p>

            <div className="border border-black">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black bg-black text-white">
                    <th 
                      className="p-3 text-left uppercase"
                      style={{ 
                        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '11px',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {type === 'ITEM' ? 'Rozměr' : 'Velikost'}
                    </th>
                    {chartData.sizes.map((size) => (
                      <th 
                        key={size}
                        className="p-3 text-center uppercase"
                        style={{ 
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '11px',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.measurements.map((measurement, index) => (
                    <tr 
                      key={measurement.label}
                      className={index < chartData.measurements.length - 1 ? 'border-b border-black' : ''}
                    >
                      <td 
                        className="p-3 text-left"
                        style={{ 
                          fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '12px'
                        }}
                      >
                        {measurement.labelCz}
                      </td>
                      {chartData.sizes.map((size) => (
                        <td 
                          key={size}
                          className="p-3 text-center"
                          style={{ 
                            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '12px'
                          }}
                        >
                          {measurement.values[size] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {type !== 'ITEM' && (
              <div className="mt-6 p-4 border border-black bg-gray-50">
                <h3 
                  className="uppercase mb-2"
                  style={{ 
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  JAK MĚŘIT
                </h3>
                <ul 
                  className="space-y-1"
                  style={{ 
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '11px',
                    lineHeight: '1.5'
                  }}
                >
                  <li><strong>A - Šířka:</strong> Měřeno přes hrudník od švu ke švu</li>
                  <li><strong>B - Délka:</strong> Měřeno od nejvyššího bodu ramene k dolnímu lemu</li>
                  <li><strong>C - Délka rukávu:</strong> Měřeno od ramenního švu k dolnímu lemu rukávu</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
