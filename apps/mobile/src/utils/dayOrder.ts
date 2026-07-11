// Day Order System Utility

// Predefined day order overrides for specific dates (Admin override)
const dayOrderOverrides: Record<string, string> = {};

// Semester start base date (Monday, June 1st, 2026 as D1)
let semesterBaseDate = new Date("2026-06-01");

export function getSemesterBaseDate(): Date {
  return semesterBaseDate;
}

export function setSemesterBaseDate(date: Date) {
  semesterBaseDate = date;
}

export function getDayOrderOverride(dateString: string): string | undefined {
  return dayOrderOverrides[dateString];
}

export function setDayOrderOverride(dateString: string, dayOrder: string) {
  dayOrderOverrides[dateString] = dayOrder;
}

/**
 * Calculates the Day Order (D1 - D6) for any given Date.
 * Mondays to Fridays are considered working days and increment the day order sequence.
 * Saturdays and Sundays are skipped and do not increment the sequence.
 */
export function getDayOrder(date: Date, baseDate = semesterBaseDate): string {
  const targetStr = date.toISOString().split("T")[0];
  if (dayOrderOverrides[targetStr]) {
    return dayOrderOverrides[targetStr];
  }

  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target < start) return "D1";

  let current = new Date(start);
  let dayOrderIndex = 0; // 0 = D1, 1 = D2, ..., 5 = D6

  while (current < target) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    // Check if it is a weekday (Monday to Friday)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dayOrderIndex = (dayOrderIndex + 1) % 6;
    }
  }

  return `D${dayOrderIndex + 1}`;
}

export const DAY_ORDER_MAP: Record<string, string> = {
  D1: "Mon",
  D2: "Tue",
  D3: "Wed",
  D4: "Thu",
  D5: "Fri",
  D6: "Sat",
};
