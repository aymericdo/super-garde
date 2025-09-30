<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { currentUser } from '$lib/stores/user';
  import { pb } from '$lib/pocketbase';
  
  import type { ClientResponseError, RecordModel } from 'pocketbase'
  import type { PageData } from './$types'

  export let data: PageData

  let loading = true;
  let slots: RecordModel[] = [];

  const fetchAll = async () => {
    if (!data.currentStudent?.id) return;

    try {
      const options: { expand: string, filter: string, sort: string } = {
        expand: 'student',
        filter: `student = "${data.currentStudent?.id}"`,
        sort: 'start',
      };

      slots = await pb.collection("onCallSlots").getFullList(options);
    } catch (error) {
      if (!(error as ClientResponseError).isAbort) {
        console.error(error);
      }
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await fetchAll();

    pb.realtime.subscribe('onCallSlots', async (e) => {
      if (['create', 'update', 'delete'].includes(e.action)) {
        await fetchAll();
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
    pb.realtime.unsubscribe('users');
  })

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const formatted = date.toLocaleString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
</script>

<div class="flex justify-between mb-4">
  <h1 class="font-bold text-gray-900 text-lg">Vos gardes</h1>
</div>

{#if data.currentStudent}
  {#if loading}
    <div class="flex justify-center px-6 py-4">
      <span class="loading loading-ball loading-lg text-accent"></span>
    </div>
  {:else if slots.length === 0}
    <p class="text-gray-500 text-center italic">Aucune garde prévue.</p>
  {:else}
    <ul class="space-y-3">
      {#each slots as slot}
        <li class="p-4 bg-white rounded-2xl shadow flex items-start justify-between">
          <div>
            <p class="font-semibold text-gray-800">{slot.sector}</p>
            <p class="text-sm text-gray-500">
              <span>{formatDateTime(slot.start.toString())}</span> → {formatDateTime(slot.end.toString())}
            </p>
            <p class="text-sm text-gray-500">Hôpital : {slot.hospital}</p>
          </div>
          {#if slot.isOnMarket}
            <span class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full self-start">
              En échange
            </span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
{:else}
  Tu n'as pas de garde car tu n'es pas étudiant.
{/if}
