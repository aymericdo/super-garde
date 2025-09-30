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
  import { displayDateRange, eventStateColor, onCallSlotRecordToCalendarEvent } from '$lib/utils'
  
  import type { ClientResponseError, RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  import type { CalendarEvent } from '$lib/interfaces/calendar'

  export let data: PageData

  let isEventModalOpen = false;
  let openedEvent: CalendarEvent | null = null;
  let loading = true;
  let slots: RecordModel[] = [];

  const fetchAll = async () => {
    if (!data.currentStudent?.id) return;

    try {
      const options: { expand: string, filter: string, sort: string } = {
        expand: 'student',
        filter: `student = "${data.currentStudent?.id}" || isOnTransfer = true || isOnExchange = true`,
        sort: 'start',
      };

      slots = await pb.collection("onCallSlots").getFullList(options);
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
      if (e.record.id === $currentUser.id) {
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
    <ul class="space-y-3">
      {#each slots as slot}
        <li>
          <button
            class="p-4 w-full cursor-pointer bg-white rounded-2xl shadow flex justify-between"
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
                <span>{slot.hospital}</span>
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
              <span class={`px-3 py-1 text-xs bg-[${eventStateColor(slot)}] text-black font-bold rounded-full self-start`}>
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

{#if isEventModalOpen && openedEvent}
  <ModalEvent {isEventModalOpen} {openedEvent} connectedStudent={data.currentStudent} />
{/if}

