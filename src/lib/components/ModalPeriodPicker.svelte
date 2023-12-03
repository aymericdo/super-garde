<script lang="ts">
  import { getContext } from 'svelte'
  import Calendar from '@event-calendar/core';
  import DayGrid from '@event-calendar/day-grid';
  import Interaction from '@event-calendar/interaction';

  const plugins = [DayGrid, Interaction];

  const displayDateRange = (start: Date | null, end: Date | null) => {
    if (!start && !end) {
      return 'Aucune plage de date sélectionnée';
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    return `${start && start.toLocaleDateString("fr", options)} - ${end && end.toLocaleDateString("fr", options)}`;
  }

  const { handlePeriodPickerClose, handleSubmit } = getContext('isPeriodPickerModalOpen') as {
    handlePeriodPickerClose: () => void,
    handleSubmit: (start: Date, end: Date) => void,
  };

  const handleDateClick = ({ date }: { date: Date }) => {
    if (isSelectedStart) {
      start = date;
      isSelectedStart = false;
    } else {
      date.setMinutes(1440 - 1);
      if (start && start > date) {
        start = date;
      }
      end = date;
    }

    if (start && end) {
      options = {
        ...options,
        events: [{
          id: 'id',
          start: start,
          end: end,
          title: '',
          editable: false,
          startEditable: false,
          durationEditable: false,
          resourceIds: [],
        }],
      }
    }
  }

  let isSelectedStart = true;
  let start: Date | null = null;
  let end: Date | null = null;

  let options: any = {
    view: 'dayGridMonth',
    allDaySlot: true,
    firstDay: 1,
    headerToolbar: {
      start: 'prev,next today',
      center: '',
      end: 'title',
    },
    buttonText: {
      today: "Aujourd'hui",
      dayGridMonth: 'Mois',
      timeGridWeek: 'Semaine',
      listDay: 'Jour',
      listWeek: 'Liste',
    },
    events: [],
    eventBackgroundColor: 'red',
    eventContent: ' ',
    eventClassNames: 'yoyo',
    dateClick: handleDateClick,
  };

  export let isPeriodPickerModalOpen: boolean = false;
</script>

<div class="modal period-picker-calendar" class:modal-open={isPeriodPickerModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Votre période</h3>
    <div class="py-4">
      <Calendar {plugins} {options} />
      <div class="py-4">
        {displayDateRange(start, end)}
      </div>
    </div>
    <div class="modal-action">
      <button class="btn" on:click={handlePeriodPickerClose}>Close</button>
      <button class="btn btn-primary" disabled={!start || !end} on:click={() => start && end && handleSubmit(start, end)}>Générer</button>
    </div>
  </div>
  <div class="modal-backdrop">
    <button on:click={handlePeriodPickerClose}>close</button>
  </div>
</div>

<style>
  :global(.modal.period-picker-calendar .ec.ec-day-grid) {
	  height: 300px;
  }

  :global(.modal.period-picker-calendar .ec-day-grid .ec-body .ec-day) {
    cursor: pointer;
    min-height: inherit;
  }

  :global(.modal.period-picker-calendar .ec-day-grid .ec-body .ec-events) {
    position: relative;
  }

  :global(.modal.period-picker-calendar .ec-day-grid .ec-body .ec-event.yoyo) {
    position: absolute;
    top: 0;
  }
</style>