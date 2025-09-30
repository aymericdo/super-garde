<script lang="ts">
  import { pb } from "$lib/pocketbase"
  import { ClientResponseError } from "pocketbase"
  import { getContext, onMount } from "svelte"
  import type { RecordModel } from 'pocketbase'

  let students: RecordModel[] = [];
  let query = "";
  let selected: RecordModel | null = null

  const fetch = async (): Promise<RecordModel[] | undefined> => {
    try {
      const options: { expand: string, filter?: string } = {
        expand: 'user',
      }

      if (query.length) {
        options.filter = `(firstName ~ "${query}") || (lastName ~ "${query}")`;
      }

      return await pb.collection("students").getFullList(options)
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
  
  const handleSearch = async (inputEvent: Event) => {
    query = (<HTMLInputElement>inputEvent.target).value.trim() || '';
    const newData = await fetch();
    if (newData) setStudents(newData);
  }
  
  onMount(async () => {
    const data = await fetch();
    console.log(data)
    if (data) setStudents(data);
  })

  const {
    handleSelectStudent,
  } = getContext('studentSelector') as {
    handleSelectStudent: () => void
  }
</script>

<div class="w-full bg-base-100 rounded-box p-4 shadow">
  <!-- Champ de recherche -->
  <input
    type="text"
    placeholder="Filtrer..."
    class="input input-bordered input-sm mb-2 w-full"
    on:input={handleSearch}
  />

  <select class="select">
    <option disabled selected>Choisis un étudiant</option>
    {#each students as student}
      <option>{student.lastName}</option>
    {/each}
  </select>

  <input
    type="checkbox"
    checked="{true}"
    class="checkbox border-indigo-600 bg-indigo-500 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
  />

  <!-- Liste -->
  <!-- <ul class="menu w-full max-h-60 overflow-y-auto" role="listbox">
    {#each students as student}
      <button
        role="option"
        aria-selected={selected?.id === student.id}
        class="cursor-pointer"
        on:click={() => (selected = student)}
      >
        <span class={selected?.id === student.id ? 'active' : ''}>
          {student.lastName}
        </span>
      </button>
    {/each}
  </ul> -->

  <!-- Résultat -->
  {#if selected}
    <p class="mt-2 text-sm text-gray-500">Sélectionné : {selected}</p>
  {/if}
</div>
