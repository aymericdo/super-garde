<script lang="ts">
  import Calendar from '@event-calendar/core';
  import TimeGrid from '@event-calendar/time-grid';
  import DayGrid from '@event-calendar/day-grid';
  import List from '@event-calendar/list';
  import ResourceTimeGrid from '@event-calendar/resource-time-grid';
  import Interaction from '@event-calendar/interaction';
  import { currentUser } from '$lib/stores/user';
  import { pb } from '$lib/pocketbase';

  import type { PageData } from './$types'
    import { onMount } from 'svelte'
  export let data: PageData

  const initEvents = data.onCallSlotList.map((event) => ({
    id: event.id,
    start: new Date(event.start),
    end: new Date(event.end),
    title: `${event.hospital} - ${event.sector}`,
    editable: false,
    startEditable: false,
    durationEditable: false,
    resourceIds: [],
  }));

  let plugins = [TimeGrid, DayGrid, List, ResourceTimeGrid, Interaction];
  let options: any = {
    view: 'dayGridMonth',
    slotDuration: '00:15',
    allDaySlot: false,
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
  };

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
                  resourceIds: [],
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
              resourceIds: [],
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
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center">
    Calendrier
  </h1>
  {#if $currentUser?.isAdmin || ['admin', 'god'].includes($currentUser?.role)}
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

<style>
  :global(.ec) {
	  height: 640px;
    padding: 0.625rem;
  }

  :global(.ec.ec-day-grid) {
    height: 400px;
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