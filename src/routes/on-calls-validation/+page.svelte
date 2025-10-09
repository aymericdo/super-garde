<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { currentUser, type UserRecord } from '$lib/stores/user';
  import ClockTimeFiveOutline from 'svelte-material-icons/ClockTimeFiveOutline.svelte'
  import MapMarker from 'svelte-material-icons/MapMarker.svelte'
  import Doctor from 'svelte-material-icons/Doctor.svelte'
  import { pb } from '$lib/pocketbase';
  import ModalEvent from '$lib/components/ModalEvent.svelte'
  import { displayDateRange, onCallSlotRecordToCalendarEvent } from '$lib/utils'
  
  import type { ClientResponseError, RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  import type { CalendarEvent } from '$lib/interfaces/calendar'

  export let data: PageData

  let isEventModalOpen = false;
  let openedEvent: CalendarEvent | undefined;
  let loading = true;
  let slots: RecordModel[] = [];

  const fetchAll = async () => {
    try {
      const options: { expand: string, filter: string, sort: string } = {
        expand: 'student',
        filter: `manualSaved = true && validated = false`,
        sort: '-created',
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

  $: currentUser.set(data.user as UserRecord);
</script>

<div class="flex justify-between mb-4">
  <h1 class="font-bold text-gray-900 text-lg">Garde à valider</h1>
</div>

{#if ['assistant', 'god'].includes($currentUser?.role ?? '')}
  {#if loading}
    <div class="flex justify-center px-6 py-4">
      <span class="loading loading-ball loading-lg text-accent"></span>
    </div>
  {:else if slots.length === 0}
    <p class="text-gray-500 text-center italic">Aucune garde en attente.</p>
  {:else}
    <ul class="space-y-3">
      {#each slots as slot}
        <li>
          <button
            class="relative p-4 w-full cursor-pointer bg-white rounded-2xl shadow flex justify-between"
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
                {:else}
                  <span>Pas d'étudiant·e</span>
                {/if}
              </div>
            </div>

            {#if slot.manualSaved}
              <div>
                <span
                  class={`px-3 py-1 text-xs text-white font-bold rounded-full self-start`}
                  style="background-color: #000;"
                >
                  Garde de périphérie
                </span>
                {#if !slot.validated}
                  <span
                    class={`px-3 py-1 text-xs text-black font-bold rounded-full self-start`}
                    style="background-color: #00bafe;"
                  >
                    En cours de validation
                  </span>
                {:else}
                  <span
                    class={`px-3 py-1 text-xs text-black font-bold rounded-full self-start`}
                    style="background-color: #00d390;"
                  >
                    Validée
                  </span>
                {/if}
              </div>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
{:else}
  Tu n'es pas admin.
{/if}

<ModalEvent
  {isEventModalOpen}
  {openedEvent}
  on:close={() => isEventModalOpen = false}
/>

