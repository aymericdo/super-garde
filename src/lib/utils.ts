import type { CalendarEvent } from "$lib/interfaces/calendar";
import type { RecordModel } from "pocketbase";

export const displayDateRange = (start: Date, end: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }

  if (datesAreOnSameDay(start, end)) {
    const endDateOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    }
    return `${start.toLocaleTimeString(
      'fr',
      options,
    )} - ${end.toLocaleTimeString('fr', endDateOptions)}`
  }

  return `${start.toLocaleTimeString(
    'fr',
    options,
  )} - ${end.toLocaleTimeString('fr', options)}`
}

export const datesAreOnSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const eventStateColor = (onCallSlot: RecordModel): string => {
  return (!onCallSlot.student ? '#be3144' :
    onCallSlot.isOnMarket ? '#ee7214' :
    onCallSlot.isOnTransfer ? '#1e00ff' :
    onCallSlot.isOnExchange ? '#62ff00' :
    '');
}

export const onCallSlotRecordToCalendarEvent = (onCallSlot: RecordModel): CalendarEvent => ({
  ...onCallSlot,
  start: new Date(onCallSlot.start),
  end: new Date(onCallSlot.end),
  title: `${onCallSlot.hospital} - ${onCallSlot.sector}`,
  editable: false,
  startEditable: false,
  durationEditable: false,
  resourceIds: [onCallSlot.student],
  hospital: onCallSlot.hospital,
  otherHospital: onCallSlot.otherHospital,
  studentFullName: onCallSlot.expand?.student ? `${onCallSlot.expand?.student.firstName} ${onCallSlot.expand?.student.lastName}` : null,
  studentYear: onCallSlot.expand?.student.year,
  studentUHCD: onCallSlot.expand?.student.UHCD,
  studentId: onCallSlot.expand?.student.id,
  backgroundColor: eventStateColor(onCallSlot),
} as unknown as CalendarEvent)

// https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940?permalink_comment_id=4276799#gistcomment-4276799
export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
) => {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced;
}

export const holidays = [
  // 2025
  new Date("2025-01-01"),
  new Date("2025-04-21"), // Lundi de Pâques
  new Date("2025-05-01"),
  new Date("2025-05-08"),
  new Date("2025-05-29"), // Ascension
  new Date("2025-06-09"), // Lundi de Pentecôte
  new Date("2025-07-14"),
  new Date("2025-08-15"),
  new Date("2025-11-01"),
  new Date("2025-11-11"),
  new Date("2025-12-25"),

  // 2026
  new Date("2026-01-01"),
  new Date("2026-04-06"), // Lundi de Pâques
  new Date("2026-05-01"),
  new Date("2026-05-08"),
  new Date("2026-05-14"),
  new Date("2026-05-25"), // Lundi de Pentecôte
  new Date("2026-07-14"),
  new Date("2026-08-15"),
  new Date("2026-11-01"),
  new Date("2026-11-11"),
  new Date("2026-12-25"),

  // 2027
  new Date("2027-01-01"),
  new Date("2027-03-29"), // Lundi de Pâques
  new Date("2027-05-01"),
  new Date("2027-05-08"),
  new Date("2027-05-06"), // Ascension
  new Date("2027-05-17"), // Lundi de Pentecôte
  new Date("2027-07-14"),
  new Date("2027-08-15"),
  new Date("2027-11-01"),
  new Date("2027-11-11"),
  new Date("2027-12-25"),

  // 2028
  new Date("2028-01-01"),
  new Date("2028-04-17"), // Lundi de Pâques
  new Date("2028-05-01"),
  new Date("2028-05-08"),
  new Date("2028-05-25"), // Ascension
  new Date("2028-06-05"), // Lundi de Pentecôte
  new Date("2028-07-14"),
  new Date("2028-08-15"),
  new Date("2028-11-01"),
  new Date("2028-11-11"),
  new Date("2028-12-25"),
]
