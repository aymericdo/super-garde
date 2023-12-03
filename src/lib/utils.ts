import type { RecordModel } from "pocketbase";

export const datesAreOnSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const onCallSlotRecordToCalendarEvent = (onCallSlot: RecordModel) => ({
  id: onCallSlot.id,
  start: new Date(onCallSlot.start),
  end: new Date(onCallSlot.end),
  title: `${onCallSlot.hospital} - ${onCallSlot.sector}`,
  editable: false,
  startEditable: false,
  durationEditable: false,
  resourceIds: [onCallSlot.student],
  hospital: onCallSlot.hospital,
  student: `${onCallSlot.expand?.student.firstName} ${onCallSlot.expand?.student.lastName}`,
})