<script lang="ts">
  import type { ClientResponseError } from 'pocketbase'
  import { pb } from '$lib/pocketbase'
  import { currentUser } from '$lib/stores/user'
  import { onMount } from 'svelte';

	import type { PageData } from './$types'
  export let data: PageData
  
  onMount(async () => {
    const update = async () => {
      try {
        const updateData = await pb.collection("students").getFullList({ expand: 'user' })
        data.studentList = updateData;
      } catch (error) {
        if (!(error as ClientResponseError).isAbort) {
          console.error(error);
        }
      }
    };

    pb.realtime.subscribe('students', (e) => {
      update();
    });

    pb.realtime.subscribe('users', (e) => {
      if (e.record.id === $currentUser.id) {
        currentUser.set(e.record);
      }
    });
  });

  const handleImport = async () => {
    try {
      const data = await pb.send("/api/import-students", {});
      console.log(data);
    } catch(error) {
      console.error(error);
    }
  }
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center">
    La liste des étudiants
  </h1>
  {#if ['admin', 'god'].includes($currentUser?.role)}
    <button on:click={handleImport} class="btn btn-ghost text-m">Importer</button>
  {/if}
</div>
<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
  <table class="table-auto w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
        <th scope="col" class="px-6 py-3">
          Prénom
        </th>
        <th scope="col" class="px-6 py-3">
          Nom
        </th>
        <th scope="row" class="px-6 py-3">
          Email
        </th>
      </tr>
    </thead>
  
    <tbody>
      {#each data.studentList as item}
        <tr>
          <td class="px-6 py-4 font-medium text-gray-900">
            {item.firstName}
          </td>
          <td class="px-6 py-4 font-medium text-gray-500">
            {item.lastName}
          </td>
          <td class="px-6 py-4 font-medium text-gray-500">
            {item.expand?.user.email}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
