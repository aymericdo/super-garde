<script lang="ts">
  import '../app.postcss'

  import { base } from '$app/paths';
  import { applyAction, enhance } from '$app/forms'
  import { pb } from '$lib/pocketbase'
  import { currentUser } from '$lib/stores/user'
  import { page } from '$app/stores';
  import type { PageData } from './$types'

  export let data: PageData

  let isOpen: boolean = false;

  // Set the current user from the data passed in from the server
  $: currentUser.set(data.user);
  $: currentRoute = $page.url.pathname;
</script>

<div class="bg-neutral text-neutral-content">
  <div class="max-w-l mx-auto navbar">
    <div class="navbar-start">
      <a href="{base}/" class="btn btn-ghost text-xl">(Super) logiciel de garde</a>

      {#if $currentUser}
        <div class="hidden w-full lg:flex lg:w-auto">
          <a href="{base}/calendar" class="btn btn-ghost text-l mx-1" class:btn-active={currentRoute === base + "/calendar"}>Calendrier</a>
          {#if $currentUser?.isAdmin || ['assistant', 'god'].includes($currentUser?.role)}
            <a href="{base}/students" class="btn btn-ghost text-l mx-1" class:btn-active={currentRoute === base + "/students"}>Étudiants</a>
          {/if}
        </div>
      {/if}
    </div>

    <div class="navbar-end">
      <div class="lg:hidden relative flex items-center w-full justify-end">
        <a class="hidden sm:flex btn btn-ghost text-l mx-1" href="{base}/">
          {$currentUser.email}
          {#if $currentUser.isAdmin}
            <div class="badge badge-accent">admin</div>
          {:else}
            <div class="badge badge-secondary">{$currentUser.role}</div>
          {/if}
        </a>

        <button on:click={() => (isOpen = !isOpen)} type="button" class="btn btn-secondary block text-gray-500 hover:text-white focus:text-white focus:outline-none">
          <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
            {#if isOpen}
              <path fill-rule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"/>
            {:else}
              <path fill-rule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
            {/if}
          </svg>
        </button>

        <button on:click={() => (isOpen = !isOpen)}
          class:hidden={!isOpen} class="fixed z-10 w-screen h-screen bg-red top-0 left-0">
        </button>

        <div class:hidden={!isOpen} class="absolute -bottom-1 translate-y-full w-40 right-1 shadow-md rounded bg-slate-100 z-20">
          {#if $currentUser}
            <a href="{base}/" on:click={() => (isOpen = false)}
              class="sm:hidden btn btn-ghost relative text-l w-full bg-black text-white flex p-1">
              <p class="truncate">{$currentUser.email}</p>
              {#if $currentUser.isAdmin}
                <div class="badge badge-accent absolute bottom-0 right-0 translate-y-1/2">admin</div>
              {:else}
                <div class="badge badge-secondary absolute bottom-0 right-0 translate-y-1/2">{$currentUser.role}</div>
              {/if}
            </a>

            <a href="{base}/calendar" on:click={() => (isOpen = false)}
                class:btn-active={currentRoute === base + "/calendar"}
                class="btn btn-ghost text-l w-full text-black">Calendrier</a>
            {#if $currentUser?.isAdmin || ['assistant', 'god'].includes($currentUser?.role)}
              <a href="{base}/students" on:click={() => (isOpen = false)}
                  class:btn-active={currentRoute === base + "/students"}
                  class="btn btn-ghost text-l w-full text-black">Étudiants</a>
            {/if}
            <form
              class="btn btn-ghost text-l w-full text-black"
              method="POST"
              action="{base}/logout"
              use:enhance={() => {
                return async ({ result }) => {
                  pb.authStore.clear()
                  await applyAction(result)
                }
              }}
            >
              <button>Log out</button>
            </form>
          {:else}
            <a class="btn btn-ghost text-l w-full text-black"
              on:click={() => (isOpen = false)}
              href="{base}/login">Log in</a>
            <!-- <a class="btn btn-ghost text-l w-full text-black"
              on:click={() => (isOpen = false)}
              href="{base}/register">Register</a> -->
          {/if}
        </div>
      </div>

      <div class="hidden w-full lg:flex lg:w-auto">
        <div class="menu menu-horizontal">
          {#if $currentUser}
            <a class="btn btn-ghost text-l mx-1" href="{base}/">
              {$currentUser.email}
              {#if $currentUser.isAdmin}
                <div class="badge badge-accent">admin</div>
              {:else}
                <div class="badge badge-secondary">{$currentUser.role}</div>
              {/if}
            </a>
            <form
              class="btn btn-ghost text-l"
              method="POST"
              action="{base}/logout"
              use:enhance={() => {
                return async ({ result }) => {
                  pb.authStore.clear()
                  await applyAction(result)
                }
              }}
            >
              <button>Log out</button>
            </form>
          {:else}
            <a class="btn btn-ghost text-l mx-1" href="{base}/login">Login</a>
            <!-- <a class="btn btn-ghost text-l mx-1" href="{base}/register">Register</a> -->
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<div class="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto py-8 px-4">
  <slot />
</div>
