<script lang="ts">
  import { Player } from '$lib/Player';
  import { MainScene } from '$lib/MainScene';
  import { onMount } from 'svelte';

  import { characters } from '$lib/characters';
  const charactersMap = new Map(characters.map((c) => [c.name, c]));

  let el: HTMLCanvasElement;
  let scene: MainScene;
  let character: Player;

  onMount(() => {
    scene = new MainScene({ root: el, width: el.clientWidth, height: el.clientHeight });
    scene.addCharacter(new Player(charactersMap.get('Fox')!));
  });
</script>

<svelte:head>
  <title>Adventure</title>
  <meta name="description" content="Adventure" />
</svelte:head>

<canvas bind:this={el} style="width: 100vw; height: 100vh;" />
<svelte:window
  on:keydown|preventDefault={(event) => scene.onKeyDown(event)}
  on:keyup|preventDefault={(event) => scene.onKeyUp(event)}
/>
