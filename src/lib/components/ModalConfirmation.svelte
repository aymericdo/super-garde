<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher();

  export let isConfirmationModalOpen: boolean = false;
  export let title: string;
  export let description: string;
  export let action: string;
</script>

<div class="modal" class:modal-open={isConfirmationModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">
      { title ?? 'Confirmation' }
    </h3>
    <p class="py-2">
      { description ?? 'Voulez-vous vraiment faire ça ?' }
    </p>
    <div class="modal-action">
      <button 
        class="btn"
        on:click={() => {
          dispatch('close')
        }}
      >
        Annuler
      </button>
      <button 
        class="btn btn-primary"
        on:click={() => {
          dispatch('confirm')
          dispatch('close')
        }}
      >
        { action ?? 'Confirmer' }
      </button>
    </div>
  </div>
  <div class="modal-backdrop">
    <button on:click={() => dispatch('close')}>Fermer</button>
  </div>
</div>