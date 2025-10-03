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
  import ModalDownload from '$lib/components/ModalDownload.svelte'
  import ModalPeriodPicker from '$lib/components/ModalPeriodPicker.svelte'
  import { currentUser } from '$lib/stores/user';
  import { pb } from '$lib/pocketbase';
  import { debounce, onCallSlotRecordToCalendarEvent } from '$lib/utils'
  import AlertSuccess from "$lib/components/AlertSuccess.svelte"
  
  import type { CalendarElement, CalendarEvent, CalendarOptions, ViewCalendar } from '$lib/interfaces/calendar'
  import type { ClientResponseError, RecordModel } from 'pocketbase'
  import type { PageData } from './$types'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  export let data: PageData
  
  let isEventModalOpen = false;
  let isPeriodPickerModalOpen = false;
  let isConfirmationModalOpen = false;
  let isDownloadModalOpen = false;
  let openedEvent: { event: CalendarEvent, element: HTMLDivElement } | null = null;
  let loading = true;
  let isOnMarketPlaceOnly = false;

  let alertMessage: string | null = null;
  let alertMessageTimeout: NodeJS.Timeout | null = null;

  let tempOptionsEvents: CalendarEvent[] = [];

  const plugins = [TimeGrid, DayGrid, List, ResourceTimeGrid, Interaction];

  const fetchAll = async (start: string, end: string): Promise<RecordModel[] | undefined> => {
    try {
      const startISO = new Date(start).toISOString()
      const endISO = new Date(end).toISOString()
      const options: { expand: string, filter: string } = {
        expand: 'student',
        filter: `(start < "${endISO}" && end > "${startISO}")`,
      }

      if (data.currentStudent) {
        options.filter += `&& (student = "${data.currentStudent?.id}" || isOnTransfer = true || isOnExchange = true)`
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

  const handleDelete = async () => {
    loading = true;
    try {
      await pb.send("/api/delete-all-on-call-slots", {});
      setAlertMessage('Les gardes ont bien été supprimées 😊')
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
    if (el.parentElement?.parentElement?.className === 'ec-popup') {
      el.parentElement.parentElement.style.display = 'none';
    }
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
    page.url.searchParams.set('view', info.view.type)
    page.url.searchParams.set('date', new Date(info.view.currentStart).toDateString())
    goto(`?${page.url.searchParams.toString()}`, { replaceState: true, noScroll: true });

    loading = true;

    const list = await fetchAll(info.startStr, info.endStr);

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
    isPeriodPickerModalOpen = false;
    try {
      start.setDate(start.getDate() + 1)
      start.setUTCHours(0)
      start.setUTCMinutes(0)
      end.setUTCHours(23)
      end.setUTCMinutes(59)
      await pb.send("/api/create-all-events", {
        params: {
          startDate: start,
          endDate: end,
        }
      });

      setAlertMessage('Les gardes ont bien été générées 😊')
    } catch(error) {
      console.error(error);
    } finally {
      loading = false;
    }
  }

  const setAlertMessage = (message: string) => {
    if (alertMessageTimeout) clearTimeout(alertMessageTimeout)

    alertMessage = message;

    alertMessageTimeout = setTimeout(() => {
      alertMessage = null;
    }, 3 * 1000);
  }

  const handleEventModalClose = () => {
    openedEvent?.element.classList.remove('-selected');
    isEventModalOpen = false;
  }

  const handleIsOnMarketPlaceOnlyChanged = async () => {
    if (!myCalendar) return
 
    loading = true;
    isOnMarketPlaceOnly = !isOnMarketPlaceOnly;

    const start = (myCalendar.getView())?.activeStart.toISOString()
    const end = (myCalendar.getView())?.activeEnd.toISOString()

    const list = await fetchAll(start, end);

    if (list) {
      tempOptionsEvents = list.map((event: RecordModel) => {
        return onCallSlotRecordToCalendarEvent(event);
      });

      setOptionsEvents();
    }

    loading = false;
  }

  const date = page.url.searchParams.get('date')
  const viewType = page.url.searchParams.get('view') as 'dayGridMonth' | 'timeGridWeek' | 'listDay' | 'listWeek'

  let myCalendar: CalendarElement | null = null;
  let options: CalendarOptions = {
    view: viewType ? viewType : 'dayGridMonth',
    slotDuration: '00:15',
    allDaySlot: false,
    firstDay: 1,
    selectable: false,
    dayMaxEvents: true,
    date: date ? new Date(date) : new Date(),
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
    noEventsContent: 'Aucune garde',
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

    pb.realtime.subscribe('xxxonCallSlotsToHide', async (e) => {
      if (e.action === 'create') {
        await updateEvent(e.record.onCallSlotId);
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
    pb.realtime.unsubscribe('xxxonCallSlotsToHide');
    pb.realtime.unsubscribe('users');
  })

  setContext('isEventModalOpen', {
    handleEventModalClose,
  });

  setContext('isPeriodPickerModalOpen', {
    handlePeriodPickerClose: () => {
      isPeriodPickerModalOpen = false;
    },
    handleGenerateSubmit,
  });

  setContext('isConfirmationModalOpen', {
    handleModalClose: () => isConfirmationModalOpen = false,
    handleConfirm: () => handleDelete(),
  });
  
  setContext('isDownloadModalOpen', {
    handleModalClose: () => isDownloadModalOpen = false,
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
    {#if ['assistant', 'god'].includes($currentUser?.role ?? '')}
      <button disabled={!options.events.length} on:click={() => isDownloadModalOpen = true} class="btn btn-outline text-m btn-sm my-2 me-1 flex-1 md:flex-initial md:btn-md">Télécharger CSV</button>
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


{#if alertMessage}
  <AlertSuccess message={alertMessage} />
{/if}

<ModalPeriodPicker {isPeriodPickerModalOpen} />
<ModalEvent {isEventModalOpen} openedEvent={openedEvent?.event} connectedStudent={data.currentStudent} />

<ModalConfirmation
  {isConfirmationModalOpen}
  title={'Confirmer la suppression'}
  description={'Voulez-vous vraiment supprimer ces événements ?'}
  action={'Supprimer'}
/>

{#if isDownloadModalOpen}
  <ModalDownload
    {isDownloadModalOpen}
  />
{/if}

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