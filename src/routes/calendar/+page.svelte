<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte'
  import Calendar from '@event-calendar/core';
  import TimeGrid from '@event-calendar/time-grid';
  import DayGrid from '@event-calendar/day-grid';
  import List from '@event-calendar/list';
  import ResourceTimeGrid from '@event-calendar/resource-time-grid';
  import Interaction from '@event-calendar/interaction';
  import ModalEvent from '$lib/components/ModalEvent.svelte'
  import ModalPeriodPicker from '$lib/components/ModalPeriodPicker.svelte'
  import { currentUser } from '$lib/stores/user';
  import { pb } from '$lib/pocketbase';
  
  import type { CalendarEvent } from '$lib/interfaces/calendar'
  import type { RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  import { onCallSlotRecordToCalendarEvent } from '$lib/utils'
  export let data: PageData
  
  let isEventModalOpen = false;
  let isPeriodPickerModalOpen = false;
  let openedEvent: { event: CalendarEvent, element: HTMLDivElement } | null = null;

  const plugins = [TimeGrid, DayGrid, List, ResourceTimeGrid, Interaction];

  const handleGenerate = async () => {
    isPeriodPickerModalOpen = true;
  }

  const handleDelete = async () => {
    try {
      const data = await pb.send("/api/delete-all-on-call-slots", {});
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleEventClick = ({ el, event, jsEvent }: {
    el: HTMLDivElement,
    event: RecordModel,
    jsEvent: PointerEvent,
  }) => {
    el.classList.add('-selected');
    openedEvent = {
      event: options.events.find((ev: CalendarEvent) => ev.id === event.id)!,
      element: el,
    };
    isEventModalOpen = true;
  }

  const handleSubmit = async (start: Date, end: Date) => {
    handlePeriodPickerClose();
    try {
      const data = await pb.send("/api/generate-events", {
        params: {
          startDate: start,
          endDate: end,
        }
      });
      console.log(data);
    } catch(error) {
      console.error(error);
    }
  }

  const handlePeriodPickerClose = () => {
    isPeriodPickerModalOpen = false;
  }

  const handleEventModalClose = () => {
    openedEvent?.element.classList.remove('-selected');
    isEventModalOpen = false;
  }

  let options: any = {
    view: 'dayGridMonth',
    slotDuration: '00:15',
    allDaySlot: false,
    firstDay: 1,
    selectable: false,
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth timeGridWeek listDay listWeek',
    },
    buttonText: {
      today: "Aujourd'hui",
      dayGridMonth: 'Mois',
      timeGridWeek: 'Semaine',
      listDay: 'Jour',
      listWeek: 'Liste',
    },
    events: data.onCallSlotList
      .map((event) => onCallSlotRecordToCalendarEvent(event)),
    eventClick: handleEventClick,
  };

  onMount(async () => {
    pb.realtime.subscribe('onCallSlots', (e) => {
      switch (e.action) {
        case 'update': {
          options = {
            ...options,
            events: options.events.map((event: CalendarEvent) => {
              if (event.id === e.record.id) {
                return onCallSlotRecordToCalendarEvent(e.record);
              } else {
                return event;
              }
            }),
          }
          break;
        }
        case 'delete': {
          options = {
            ...options,
            events: options.events
              .filter((event: CalendarEvent) => event.id !== e.record.id)
          }
          break;
        }
        case 'create': {
          options = {
            ...options,
            events: [
              ...options.events,
              onCallSlotRecordToCalendarEvent(e.record),
            ],
          };
          break;
        }
      }
    });

    pb.realtime.subscribe('users', (e) => {
      if (e.record.id === $currentUser.id) {
        currentUser.set({
          ...e.record,
          isAdmin: $currentUser?.isAdmin,
        });
      }
    });
  });

  onDestroy(() => {
    pb.realtime.unsubscribe('onCallSlots');
    pb.realtime.unsubscribe('users');
  })

  setContext('isEventModalOpen', { handleEventModalClose });
  setContext('isPeriodPickerModalOpen', { handlePeriodPickerClose, handleSubmit });
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center font-bold text-gray-900 text-lg">
    Calendrier
  </h1>
  {#if $currentUser?.isAdmin || ['assistant', 'god'].includes($currentUser?.role)}
    <div>
      <button disabled={!options.events.length} on:click={handleDelete} class="btn btn-warning text-m">Supprimer</button>
      <button disabled={!!options.events.length} on:click={handleGenerate} class="btn btn-ghost text-m">Générer</button>
    </div>
  {/if}
</div>

<div class="shadow-md sm:rounded-lg event-calendar">
  <div class="w-full">
    <Calendar {plugins} {options} />
  </div>
</div>

<ModalPeriodPicker {isPeriodPickerModalOpen} />
<ModalEvent {isEventModalOpen} {openedEvent} />

<style>
  :global(.event-calendar .ec) {
	  height: 640px;
    padding: 0.625rem;
  }

  :global(.event-calendar .ec.ec-day-grid) {
    height: 400px;
  }
  :global(.event-calendar .ec .ec-event) {
    cursor: pointer;
  }

  :global(.event-calendar .ec .ec-event) {
    border: dotted transparent 2px;
  }

  :global(.event-calendar .ec .ec-event.-selected) {
    border: dotted black 2px;
  }

  :global(.ec-icon::before, .ec-icon::after) {
    box-sizing: initial;
  }

  @media (min-width: 576px) {
    :global(.event-calendar .ec) {
      height: 700px;
    }

    :global(.event-calendar .ec.ec-day-grid) {
      height: 500px;
    }
  }

  @media (min-width: 992px) {
    :global(.event-calendar .ec) {
      height: 800px;
    }

    :global(.event-calendar .ec.ec-day-grid) {
      height: 700px;
    }
  }

  @media (min-width: 1200px) {
    :global(.event-calendar .ec.ec-day-grid) {
      height: 800px;
    }
  }
</style>