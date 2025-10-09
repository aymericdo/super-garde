<script lang="ts">
  import { pb } from "$lib/pocketbase"
  import { ClientResponseError } from "pocketbase"
  import { createEventDispatcher, onDestroy } from "svelte"
  import { debounce } from "$lib/utils"
  import type { RecordModel } from 'pocketbase'

  let students: RecordModel[] = [];
  let query = "";
  let selected: RecordModel | null = null
  let isOpen = false

  const dispatch = createEventDispatcher();

  const fetch = async (): Promise<void> => {
    try {
      const options: { filter?: string } = {}

      if (query.length) {
        const terms = query.trim().split(/\s+/)
        options.filter = terms
          .map(term => `(firstName ~ "${term}" || lastName ~ "${term}")`)
          .join(" && ")
      }

      const data = await pb.collection("students").getFullList(options)
      setStudents(data);
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const setStudents = async (newData: RecordModel[]) => {
    students = [...newData];
    selected = null;
  };

  const fetchWithDebounce = debounce(fetch, 250);
  
  const handleSearch = async (inputEvent: Event) => {
    isOpen = true;
    query = (<HTMLInputElement>inputEvent.target).value || '';
    fetchWithDebounce();
  }

  onDestroy(() => {
    query = ''
    selected = null;
    isOpen = false
  })

  export let selectedStudentError: string | null = null;
</script>

<div class="w-full p-4">
  <!-- Champ de recherche -->
  <input
    type="text"
    placeholder="Filtrer..."
    class="input input-bordered mb-2 w-full"
    value={query}
    on:input={handleSearch}
  />

  {#if isOpen && query.length}
    <ul class="list bg-base-100 rounded-box max-h-80 overflow-y-auto">
      <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">
        Choisis un étudiant
      </li>
      {#each students as student}
        <li class="list-row w-full flex">
          <button
            class="flex-1 text-left cursor-pointer"
            class:selected={selected?.id === student.id}
            disabled={selected?.id === student.id}
            on:click={() => {
              selected = student
              query = `${student.firstName} ${student.lastName}`;
              isOpen = false
              dispatch('selectStudent', student);
            }}
          >
            {student.firstName} {student.lastName} ({student.year})
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if !isOpen && selectedStudentError}
  <div role="alert" class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>{selectedStudentError}</span>
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