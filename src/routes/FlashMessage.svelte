<script lang="ts">
  import { page } from '$app/stores'
  import { invalidate } from '$app/navigation'

  $: flashMessage = $page.data.flashMessage

  const dismiss = () => {
    invalidate('flashMessage')
  }
</script>

{#if flashMessage}
  <div role="alert" class="alert alert-{flashMessage.type}">
    <span>{flashMessage.message}</span>
    <button class="btn-close" type="button" title="Dismiss" on:click={dismiss}>
      <span>&times;</span>
    </button>
  </div>
{/if}

<style>
  .alert {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 0.25rem;
    padding: 0.75rem 1.25rem;
  }

  .alert-success {
    border-color: #c3e6cb;
    background-color: #d4edda;
    color: #155724;
  }

  .alert-danger {
    border-color: #f5c6cb;
    background-color: #f8d7da;
    color: #721c24;
  }

  .alert-warning {
    border-color: #ffeeba;
    background-color: #fff3cd;
    color: #856404;
  }

  .alert-info {
    border-color: #bee5eb;
    background-color: #d1ecf1;
    color: #0c5460;
  }

  .btn-close {
    appearance: none;
    cursor: pointer;
    margin-left: auto;
    border: 0;
    background: transparent;
    padding: 0;
    font-size: 1rem;
  }
</style>
