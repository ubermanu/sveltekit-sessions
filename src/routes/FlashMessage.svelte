<script lang="ts">
  import { page } from '$app/stores'

  $: flashMessage = $page.data.flashMessage
</script>

{#if flashMessage}
  <div class="alert alert-{flashMessage.type}" role="alert">
    {flashMessage.message}
  </div>
{/if}
