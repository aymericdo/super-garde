<script lang="ts">
  import { pb } from '$lib/pocketbase'
  import { currentUser } from '$lib/stores/user'
  import { onDestroy, onMount, setContext } from 'svelte';
  import ModalStudentSource from "$lib/components/ModalStudentSource.svelte"
  import AlertError from "$lib/components/AlertError.svelte"
  import AlertSuccess from "$lib/components/AlertSuccess.svelte"
  import InfiniteScroll from '$lib/components/InfiniteScroll.svelte'
  
  import type { ClientResponseError, ListResult, RecordModel} from 'pocketbase'
	import type { PageData } from './$types'

  export let data: PageData
  
  const totalItemsAtBeginning = data.studentList.totalItems;
  let isNewStudentsNotVisible = false;
  let isStudentSourceModalOpen = false;
  let query = '';
  let isAllStudentsChecked: boolean = false;
  let selectedStudents: string[] = [];
  let loading = false;
  const error = data.error;
  
  let scrollContainer: HTMLElement;

  let requestErrorMessage: string | null = null;
  let isAlertSuccessVisible: boolean = false;

  const fetch = async (): Promise<ListResult<RecordModel> | undefined> => {
    try {
      const options: { expand: string, filter?: string } = {
        expand: 'user',
      }

      if (query.length) {
        const terms = query.trim().split(/\s+/)
        options.filter = terms
          .map(term => `(firstName ~ "${term}" || lastName ~ "${term}") || (year ~ "${query}") || (user.email ~ "${query}")`)
          .join(" && ")
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
      await pb.send("/api/import-all-students", {
        url,
      });
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
      if (e.record.id === $currentUser?.id) {
        currentUser.set({
          ...e.record,
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
    <input type="text" placeholder="Nom de l'étudiant" on:input={handleSearch}
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
  {#if ['assistant', 'god'].includes($currentUser?.role ?? '')}
    <div class="flex flex-1 flex-wrap items-center justify-end">
      {#if selectedStudents.length}
        <button on:click={handleDelete} class="btn btn-warning text-m btn-sm my-2 me-1 flex-1 md:flex-initial md:btn-md">Supprimer</button>
      {/if}
      <button on:click={() => isStudentSourceModalOpen = true} class="btn btn-neutral text-m btn-sm my-2 flex-1 md:flex-initial md:btn-md">Importer</button>
    </div>
  {/if}
</div>
<div class="students-table relative overflow-y-hidden shadow-md sm:rounded-lg">
  <div class="thead-container w-full">
    <table class="w-full">
      <thead class="block text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
        <tr class="flex w-full">
          <th class="basis-1/12 px-6 py-3 min-w-[36px] -checkbox">
            <input type="checkbox" class="checkbox checkbox-accent" checked={isAllStudentsChecked} disabled={!data.studentList.items.length}
              indeterminate={!isAllStudentsChecked && !!selectedStudents.length} on:input={handleCheckAll} />
          </th>
          <th class="basis-3/12 px-6 py-3 flex items-center min-w-[100px]">Prénom</th>
          <th class="basis-3/12 px-6 py-3 flex items-center min-w-[100px]">Nom</th>
          <th class="basis-6/12 px-6 py-3 flex items-center min-w-[100px]">Email</th>
          <th class="basis-2/12 px-6 py-3 flex items-center min-w-[100px]">Année</th>
        </tr>
      </thead>
    </table>
  </div>
  <div
    class="block w-full overflow-y-auto bg-white pb-8 h-[500px] sm:h-[700px] lg:h-[700px]"
    bind:this={scrollContainer}
  >
    <InfiniteScroll
      threshold={100}
      hasMore={data.studentList.totalPages > data.page}
      rootEl={scrollContainer}
      on:loadMore={handleLoadMore}
    >
      <table class="table-fixed w-full">
        <tbody class="w-full">
          {#each data.studentList.items as item}
            <tr class="flex w-full">
              <td class="basis-1/12 px-6 py-4 flex items-center min-w-[36px] -checkbox">
                <input type="checkbox" checked="{selectedStudents.includes(item.id)}"
                  on:input={() => handleCheck(item)}
                  class="checkbox checkbox-ghost checkbox-md" />
              </td>
              <td class="basis-3/12 px-6 py-4 flex items-center font-medium text-gray-900 min-w-[100px]">
                <span>{item.firstName}</span>
              </td>
              <td class="basis-3/12 px-6 py-4 flex items-center font-medium text-gray-500 min-w-[100px]">
                <span>{item.lastName}</span>
              </td>
              <td class="basis-6/12 px-6 py-4 flex items-center font-medium text-gray-500 min-w-[300px]">
                {#if item.expand?.user?.email}<span>{item.expand?.user?.email}</span>{/if}
              </td>
              <td class="basis-2/12 px-6 py-4 flex items-center font-medium text-gray-500 min-w-[100px]">
                <span>{item.year}</span>
              </td>
            </tr>
          {/each}
          <InfiniteScroll threshold={100} on:loadMore={handleLoadMore} />
          {#if loading}
            <div class="flex justify-center px-6 py-4">
              <span class="loading loading-ball loading-lg text-accent"></span>
            </div>
          {/if}
        </tbody>
      </table>
    </InfiniteScroll>
  </div>
</div>

{#if error}
  <AlertError message={error} />
{/if}

{#if isAlertSuccessVisible}
  <AlertSuccess message={'Les étudiants ont bien été importés 😊'} />
{:else if requestErrorMessage?.length}
  <AlertError message={requestErrorMessage} />
{/if}
<ModalStudentSource {isStudentSourceModalOpen} />
