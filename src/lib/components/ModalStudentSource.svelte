<script lang="ts">
  import { getContext } from 'svelte'

  const { handleStudentSourceModalClose, handleGenerateStudents } =
    getContext('isStudentSourceModalOpen') as {
      handleStudentSourceModalClose: () => void,
      handleGenerateStudents: (url: string) => void,
    };

  export let isStudentSourceModalOpen: boolean = false;
  let googleSheetUrl: string = 'https://docs.google.com/spreadsheets/d/1tIB3eytaiWk3fI1o0jNUGhJ413hqrCplBXwcldI7_hU/gviz/tq?tqx=out:csv';
</script>

<div class="modal" class:modal-open={isStudentSourceModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Source des étudiants</h3>
    <div class="py-4">
      <div class="flex items-center justify-center mb-2">
        <input type="text" placeholder="https://docs.google.com/spreadsheets/d/..." bind:value={googleSheetUrl}
        class="input input-bordered input-primary input-sm w-full sm:w-8/12" />
      </div>
    </div>
    <div class="modal-action">
      <button class="btn" on:click={handleStudentSourceModalClose}>Close</button>
      <button disabled={!googleSheetUrl.length} class="btn btn-primary" on:click={() => handleGenerateStudents(googleSheetUrl)}>Générer la liste</button>
    </div>
  </div>
  <div class="modal-backdrop">
    <button on:click={handleStudentSourceModalClose}>close</button>
  </div>
</div>