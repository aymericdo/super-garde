<script lang="ts">
  import Eye from 'svelte-material-icons/Eye.svelte'
  import EyeOff from 'svelte-material-icons/EyeOff.svelte'
  import { applyAction, enhance } from '$app/forms'
  import { pb } from '$lib/pocketbase'
  import { goto } from '$app/navigation'

  let showPassword = false
  let serverError: string | null = null

  function extractErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'data' in err) {
      const e = err as { data?: { message?: string } }
      return e.data?.message || 'Une erreur est survenue'
    }
    return 'Une erreur est survenue'
  }
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

  <div class="form-control gap-2 mb-4">
    <input
      type="email"
      name="email"
      placeholder="Email"
      class="input input-bordered"
    />

    <div class="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name="password"
        placeholder="Password"
        class="input input-bordered w-full pr-10"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 px-3 flex items-center text-sm"
        on:click={() => (showPassword = !showPassword)}
      >
        {#if showPassword}
          <Eye class="mr-2" size="1.5em" />
        {:else}
          <EyeOff class="mr-2" size="1.5em" />
        {/if}
      </button>
    </div>

    <button class="btn btn-primary mt-4">Connexion</button>
  </div>
</form>
