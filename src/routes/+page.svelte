<script>
  import FlashMessage from './FlashMessage.svelte'
  import UserAvatar from './UserAvatar.svelte'
</script>

<FlashMessage />

<h3>Form actions (+ redirect):</h3>

<UserAvatar />

<br />

<form action="/account?/login" method="post">
  <button type="submit">Log me in</button>
</form>

<form action="/account?/logout" method="post">
  <button type="submit">Log out</button>
</form>

<h3>Link (+ redirect):</h3>

<a href="/protected"> Go to /protected </a>
