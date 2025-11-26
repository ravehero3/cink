'use client';

export type SizeChartType = 'TSHIRT' | 'HOODIE' | 'CREWNECK' | 'ITEM' | null;

export interface SizeChartMeasurement {
  label: string;
  labelCz: string;
  values: Record<string, string>;
}

export interface SizeChartData {
  sizes: string[];
  measurements: SizeChartMeasurement[];
}

export const DEFAULT_TSHIRT_SIZES: SizeChartData = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  measurements: [
    { label: 'Chest', labelCz: 'Hrudník', values: { 'XS': '86', 'S': '92', 'M': '98', 'L': '104', 'XL': '110', 'XXL': '116' } },
    { label: 'Length', labelCz: 'Délka', values: { 'XS': '66', 'S': '68', 'M': '70', 'L': '72', 'XL': '74', 'XXL': '76' } },
    { label: 'Sleeve', labelCz: 'Rukáv', values: { 'XS': '19', 'S': '20', 'M': '21', 'L': '22', 'XL': '23', 'XXL': '24' } },
  ]
};

export const DEFAULT_HOODIE_SIZES: SizeChartData = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  measurements: [
    { label: 'Chest', labelCz: 'Hrudník', values: { 'XS': '100', 'S': '106', 'M': '112', 'L': '118', 'XL': '124', 'XXL': '130' } },
    { label: 'Length', labelCz: 'Délka', values: { 'XS': '64', 'S': '66', 'M': '68', 'L': '70', 'XL': '72', 'XXL': '74' } },
    { label: 'Sleeve', labelCz: 'Rukáv', values: { 'XS': '60', 'S': '62', 'M': '64', 'L': '66', 'XL': '68', 'XXL': '70' } },
  ]
};

export const DEFAULT_CREWNECK_SIZES: SizeChartData = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  measurements: [
    { label: 'Chest', labelCz: 'Hrudník', values: { 'XS': '100', 'S': '106', 'M': '112', 'L': '118', 'XL': '124', 'XXL': '130' } },
    { label: 'Length', labelCz: 'Délka', values: { 'XS': '64', 'S': '66', 'M': '68', 'L': '70', 'XL': '72', 'XXL': '74' } },
    { label: 'Sleeve', labelCz: 'Rukáv', values: { 'XS': '60', 'S': '62', 'M': '64', 'L': '66', 'XL': '68', 'XXL': '70' } },
  ]
};

export const DEFAULT_ITEM_DIMENSIONS: SizeChartData = {
  sizes: ['Produkt'],
  measurements: [
    { label: 'Width', labelCz: 'Šířka', values: { 'Produkt': '' } },
    { label: 'Height', labelCz: 'Výška', values: { 'Produkt': '' } },
    { label: 'Depth', labelCz: 'Hloubka', values: { 'Produkt': '' } },
  ]
};

interface SizeChartProps {
  imageUrl?: string;
  type?: SizeChartType;
  data?: SizeChartData | null;
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  'TSHIRT': 'Tabulka velikostí - Tričko',
  'HOODIE': 'Tabulka velikostí - Mikina s kapucí',
  'CREWNECK': 'Tabulka velikostí - Mikina bez kapuce',
  'ITEM': 'Rozměry produktu',
};

export default function SizeChart({ imageUrl, type, data, isOpen, onClose }: SizeChartProps) {
  if (!isOpen) return null;
  
  const hasDataChart = type && data && data.sizes && data.measurements;
  
  if (!hasDataChart && !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-black p-4 flex justify-between items-center">
          <h2 
            className="uppercase"
            style={{
              fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '18px',
              letterSpacing: '0.03em',
            }}
          >
            {type ? TYPE_LABELS[type] || 'Tabulka velikostí' : 'Tabulka velikostí'}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:opacity-50"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {hasDataChart ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th 
                      className="p-3 text-left border-r border-black uppercase"
                      style={{
                        fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '12px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {type === 'ITEM' ? 'Rozměr' : 'Míra'}
                    </th>
                    {data.sizes.map((size) => (
                      <th 
                        key={size} 
                        className="p-3 text-center border-r border-black last:border-r-0 uppercase"
                        style={{
                          fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '12px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.measurements.map((measurement, index) => (
                    <tr key={index} className="border-t border-black">
                      <td 
                        className="p-3 border-r border-black"
                        style={{
                          fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '13px',
                        }}
                      >
                        {measurement.labelCz || measurement.label}
                      </td>
                      {data.sizes.map((size) => (
                        <td 
                          key={size} 
                          className="p-3 text-center border-r border-black last:border-r-0"
                          style={{
                            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '13px',
                          }}
                        >
                          {measurement.values[size] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p 
                className="mt-4 text-center text-gray-600"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '11px',
                }}
              >
                Všechny rozměry jsou uvedeny v centimetrech (cm)
              </p>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Size Chart" 
              className="w-full h-auto"
              style={{ aspectRatio: '16/9', objectFit: 'cover' }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type { SizeChartProps };
