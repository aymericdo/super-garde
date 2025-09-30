<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { goto } from '$app/navigation'

  let email = ''
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

        await applyAction(result)
        await goto('/login?forgetten-password=true')

        // Clear previous error
        serverError = null
      } catch (err) {
        serverError = extractErrorMessage(err)
      }
    }
  }}
>
  <h1 class="text-2xl mb-8">Mot de passe oublié</h1>

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
      class="input input-bordered w-full"
      bind:value={email}
    />
  </div>

  <div class="flex justify-end mt-4">
    <button
      class="btn btn-primary"
      disabled={!email}
    >
      Réinitialiser
    </button>
  </div>
</form>
