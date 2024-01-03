<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte'
  import Calendar from '@event-calendar/core';
  import TimeGrid from '@event-calendar/time-grid';
  import DayGrid from '@event-calendar/day-grid';
  import List from '@event-calendar/list';
  import ResourceTimeGrid from '@event-calendar/resource-time-grid';
  import Interaction from '@event-calendar/interaction';
  import ModalEvent from '$lib/components/ModalEvent.svelte'
  import ModalPeriodPicker from '$lib/components/ModalPeriodPicker.svelte'
  import { currentUser } from '$lib/stores/user';
  import { pb } from '$lib/pocketbase';
  import { BarLoader } from 'svelte-loading-spinners'
  import { onCallSlotRecordToCalendarEvent } from '$lib/utils'
  
  import type { CalendarEvent } from '$lib/interfaces/calendar'
  import type { ClientResponseError, RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  export let data: PageData
  
  let isEventModalOpen = false;
  let isPeriodPickerModalOpen = false;
  let openedEvent: { event: CalendarEvent, element: HTMLDivElement } | null = null;
  let loading = false;
  let isOnMarketPlaceOnly = false;

  const plugins = [TimeGrid, DayGrid, List, ResourceTimeGrid, Interaction];

  const fetch = async (): Promise<RecordModel[] | undefined> => {
    try {
      const options: { expand: string, filter?: string } = {
        expand: 'student',
      }

      if (isOnMarketPlaceOnly) {
        options.filter = 'isOnMarket = true';
      }

      return await pb.collection("onCallSlots").getFullList(options);
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const fetchOne = async (id: string): Promise<RecordModel | undefined> => {
    try {
      const options: { expand: string } = {
        expand: 'student',
      }

      return await pb.collection("onCallSlots").getOne(id, options)
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        if ((error as ClientResponseError).status === 404) {
          throw error;
        } else {
          console.error(error);
        }
      }
    }
  }

  const putEventOnMarket = async (id: string): Promise<RecordModel | undefined> => {
    try {
      return await pb.collection("onCallSlots").update(id, { isOnMarket: true });
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const putEventOutOfMarket = async (id: string): Promise<RecordModel | undefined> => {
    try {
      return await pb.collection("onCallSlots").update(id, { isOnMarket: false });
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const takeEventFromMarket = async (id: string): Promise<RecordModel | undefined> => {
    if (data.currentStudent?.id) {
      try {
        return await pb.collection("onCallSlots").update(id, { isOnMarket: false, student: data.currentStudent?.id });
      } catch (error) {
        if (!(error as ClientResponseError).isAbort) {
          console.error(error);
        }
      }
    }
  }

  const handleGenerate = async () => {
    isPeriodPickerModalOpen = true;
  }

  const handleDelete = async () => {
    loading = true;
    try {
      const data = await pb.send("/api/delete-all-on-call-slots", {});
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  }

  const handleEventClick = ({ el, event, jsEvent }: {
    el: HTMLDivElement,
    event: RecordModel,
    jsEvent: PointerEvent,
  }) => {
    el.classList.add('-selected');
    openedEvent = {
      event: options.events.find((ev: CalendarEvent) => ev.id === event.id)!,
      element: el,
    };
    isEventModalOpen = true;
  }

  const handleGenerateSubmit = async (start: Date, end: Date) => {
    loading = true;
    handlePeriodPickerClose();
    try {
      const data = await pb.send("/api/generate-events", {
        params: {
          startDate: start,
          endDate: end,
        }
      });
      console.log(data);
    } catch(error) {
      console.error(error);
    } finally {
      loading = false;
    }
  }

  const handlePeriodPickerClose = () => {
    isPeriodPickerModalOpen = false;
  }

  const handleEventModalClose = () => {
    openedEvent?.element.classList.remove('-selected');
    isEventModalOpen = false;
  }

  const handlePutOnMarket = async () => {
    if (openedEvent) {
      await putEventOnMarket(openedEvent.event.id);
      handleEventModalClose();
    } else {
      console.error('should have an opened event here');
    }
  }

  const handlePutOutOfMarket = async () => {
    if (openedEvent) {
      await putEventOutOfMarket(openedEvent.event.id);
      handleEventModalClose();
    } else {
      console.error('should have an opened event here');
    }
  }

  const handleTakeFromMarket = async () => {
    if (openedEvent) {
      await takeEventFromMarket(openedEvent.event.id);
      handleEventModalClose();
    } else {
      console.error('should have an opened event here');
    }
  }

  const handleIsOnMarketPlaceOnlyChanged = async () => {
    isOnMarketPlaceOnly = !isOnMarketPlaceOnly;
    const list = await fetch();

    if (list) {
      options = {
        ...options,
        events: list.map((event: RecordModel) => {
          return onCallSlotRecordToCalendarEvent(event);
        }),
      }
    }
  }

  let options: any = {
    view: 'dayGridMonth',
    slotDuration: '00:15',
    allDaySlot: false,
    firstDay: 1,
    selectable: false,
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth listDay listYear',
    },
    buttonText: {
      today: "Aujourd'hui",
      dayGridMonth: 'Mois',
      timeGridWeek: 'Semaine',
      listDay: 'Jour',
      listYear: 'Liste',
    },
    events: data.onCallSlotList
      .map((event) => onCallSlotRecordToCalendarEvent(event)),
    eventClick: handleEventClick,
  };

  const updateEvent = async (onCallSlotId: string) => {
    try {
      const newSlot = await fetchOne(onCallSlotId);
      if (newSlot) {
        if (options.events.some((event: CalendarEvent) => event.id === newSlot.id)) {
          options = {
            ...options,
            events: options.events.map((event: CalendarEvent) => {
              if (event.id === newSlot.id) {
                return onCallSlotRecordToCalendarEvent(newSlot);
              } else {
                return event;
              }
            }),
          }

          if (openedEvent?.event.id === onCallSlotId) {
            openedEvent.event = { ...onCallSlotRecordToCalendarEvent(newSlot) };
          }
        } else {
          appendEvent(newSlot);
        }
      }
    } catch (error) {
      if ((error as ClientResponseError).status === 404) {
        deleteEvent(onCallSlotId);
      }
    }
  }

  const deleteEvent = async (onCallSlotId: string) => {
    options = {
      ...options,
      events: options.events.filter((event: CalendarEvent) => event.id !== onCallSlotId)
    }

    if (openedEvent?.event.id === onCallSlotId) {
      handleEventModalClose();
    }
  }

  const appendEvent = async (newSlot: RecordModel) => {
    options = {
      ...options,
      events: [
        ...options.events,
        onCallSlotRecordToCalendarEvent(newSlot),
      ],
    };
  }

  onMount(async () => {
    pb.realtime.subscribe('onCallSlots', async (e) => {
      switch (e.action) {
        case 'update': {
          await updateEvent(e.record.id);
          break;
        }
        case 'delete': {
          deleteEvent(e.record.id);
          break;
        }
        case 'create': {
          const newSlot = await fetchOne(e.record.id);

          if (newSlot) {
            appendEvent(newSlot);
          }
          break;
        }
      }
    });

    pb.realtime.subscribe('onCallSlotsToHide', async (e) => {
      if (e.action === 'create') {
        await updateEvent(e.record.onCallSlotId);
      }
    });

    pb.realtime.subscribe('users', (e) => {
      if (e.record.id === $currentUser.id) {
        currentUser.set({
          ...e.record,
          isAdmin: $currentUser?.isAdmin,
        });
      }
    });
  });

  onDestroy(() => {
    pb.realtime.unsubscribe('onCallSlots');
    pb.realtime.unsubscribe('onCallSlotsToHide');
    pb.realtime.unsubscribe('users');
  })

  setContext('isEventModalOpen', { handleEventModalClose, handlePutOnMarket, handlePutOutOfMarket, handleTakeFromMarket });
  setContext('isPeriodPickerModalOpen', { handlePeriodPickerClose, handleGenerateSubmit });
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center font-bold text-gray-900 text-lg">
    Calendrier
  </h1>
</div>

<div class="flex justify-between items-center flex-wrap mb-1">
  <div class="flex items-center my-2 justify-center w-full md:w-auto">
    <label class="relative inline-flex cursor-pointer">
      <input type="checkbox" class="sr-only peer" checked={isOnMarketPlaceOnly} on:change={handleIsOnMarketPlaceOnlyChanged}>
      <div class="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
      <span class="flex items-center ms-3 text-sm font-medium text-gray-900 dark:text-gray-500">Afficher uniquement les gardes dispo</span>
    </label>
  </div>
  <div class="flex flex-1 flex-wrap items-center justify-end">
    {#if $currentUser?.isAdmin || ['assistant', 'god'].includes($currentUser?.role)}
      <button disabled={!options.events.length} on:click={handleDelete} class="btn btn-warning text-m btn-sm my-2 me-1 flex-1 md:flex-initial md:btn-md">Supprimer</button>
      <button disabled={!!options.events.length} on:click={handleGenerate} class="btn btn-neutral text-m btn-sm my-2 flex-1 md:flex-initial md:btn-md">Générer</button>
    {/if}
  </div>
</div>


{#if loading}
  <div class="flex justify-center px-6 py-4">
    <BarLoader size="60" color="#FF3E00" unit="px" duration="1s" />
  </div>
{/if}
<div class="shadow-md sm:rounded-lg event-calendar">
  <div class="w-full h-full">
    <Calendar {plugins} {options} />
  </div>
</div>

<ModalPeriodPicker {isPeriodPickerModalOpen} />
<ModalEvent {isEventModalOpen} {openedEvent} student={data.currentStudent} />

<style>
  :global(.event-calendar .ec .ec-event) {
    cursor: pointer;
  }

  :global(.event-calendar .ec .ec-event) {
    border: dotted transparent 2px;
  }

  :global(.event-calendar .ec .ec-event.-selected) {
    border: dotted black 2px;
  }

  :global(.ec-icon::before, .ec-icon::after) {
    box-sizing: initial;
  }
</style>