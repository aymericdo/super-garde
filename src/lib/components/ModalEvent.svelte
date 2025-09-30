<script lang="ts">
  import { fly } from 'svelte/transition'
  import { getContext, setContext } from 'svelte'
  import { datesAreOnSameDay } from '$lib/utils'
  import ClockTimeFiveOutline from 'svelte-material-icons/ClockTimeFiveOutline.svelte'
  import MapMarker from 'svelte-material-icons/MapMarker.svelte'
  import Doctor from 'svelte-material-icons/Doctor.svelte'
  import { currentUser } from '$lib/stores/user'
  import StudentSelector from './StudentSelector.svelte'
  import type { CalendarEvent } from '$lib/interfaces/calendar'
  import type { RecordModel } from 'pocketbase'

  const displayDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }

    if (datesAreOnSameDay(start, end)) {
      const endDateOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
      }
      return `${start.toLocaleTimeString(
        'fr',
        options,
      )} - ${end.toLocaleTimeString('fr', endDateOptions)}`
    }

    return `${start.toLocaleTimeString(
      'fr',
      options,
    )} - ${end.toLocaleTimeString('fr', options)}`
  }

  setContext('studentSelector', {
    handleSelectStudent: (student: RecordModel[]) => {
      console.log(student);
    },
  });

  const {
    handleEventModalClose,
    handlePutOnMarket,
    handlePutOnTransfer,
    handlePutOnExchange,
    handleTakeFromMarket,
    handlePutOutOfMarket,
  } = getContext('isEventModalOpen') as {
    handleEventModalClose: () => void
    handlePutOnMarket: () => void
    handlePutOnTransfer: () => void
    handlePutOnExchange: () => void
    handleTakeFromMarket: () => void
    handlePutOutOfMarket: () => void
  }

  export let isEventModalOpen: boolean = false
  export let openedEvent: {
    event: CalendarEvent
    element: HTMLDivElement
  } | null = null
  export let isConnectedStudent: boolean

  let modalStep: 'default' | 'exchange' | 'transfer' = 'default'

  function resetModal() {
    modalStep = 'default'
  }
</script>

<div class="modal" class:modal-open={isEventModalOpen}>
  <div class="modal-box">
    <!-- Transition sur le contenu -->
    {#if modalStep === 'default'}
      <div
        in:fly|global={{ x: 300, duration: 300 }}
        out:fly|global={{ x: -300, duration: 300 }}
      >
        <h3 class="font-bold text-lg">{openedEvent?.event.title}</h3>
        <div class="py-4">
          <div class="flex items-center mb-2">
            <ClockTimeFiveOutline class="mr-2" size="1.5em" />
            <span class="capitalize">
              {openedEvent &&
                displayDateRange(
                  openedEvent?.event.start,
                  openedEvent?.event.end,
                )}
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

          <div class="flex flex-col">
            {#if !openedEvent?.event.isOnMarket}
              <button
                class="btn btn-secondary btn-outline btn-sm m-1"
                on:click={() => (modalStep = 'transfer')}
              >
                Transférer
              </button>
              <button
                class="btn btn-secondary btn-outline btn-sm m-1"
                on:click={() => (modalStep = 'exchange')}
              >
                Échanger
              </button>
              <button
                class="btn btn-secondary btn-outline btn-sm m-1"
                on:click={() => {
                  handlePutOnMarket()
                  handleEventModalClose()
                }}
              >
                Mettre sur le marché
              </button>
            {:else if isConnectedStudent}
              <button
                class="btn btn-primary btn-sm m-1"
                on:click={() => {
                  handleTakeFromMarket()
                  handleEventModalClose()
                }}
              >
                Prendre
              </button>
            {:else if openedEvent?.event.isOnMarket && ['assistant', 'god'].includes($currentUser?.role)}
              <button
                class="btn btn-primary btn-sm m-1"
                on:click={() => {
                  handlePutOutOfMarket()
                  handleEventModalClose()
                }}
              >
                Sortir du marché
              </button>
            {/if}
          </div>
        </div>
      </div>
    {:else if modalStep === 'exchange' || modalStep === 'transfer'}
      <div
        in:fly|global={{ x: 300, duration: 300 }}
        out:fly|global={{ x: -300, duration: 300 }}
      >
        <h3 class="font-bold text-lg">
          {modalStep === 'exchange'
            ? 'Choisir un étudiant'
            : 'Choisir un étudiant'}
        </h3>
        <div class="py-4">
          <StudentSelector  />
        </div>
      </div>
    {/if}

    <!-- Action de fermeture globale -->
    <div class="modal-action">
      {#if modalStep === 'default'}
      <button class="btn" on:click={handleEventModalClose}>Fermer</button>
      {:else if modalStep === 'exchange' || modalStep === 'transfer'}
        <button class="btn btn-outline" on:click={resetModal}>Retour</button>
        <button class="btn btn-secondary">Valider</button>
      {/if}
    </div>
  </div>

  <div class="modal-backdrop">
    <button on:click={handleEventModalClose}>Fermer</button>
  </div>
</div>
