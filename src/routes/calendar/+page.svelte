<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte'
  import Calendar from '@event-calendar/core';
  import TimeGrid from '@event-calendar/time-grid';
  import DayGrid from '@event-calendar/day-grid';
  import List from '@event-calendar/list';
  import ResourceTimeGrid from '@event-calendar/resource-time-grid';
  import Interaction from '@event-calendar/interaction';
  import ModalEvent from '$lib/components/ModalEvent.svelte'
  import ModalConfirmation from '$lib/components/ModalConfirmation.svelte'
  import ModalPeriodPicker from '$lib/components/ModalPeriodPicker.svelte'
  import { currentUser } from '$lib/stores/user';
  import { pb } from '$lib/pocketbase';
  import { debounce, onCallSlotRecordToCalendarEvent } from '$lib/utils'
  import AlertSuccess from "$lib/components/AlertSuccess.svelte"
  
  import type { CalendarElement, CalendarEvent, CalendarOptions, ViewCalendar } from '$lib/interfaces/calendar'
  import type { ClientResponseError, RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  export let data: PageData
  
  let isEventModalOpen = false;
  let isPeriodPickerModalOpen = false;
  let isConfirmationModalOpen = false;
  let openedEvent: { event: CalendarEvent, element: HTMLDivElement } | null = null;
  let loading = false;
  let isOnMarketPlaceOnly = false;

  let isAlertGenerateSuccessVisible = false;
  let isAlertDeletionSuccessVisible = false;

  let tempOptionsEvents: CalendarEvent[] = [];

  const plugins = [TimeGrid, DayGrid, List, ResourceTimeGrid, Interaction];

  const fetchAll = async (view?: ViewCalendar): Promise<RecordModel[] | undefined> => {
    try {
      if (!(view || myCalendar)) return;

      const options: { expand: string, filter: string } = {
        expand: 'student',
        filter: `(start >= "${(view || myCalendar?.getView())?.activeStart.toISOString()}"` +
          `&& end < "${(view || myCalendar?.getView())?.activeEnd.toISOString()}")`,
      }

      if (isOnMarketPlaceOnly) {
        options.filter += ' && isOnMarket = true';
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

  const handleDelete = async () => {
    loading = true;
    try {
      const data = await pb.send("/api/delete-all-on-call-slots", {});
      isAlertGenerateSuccessVisible = false;
      isAlertDeletionSuccessVisible = true;

      setTimeout(() => {
        isAlertDeletionSuccessVisible = false;
      }, 3*1000);
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

  const handleDatesSet = async (info: {
    start: Date,
    end: Date,
    startStr: string,
    endStr: string,
    view: ViewCalendar,
  }) => {
    loading = true;
    const list = await fetchAll(info.view);

    if (list) {
      tempOptionsEvents = list.map((event: RecordModel) => {
        return onCallSlotRecordToCalendarEvent(event);
      });

      setOptionsEvents();
    }
    loading = false;
  }

  const handleGenerateSubmit = async (start: Date, end: Date) => {
    loading = true;
    handlePeriodPickerClose();
    try {
      await pb.send("/api/create-all-events", {
        params: {
          startDate: start,
          endDate: end,
        }
      });

      isAlertGenerateSuccessVisible = true;
      isAlertDeletionSuccessVisible = false;

      setTimeout(() => {
        isAlertGenerateSuccessVisible = false;
      }, 3*1000);
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
    } else {
      console.error('should have an opened event here');
    }
  }

  const handlePutOnTransfer = async () => {
    console.log('OnTransfer', openedEvent)
  }

  const handlePutOnExchange = async () => {
    console.log('OnExchange', openedEvent)
  }

  const handlePutOutOfMarket = async () => {
    if (openedEvent) {
      await putEventOutOfMarket(openedEvent.event.id);
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
    loading = true;
    isOnMarketPlaceOnly = !isOnMarketPlaceOnly;
    const list = await fetchAll();

    if (list) {
      tempOptionsEvents = list.map((event: RecordModel) => {
        return onCallSlotRecordToCalendarEvent(event);
      });

      setOptionsEvents();
    }

    loading = false;
  }

  loading = true;
  let myCalendar: CalendarElement | null = null;
  let options: CalendarOptions = {
    view: 'dayGridMonth',
    slotDuration: '00:15',
    allDaySlot: false,
    firstDay: 1,
    selectable: false,
    dayMaxEvents: true,
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
    events: [],
    eventClick: handleEventClick,
    datesSet: handleDatesSet,
  };

  const updateEvent = async (onCallSlotId: string) => {
    try {
      const newSlot = await fetchOne(onCallSlotId);
      if (newSlot) {
        if (tempOptionsEvents.some((event: CalendarEvent) => event.id === newSlot.id)) {
          tempOptionsEvents = tempOptionsEvents.map((event: CalendarEvent) => {
            if (event.id === newSlot.id) {
              return onCallSlotRecordToCalendarEvent(newSlot);
            } else {
              return event;
            }
          });

          setOptionsEventsWithDebounce();

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
    tempOptionsEvents = tempOptionsEvents.filter((event: CalendarEvent) => event.id !== onCallSlotId);

    setOptionsEventsWithDebounce();

    if (openedEvent?.event.id === onCallSlotId) {
      handleEventModalClose();
    }
  }

  const appendEvent = async (newSlot: RecordModel) => {
    tempOptionsEvents = [
      ...tempOptionsEvents,
      onCallSlotRecordToCalendarEvent(newSlot),
    ];

    setOptionsEventsWithDebounce();
  }

  const setOptionsEvents = (): void => {
    options = {
      ...options,
      events: [...tempOptionsEvents],
    };
  }

  const setOptionsEventsWithDebounce = debounce(setOptionsEvents, 200);

  onMount(async () => {
    pb.realtime.subscribe('onCallSlots', async (e) => {
      if (!myCalendar ||
        !(myCalendar.getView().activeStart <= new Date(e.record.start) && myCalendar.getView().activeEnd > new Date(e.record.end))) {
        return;
      }

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
        });
      }
    });
  });

  onDestroy(() => {
    pb.realtime.unsubscribe('onCallSlots');
    pb.realtime.unsubscribe('onCallSlotsToHide');
    pb.realtime.unsubscribe('users');
  })

  setContext('isEventModalOpen', {
    handleEventModalClose,
    handlePutOnMarket,
    handlePutOnTransfer,
    handlePutOnExchange,
    handlePutOutOfMarket,
    handleTakeFromMarket,
  });
  setContext('isPeriodPickerModalOpen', {
    handlePeriodPickerClose,
    handleGenerateSubmit,
  });

  setContext('isConfirmationModalOpen', {
    handleModalClose: () => isConfirmationModalOpen = false,
    handleConfirm: () => handleDelete(),
  });
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
    {#if ['assistant', 'god'].includes($currentUser?.role)}
      <button disabled={!options.events.length} on:click={() => isConfirmationModalOpen = true} class="btn btn-warning text-m btn-sm my-2 me-1 flex-1 md:flex-initial md:btn-md">Supprimer</button>
      <button disabled={!!options.events.length} on:click={() => isPeriodPickerModalOpen = true} class="btn btn-neutral text-m btn-sm my-2 flex-1 md:flex-initial md:btn-md">Générer</button>
    {/if}
  </div>
</div>


{#if loading}
  <div class="flex justify-center px-6 py-4">
    <span class="loading loading-ball loading-lg text-accent"></span>
  </div>
{/if}

<div class="sm:rounded-lg event-calendar bg-white p-4">
  <div class="w-full h-full">
    <Calendar {plugins} {options} bind:this={myCalendar} />
  </div>
</div>

{#if isAlertGenerateSuccessVisible}
  <AlertSuccess message={'Les gardes ont bien été générées 😊'} />
  {:else if isAlertDeletionSuccessVisible}
  <AlertSuccess message={'Les gardes ont bien été supprimées 😊'} />
{/if}

<ModalPeriodPicker {isPeriodPickerModalOpen} />
<ModalEvent {isEventModalOpen} {openedEvent} isConnectedStudent={!!data.currentStudent} />
<ModalConfirmation
  {isConfirmationModalOpen}
  title={'Confirmer la suppression'}
  description={'Voulez-vous vraiment supprimer ces événements ?'}
/>

<style>
  :global(.event-calendar .ec .ec-event) {
    cursor: pointer;
  }
  
  :global(.event-calendar .ec .ec-toolbar) {
    flex-wrap: wrap;
  }

  :global(.event-calendar .ec .ec-toolbar div) {
    margin-bottom: 0.5em;
  }

  @media (max-width: 992px) {
    :global(.event-calendar .ec .ec-toolbar) {
      flex-direction: column;
    }
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

  :global(.ec-day-grid .ec-uniform .ec-content) {
    min-height: 25rem;
  }

  :global(.ec-day-grid .ec-uniform .ec-day) {
    min-height: 5rem;
    max-height: 8rem;
  }
</style>