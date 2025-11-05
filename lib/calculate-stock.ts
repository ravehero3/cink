export function calculateTotalStock(sizes: any): number {
  if (!sizes || typeof sizes !== 'object') {
    return 0;
  }
  
  return Object.values(sizes).reduce((total: number, count: any) => {
    const stockCount = typeof count === 'number' ? count : 0;
    return total + stockCount;
  }, 0);
}
