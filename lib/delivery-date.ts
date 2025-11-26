export function getCzechHolidays(year: number): Date[] {
  const holidays: Date[] = [
    new Date(year, 0, 1),   // Nový rok
    new Date(year, 4, 1),   // Svátek práce
    new Date(year, 4, 8),   // Den vítězství
    new Date(year, 6, 5),   // Cyril a Metoděj
    new Date(year, 6, 6),   // Jan Hus
    new Date(year, 8, 28),  // Den české státnosti
    new Date(year, 9, 28),  // Vznik samostatného československého státu
    new Date(year, 10, 17), // Den boje za svobodu a demokracii
    new Date(year, 11, 24), // Štědrý den
    new Date(year, 11, 25), // 1. svátek vánoční
    new Date(year, 11, 26), // 2. svátek vánoční
  ];

  const easter = getEasterDate(year);
  holidays.push(new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000)); // Velký pátek
  holidays.push(new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000)); // Velikonoční pondělí

  return holidays;
}

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function isHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some(holiday => 
    holiday.getDate() === date.getDate() && 
    holiday.getMonth() === date.getMonth() && 
    holiday.getFullYear() === date.getFullYear()
  );
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function addWorkingDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let addedDays = 0;
  
  const currentYear = result.getFullYear();
  const nextYear = currentYear + 1;
  const holidays = [...getCzechHolidays(currentYear), ...getCzechHolidays(nextYear)];

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result) && !isHoliday(result, holidays)) {
      addedDays++;
    }
  }

  return result;
}

export function formatCzechDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function isWorkingDay(date: Date): boolean {
  const currentYear = date.getFullYear();
  const holidays = getCzechHolidays(currentYear);
  return !isWeekend(date) && !isHoliday(date, holidays);
}

export function getDeliveryDateRange(): { minDate: string; maxDate: string; isBeforeCutoff: boolean } {
  const now = new Date();
  const czechTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
  
  const cutoffHour = 17; // 17:00
  const isBeforeCutoff = czechTime.getHours() < cutoffHour;
  
  let minDays = 3;
  let maxDays = 5;
  let startDate = new Date(czechTime);
  
  if (isBeforeCutoff && isWorkingDay(czechTime)) {
    minDays = 2;
    maxDays = 4;
  } else if (!isBeforeCutoff) {
    startDate = new Date(czechTime.getTime() + 24 * 60 * 60 * 1000);
    if (isWorkingDay(startDate)) {
      minDays = 2;
      maxDays = 4;
    }
  }
  
  const minDeliveryDate = addWorkingDays(startDate, minDays);
  const maxDeliveryDate = addWorkingDays(startDate, maxDays);

  return {
    minDate: formatCzechDate(minDeliveryDate),
    maxDate: formatCzechDate(maxDeliveryDate),
    isBeforeCutoff
  };
}
