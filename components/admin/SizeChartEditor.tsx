'use client';

import { useState, useEffect } from 'react';
import { SizeChartType, SizeChartData, DEFAULT_TSHIRT_SIZES, DEFAULT_HOODIE_SIZES, DEFAULT_CREWNECK_SIZES, DEFAULT_ITEM_DIMENSIONS } from '@/components/SizeChart';

interface SizeChartEditorProps {
  sizeChartType: SizeChartType;
  sizeChartData: SizeChartData | null;
  onChange: (type: SizeChartType, data: SizeChartData | null) => void;
}

const SIZE_CHART_TYPE_LABELS: Record<string, string> = {
  'TSHIRT': 'Tričko (Tabulka velikostí)',
  'HOODIE': 'Mikina s kapucí (Tabulka velikostí)',
  'CREWNECK': 'Mikina bez kapuce (Tabulka velikostí)',
  'ITEM': 'Produkt (Rozměry produktu)',
};

export default function SizeChartEditor({ sizeChartType, sizeChartData, onChange }: SizeChartEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localData, setLocalData] = useState<SizeChartData | null>(sizeChartData);

  useEffect(() => {
    setLocalData(sizeChartData);
  }, [sizeChartData]);

  const getDefaultData = (type: SizeChartType): SizeChartData => {
    switch (type) {
      case 'TSHIRT':
        return JSON.parse(JSON.stringify(DEFAULT_TSHIRT_SIZES));
      case 'HOODIE':
        return JSON.parse(JSON.stringify(DEFAULT_HOODIE_SIZES));
      case 'CREWNECK':
        return JSON.parse(JSON.stringify(DEFAULT_CREWNECK_SIZES));
      case 'ITEM':
        return JSON.parse(JSON.stringify(DEFAULT_ITEM_DIMENSIONS));
      default:
        return JSON.parse(JSON.stringify(DEFAULT_TSHIRT_SIZES));
    }
  };

  const handleTypeChange = (newType: string) => {
    const type = newType === '' ? null : (newType as SizeChartType);
    if (type) {
      const defaultData = getDefaultData(type);
      setLocalData(defaultData);
      onChange(type, defaultData);
    } else {
      setLocalData(null);
      onChange(null, null);
    }
  };

  const handleMeasurementValueChange = (measurementIndex: number, size: string, value: string) => {
    if (!localData) return;
    
    const newData = JSON.parse(JSON.stringify(localData)) as SizeChartData;
    newData.measurements[measurementIndex].values[size] = value;
    setLocalData(newData);
    onChange(sizeChartType, newData);
  };

  const handleMeasurementLabelChange = (measurementIndex: number, labelCz: string) => {
    if (!localData) return;
    
    const newData = JSON.parse(JSON.stringify(localData)) as SizeChartData;
    newData.measurements[measurementIndex].labelCz = labelCz;
    setLocalData(newData);
    onChange(sizeChartType, newData);
  };

  const handleAddSize = () => {
    if (!localData) return;
    
    const newSize = prompt('Zadejte název velikosti (např. XS, S, M, L, XL):');
    if (!newSize) return;
    
    const newData = JSON.parse(JSON.stringify(localData)) as SizeChartData;
    if (!newData.sizes.includes(newSize)) {
      newData.sizes.push(newSize);
      newData.measurements.forEach(m => {
        m.values[newSize] = '';
      });
      setLocalData(newData);
      onChange(sizeChartType, newData);
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (!localData) return;
    if (localData.sizes.length <= 1) {
      alert('Musíte mít alespoň jednu velikost');
      return;
    }
    
    const newData = JSON.parse(JSON.stringify(localData)) as SizeChartData;
    newData.sizes = newData.sizes.filter(s => s !== sizeToRemove);
    newData.measurements.forEach(m => {
      delete m.values[sizeToRemove];
    });
    setLocalData(newData);
    onChange(sizeChartType, newData);
  };

  const handleAddMeasurement = () => {
    if (!localData) return;
    
    const labelCz = prompt('Zadejte název míry (česky):');
    if (!labelCz) return;
    
    const newData = JSON.parse(JSON.stringify(localData)) as SizeChartData;
    const newMeasurement = {
      label: labelCz,
      labelCz: labelCz,
      values: {} as Record<string, string>
    };
    newData.sizes.forEach(size => {
      newMeasurement.values[size] = '';
    });
    newData.measurements.push(newMeasurement);
    setLocalData(newData);
    onChange(sizeChartType, newData);
  };

  const handleRemoveMeasurement = (index: number) => {
    if (!localData) return;
    if (localData.measurements.length <= 1) {
      alert('Musíte mít alespoň jednu míru');
      return;
    }
    
    const newData = JSON.parse(JSON.stringify(localData)) as SizeChartData;
    newData.measurements.splice(index, 1);
    setLocalData(newData);
    onChange(sizeChartType, newData);
  };

  return (
    <div className="border border-black p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm uppercase font-bold">Tabulka velikostí / Rozměry</h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm underline hover:no-underline"
        >
          {isExpanded ? 'Skrýt' : 'Zobrazit'}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm uppercase font-medium mb-2">Typ tabulky</label>
        <select
          value={sizeChartType || ''}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full px-3 py-2 border border-black text-sm"
        >
          <option value="">Bez tabulky velikostí</option>
          {Object.entries(SIZE_CHART_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {isExpanded && sizeChartType && localData && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Hodnoty</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddSize}
                className="px-3 py-1 text-xs uppercase border border-black hover:bg-black hover:text-white transition-colors"
              >
                + Velikost
              </button>
              <button
                type="button"
                onClick={handleAddMeasurement}
                className="px-3 py-1 text-xs uppercase border border-black hover:bg-black hover:text-white transition-colors"
              >
                + Míra
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-black">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border-r border-black" style={{ minWidth: '150px' }}>
                    {sizeChartType === 'ITEM' ? 'Rozměr' : 'Míra'}
                  </th>
                  {localData.sizes.map((size) => (
                    <th key={size} className="p-2 text-center border-r border-black last:border-r-0" style={{ minWidth: '80px' }}>
                      <div className="flex items-center justify-center gap-1">
                        <span>{size}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(size)}
                          className="text-red-600 hover:text-red-800 text-xs ml-1"
                          title="Odstranit velikost"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {localData.measurements.map((measurement, mIndex) => (
                  <tr key={mIndex} className="border-t border-black">
                    <td className="p-2 border-r border-black">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={measurement.labelCz}
                          onChange={(e) => handleMeasurementLabelChange(mIndex, e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 text-xs"
                          placeholder="Název míry"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMeasurement(mIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          title="Odstranit míru"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                    {localData.sizes.map((size) => (
                      <td key={size} className="p-2 border-r border-black last:border-r-0">
                        <input
                          type="text"
                          value={measurement.values[size] || ''}
                          onChange={(e) => handleMeasurementValueChange(mIndex, size, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 text-xs text-center"
                          placeholder="cm"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-gray-600">
            Hodnoty jsou v centimetrech (cm). Nechte prázdné, pokud míra není relevantní pro danou velikost.
          </p>
        </div>
      )}
    </div>
  );
}
