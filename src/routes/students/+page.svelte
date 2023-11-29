<script lang="ts">
  import InfiniteScroll from "svelte-infinite-scroll";
  import type { ClientResponseError, ListResult, RecordModel} from 'pocketbase'
  import { BarLoader } from 'svelte-loading-spinners';
  import { pb } from '$lib/pocketbase'
  import { currentUser } from '$lib/stores/user'
  import { onMount } from 'svelte';

	import type { PageData } from './$types'
  export let data: PageData

  let loading = false;
  let query = '';
  let isAllStudentsChecked: boolean = false;
  let selectedStudents: string[] = [];

  const fetch = async (): Promise<ListResult<RecordModel> | undefined> => {
    try {
      const options: { expand: string, filter?: string } = {
        expand: 'user',
      }
      if (query.length) {
        options.filter = `(firstName ~ "${query}") || (lastName ~ "${query}") || (user.email ~ "${query}")`;
      }

      return await pb.collection("students").getList(data.page, data.perPage, options)
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const appendStudents = async (newData: ListResult<RecordModel>) => {
    data.studentList = {
      ...newData,
      items: [
        ...data.studentList.items,
        ...newData.items,
      ],
    };
    loading = false;
  };

  const setStudents = async (newData: ListResult<RecordModel>) => {
    data.studentList = {
      ...newData,
    };
    loading = false;
  };

  const handleImport = async () => {
    try {
      const data = await pb.send("/api/import-students", {});
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleLoadMore = async () => {
    if (data.studentList.totalPages > data.page) {
      loading = true;
      data.page += 1;
      const newData = await fetch();
      if (newData) appendStudents(newData);
    }
  }

  const handleSearch = async (inputEvent: Event) => {
    query = (<HTMLInputElement>inputEvent.target).value || '';
    loading = true;
    data.page = 0;
    const newData = await fetch();
    if (newData) setStudents(newData);
  }

  const handleCheckAll = () => {
    if (isAllStudentsChecked) {
      isAllStudentsChecked = false;
      selectedStudents = [];
    } else {
      isAllStudentsChecked = true;
    }
  }

  const handleCheck = (item: RecordModel) => {
    if (selectedStudents.includes(item.id)) {
      selectedStudents = selectedStudents.filter(id => item.id !== id);
    } else {
      selectedStudents = [...selectedStudents, item.id];
    }

    if (selectedStudents.length === data.studentList.totalItems) {
      isAllStudentsChecked = true;
    } else {
      isAllStudentsChecked = false;
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
        currentUser.set({
          ...e.record,
          isAdmin: $currentUser?.isAdmin,
        });
      }
    });
  });
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center">
    La liste des étudiants
  </h1>
</div>
<div class="flex justify-between items-center mb-1">
  <input type="text" placeholder="Roger Federer" on:input={handleSearch}
  class="input input-bordered input-primary input-sm max-w-xs" />
  {#if $currentUser?.isAdmin || ['admin', 'god'].includes($currentUser?.role)}
    <button on:click={handleImport} class="btn btn-ghost text-m">Importer</button>
  {/if}
</div>
<div class="students-table relative overflow-x-auto shadow-md sm:rounded-lg">
  <table class="table-fixed w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
    <thead class="block text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr class="flex odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
        <th class="basis-1/12 px-6 py-3 -checkbox">
          <input type="checkbox" class="checkbox checkbox-accent" checked={isAllStudentsChecked}
            indeterminate={!isAllStudentsChecked && !!selectedStudents.length} on:input={handleCheckAll} />
        </th>
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
          <td class="basis-1/12 px-6 py-4 flex items-center -checkbox">
            <input type="checkbox" checked="{isAllStudentsChecked || selectedStudents.includes(item.id)}"
              on:input={() => handleCheck(item)}
              class="checkbox checkbox-ghost checkbox-md" />
          </td>
          <td class="basis-3/12 px-6 py-4 flex items-center font-medium text-gray-900">
            <span>{item.firstName}</span>
          </td>
          <td class="basis-3/12 px-6 py-4 flex items-center font-medium text-gray-500">
            <span>{item.lastName}</span>
          </td>
          <td class="basis-6/12 px-6 py-4 flex items-center font-medium text-gray-500">
            <span>{item.expand?.user.email}</span>
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

  th:not(.-checkbox),
  td:not(.-checkbox) {
    min-width: 100px;
  }

  th.-checkbox,
  td.-checkbox {
    min-width: 36px;
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