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
  import { displayDateRange, eventStateColor, holidays, onCallSlotRecordToCalendarEvent } from '$lib/utils'
  
  import type { ClientResponseError, RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  import type { CalendarEvent } from '$lib/interfaces/calendar'

  export let data: PageData

  let isAddSlotModalOpen = false;
  let isEventModalOpen = false;
  let openedEvent: CalendarEvent | undefined;
  let loading = true;
  let slots: RecordModel[] = [];
  let currentYearCount: number = 0;
  let past3YearsCount: number = 0;

  const getTotalYearCount = async (options: { expand: string, filter: string, sort: string }) => {
    const slots = (await pb.collection("onCallSlots").getFullList(options));

    let count = 0;
    for (const slot of slots) {
      const start = new Date(slot.start);
      const isWeekend = start.getDay() === 0 || start.getDay() === 6; // dimanche=0, samedi=6
      const isHoliday = holidays.some((h) => h.toDateString() === start.toDateString());
      const weight = (isWeekend || isHoliday) ? 2 : 1;
      count += weight;
    }

    return count;
  }

  const fetchAll = async () => {
    if (!data.currentStudent?.id) return;

    try {
      const options: { expand: string, filter: string, sort: string } = {
        expand: 'student',
        filter: `(student = "${data.currentStudent?.id}" || isOnTransfer = true || isOnExchange = true)`,
        sort: '-start',
      };

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

      slots = await pb.collection("onCallSlots").getFullList(options);

      const threeYearsAgo = new Date(period[0])
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 2)

      past3YearsCount = await getTotalYearCount({
          ...options,
          filter: `student = "${data.currentStudent?.id}" && (start > "${threeYearsAgo.toISOString()}" && end <= @now) && (manualSaved = false || validated = true)`})

      if (data.currentStudent.year !== 'MM3') {
        currentYearCount = await getTotalYearCount({
          ...options,
          filter: `student = "${data.currentStudent?.id}" && (start > "${period[0].toISOString()}" && end <= @now) && (manualSaved = false || validated = true)`})
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
        <div class="flex flex-col items-center m-4">
          <span class="mb-2">
            {#if currentYearCount > 1}
              Gardes réalisées sur vos 3 années
            {:else}
              Garde réalisée sur vos 3 années
            {/if}
          </span>
          <div class="radial-progress text-secondary" style="--value:{past3YearsCount * 100 / 25};"
          aria-valuenow="{past3YearsCount * 100 / 25}"
          class:text-success={past3YearsCount === 25}
          role="progressbar">{past3YearsCount}/25</div>
        </div>
      {:else}
        <div class="flex flex-col items-center m-4">
          <span class="mb-2">
            {#if currentYearCount > 1}
              Gardes réalisées sur l'année
            {:else}
              Garde réalisée sur l'année
            {/if}
          </span>
          <div class="radial-progress text-primary mx-2"
            style="--value:{currentYearCount * 100 / 4};" aria-valuenow="{currentYearCount * 100 / 4}"
            class:text-success={currentYearCount === 4}
            role="progressbar">{currentYearCount}/4</div>
        </div>
        <div class="flex flex-col items-center m-4">
          <span class="mb-2">
            {#if currentYearCount > 1}
              Gardes réalisées sur vos 3 années
            {:else}
              Garde réalisée sur vos 3 années
            {/if}
          </span>
          <div class="radial-progress text-secondary mx-2"
            style="--value:{past3YearsCount * 100 / 25};" aria-valuenow="{past3YearsCount * 100 / 25}"
            class:text-success={past3YearsCount === 25}
            role="progressbar">{past3YearsCount}/25</div>
        </div>
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
            class:bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.1)_0,rgba(0,0,0,0.1)_10px,transparent_10px,transparent_20px)]={new Date(slot.end) < new Date()}
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

            {#if slot.isOnTransfer}
              <span
                class={`px-3 py-1 text-xs text-white font-bold rounded-full self-start`}
                style="background-color: {eventStateColor(slot)};"
              >
                En transfert
              </span>
            {:else if slot.isOnExchange}
              <span
                class={`px-3 py-1 text-xs text-black font-bold rounded-full self-start`}
                style="background-color: {eventStateColor(slot)};"
              >
                En échange
              </span>
            {:else if slot.isOnMarket}
              <span
                class={`px-3 py-1 text-xs text-white font-bold rounded-full self-start`}
                style="background-color: {eventStateColor(slot)};"
              >
                Sur le marché
              </span>
            {/if}

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

<ModalAddSlot
  {isAddSlotModalOpen}
  connectedStudent={data.currentStudent}
  on:close={() => isAddSlotModalOpen = false}
/>
<ModalEvent
  {isEventModalOpen}
  {openedEvent}
  connectedStudent={data.currentStudent}
  on:close={() => isEventModalOpen = false}
/>

