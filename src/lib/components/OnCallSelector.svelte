<script lang="ts">
  import { pb } from "$lib/pocketbase"
  import { ClientResponseError } from "pocketbase"
  import { getContext, onDestroy, setContext } from "svelte"
  import { currentUser } from '$lib/stores/user';
  import MapMarker from 'svelte-material-icons/MapMarker.svelte'
  import ModalConfirmation from '$lib/components/ModalConfirmation.svelte'
  import { displayDateRange } from "$lib/utils"
  import type { RecordModel } from 'pocketbase'

  let slots: RecordModel[] = [];
  let selected: RecordModel | null = null
  let isConfirmationModalOpen = false
  let isOpen = false

  const checkConsent = async (): Promise<void> => {
    try {
      const data = await pb.collection("stalkOnCallsConsent").getFirstListItem(`stalker = "${$currentUser!.id}" && stalked = "${selectedStudent.id}" && consent = true && expiration > @now`)
      if (data) {
        fetch()
      } else {
        isConfirmationModalOpen = true;
      }
    } catch (error) {
      if ((error as ClientResponseError).status === 404) {
        isConfirmationModalOpen = true;
      } else if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const fetch = async (consent = false): Promise<void> => {
    try {
      if (consent) {
        await pb.collection("stalkOnCallsConsent").create({
          stalker: $currentUser!.id,
          stalked: selectedStudent.id, 
          consent: true,
        })
      }
      const data = await pb.collection("onCallSlots").getFullList({ filter: `student = "${selectedStudent.id}" && start >= @now` })
      setSlots(data);
      isOpen = true
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const setSlots = async (newData: RecordModel[]) => {
    slots = [...newData];
    selected = null;
  };

  const {
    handleSelectSlot,
  } = getContext('slotSelector') as {
    handleSelectSlot: (slot: RecordModel) => void
  }

  setContext('isConfirmationModalOpen', {
    handleModalClose: () => isConfirmationModalOpen = false,
    handleConfirm: () => fetch(true),
  });

  onDestroy(() => {
    selected = null;
    isOpen = false
  })

  export let selectedStudent: RecordModel
  export let selectedSlotError: string | null = null;

  $: selectedStudent && checkConsent();
</script>

<ModalConfirmation
  {isConfirmationModalOpen}
  title={'Vous souhaitez voir les gardes de ' + selectedStudent.firstName + ' ' + selectedStudent.lastName}
  description={'Acceptez-vous que cette action soit enregistrée dans les logs pour des raisons de suivi ?'}
  action={'Accepter'}
/>

<div class="w-full p-4">
  {#if selected}
  <div class="border-gray-950 outline-solid rounded-sm p-2">
    <span class="pb-2 text-xs opacity-60 tracking-wide">
      Garde selectionnée
    </span>
    <div>
      <span class="capitalize">
        {selected &&
          displayDateRange(
            new Date(selected.start),
            new Date(selected.end),
          )}
      </span>
      <div class="flex items-center mb-2">
        <MapMarker class="mr-2" size="1.5em" />
        <span>{selected.hospital}</span>-<span>{selected.sector}</span>
      </div>
    </div>
    </div>
  {/if}

  {#if isOpen}
    {#if slots.length}
      <ul class="list bg-base-100 rounded-box max-h-80 overflow-y-auto">
        <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">
          Choisis une garde
        </li>
        {#each slots as slot}
          <li class="list-row w-full flex">
            <button
              class="flex-1 text-left cursor-pointer"
              class:selected={selected?.id === slot.id}
              disabled={selected?.id === slot.id}
              on:click={() => {
                selected = slot
                handleSelectSlot(slot)
              }}
            >
              <div>
                <span class="capitalize">
                  {slot &&
                    displayDateRange(
                      new Date(slot.start),
                      new Date(slot.end),
                    )}
                </span>
                <div class="flex items-center mb-2">
                  <MapMarker class="mr-2" size="1.5em" />
                  <span>{slot.hospital}</span>-<span>{slot.sector}</span>
                </div>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      Aucune garde
    {/if}
  {/if}

  {#if selectedSlotError}
  <div role="alert" class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>{selectedSlotError}</span>
  </div>
  {/if}
</div>

<style>
button {
  transition: 0.3s;
}

button.selected,
button:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>