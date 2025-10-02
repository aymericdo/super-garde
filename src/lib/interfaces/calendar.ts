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
  hospital?: string;
  sector?: string;
  student?: string;
  studentFullName?: string;
  studentUHCD?: string;
  studentYear?: string;
  studentId?: string;
  isOnMarket?: boolean;
  isOnTransfer?: boolean;
  isOnExchange?: boolean;
  backgroundColor?: string;
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
    listWeek?: string;
    listYear?: string;
  },
  eventBackgroundColor?: string;
  eventContent?: string;
  eventClassNames?: string;
  events: CalendarEvent[];
  dateClick?: (data: {
    date: Date,
  }) => void;
  eventClick?: (data: {
    el: HTMLDivElement,
    event: RecordModel,
    jsEvent: PointerEvent,
  }) => void;
  datesSet?: (info: {
    start: Date,
    end: Date,
    startStr: string,
    endStr: string,
    view: ViewCalendar,
  }) => void;
  eventMouseEnter?: (data: {
    el: HTMLDivElement,
    event: RecordModel,
    jsEvent: PointerEvent,
  }) => void;
  eventDidMount?: (data: {
    el: HTMLDivElement,
    event: RecordModel,
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