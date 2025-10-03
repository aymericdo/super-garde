<script lang="ts">
  import { getContext } from 'svelte'
  import { pb } from '$lib/pocketbase'
  import type { RecordModel } from 'pocketbase'

  let date: string = ''
  let hospital: string = ''
  let sector: string = ''
  let error: string = ''
  let loading: boolean = false

  const handleSave = async () => {
    if (!connectedStudent) return;

    loading = true
    // Vérification que la date est dans le passé
    if (!date || new Date(date) > new Date()) {
      error = 'La date doit être dans le passé'
      return
    }

    if (!hospital.trim() || !sector.trim()) {
      error = 'Hôpital et secteur sont requis'
      return
    }
    error = ''

    const startDate = new Date(date)
    startDate.setHours(12)
    startDate.setMinutes(0)

    const endDate = new Date(date)
    endDate.setHours(13)
    endDate.setMinutes(0)

    await pb.collection("onCallSlots").create({
      student: connectedStudent.id,
      start: startDate,
      end: endDate,
      hospital: 'Autre',
      otherHospital: hospital,
      sector
    })

    handleModalClose()
    loading = false
  }

  const {
    handleModalClose,
  } = getContext('isAddSlotModalOpen') as {
    handleModalClose: () => void,
  };

  export let isAddSlotModalOpen: boolean = false;
  export let connectedStudent: RecordModel | undefined
</script>

<div class="modal" class:modal-open={isAddSlotModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">
      Ajouter une garde passée
    </h3>
    <p class="py-2">
      Cet outil a pour but d'ajouter des gardes passées dans le système afin de respecter au mieux l'équité au moment de la génération automatique des gardes.
    </p>

    <!-- Formulaire -->
    <div class="space-y-4">
      <div>
        <label class="label mb-2" for="date">Date</label>
        <input
          id="date"
          type="date" 
          bind:value={date} 
          class="input input-bordered w-full"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      <div>
        <label class="label mb-2" for="hospital">Hôpital</label>
        <input
          id="hospital"
          type="text" 
          bind:value={hospital} 
          placeholder="Nom de l'hôpital"
          class="input input-bordered w-full"
        />
      </div>
      <div>
        <label class="label mb-2" for="sector">Secteur</label>
        <input
          id="sector"
          type="text" 
          bind:value={sector} 
          placeholder="Nom du secteur"
          class="input input-bordered w-full"
        />
      </div>

      {#if error}
        <p class="text-red-500">{error}</p>
      {/if}
    </div>

    <div class="modal-action">
      <button class="btn" on:click={handleModalClose}>Annuler</button>
      <button
        class="btn btn-primary"
        disabled={loading}
        on:click={handleSave}>
        {#if loading}
          <span class="loading loading-spinner"></span>
        {/if}
        Sauvegarder
      </button>
    </div>
  </div>
  <div class="modal-backdrop">
    <button on:click={handleModalClose}>Fermer</button>
  </div>
</div>
