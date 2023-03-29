<script lang="ts">
  import { MainScene } from '$lib/MainScene';
  import { onMount } from 'svelte';
  let el: HTMLCanvasElement;
  let scene: MainScene;

  onMount(() => {
    scene = new MainScene({ root: el, width: el.clientWidth, height: el.clientHeight });
  });
</script>

<svelte:head>
  <title>Adventure</title>
  <meta name="description" content="Adventure" />
</svelte:head>

<canvas bind:this={el} style="width: 100vw; height: 100vh;" />
