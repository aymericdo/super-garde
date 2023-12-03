<script lang="ts">
  import { getContext } from 'svelte'
  import type { CalendarEvent } from '$lib/interfaces/calendar'
  import { datesAreOnSameDay } from '$lib/utils'
  import ClockTimeFiveOutline from 'svelte-material-icons/ClockTimeFiveOutline.svelte'
  import MapMarker from 'svelte-material-icons/MapMarker.svelte'
  import Doctor from 'svelte-material-icons/Doctor.svelte'

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

  const { handleEventModalClose } = getContext('isEventModalOpen') as { handleEventModalClose: () => void };

  export let isEventModalOpen: boolean = false;
  export let openedEvent: { event: CalendarEvent, element: HTMLDivElement } | null = null;
</script>

<div class="modal" class:modal-open={isEventModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">{openedEvent?.event.title}</h3>
    <div class="py-4">
      <div class="flex items-center mb-2">
        <ClockTimeFiveOutline class="mr-2" size="1.5em" />
        <span class="capitalize">
          {openedEvent && displayDateRange(openedEvent?.event.start, openedEvent?.event.end)}
        </span>
      </div>
      <div class="flex items-center mb-2">
        <MapMarker class="mr-2" size="1.5em" />
        <span>{openedEvent?.event.hospital}</span>
      </div>
      <div class="flex items-center mb-2">
        <Doctor class="mr-2" size="1.5em" />
        <span>{openedEvent?.event.student}</span>
      </div>
    </div>
    <div class="modal-action">
      <button class="btn" on:click={handleEventModalClose}>Close</button>
    </div>
  </div>
  <div class="modal-backdrop">
    <button on:click={handleEventModalClose}>close</button>
  </div>
</div>