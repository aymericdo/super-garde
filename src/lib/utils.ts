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
