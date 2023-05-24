<script>
  export let data

  $: console.log(data?.session)
</script>

<form action="/account?/login" method="post">
  <button type="submit">Log me in</button>
</form>

<form action="/account?/logout" method="post">
  <button type="submit">Log out</button>
</form>
