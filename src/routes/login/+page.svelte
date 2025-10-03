<script lang="ts">
  import Eye from 'svelte-material-icons/Eye.svelte'
  import EyeOff from 'svelte-material-icons/EyeOff.svelte'
  import { applyAction, enhance } from '$app/forms'
  import { pb } from '$lib/pocketbase'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { page } from '$app/state';

  let email = ''
  let password = ''
  let showPassword = false
  let serverError: string | null = null

  function extractErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'data' in err) {
      const e = err as { data?: { message?: string } }
      return e.data?.message || 'Une erreur est survenue'
    }
    return 'Une erreur est survenue'
  }

  const forgottenPassword = page.url.searchParams.get('forgotten-password')
</script>

<form
  method="POST"
  class="card"
  use:enhance={() => {
    return async ({ result }) => {
      try {
        if (result.status !== 200) {
          throw result
        }

        // Charge le cookie PocketBase
        pb.authStore.loadFromCookie(document.cookie)
        await applyAction(result)

        await goto('/')

        // Clear previous error
        serverError = null
      } catch (err) {
        serverError = extractErrorMessage(err)
      }
    }
  }}
>
  <h1 class="text-2xl mb-8">Connexion</h1>

  {#if serverError}
    <div class="alert alert-error mb-4">
      {serverError}
    </div>
  {/if}

  {#if forgottenPassword}
    <div class="alert alert-success mb-4">
      Un mail t'a été envoyé pour la réinitialisation du mot de passe. Vérifie tes spams.
    </div>
  {/if}

  <div class="form-control gap-2 mb-4">
    <input
      type="email"
      name="email"
      placeholder="Email"
      class="input input-bordered w-full"
      bind:value={email}
    />
  </div>

  <div class="form-control gap-2 mb-4">
    <div class="relative">
      {#if showPassword}
        <input
          type="text"
          name="password"
          placeholder="Password"
          class="input input-bordered w-full pr-10"
          bind:value={password}
        />
      {:else}
        <input
          type="password"
          name="password"
          placeholder="Password"
          class="input input-bordered w-full pr-10"
          bind:value={password}
        />
      {/if}

      <button
        type="button"
        class="absolute z-1 inset-y-0 right-0 px-3 flex items-center text-sm"
        on:click={() => (showPassword = !showPassword)}
      >
        {#if showPassword}
          <Eye class="mr-2" size="1.5em" />
        {:else}
          <EyeOff class="mr-2" size="1.5em" />
        {/if}
      </button>
    </div>
  </div>

  <div class="flex justify-end mt-4">
    <a href="{resolve('/forgotten-password')}"
      class="btn btn-link text-l mx-4">
      Mot de passe oublié
    </a>

    <button
      class="btn btn-primary"
      type="submit"
      disabled={!email || !password}
    >Connexion</button>
  </div>
</form>
