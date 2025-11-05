'use client';

import { useState } from 'react';

export default function Header2() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <header className="h-header border-b border-black bg-white relative">
      <div className="h-full flex items-center px-8">
        <div className="flex items-center gap-3 flex-1 relative">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <input
            type="text"
            placeholder="Co právě hledáte?"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 text-body bg-transparent border-none outline-none focus:border-b focus:border-black placeholder:text-black placeholder:opacity-50"
          />

          {showResults && (
            <div className="absolute top-full left-0 right-0 bg-white border border-black mt-1 max-h-96 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <div key={index} className="p-4 border-b border-black last:border-b-0 hover:bg-black hover:text-white cursor-pointer">
                    {result.name}
                  </div>
                ))
              ) : (
                <div className="p-4 text-body text-center">
                  {searchQuery.length > 0 ? 'Žádné výsledky' : 'Začněte psát...'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
