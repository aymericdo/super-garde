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
  backgroundColor: string;
}

export interface CalendarOptions {
  view: 'dayGridMonth' | 'timeGridWeek' | 'listDay' | 'listWeek';
  slotDuration: string;
  selectable: boolean;
  dayMaxEvents: boolean;
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
    listYear: string;
  },
  events: CalendarEvent[];
  eventClick: (data: {
    el: HTMLDivElement,
    event: RecordModel,
    jsEvent: PointerEvent,
  }) => void;
  datesSet: (info: {
    start: Date,
    end: Date,
    startStr: string,
    endStr: string,
    view: ViewCalendar,
  }) => void;
}

export interface CalendarElement {
  getView: () => ViewCalendar;
}

export interface ViewCalendar {
  type: string;
  title: string;
  currentStart: Date;
  currentEnd: Date;
  activeStart: Date;
  activeEnd: Date;
}