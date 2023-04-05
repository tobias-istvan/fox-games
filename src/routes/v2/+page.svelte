<script lang="ts">
  import { GameScene } from '$lib/GameScene';
  import { onMount } from 'svelte';
  let el: HTMLCanvasElement;
  let scene: GameScene;

  onMount(() => {
    scene = new GameScene(el);
  });
</script>

<svelte:head>
  <title>Adventure</title>
  <meta name="description" content="Adventure" />
</svelte:head>

<canvas bind:this={el} style="width: 100vw; height: 100vh;" />
