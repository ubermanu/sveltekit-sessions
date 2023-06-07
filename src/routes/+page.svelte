<script>
  import FlashMessage from './FlashMessage.svelte'
  import UserAvatar from './UserAvatar.svelte'

  export let data
</script>

<FlashMessage />

<h3>Form actions (+ redirect):</h3>

<UserAvatar />

<br />

<form method="post">
  {#if data?.user?.id}
    <button type="submit" formaction="/account?/logout">Log Out</button>
  {:else}
    <button type="submit" formaction="/account?/login">Log In</button>
  {/if}
</form>

<h3>Link (+ redirect):</h3>

<a href="/protected"> Go to /protected </a>
