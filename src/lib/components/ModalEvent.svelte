<script lang="ts">
  import { getContext } from 'svelte'
  import type { CalendarEvent } from '$lib/interfaces/calendar'
  import { datesAreOnSameDay } from '$lib/utils'
  import ClockTimeFiveOutline from 'svelte-material-icons/ClockTimeFiveOutline.svelte'
  import MapMarker from 'svelte-material-icons/MapMarker.svelte'
  import Doctor from 'svelte-material-icons/Doctor.svelte'
  import { currentUser } from '$lib/stores/user'
  import type { RecordModel } from 'pocketbase'

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

  const { handleEventModalClose, handlePutOnMarket, handleTakeFromMarket, handlePutOutOfMarket } =
    getContext('isEventModalOpen') as {
      handleEventModalClose: () => void,
      handlePutOnMarket: () => void,
      handleTakeFromMarket: () => void,
      handlePutOutOfMarket: () => void,
    };

  export let isEventModalOpen: boolean = false;
  export let openedEvent: { event: CalendarEvent, element: HTMLDivElement } | null = null;
  export let isConnectedStudent: boolean;
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
        {#if !!openedEvent?.event.student}
          <span>{openedEvent?.event.student}</span>
        {:else}
          <span>Pas d'étudiant·e</span>
        {/if}
          
      </div>
    </div>
    <div class="modal-action">
      <button class="btn" on:click={handleEventModalClose}>Fermer</button>
      {#if !openedEvent?.event.isOnMarket}
        <button class="btn btn-primary" on:click={handlePutOnMarket}>Mettre sur le marché</button>
      {:else if isConnectedStudent}
        <button class="btn btn-primary" on:click={handleTakeFromMarket}>Prendre</button>
      {/if}

      {#if openedEvent?.event.isOnMarket && (['assistant', 'god'].includes($currentUser?.role))}
        <button class="btn btn-primary" on:click={handlePutOutOfMarket}>Sortir du marché</button>
      {/if}
    </div>
  </div>
  <div class="modal-backdrop">
    <button on:click={handleEventModalClose}>close</button>
  </div>
</div>