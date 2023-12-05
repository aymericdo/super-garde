import type { RecordModel } from "pocketbase";

export interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  editable: boolean;
  startEditable: boolean;
  durationEditable: boolean;
  resourceIds: string[];
  hospital: string;
  student: string;
  isOnMarket: boolean;
}

export interface CalendarOptions {
  view: 'dayGridMonth' | 'timeGridWeek' | 'listDay' | 'listWeek';
  slotDuration: string;
  selectable: boolean;
  allDaySlot: boolean;
  firstDay: number;
  headerToolbar: {
    start: string;
    center: string;
    end: string;
  };
  buttonText: {
    today: string;
    dayGridMonth: string;
    timeGridWeek: string;
    listDay: string;
    listWeek: string;
  },
  events: CalendarEvent[];
  eventClick: (data: {
    el: HTMLDivElement,
    event: RecordModel,
    jsEvent: PointerEvent,
  }) => void;
}