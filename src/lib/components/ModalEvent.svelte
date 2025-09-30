<script lang="ts">
  import { fly } from 'svelte/transition'
  import { getContext, onDestroy, onMount, setContext } from 'svelte'
  import { displayDateRange } from '$lib/utils'
  import { onCallErrorValidation } from '$lib/validations'
  import ClockTimeFiveOutline from 'svelte-material-icons/ClockTimeFiveOutline.svelte'
  import MapMarker from 'svelte-material-icons/MapMarker.svelte'
  import Doctor from 'svelte-material-icons/Doctor.svelte'
  import ArrowBottomRightThinCircleOutline from 'svelte-material-icons/ArrowBottomRightThinCircleOutline.svelte'
  import ArrowTopRightThinCircleOutline from 'svelte-material-icons/ArrowTopRightThinCircleOutline.svelte'
  import Autorenew from 'svelte-material-icons/Autorenew.svelte'
  import { currentUser } from '$lib/stores/user'
  import StudentSelector from './StudentSelector.svelte'
  import GardeSelector from './GardeSelector.svelte'
  import { pb } from '$lib/pocketbase'
  import type { CalendarEvent } from '$lib/interfaces/calendar'
  import type { ClientResponseError, RecordModel } from 'pocketbase'

  let modalStep: 'default' | 'exchange' | 'transfer' = 'default'
  
  let selectedStudent: RecordModel | null = null
  let selectedStudentError: string | null = null
  let selectedSlot: RecordModel | null = null

  let onTransferSlot: RecordModel | null = null
  let onExchangeSlot: RecordModel | null = null

  const handlePutOnMarket = async () => {
    if (!openedEvent) return;

    try {
      await pb.collection("onCallSlots").update(openedEvent.id, { isOnMarket: true });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const handlePutOutOfMarket = async () => {
    if (!openedEvent) return;

    try {
      await pb.collection("onCallSlots").update(openedEvent.id, { isOnMarket: false });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const handlePutOutOfTransfer = async () => {
    if (!openedEvent) return;
    if (!onTransferSlot) return;

    try {
      await pb.collection("onTransferSlots").update(onTransferSlot.id, { state: 'cancel' });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const handlePutOutOfExchange = async () => {
    if (!openedEvent) return;
    if (!onExchangeSlot) return;

    try {
      await pb.collection("onExchangeSlots").update(onExchangeSlot.id, { state: 'cancel' });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const handleTakeFromTransfer = async () => {
    if (!openedEvent) return;
    if (!onTransferSlot) return;

    try {
      await pb.collection("onTransferSlots").update(onTransferSlot.id, { state: 'done' });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const handleTakeFromExchange = async () => {
    if (!openedEvent) return;
    if (!onExchangeSlot) return;

    try {
      await pb.collection("onExchangeSlots").update(onExchangeSlot.id, { state: 'done' });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const handleTakeFromMarket = async () => {
    if (!openedEvent) return;
    if (!connectedStudent) return;

    try {
      await pb.collection("onCallSlots").update(openedEvent.id, { isOnMarket: false, student: connectedStudent?.id });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const handlePutOnTransfer = async () => {
    if (!openedEvent) return;
    if (!selectedStudent) return;

    try {
      await pb.collection("onTransferSlots").create({
        slot: openedEvent.id,
        to: selectedStudent.id,
        from: openedEvent.studentId,
      });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const handlePutOnExchange = async () => {
    if (!openedEvent) return;
    if (!selectedStudent) return;
    if (!selectedSlot) return;

    try {
      await pb.collection("onExchangeSlots").create({
        slot: openedEvent.id,
        to: selectedStudent.id,
        from: openedEvent.studentId,
        toSlot: selectedSlot.id,
      });
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  setContext('studentSelector', {
    handleSelectStudent: (student: RecordModel) => {
      if (!openedEvent) return;
      selectedStudent = { ...student };
      selectedStudentError = onCallErrorValidation(openedEvent, selectedStudent)
    },
  });

  setContext('slotSelector', {
    handleSelectSlot: (slot: RecordModel) => {
      if (!openedEvent) return;
      selectedSlot = { ...slot };
    },
  });

  onDestroy(() => {
    modalStep = 'default'
  })

  onMount(async () => {
    if (openedEvent.isOnTransfer) {
      let filter = `state="progress"&&slot="${openedEvent.id}"`
      onTransferSlot = await pb.collection("onTransferSlots").getFirstListItem(filter, {
        expand: 'from,to',
      })
    } else if (openedEvent.isOnExchange) {
      let filter = `state="progress"&&slot="${openedEvent.id}"`
      onExchangeSlot = await pb.collection("onExchangeSlots").getFirstListItem(filter, {
        expand: 'from,to,toSlot',
      })
    }
  })

  const {
    handleEventModalClose,
  } = getContext('isEventModalOpen') as {
    handleEventModalClose: () => void
  }

  export let isEventModalOpen: boolean = false
  export let openedEvent: CalendarEvent;
  export let connectedStudent: RecordModel | undefined

  function resetModal() {
    modalStep = 'default'
    selectedStudent = null;
    selectedSlot = null;
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
        <h3 class="font-bold text-lg">{openedEvent.title}</h3>
        <div class="py-4">
          <div class="flex items-center mb-2">
            <ClockTimeFiveOutline class="mr-2" size="1.5em" />
            <span class="capitalize">
              {openedEvent &&
                displayDateRange(
                  openedEvent.start,
                  openedEvent.end,
                )}
            </span>
          </div>
          <div class="flex items-center mb-2">
            <MapMarker class="mr-2" size="1.5em" />
            <span>{openedEvent.hospital}</span>
          </div>
          <div class="flex items-center mb-2">
            <Doctor class="mr-2" size="1.5em" />
            {#if !!openedEvent.student}
              <span>{openedEvent.student}</span>
            {:else}
              <span>Pas d'étudiant·e</span>
            {/if}
          </div>

          <div class="mt-4">
            {#if openedEvent.isOnMarket}
              <div class="flex items-center mb-2">
                Cette garde est actuellement sur le marché.
              </div>
            {:else if openedEvent.isOnTransfer && onTransferSlot?.expand}
              <div class="flex items-center mb-2">
                {#if connectedStudent?.id === onTransferSlot?.expand.to.id}
                  <ArrowBottomRightThinCircleOutline class="mr-2" size="1.5em" />
                {:else}
                  <ArrowTopRightThinCircleOutline class="mr-2" size="1.5em" />
                {/if}
                <span>
                  Cette garde est actuellement en transfert vers
                  <span class="font-bold">{connectedStudent?.id === onTransferSlot?.expand.to.id ? 'vous' : `${onTransferSlot?.expand.to.firstName} ${onTransferSlot?.expand.to.lastName}`}</span>
                </span>
              </div>
            {:else if openedEvent.isOnExchange && onExchangeSlot?.expand}
              <div class="flex mb-2">
                {#if connectedStudent?.id === onExchangeSlot?.expand.to.id}
                  <Autorenew class="mr-2" size="1.5em" />
                  <ArrowBottomRightThinCircleOutline class="mr-2" size="1.5em" />
                {:else}
                  <div class="flex flex-col mr-2">
                    <Autorenew class="mb-1" size="1.5em" />
                    <ArrowTopRightThinCircleOutline size="1.5em" />
                  </div>
                {/if}
                <span>
                  Cette garde est actuellement en échange avec
                  <span class="font-bold">
                    {connectedStudent?.id === onExchangeSlot?.expand.to.id ? 'vous' : `${onExchangeSlot?.expand.to.firstName} ${onExchangeSlot?.expand.to.lastName}`}.
                  </span>

                  <span>Voici la garde en retour :</span>
                  <div class="mt-4">
                    <span class="capitalize">
                      {onExchangeSlot?.expand.toSlot &&
                        displayDateRange(
                          new Date(onExchangeSlot?.expand.toSlot.start),
                          new Date(onExchangeSlot?.expand.toSlot.end),
                      )}
                    </span>
                    <div class="flex items-center mb-2">
                      <MapMarker class="mr-2" size="1.5em" />
                      <span>{onExchangeSlot?.expand.toSlot.hospital}</span>-<span>{onExchangeSlot?.expand.toSlot.sector}</span>
                    </div>
                  </div>
                </span>
              </div>
            {/if}
          </div>

          <div class="flex flex-col">
            {#if !openedEvent.isOnMarket && !openedEvent.isOnTransfer && !openedEvent.isOnExchange}
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
                }}
              >
                Mettre sur le marché
              </button>
            {:else if !!connectedStudent && openedEvent.isOnMarket}
              <button
                class="btn btn-primary btn-sm m-1"
                disabled={!!onCallErrorValidation(openedEvent, connectedStudent)}
                on:click={() => {
                  handleTakeFromMarket()
                }}
              >
                Prendre
              </button>
            {:else if openedEvent.isOnMarket && ['assistant', 'god'].includes($currentUser?.role ?? '')}
              <button
                class="btn btn-primary btn-sm m-1"
                on:click={() => {
                  handlePutOutOfMarket()
                }}
              >
                Sortir du marché
              </button>
            {:else if openedEvent.isOnTransfer}
              <button
                class="btn btn-default btn-sm m-1"
                on:click={handlePutOutOfTransfer}
              >
                {!connectedStudent || connectedStudent.id === openedEvent.studentId ? 'Annuler le transfert' : 'Refuser le transfert'}
              </button>
              {#if onTransferSlot?.expand && connectedStudent?.id === onTransferSlot.expand.to.id}
                <button
                  class="btn btn-primary btn-sm m-1"
                  on:click={handleTakeFromTransfer}
                >
                  Accepter le transfert
                </button>
              {/if}
            {:else if openedEvent.isOnExchange}
              <button
                class="btn btn-default btn-sm m-1"
                on:click={handlePutOutOfExchange}
              >
                {!connectedStudent || connectedStudent.id === openedEvent.studentId ? "Annuler l'échange" : "Refuser l'échange"}
              </button>
              {#if onExchangeSlot?.expand && connectedStudent?.id === onExchangeSlot.expand.to.id}
                <button
                  class="btn btn-primary btn-sm m-1"
                  on:click={handleTakeFromExchange}
                >
                  Accepter l'échange
                </button>
              {/if}
            {/if}
          </div>
        </div>
      </div>
    {:else if modalStep === 'transfer'}
      <div
        in:fly|global={{ x: 300, duration: 300 }}
        out:fly|global={{ x: -300, duration: 300 }}
      >
        <h3 class="font-bold text-lg">
          Choisir un étudiant
        </h3>
        <div class="py-4">
          <StudentSelector {selectedStudentError} />
        </div>
      </div>
    {:else if modalStep === 'exchange'}
      <div
        in:fly|global={{ x: 300, duration: 300 }}
        out:fly|global={{ x: -300, duration: 300 }}
      >
        <h3 class="font-bold text-lg">
          Choisir un étudiant et une garde
        </h3>
        <div class="py-4">
          <StudentSelector {selectedStudentError} />

          {#if selectedStudent}
            <GardeSelector {selectedStudent} />
          {/if}
        </div>
      </div>
    {/if}

    <!-- Action de fermeture globale -->
    <div class="modal-action">
      {#if modalStep === 'default'}
      <button class="btn" on:click={handleEventModalClose}>Fermer</button>
      {:else if modalStep === 'transfer'}
        <button class="btn btn-outline" on:click={resetModal}>Retour</button>
        <button class="btn btn-secondary"
          disabled={!selectedStudent || !!selectedStudentError}
          on:click={handlePutOnTransfer}
        >
        Valider
      </button>
      {:else if modalStep === 'exchange'}
        <button class="btn btn-outline" on:click={resetModal}>Retour</button>
        <button class="btn btn-secondary"
          disabled={!selectedStudent || !!selectedStudentError || !selectedSlot}
          on:click={handlePutOnExchange}
        >
        Valider
      </button>
      {/if}
    </div>
  </div>

  <div class="modal-backdrop">
    <button on:click={handleEventModalClose}>Fermer</button>
  </div>
</div>
