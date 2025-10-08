<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  export let threshold = 200;
  export let hasMore = true;
  export let rootEl: HTMLElement | null = null;
  const dispatch = createEventDispatcher();
  let sentinel: HTMLElement | null = null;
  let observer: IntersectionObserver | null = null;

  function setupObserver() {
    if (observer) observer.disconnect();
    if (!sentinel || !rootEl) return;

    observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore) {
          dispatch('loadMore');
        }
      },
      {
        root: rootEl,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0,
      }
    );
    observer.observe(sentinel);
  }

  $: if (rootEl && sentinel) {
    setupObserver();
  }

  onDestroy(() => {
    if (observer) observer.disconnect();
  });
</script>

<slot></slot>
{#if hasMore}
  <div bind:this={sentinel} class="infinite-scroll-sentinel"></div>
{/if}

<style>
  .infinite-scroll-sentinel {
    width: 100%;
    height: 1px;
    background: transparent;
  }
</style>
