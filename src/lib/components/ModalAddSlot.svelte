<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { pb } from '$lib/pocketbase'
  import type { RecordModel } from 'pocketbase'

  const dispatch = createEventDispatcher();

  let date: string = ''
  let hospital: string = ''
  let sector: string = ''
  let error: string = ''
  let loading: boolean = false
  let attestationFile: File | null = null

  const handleSave = async () => {
    if (!connectedStudent) return

    loading = true

    // Vérification que la date est dans le passé
    if (!date || new Date(date) > new Date()) {
      error = 'La date doit être dans le passé'
      loading = false
      return
    }

    if (!hospital.trim() || !sector.trim()) {
      error = 'Hôpital et secteur sont requis'
      loading = false
      return
    }

    if (!attestationFile) {
      error = 'Une attestation est requise'
      loading = false
      return
    }

    error = ''

    const startDate = new Date(date)
    startDate.setHours(12)
    startDate.setMinutes(0)

    const endDate = new Date(date)
    endDate.setHours(13)
    endDate.setMinutes(0)

    const formData = new FormData()
    formData.append('student', connectedStudent.id)
    formData.append('start', startDate.toISOString())
    formData.append('end', endDate.toISOString())
    formData.append('hospital', 'Autre')
    formData.append('otherHospital', hospital)
    formData.append('sector', sector)
    formData.append('proof', attestationFile)

    await pb.collection('onCallSlots').create(formData)

    date = ''
    hospital = ''
    sector = ''
    error = ''
    attestationFile = null

    dispatch('close')
    loading = false
  }

  const setFile = (e: Event) => {
    attestationFile = (e.target as HTMLInputElement).files?.[0] || null
  }

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

      <!-- Champ d'attestation -->
      <div>
        <label class="label mb-2" for="attestation">Attestation</label>
        <input
          id="attestation"
          type="file"
          accept=".jpg,image/jpeg,.png,image/png,.svg,image/svg+xml,.webp,image/webp,.pdf,application/pdf"
          class="file-input file-input-bordered w-full"
          on:change={setFile}
        />
        <p class="text-sm text-gray-500 mt-1">
          Formats acceptés : JPG, PNG, SVG, WEBP, PDF
        </p>
      </div>

      {#if error}
        <p class="text-red-500">{error}</p>
      {/if}
    </div>

    <div class="modal-action">
      <button class="btn" on:click={() => dispatch('close')}>Annuler</button>
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
    <button on:click={() => dispatch('close')}>Fermer</button>
  </div>
</div>
