<script lang="ts">
  export let message: string = 'Error! Task failed successfully.';
</script>

<div class="alert-section fixed top-1 left-1/2 w-full md:w-1/2 -translate-x-1/2 p-2 opacity-90">
  <div role="alert" class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>{message}</span>
  </div>
</div>

<style>
  .alert-section {
    z-index: 1000;
  }
</style>