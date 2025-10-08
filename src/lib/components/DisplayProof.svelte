<script lang="ts">
  import type { CalendarEvent } from "$lib/interfaces/calendar"

  export let openedEvent: CalendarEvent;
  export let baseUrl: string;
  const fileUrl = `${baseUrl}/api/files/onCallSlots/${openedEvent.id}/${openedEvent.proof}`;

  // Détecter l'extension du fichier
  const isPdf = openedEvent.proof?.toLowerCase().endsWith('.pdf');
</script>

{#if isPdf}
  <iframe 
    src={fileUrl} 
    width="100%" 
    height="500px"
    style="border:none;"
    title="attestation PDF">
  </iframe>
{:else}
  <div class="image-container">
    <img src={fileUrl} alt="attestation" />
  </div>
{/if}

<style>
  .image-container {
    max-width: 300px;
    width: 100%;
  }

  .image-container img {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
