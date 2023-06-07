<script lang="ts">
  import { page } from '$app/stores'

  $: user = $page.data.user
</script>

{#if user?.id}
  <div class="avatar">
    <img
      class="image"
      src="https://ui-avatars.com/api/?name={user.id}&size=128"
      alt=""
    />
    <div class="status-indicator" />
  </div>
{/if}

<style>
  .avatar {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
  }

  .image {
    border-radius: 50%;
    width: 32px;
    height: 32px;
  }

  .status-indicator {
    position: absolute;
    right: 0;
    bottom: 0;
    border: 2px solid #fff;
    border-radius: 50%;
    background-color: #2ecc71;
    width: 8px;
    height: 8px;
  }
</style>
