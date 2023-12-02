<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import Calendar from '@event-calendar/core';
  import TimeGrid from '@event-calendar/time-grid';
  import DayGrid from '@event-calendar/day-grid';
  import List from '@event-calendar/list';
  import ResourceTimeGrid from '@event-calendar/resource-time-grid';
  import Interaction from '@event-calendar/interaction';
  import { currentUser } from '$lib/stores/user';
  import { pb } from '$lib/pocketbase';
  import ClockTimeFiveOutline from 'svelte-material-icons/ClockTimeFiveOutline.svelte'
  import MapMarker from 'svelte-material-icons/MapMarker.svelte'
  
  import type { CalendarEvent, CalendarOptions } from '$lib/calendar'
  import type { RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  import { datesAreOnSameDay } from '$lib/utils'
  export let data: PageData
  
  let isModalOpen = false;
  let openedEvent: { event: CalendarEvent, element: HTMLDivElement } | null = null;

  const plugins = [TimeGrid, DayGrid, List, ResourceTimeGrid, Interaction];
  const initEvents: CalendarEvent[] = data.onCallSlotList.map((event) => ({
    id: event.id,
    start: new Date(event.start),
    end: new Date(event.end),
    title: `${event.hospital} - ${event.sector}`,
    editable: false,
    startEditable: false,
    durationEditable: false,
    resourceIds: [event.student],
    hospital: event.hospital,
  }));

  const handleGenerate = async () => {
    try {
      const data = await pb.send("/api/generate-events", {
        params: {
          startDate: new Date('2023-12-01T00:00'),
          endDate: new Date('2023-12-05T00:00'),
        }
      });
      console.log(data);
    } catch(error) {
      console.error(error);
    }
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
    isModalOpen = true;
  }

  const handleModalClose = () => {
    openedEvent?.element.classList.remove('-selected');
    openedEvent = null;
    isModalOpen = false;
  }

  let options: CalendarOptions = {
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
    events: [...initEvents],
    eventClick: handleEventClick,
  };

  const displayDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    if (datesAreOnSameDay(start, end)) {
      const endDateOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
      }
      return `${start.toLocaleTimeString("fr", options)} - ${end.toLocaleTimeString("fr", endDateOptions)}`;
    }

    return `${start.toLocaleTimeString("fr", options)} - ${end.toLocaleTimeString("fr", options)}`;
  }

  onMount(async () => {
    pb.realtime.subscribe('onCallSlots', (e) => {
      switch (e.action) {
        case 'update': {
          options = {
            ...options,
            events: options.events.map((event: any) => {
              if (event.id === e.record.id) {
                return {
                  id: e.record.id,
                  start: new Date(e.record.start),
                  end: new Date(e.record.end),
                  title: `${e.record.hospital} - ${e.record.sector}`,
                  editable: false,
                  startEditable: false,
                  durationEditable: false,
                  resourceIds: [e.record.student],
                  hospital: e.record.hospital,
                };
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
            events: options.events.filter((event: any) => {
              if (event.id !== e.record.id) {
                return event;
              }
            }),
          }
          break;
        }
        case 'create': {
          options = {
            ...options,
            events: [...options.events, {
              id: e.record.id,
              start: new Date(e.record.start),
              end: new Date(e.record.end),
              title: `${e.record.hospital} - ${e.record.sector}`,
              editable: false,
              startEditable: false,
              durationEditable: false,
              resourceIds: [e.record.student],
              hospital: e.record.hospital,
            }],
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
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center font-bold text-gray-900 text-lg">
    Calendrier
  </h1>
  {#if $currentUser?.isAdmin || ['assistant', 'god'].includes($currentUser?.role)}
    <div>
      <button disabled={!options.events.length} on:click={handleDelete} class="btn btn-warning text-m">Supprimer</button>
      <button on:click={handleGenerate} class="btn btn-ghost text-m">Générer</button>
    </div>
  {/if}
</div>

<div class="shadow-md sm:rounded-lg">
  <div class="w-full">
    <Calendar {plugins} {options} />
  </div>
</div>

<div class="modal" class:modal-open={isModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">{openedEvent?.event.title}</h3>
    <div class="py-4">
      <div class="flex items-center mb-2">
        <ClockTimeFiveOutline class="mr-1" size={'2em'} />
        <span class="capitalize">
          {openedEvent && displayDateRange(openedEvent?.event.start, openedEvent?.event.end)}
        </span>
      </div>
      <div class="flex items-center mb-2">
        <MapMarker class="mr-1" size={'2em'} />
        <span>{openedEvent?.event.hospital}</span>
      </div>
    </div>
    <div class="modal-action">
      <button class="btn" on:click={handleModalClose}>Close</button>
    </div>
  </div>
  <div class="modal-backdrop">
    <button on:click={handleModalClose}>close</button>
  </div>
</div>

<style>
  :global(.ec) {
	  height: 640px;
    padding: 0.625rem;
  }

  :global(.ec.ec-day-grid) {
    height: 400px;
  }
  :global(.ec .ec-event) {
    cursor: pointer;
  }

  :global(.ec .ec-event.-selected) {
    border: dotted black 2px;
  }

  :global(.ec-icon::before, .ec-icon::after) {
    box-sizing: initial;
  }

  @media (min-width: 576px) {
    :global(.ec) {
      height: 700px;
    }

    :global(.ec.ec-day-grid) {
      height: 500px;
    }
  }

  @media (min-width: 992px) {
    :global(.ec) {
      height: 800px;
    }

    :global(.ec.ec-day-grid) {
      height: 700px;
    }
  }

  @media (min-width: 1200px) {
    :global(.ec.ec-day-grid) {
      height: 800px;
    }
  }
</style>