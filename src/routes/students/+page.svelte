<script lang="ts">
  import InfiniteScroll from "svelte-infinite-scroll";
  import type { ClientResponseError } from 'pocketbase'
  import { BarLoader } from 'svelte-loading-spinners';
  import { pb } from '$lib/pocketbase'
  import { currentUser } from '$lib/stores/user'
  import { onMount } from 'svelte';

	import type { PageData } from './$types'
  export let data: PageData

  let loading = false;

  const fetchMore = async () => {
    try {
      const updateData = await pb.collection("students").getList(data.page, data.perPage, { expand: 'user' })

      data.studentList = {
        ...updateData,
        items: [
          ...data.studentList.items,
          ...updateData.items,
        ],
      };
      loading = false;
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  };

  const handleImport = async () => {
    try {
      const data = await pb.send("/api/import-students", {});
      console.log(data);
    } catch(error) {
      console.error(error);
    }
  }

  const handleLoadMore = async () => {
    if (data.studentList.totalPages > data.page) {
      loading = true;
      data.page += 1;
      fetchMore();
    }
  }

  onMount(async () => {
    pb.realtime.subscribe('students', (e) => {
      switch (e.action) {
        case 'update': {
          data.studentList = {
            ...data.studentList,
            items: data.studentList.items.map((item) => {
              if (item.id === e.record.id) {
                return {
                  ...item,
                  ...e.record,
                };
              } else {
                return item;
              }
            }),
          };
          break;
        }
        case 'delete': {
          data.studentList = {
            ...data.studentList,
            items: data.studentList.items.filter((item) => item.id !== e.record.id),
          };
          break;
        }
      }
    });

    pb.realtime.subscribe('users', (e) => {
      if (e.record.id === $currentUser.id) {
        currentUser.set(e.record);
      }
    });
  });
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center">
    La liste des étudiants
  </h1>
  {#if ['admin', 'god'].includes($currentUser?.role)}
    <button on:click={handleImport} class="btn btn-ghost text-m">Importer</button>
  {/if}
</div>
<div class="students-table relative overflow-x-auto shadow-md sm:rounded-lg">
  <table class="table-fixed w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
    <thead class="block text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr class="flex odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
        <th class="basis-3/12 px-6 py-3">
          Prénom
        </th>
        <th class="basis-3/12 px-6 py-3">
          Nom
        </th>
        <th class="basis-6/12 px-6 py-3">
          Email
        </th>
      </tr>
    </thead>
  
    <tbody class="block overflow-y-auto w-full">
      {#each data.studentList.items as item}
        <tr class="flex">
          <td class="basis-3/12 px-6 py-4 font-medium text-gray-900">
            {item.firstName}
          </td>
          <td class="basis-3/12 px-6 py-4 font-medium text-gray-500">
            {item.lastName}
          </td>
          <td class="basis-6/12 px-6 py-4 font-medium text-gray-500">
            {item.expand?.user.email}
          </td>
        </tr>
      {/each}
      <InfiniteScroll threshold={100} on:loadMore={handleLoadMore} />
      {#if loading}
        <div class="flex justify-center px-6 py-4">
          <BarLoader size="60" color="#FF3E00" unit="px" duration="1s" />
        </div>
      {/if}
    </tbody>
  </table>
</div>

<style>
  table tbody {
	  height: 640px;
  }

  th, td {
    min-width: 100px;
  }

  @media (min-width: 576px) {
    table tbody {
      height: 700px;
    }
  }

  @media (min-width: 992px) {
    table tbody {
      height: 700px;
    }
  }
</style>