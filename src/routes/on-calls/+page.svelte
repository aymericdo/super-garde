<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte'
  import { currentUser } from '$lib/stores/user';
  import ClockTimeFiveOutline from 'svelte-material-icons/ClockTimeFiveOutline.svelte'
  import MapMarker from 'svelte-material-icons/MapMarker.svelte'
  import Doctor from 'svelte-material-icons/Doctor.svelte'
  import ArrowBottomRightThinCircleOutline from 'svelte-material-icons/ArrowBottomRightThinCircleOutline.svelte'
  import ArrowTopRightThinCircleOutline from 'svelte-material-icons/ArrowTopRightThinCircleOutline.svelte'
  import Autorenew from 'svelte-material-icons/Autorenew.svelte'
  import { pb } from '$lib/pocketbase';
  import ModalEvent from '$lib/components/ModalEvent.svelte'
  import ModalAddSlot from '$lib/components/ModalAddSlot.svelte'
  import { displayDateRange, eventStateColor, onCallSlotRecordToCalendarEvent } from '$lib/utils'
  
  import type { ClientResponseError, RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  import type { CalendarEvent } from '$lib/interfaces/calendar'

  export let data: PageData

  let isAddSlotModalOpen = false;
  let isEventModalOpen = false;
  let openedEvent: CalendarEvent | undefined;
  let loading = true;
  let slots: RecordModel[] = [];
  let currentYearSlots: RecordModel[] = [];

  const fetchAll = async () => {
    if (!data.currentStudent?.id) return;

    try {
      const options: { expand: string, filter: string, sort: string } = {
        expand: 'student',
        filter: `(student = "${data.currentStudent?.id}" || isOnTransfer = true || isOnExchange = true)`,
        sort: '-start',
      };

      slots = await pb.collection("onCallSlots").getFullList(options);

      if (data.currentStudent.year !== 'MM3') {
        const currentDate = new Date()
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const period = (month >= 10) ?
          // Octobre à décembre
          [new Date(year, 9, 1), new Date(year + 1, 8, 30)]
        : (month <= 4) ?
          // Janvier à avril
          [new Date(year - 1, 9, 1), new Date(year, 8, 30)]
        :
          // Mai à septembre
          [new Date(year - 1, 9, 1), new Date(year, 8, 30)];

        const currentYearFilter = `${options.filter} && (start > "${period[0].toISOString()}" && end <= "${period[1].toISOString()}")`
        currentYearSlots = await pb.collection("onCallSlots").getFullList({
          ...options,
          filter: currentYearFilter,
        });
      }
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await fetchAll();

    pb.realtime.subscribe('onCallSlots', async (e) => {
      if (['create', 'update', 'delete'].includes(e.action)) {
        await fetchAll();
      }
    });

    pb.realtime.subscribe('users', (e) => {
      if (e.record.id === $currentUser?.id) {
        currentUser.set({
          ...e.record,
        });
      }
    });
  });

  onDestroy(() => {
    pb.realtime.unsubscribe('onCallSlots');
    pb.realtime.unsubscribe('users');
  })

  setContext('isEventModalOpen', {
    handleEventModalClose: () => {
      isEventModalOpen = false;
    },
  });

  setContext('isAddSlotModalOpen', {
    handleModalClose: () => {
      isAddSlotModalOpen = false;
    },
  });
</script>

<div class="flex justify-between mb-4">
  <h1 class="font-bold text-gray-900 text-lg">Vos gardes</h1>
</div>

{#if data.currentStudent}
  {#if loading}
    <div class="flex justify-center px-6 py-4">
      <span class="loading loading-ball loading-lg text-accent"></span>
    </div>
  {:else if slots.length === 0}
    <p class="text-gray-500 text-center italic">Aucune garde prévue.</p>
  {:else}
    <div class="flex justify-center mb-4">
      {#if data.currentStudent.year === 'MM3'}
        <div class="radial-progress text-secondary" style="--value:{slots.length * 100 / 25};"
        aria-valuenow="{slots.length * 100 / 25}"
        class:text-success={currentYearSlots.length === 25}
        role="progressbar">{slots.length}/25</div>
      {:else}
        <div class="radial-progress text-primary mx-2"
          style="--value:{currentYearSlots.length * 100 / 4};" aria-valuenow="{currentYearSlots.length * 100 / 4}"
          class:text-success={currentYearSlots.length === 4}
          role="progressbar">{currentYearSlots.length}/4</div>
        <div class="radial-progress text-secondary mx-2"
          style="--value:{slots.length * 100 / 25};" aria-valuenow="{slots.length * 100 / 25}"
          class:text-success={currentYearSlots.length === 25}
          role="progressbar">{slots.length}/25</div>
      {/if}
    </div>
    <ul class="space-y-3">
      {#each slots as slot}
        <li>
          <button
            class="relative p-4 w-full cursor-pointer bg-white rounded-2xl shadow flex justify-between"
            class:border-2={slot.student !== data.currentStudent.id}
            class:border-dashed={slot.student !== data.currentStudent.id}
            class:border-gray-400={slot.student !== data.currentStudent.id}
            class:opacity-50={slot.student !== data.currentStudent.id}
            class:bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.2)_0,rgba(0,0,0,0.2)_10px,transparent_10px,transparent_20px)]={new Date(slot.end) < new Date()}
            on:click={() => {
              openedEvent = { ...onCallSlotRecordToCalendarEvent(slot) }
              isEventModalOpen = true;
            }}
          >
            <div class="flex flex-col items-start">
              <h3 class="font-bold text-lg">{slot.sector}</h3>
              <div class="flex items-center my-2">
                <ClockTimeFiveOutline class="mr-2" size="1.5em" />
                <span class="capitalize">
                  {slot &&
                    displayDateRange(
                      new Date(slot.start),
                      new Date(slot.end),
                    )}
                </span>
              </div>
              <div class="flex items-center mb-2">
                <MapMarker class="mr-2" size="1.5em" />
                {#if slot.hospital === 'Autre'}
                  <span>{slot.otherHospital}</span>
                {:else}
                  <span>{slot.hospital}</span>
                {/if}
              </div>
              <div class="flex items-center mb-2">
                <Doctor class="mr-2" size="1.5em" />
                {#if !!slot.student}
                  <span>{slot.expand?.student.firstName} {slot.expand?.student.lastName}</span>
                  {#if slot.isOnTransfer && slot.student !== data.currentStudent.id}
                    <ArrowBottomRightThinCircleOutline class="ml-2" size="1.5em" />
                  {:else if slot.isOnTransfer && slot.student === data.currentStudent.id}
                    <ArrowTopRightThinCircleOutline class="ml-2" size="1.5em" />
                  {:else if slot.isOnExchange && slot.student !== data.currentStudent.id}
                    <Autorenew class="ml-2" size="1.5em" />
                    <ArrowBottomRightThinCircleOutline class="ml-2" size="1.5em" />
                  {:else if slot.isOnExchange && slot.student === data.currentStudent.id}
                    <Autorenew class="ml-2" size="1.5em" />
                    <ArrowTopRightThinCircleOutline class="ml-2" size="1.5em" />
                  {/if}
                {:else}
                  <span>Pas d'étudiant·e</span>
                {/if}
              </div>
            </div>

            {#if slot.isOnMarket}
              <span class={`px-3 py-1 text-xs bg-${eventStateColor(slot)} text-black font-bold rounded-full self-start`}>
                Sur le marché
              </span>
            {:else if slot.isOnTransfer}
              <span class={`px-3 py-1 text-xs bg-[${eventStateColor(slot)}] text-white font-bold rounded-full self-start`}>
                En transfert
              </span>
            {:else if slot.isOnExchange}
              <span class={`px-3 py-1 text-xs bg-[${eventStateColor(slot)}] text-black font-bold rounded-full self-start`}>
                En échange
              </span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
{:else}
  Tu n'as pas de garde car tu n'es pas étudiant.
{/if}

<button
  class="absolute bottom-6 right-6 btn btn-lg btn-circle btn-secondary"
  on:click={() => {
    isAddSlotModalOpen = true;
  }}
>
  <svg
    aria-label="New"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    class="size-6"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
</button>

<ModalAddSlot {isAddSlotModalOpen} connectedStudent={data.currentStudent} />
<ModalEvent {isEventModalOpen} {openedEvent} connectedStudent={data.currentStudent} />

