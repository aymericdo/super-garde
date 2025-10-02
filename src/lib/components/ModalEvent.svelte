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
  import OnCallSelector from './OnCallSelector.svelte'
  import { pb } from '$lib/pocketbase'
  import type { CalendarEvent } from '$lib/interfaces/calendar'
  import type { ClientResponseError, RecordModel } from 'pocketbase'

  let modalStep: 'default' | 'exchange' | 'transfer' | 'studentList' = 'default'

  let selectedStudent: RecordModel | null = null
  let selectedStudentError: string | null = null
  let selectedSlot: RecordModel | null = null

  let onTransferSlot: RecordModel | null = null
  let onExchangeSlot: RecordModel | null = null

  let sameDayStudents: { [sector: string]: string[] } | null = null

  let loading = false

  const handlePutOnMarket = async () => {
    if (!openedEvent) return

    loading = true

    try {
      await pb
        .collection('onCallSlots')
        .update(openedEvent.id, { isOnMarket: true })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handlePutOutOfMarket = async () => {
    if (!openedEvent) return

    loading = true

    try {
      await pb
        .collection('onCallSlots')
        .update(openedEvent.id, { isOnMarket: false })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handlePutOutOfTransfer = async () => {
    if (!openedEvent) return
    if (!onTransferSlot) return

    loading = true

    try {
      await pb
        .collection('onTransferSlots')
        .update(onTransferSlot.id, { state: 'cancel' })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handlePutOutOfExchange = async () => {
    if (!openedEvent) return
    if (!onExchangeSlot) return

    loading = true

    try {
      await pb
        .collection('onExchangeSlots')
        .update(onExchangeSlot.id, { state: 'cancel' })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handleTakeFromTransfer = async () => {
    if (!openedEvent) return
    if (!onTransferSlot) return

    loading = true

    try {
      await pb
        .collection('onTransferSlots')
        .update(onTransferSlot.id, { state: 'done' })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handleTakeFromExchange = async () => {
    if (!openedEvent) return
    if (!onExchangeSlot) return

    loading = true

    try {
      await pb
        .collection('onExchangeSlots')
        .update(onExchangeSlot.id, { state: 'done' })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handleTakeFromMarket = async () => {
    if (!openedEvent) return
    if (!connectedStudent) return

    loading = true

    try {
      await pb
        .collection('onCallSlots')
        .update(openedEvent.id, {
          isOnMarket: false,
          student: connectedStudent?.id,
        })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handlePutOnTransfer = async () => {
    if (!openedEvent) return
    if (!selectedStudent) return

    loading = true

    try {
      await pb.collection('onTransferSlots').create({
        slot: openedEvent.id,
        to: selectedStudent.id,
        from: openedEvent.studentId,
      })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handlePutOnExchange = async () => {
    if (!openedEvent) return
    if (!selectedStudent) return
    if (!selectedSlot) return

    loading = true

    try {
      await pb.collection('onExchangeSlots').create({
        slot: openedEvent.id,
        to: selectedStudent.id,
        from: openedEvent.studentId,
        toSlot: selectedSlot.id,
      })
      handleEventModalClose()
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  const handleStudentListOpen = async () => {
    if (!openedEvent) return

    loading = true

    try {
      sameDayStudents = await pb.send("/api/get-your-colleagues", {
        params: {
          slotId: openedEvent.id,
        }
      });

      modalStep = 'studentList'
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    } finally {
      loading = false
    }
  }

  setContext('studentSelector', {
    handleSelectStudent: (student: RecordModel) => {
      if (!openedEvent) return
      selectedStudent = { ...student }
      selectedStudentError = onCallErrorValidation(openedEvent, selectedStudent)
    },
  })

  setContext('slotSelector', {
    handleSelectSlot: (slot: RecordModel) => {
      if (!openedEvent) return
      selectedSlot = { ...slot }
    },
  })

  onDestroy(() => {
    modalStep = 'default'
  })

  onMount(async () => {
    try {
      if (openedEvent.isOnTransfer) {
        let filter = `state="progress"&&slot="${openedEvent.id}"`
        onTransferSlot = await pb
          .collection('onTransferSlots')
          .getFirstListItem(filter, {
            expand: 'from,to',
          })
      } else if (openedEvent.isOnExchange) {
        let filter = `state="progress"&&(slot="${openedEvent.id}"||toSlot="${openedEvent.id}")`
        onExchangeSlot = await pb
          .collection('onExchangeSlots')
          .getFirstListItem(filter, {
            expand: 'from,to,slot,toSlot',
          })
      }
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error)
      }
    }
  })

  const { handleEventModalClose } = getContext('isEventModalOpen') as {
    handleEventModalClose: () => void
  }

  export let isEventModalOpen: boolean = false
  export let openedEvent: CalendarEvent
  export let connectedStudent: RecordModel | undefined

  function resetModal() {
    modalStep = 'default'
    selectedStudent = null
    selectedSlot = null
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
                displayDateRange(openedEvent.start, openedEvent.end)}
            </span>
          </div>
          <div class="flex items-center mb-2">
            <MapMarker class="mr-2" size="1.5em" />
            <span>{openedEvent.hospital}</span>
          </div>
          <div class="flex items-center mb-2">
            <Doctor class="mr-2" size="1.5em" />
            {#if !!openedEvent.studentFullName}
              <span
                >{openedEvent.studentFullName} ({openedEvent.studentYear})</span
              >
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
                  <ArrowBottomRightThinCircleOutline
                    class="mr-2"
                    size="1.5em"
                  />
                {:else}
                  <ArrowTopRightThinCircleOutline class="mr-2" size="1.5em" />
                {/if}
                <span>
                  Cette garde est actuellement en transfert vers
                  <span class="font-bold"
                    >{connectedStudent?.id === onTransferSlot?.expand.to.id
                      ? 'toi'
                      : `${onTransferSlot?.expand.to.firstName} ${onTransferSlot?.expand.to.lastName}`}</span
                  >
                </span>
              </div>
            {:else if openedEvent.isOnExchange && onExchangeSlot?.expand}
              <div class="flex mb-2">
                {#if connectedStudent?.id === onExchangeSlot?.expand.to.id}
                  <Autorenew class="mr-2" size="1.5em" />
                  <ArrowBottomRightThinCircleOutline
                    class="mr-2"
                    size="1.5em"
                  />
                {:else}
                  <div class="flex flex-col mr-2">
                    <Autorenew class="mb-1" size="1.5em" />
                    <ArrowTopRightThinCircleOutline size="1.5em" />
                  </div>
                {/if}
                <span>
                  Cette garde est actuellement en échange avec
                  {#if openedEvent.id === onExchangeSlot?.expand.slot.id}
                    <span class="font-bold">
                      {connectedStudent?.id === onExchangeSlot?.expand.to.id
                        ? 'toi'
                        : `${onExchangeSlot?.expand.to.firstName} ${onExchangeSlot?.expand.to.lastName}`}.
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
                        <span>{onExchangeSlot?.expand.toSlot.hospital}</span
                        >-<span>{onExchangeSlot?.expand.toSlot.sector}</span>
                      </div>
                    </div>
                  {:else if openedEvent.id === onExchangeSlot?.expand.toSlot.id}
                    <span class="font-bold">
                      {connectedStudent?.id === onExchangeSlot?.expand.from.id
                        ? 'toi'
                        : `${onExchangeSlot?.expand.from.firstName} ${onExchangeSlot?.expand.from.lastName}`}.
                    </span>

                    <span>Voici la garde en retour :</span>
                    <div class="mt-4">
                      <span class="capitalize">
                        {onExchangeSlot?.expand.slot &&
                          displayDateRange(
                            new Date(onExchangeSlot?.expand.slot.start),
                            new Date(onExchangeSlot?.expand.slot.end),
                          )}
                      </span>
                      <div class="flex items-center mb-2">
                        <MapMarker class="mr-2" size="1.5em" />
                        <span>{onExchangeSlot?.expand.slot.hospital}</span
                        >-<span>{onExchangeSlot?.expand.slot.sector}</span>
                      </div>
                    </div>
                  {/if}
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
                disabled={loading}
                on:click={handlePutOnMarket}
              >
                {#if loading}
                  <span class="loading loading-spinner"></span>
                {/if}
                Mettre sur le marché
              </button>
            {:else if !!connectedStudent && openedEvent.isOnMarket}
              <button
                class="btn btn-primary btn-sm m-1"
                disabled={!!onCallErrorValidation(
                  openedEvent,
                  connectedStudent,
                ) || loading}
                on:click={handleTakeFromMarket}
              >
                {#if loading}
                  <span class="loading loading-spinner"></span>
                {/if}
                Prendre
              </button>
            {:else if openedEvent.isOnMarket && ['assistant', 'god'].includes($currentUser?.role ?? '')}
              <button
                class="btn btn-primary btn-sm m-1"
                disabled={loading}
                on:click={handlePutOutOfMarket}
              >
                {#if loading}
                  <span class="loading loading-spinner"></span>
                {/if}
                Sortir du marché
              </button>
            {:else if openedEvent.isOnTransfer}
              <button
                class="btn btn-default btn-sm m-1"
                disabled={loading}
                on:click={handlePutOutOfTransfer}
              >
                {#if loading}
                  <span class="loading loading-spinner"></span>
                {/if}
                {!connectedStudent ||
                connectedStudent?.id === onTransferSlot?.expand?.from.id
                  ? 'Annuler le transfert'
                  : 'Refuser le transfert'}
              </button>
              {#if onTransferSlot?.expand && connectedStudent?.id === onTransferSlot.expand.to.id}
                <button
                  class="btn btn-primary btn-sm m-1"
                  disabled={loading}
                  on:click={handleTakeFromTransfer}
                >
                  {#if loading}
                    <span class="loading loading-spinner"></span>
                  {/if}
                  Accepter le transfert
                </button>
              {/if}
            {:else if openedEvent.isOnExchange}
              <button
                class="btn btn-default btn-sm m-1"
                disabled={loading}
                on:click={handlePutOutOfExchange}
              >
                {#if loading}
                  <span class="loading loading-spinner"></span>
                {/if}
                {!connectedStudent ||
                connectedStudent?.id === onExchangeSlot?.expand?.from.id
                  ? "Annuler l'échange"
                  : "Refuser l'échange"}
              </button>
              {#if onExchangeSlot?.expand && connectedStudent?.id === onExchangeSlot.expand.to.id}
                <button
                  class="btn btn-primary btn-sm m-1"
                  disabled={loading}
                  on:click={handleTakeFromExchange}
                >
                  {#if loading}
                    <span class="loading loading-spinner"></span>
                  {/if}
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
        <h3 class="font-bold text-lg">Choisir un étudiant</h3>
        <div class="py-4">
          <StudentSelector {selectedStudentError} />
        </div>
      </div>
    {:else if modalStep === 'exchange'}
      <div
        in:fly|global={{ x: 300, duration: 300 }}
        out:fly|global={{ x: -300, duration: 300 }}
      >
        <h3 class="font-bold text-lg">Choisir un étudiant et une garde</h3>
        <div class="py-4">
          <StudentSelector {selectedStudentError} />

          {#if selectedStudent}
            <OnCallSelector {selectedStudent} />
          {/if}
        </div>
      </div>
    {:else if modalStep === 'studentList' && sameDayStudents}
      <div
        in:fly|global={{ x: 300, duration: 300 }}
        out:fly|global={{ x: -300, duration: 300 }}
      >
        <h3 class="font-bold text-lg">Étudiants - {openedEvent.hospital}</h3>
        <h4 class="font-bold text-sm capitalize">{displayDateRange(openedEvent.start, openedEvent.end)}</h4>
        <div class="py-4 max-h-80 overflow-y-auto">
          {#each Object.keys(sameDayStudents) as sector}
            <h5 class="mt-4">{sector}</h5>
            <ul class="list-disc list-inside bg-base-200 rounded-box space-y-2 p-4">
              {#each sameDayStudents[sector] as student}
                <li>{student}</li>
              {/each}
            </ul>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Action de fermeture globale -->
    <div class="modal-action">
      {#if modalStep === 'default'}
        <div
          class="tooltip"
          data-tip="Voir la liste complète des étudiants présents dans l'hôpital en même temps"
        >
          <button
            class="btn btn-outline"
            disabled={loading}
            on:click={handleStudentListOpen}
          >
            {#if loading}
              <span class="loading loading-spinner"></span>
            {/if}
            Étudiants présents
          </button>
        </div>
        <button class="btn" on:click={handleEventModalClose}>Fermer</button>
      {:else if modalStep === 'transfer'}
        <button class="btn btn-outline" on:click={resetModal}>Retour</button>
        <button
          class="btn btn-secondary"
          disabled={!selectedStudent || !!selectedStudentError || loading}
          on:click={handlePutOnTransfer}
        >
          {#if loading}
            <span class="loading loading-spinner"></span>
          {/if}
          Valider
        </button>
      {:else if modalStep === 'exchange'}
        <button class="btn btn-outline" on:click={resetModal}>Retour</button>
        <button
          class="btn btn-secondary"
          disabled={!selectedStudent ||
            !!selectedStudentError ||
            !selectedSlot ||
            loading}
          on:click={handlePutOnExchange}
        >
          {#if loading}
            <span class="loading loading-spinner"></span>
          {/if}
          Valider
        </button>
      {:else}
        <button class="btn btn-outline" on:click={resetModal}>Retour</button>
      {/if}
    </div>
  </div>

  <div class="modal-backdrop">
    <button on:click={handleEventModalClose}>Fermer</button>
  </div>
</div>
