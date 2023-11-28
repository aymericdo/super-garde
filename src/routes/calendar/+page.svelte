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
  export let data: PageData

  const events = data.onCallSlotList.map((event) => ({
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
    events: [...events]
  };

  const handleGenerate = async () => {
    try {
      const data = await pb.send("/api/generate-events", {});
      console.log(data);
    } catch(error) {
      console.error(error);
    }
  }
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center">
    Calendrier
  </h1>
  {#if ['admin', 'god'].includes($currentUser?.role)}
    <button on:click={handleGenerate} class="btn btn-ghost text-m">Générer</button>
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