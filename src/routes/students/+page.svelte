<script lang="ts">
  import InfiniteScroll from "svelte-infinite-scroll";
  import type { ClientResponseError, ListResult, RecordModel} from 'pocketbase'
  import { BarLoader } from 'svelte-loading-spinners';
  import { pb } from '$lib/pocketbase'
  import { currentUser } from '$lib/stores/user'
  import { onDestroy, onMount, setContext } from 'svelte';
  import ModalStudentSource from "$lib/components/ModalStudentSource.svelte"
  import AlertError from "$lib/components/AlertError.svelte"
  import AlertSuccess from "$lib/components/AlertSuccess.svelte"

	import type { PageData } from './$types'
  export let data: PageData

  let totalItemsAtBeginning = data.studentList.totalItems;
  let loading = false;
  let isNewStudentsNotVisible = false;
  let isStudentSourceModalOpen = false;
  let query = '';
  let isAllStudentsChecked: boolean = false;
  let selectedStudents: string[] = [];

  let requestErrorMessage: string | null = null;
  let isAlertSuccessVisible: boolean = false;

  const fetch = async (): Promise<ListResult<RecordModel> | undefined> => {
    try {
      const options: { expand: string, filter?: string } = {
        expand: 'user',
      }

      if (query.length) {
        options.filter = `(firstName ~ "${query}") || (lastName ~ "${query}") || (year ~ "${query}") || (user.email ~ "${query}")`;
      }

      return await pb.collection("students").getList(data.page, data.perPage, options)
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    }
  }

  const fetchOne = async (id: string): Promise<RecordModel | undefined> => {
    try {
      const options: { expand: string } = {
        expand: 'user',
      }

      return await pb.collection("students").getOne(id, options)
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
    if (isAllStudentsChecked) {
      selectedStudents = [...selectedStudents, ...newData.items.map(item => item.id)]
    }
    loading = false;
  };

  const setStudents = async (newData: ListResult<RecordModel>) => {
    data.studentList = {
      ...newData,
    };
    if (isAllStudentsChecked) {
      selectedStudents = [...newData.items.map(item => item.id)]
    }
    loading = false;
  };

  const handleImport = async (url: string) => {
    try {
      const data = await pb.send("/api/import-all-students", {
        url
      });
      console.log(data);
      requestErrorMessage = null;
      isAlertSuccessVisible = true;
      setTimeout(() => {
        isAlertSuccessVisible = false;
      }, 3*1000)
    } catch (error) {
      console.error(error);
      if ((error as ClientResponseError).message) requestErrorMessage = (error as ClientResponseError).message;
      setTimeout(() => {
        requestErrorMessage = null;
      }, 10*1000)
    }
  }

  const handleRefresh = async () => {
    loading = true;
    query = '';
    data.page = 1;
    isNewStudentsNotVisible = false;
    const newData = await fetch();
    if (newData) setStudents(newData);
  }

  const handleDelete = async () => {
    try {
      if (isAllStudentsChecked) {
        const data = await pb.send("/api/delete-all-students", {});
        console.log(data);
      } else {
        selectedStudents.forEach(async (id) => {
          const student = await pb.collection('students').getOne(id);
          await pb.collection('users').delete(student.user);
        });
      }
      selectedStudents = [];
      isAllStudentsChecked = false;
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
    loading = true;
    query = (<HTMLInputElement>inputEvent.target).value.trim() || '';
    data.page = 1;
    const newData = await fetch();
    if (newData) setStudents(newData);
  }

  const handleCheckAll = () => {
    if (isAllStudentsChecked) {
      isAllStudentsChecked = false;
      selectedStudents = [];
    } else {
      isAllStudentsChecked = true;
      selectedStudents = data.studentList.items.map(item => item.id);
    }
  }

  const handleCheck = (item: RecordModel) => {
    if (selectedStudents.includes(item.id)) {
      selectedStudents = selectedStudents.filter(id => item.id !== id);
    } else {
      selectedStudents = [...selectedStudents, item.id];
    }

    if (selectedStudents.length === totalItemsAtBeginning) {
      isAllStudentsChecked = true;
    } else {
      isAllStudentsChecked = false;
    }
  }

  const handleStudentSourceModalClose = (): void => {
    isStudentSourceModalOpen = false;
  }

  const handleGenerateStudents = async (url: string) => {
    handleImport(url);
    handleStudentSourceModalClose();
  }

  onMount(async () => {
    pb.realtime.subscribe('students', async (e) => {
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
            totalItems: data.studentList.totalItems - 1,
            totalPages: Math.floor((data.studentList.totalItems - 1) / data.studentList.perPage) + 1,
            items: data.studentList.items.filter((item) => item.id !== e.record.id),
          };
          break;
        }
        case 'create': {
          const newStudent = await fetchOne(e.record.id);

          data.studentList = {
            ...data.studentList,
            totalItems: data.studentList.totalItems + 1,
            totalPages: Math.floor((data.studentList.totalItems + 1) / data.studentList.perPage) + 1,
          };

          if (newStudent && data.studentList.totalPages === data.page) {
            data.studentList = {
              ...data.studentList,
              items: [
                ...data.studentList.items,
                newStudent,
              ],
            };
            if (isAllStudentsChecked) {
              selectedStudents = [...selectedStudents, newStudent.id]
            }
          } else {
            isNewStudentsNotVisible = true;
          }
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

  onDestroy(() => {
    pb.realtime.unsubscribe('students');
    pb.realtime.unsubscribe('users');
  })

  setContext('isStudentSourceModalOpen', { handleStudentSourceModalClose, handleGenerateStudents });

  $: selectedStudentsTotalCount = isAllStudentsChecked ? totalItemsAtBeginning : selectedStudents.length;
</script>

<div class="flex justify-between mb-1">
  <h1 class="flex items-center font-bold text-gray-900 text-lg">
    La liste des étudiants
  </h1>
</div>
<div class="flex justify-between flex-wrap items-center mb-1">
  <div class="flex items-center">
    <input type="text" placeholder="Roger Federer" on:input={handleSearch}
      class="input input-bordered input-primary input-sm max-w-xs" />
    {#if selectedStudentsTotalCount}
      <span class="dark:text-gray-400 mx-2">({selectedStudentsTotalCount} {selectedStudentsTotalCount > 1 ? 'étudiants sélectionnés' : 'étudiant sélectionné'} sur {totalItemsAtBeginning})</span>
    {:else if query.length}
      <span class="dark:text-gray-400 mx-2">({data.studentList.totalItems} étudiant{data.studentList.totalItems > 1 ? 's' : ''} sur {totalItemsAtBeginning})</span>
    {:else}
      <span class="dark:text-gray-400 mx-2">({data.studentList.totalItems} étudiant{data.studentList.totalItems > 1 ? 's' : ''})</span>
    {/if}

    {#if isNewStudentsNotVisible}
      <button on:click={handleRefresh} class="btn btn-outline btn-warning btn-sm mx-1">Rafraichir</button>
    {/if}
  </div>
  {#if $currentUser?.isAdmin || ['assistant', 'god'].includes($currentUser?.role)}
    <div class="flex flex-1 flex-wrap items-center justify-end">
      {#if selectedStudents.length}
        <button on:click={handleDelete} class="btn btn-warning text-m btn-sm my-2 me-1 flex-1 md:flex-initial md:btn-md">Supprimer</button>
      {/if}
      <button on:click={() => isStudentSourceModalOpen = true} class="btn btn-neutral text-m btn-sm my-2 flex-1 md:flex-initial md:btn-md">Importer</button>
    </div>
  {/if}
</div>
<div class="students-table relative overflow-x-auto shadow-md sm:rounded-lg">
  <table class="table-fixed w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
    <thead class="block text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr class="flex odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
        <th class="basis-1/12 px-6 py-3 -checkbox">
          <input type="checkbox" class="checkbox checkbox-accent" checked={isAllStudentsChecked} disabled={!data.studentList.items.length}
            indeterminate={!isAllStudentsChecked && !!selectedStudents.length} on:input={handleCheckAll} />
        </th>
        <th class="basis-3/12 px-6 py-3 flex items-center">
          Prénom
        </th>
        <th class="basis-3/12 px-6 py-3 flex items-center">
          Nom
        </th>
        <th class="basis-6/12 px-6 py-3 flex items-center">
          Email
        </th>
        <th class="basis-3/12 px-6 py-3 flex items-center">
          Année
        </th>
      </tr>
    </thead>
  
    <tbody class="block overflow-y-auto w-full">
      {#each data.studentList.items as item}
        <tr class="flex">
          <td class="basis-1/12 px-6 py-4 flex items-center -checkbox">
            <input type="checkbox" checked="{selectedStudents.includes(item.id)}"
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
            {#if item.expand?.user?.email}
              <span>{item.expand?.user?.email}</span>
            {/if}
          </td>
          <td class="basis-3/12 px-6 py-4 flex items-center font-medium text-gray-500">
            <span>{item.year}</span>
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

{#if isAlertSuccessVisible}
  <AlertSuccess message={'Les étudiants ont bien été importés 😊'} />
{:else if requestErrorMessage?.length}
  <AlertError message={requestErrorMessage} />
{/if}
<ModalStudentSource {isStudentSourceModalOpen} />

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