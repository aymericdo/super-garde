<script lang="ts">
  import '../app.css'

  import { resolve } from '$app/paths';
  import { applyAction, enhance } from '$app/forms'
  import { pb } from '$lib/pocketbase'
  import { currentUser } from '$lib/stores/user'
  import { page } from '$app/state';
  import type { PageData } from './$types'
    import { afterNavigate } from '$app/navigation'

  export let data: PageData

  let isOpen: boolean = false;

  let currentRoute = page.url.pathname;

  afterNavigate(() => {
    currentRoute = page.url.pathname;
  });

  // Set the current user from the data passed in from the server
  $: currentUser.set(data.user);
</script>

<style>
  /* Accentuation du bouton actif */
  .btn-active {
    background-color: var(--color-secondary);;
    color: white !important;
    font-weight: 600;
    border-radius: 0.5rem;
  }

  /* Animation menu mobile */
  .mobile-menu {
    transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;
  }
  .mobile-menu.closed {
    transform: translateY(-10px);
    opacity: 0;
    pointer-events: none;
  }
</style>

<div class="bg-neutral text-neutral-content">
  <div class="max-w-6xl mx-auto navbar px-4">
    <!-- Logo / Accueil -->
    <div class="navbar-start">
      <a href="{resolve('/')}" class="btn btn-ghost text-xl font-bold">(Super) logiciel de garde</a>
    </div>

    <!-- Desktop menu -->
    <div class="navbar-center hidden lg:flex space-x-2">
      {#if $currentUser}
        <a href="{resolve('/calendar')}"
          class="btn btn-ghost text-l mx-1"
          class:btn-active={currentRoute.toString() === resolve("/calendar")}>Calendrier</a>

        <a href="{resolve('/on-calls')}"
          class="btn btn-ghost text-l mx-1"
          class:btn-active={currentRoute.toString() === resolve("/on-calls")}>Vos gardes</a>

        {#if ['assistant', 'god'].includes($currentUser?.role)}
          <a href="{resolve('/students')}"
            class="btn btn-ghost text-l mx-1"
            class:btn-active={currentRoute.toString() === resolve("/students")}>Étudiants</a>
        {/if}
      {/if}
    </div>

    <!-- Navbar end -->
    <div class="navbar-end">
      <!-- Desktop user -->
      <div class="hidden lg:flex items-center space-x-2">
        {#if $currentUser}
          <a class="btn btn-ghost text-l flex items-center" href="{resolve('/')}">
            <span>{$currentUser.email}</span>
            <div class="badge badge-secondary">{$currentUser.role}</div>
          </a>
          <form method="POST" action="{resolve('/logout')}" use:enhance={() => {
            return async ({ result }) => {
              pb.authStore.clear()
              await applyAction(result)
            }
          }}>
            <button type="submit" class="btn btn-ghost text-l">Déconnexion</button>
          </form>
        {:else}
          <a class="btn btn-ghost text-l mx-1" href="{resolve('/login')}">Login</a>
        {/if}
      </div>

      <!-- Mobile burger -->
      <div class="lg:hidden flex items-center">
        <button on:click={() => (isOpen = !isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          class="btn">
          <svg class="h-6 w-6" fill="none" stroke="currentColor">
            {#if isOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
          <span class="sr-only">{isOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Overlay + Mobile menu -->
  <button class:hidden={!isOpen} class="fixed inset-0 bg-black/40 z-20" on:click={() => (isOpen = false)}></button>

  <div class="lg:hidden fixed top-16 right-2 w-48 bg-white rounded shadow-lg z-30 p-2 mobile-menu {isOpen ? '' : 'closed'}">
    {#if $currentUser}
      <a href="{resolve('/calendar')}"
        on:click={() => (isOpen = false)}
        class="btn btn-ghost w-full text-black"
        class:btn-active={currentRoute === resolve("/calendar")}>Calendrier</a>
        
      <a href="{resolve('/on-calls')}"
        on:click={() => (isOpen = false)}
        class="btn btn-ghost w-full text-black"
        class:btn-active={currentRoute === resolve("/on-calls")}>Vos gardes</a>

      {#if ['assistant', 'god'].includes($currentUser?.role)}
        <a href="{resolve('/students')}"
          on:click={() => (isOpen = false)}
          class="btn btn-ghost w-full text-black"
          class:btn-active={currentRoute === resolve('/students')}>Étudiants</a>
      {/if}

      <form method="POST" action="{resolve('/logout')}"
        class="btn btn-ghost w-full text-black"
        use:enhance={() => {
          return async ({ result }) => {
            pb.authStore.clear()
            await applyAction(result)
          }
        }}>
        <button type="submit" class="btn btn-ghost">Déconnexion</button>
      </form>
    {:else}
      <a class="btn btn-ghost w-full text-black" href="{resolve('/login')}" on:click={() => (isOpen = false)}>Log in</a>
    {/if}
  </div>
</div>

<div class="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto py-8 px-4">
  <slot />
</div>
