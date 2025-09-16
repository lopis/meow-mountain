# Meow Mountain - postmortem of a 13KB game

Another [JS13k Games](https://www.js13kgames.com) just ended and I was able to preserve my 8 year streak of participating in this game jam. In this essay, I'd like to share a little about the "low-tech tech" I've used, a lot of it being techniques of low-level development that aid me in making tiny games.

## About the game

This year's "black cat" theme inspired me to make an adventure grid-based game. Over the years, I've dipped into different genres, learning new game development concepts in the process.

"Meow Mountain" is the story of a cat with magical abilities who is the protector of a mountain. The cat took too long of a nap, and accidentally let down the magic barrier that protects the mountain from evil spirits. In the process, the villagers who inhabit the moutain stopped tending to the cat altars found around the mountain. These altars are essential to the magic abilities of the cat, who now needs to fix all altars, restore the barrier, and bring peace to the mountain.

## Game concepts

### Ideas that didn't make it

This was my first time developing a grid-based game, as well as my first adventure game. The time and size restrictions meant a lot of ideas I had for lore and game mechanics were left on the cutting floor.

Initially, the cat was going to be a witch who could transform into a cat to discreetly sneak around the mountain without being seen by the villagers. The witch would use her magic powers to help the villagers by helping them have better harvests, clearing up trails they need to travel between villages, or making sure they had access to food and water. These side-quests would then motivate the villagers make offerings to the cat altars, which would then provide magic power to the witch. Obviously, this game mechanic was far too complex to implement on top of everything else.

Another idea I initially wanted to explore was to create an AI for the villagers. The villagers in the game just wander aimlesslly around their village (read more below). My initial goal was that they would live in the houses and have daily routines and jobs. They would leave home each day and go to their work place. Some of them could travel between villages. Sadly, none of this made it in the game, so their movements are mostly random.

I also invisioned a more detailed goals & achivements system, that the player could consult to know what they needed to do now. Because the quests system ended up much simpler -- repair the obelisk and the statues --  this was no longer a priority. I still show a "new goal" pop-up, but there's no way to consult the current goals.

![alt text](new_goal.png)

Finally, I planned for the player to be able to use magic for things other than restoring the magic barrier. I had invisioned conjuring spells and special attacks that would aid in the side-quests and in fighting the spirits.

### Main concept

I've been wanting to make a Zelda-style RPG game for a while. This year I finally felt confident I could pull it off. The game has a simple story: the protagonist fell into a long nap and the world in chaos. The main quest is thus to repair the barrier by finding the magic obelisk. When the player attempts to restore the barrier, they learn that they ran out of magic, so something must be wrong with the cat altar. When repairing the cat altar, the player then learns that this isn't enough to restore all their magic, and they must find all altars.

#### Story Engine

I've made use of dialogs to guide the player step by step.

![Screenshot: how long was I asleep?](how_long_was_i_sleeping.png)

I've created a simple reusable "story engine", which consumes a storyline data structure and keeps track of dialogs and game events. It's really rudimentary, as this was the first time I've implemented something like this. I've made creating a clear storyline and onboarding a priority this year because one recurring issue in JS13k is that games are confusing to players without reading lengthy manuals. But as they say:

> Ain't nobody got time for that.
> -- Plato or Einstein or something.

History shows that people don't like reading instructions. So the game starts with a bit of soft exposition. The player learns about the existance of spirits, and that this means some magic barrier has disappeared.

![Screenshot: evil spirits?](evil_spirits.png)

This also introduces the player to the combat abilities of the protagonist. Technically the first (and in fact, all of the other) spirit doesn't need to be killed. Running away is a viable strategy in this game.

![Screenshot: path to cat altar](path_to_cat_altar.png)

Whenever possible, I tried showing instead of telling. The protagonist finds themselves surrounded by thick bushes. Technically the player is free to cut through the grass and leave the home meadow. But a path in the meadow tries to prime the player to explore in the direction of the cat statue. Once the first statue is cleared, the main actions are now clear: scratch, repair the obelisk, and repair the statues. I've left 2 other mechanics unexplained for players to discover: teleporting from the other statues to the home statue, and "sleeping" at home to restore life.

![Screenshot: the magic gauge](magic.png)

The game will occasionally show a few more dialogs to guide the player, but the game progress is marked by the magic gauge. Once that gauge is full, it means the player has restore their magic power and the magic power can be restored once again.

### Reusable components

Over the years, I've learned how to implement many game development features. While modern game engines take care of most things related to sounds, images, physics, etc, in JS13k one can't afford to use a massive game engine. This means that a lot of core engine stuff has to be carefully optimized.

#### Sprites

I've written before about how I've made games without any image files (TODO: insert links to previous articles). There are different ways to achive that. Images can be proceduraly generated (e.g. the minimap in Meow Mountain), or drawn using canvas primitives (e.g. all the background images in Market Tycoon, as well as the UI elements in Meow Mountain), or images can be encodded as part of the source code.

I was inspired by (xem)[https://xem.github.io/] some years ago to strealine icon making. When I made Market Tycoon, I created my [Mini Pixelart Editor](https://lopis.github.io/mini-pixelart-editor/image-editor.html), an online pixelart editor that focuses in create pixelart with a limited palette, and then generate a string encoded version of the sprite, as long as the necessary javascript code to decode it.

(TODO: insert screenshot)

This served me well in the last years as my games were never very image-heavy so far. However, Meow Mountain has dozens of sprites, including several animations. My sprite editor became too cumbersome to use, so I ended up reverting back to plain old PNGs. PNGs can be well compressed when they use a limited palette, so this served me well for a while. However, I soon felt the need to free up some precious bytes from my game.

I wrote some scripts to aid me in encoding my PNGs to simpler strings.

- First script reads an spritesheet and chops it up into individual sprites
- The second script converts the image into an array of values, and a list of colors.
  - The list of colors contains all colors present in the image
  - The array of values contains the index of the color in the palette
  - `[[1,0,0,0,0,0,0,0],['#000000']]` then represents a 9x9 pixel transparent image with a black corner.
- The third script then encodes this information into a string
  - Since the image has only 2 colors, black and transparent, we only need to 1 bit per pixel
  - Our array becomes the number `10000000` in binary, which in base 32 is `40`.

One advantage of this method is that, because the color information is now detached from the pixel information, I can reuse the same game palette information as the rest of the game. Reusing the same sprite in different colors also becomes trivial. For my 16x16 icons, I could see a 40% reduction in sprite size, even taking into account the extra code needed to decode the images.

I'm hoping to further streamline the sprite management into a reusable npm package.

#### Font

Similarly to the sprite rendering, I've been using a pixel font where each character is a string-encoded sprite. Since text is just a single color, you can think of each letter as a 1-bit sprite. For this game I've used a 5x5 pixel font. However, unlike last year, I've improved the rendering to allow for non-square glyths. Until now, my fonts were always monospaces.

To make font-editing simpler, I use my [Mini Font Editor](https://lopis.github.io/mini-pixelart-editor/font-editor.html), which is a fork of the mini pixelart editor adapted to creating a pixelart font.

The encoded font looks like this:

```js
export const tinyFont = '6v7ic,6trd0,6to3o,6nvic,55eyo,2np50,2jcjo,3ugt8,34ao,7k,glc,1,opzc,3xdeu,3sapz,8rhfz,8ri26,1bzky,9j1ny,3ws2u,9dv9k,3xb1i,3xbmu,2t8g,2t8s,26ndv,ajmo,fl5ug,3x7nm,n75t,54br,59u0e,53if,rlev,4jrb,1yjk4,4eav,55q95,18zsz,mi3r,574tl,1aedd,ljn9,a1bd,4f1i,a1fs,549t,53ig,5832,1dwsh,6iw6,6ix0,cbsa,6gix,6fk4,aky7,7mbws,cvtyq,deehh,2sfi3'.split(',');
```

and just like for the sprites, each string like `6v7ic` is a base 32 number, which when converted to binary represents a 1-bit array of black and transparent pixels.

The rendering logic is slightly different than the sprites, but I'm hoping to also bring both together in the same reusable npm package.

#### Emoji icons

This year I also explored using pixel-art emoji icons as a way to save some precious bytes. After all, an emoji costs 2-3 bytes, while a single multi-color icon costs tens of bytes.

(TODO: add screenshot from codepen https://codepen.io/lopis/pen/gbaKYVo).

The problem is that if you just try to render emoji in the canvas, you get a blurry anti-aliased mess. What if we could somehow pre-processed emoji to retrict the color palette, as well as eliminate color and alpha anti-aliasing? The downside of this method is that devices and browsers use different emoji fonts. Unless we load an actual emoji font, we lose control of how parts of the game look like. However, I believe this goes against the spirit of JS13kGames (although others might disagree :)). This was my first attempt at this, so the code might not be the most efficient or elegant.

```ts
/**
 * Quantizes rgba color values to 8bit.
 */
const quantizeToPalette = (r: number, g: number, b: number, a: number) => {
  // 1-bit transparency
  if (a < 128) {
    return [0, 0, 0, 0]; // transparent
  }
  const qr = Math.round(r / 51) * 51;
  const qg = Math.round(g / 51) * 51;
  const qb = Math.round(b / 51) * 51;

  return [qr, qg, qb, 255];
};

/**
 * Converts an emoji to a pixelated image by quantizing the colors
 * to 8 bit and the transparency to 1 bit.
 */
export const emojiToPixelArt = (
  emoji: string,
  fontSize = 10,
): HTMLImageElement => {
  // Some emoji are a bit bigger than the font
  const spriteScale = 0.25;
  const spriteSize = Math.floor(fontSize * (1 + spriteScale));
  const padding = Math.floor(fontSize * spriteScale / 2);

  // Create temporary canvas
  const [_, tmpCtx] = createCanvasWithCtx(spriteSize, spriteSize);

  // Draw emoji in chosen font size
  tmpCtx.font = `${fontSize}px sans-serif`;
  tmpCtx.textBaseline = 'top';
  tmpCtx.clearRect(0, 0, spriteSize, spriteSize);
  tmpCtx.translate(-1, 0);
  tmpCtx.fillText(emoji, padding, padding);

  // Read pixels
  const imgData = tmpCtx.getImageData(0, 0, spriteSize, spriteSize);
  const data = imgData.data;

  // Create new image data with quantized colors
  const outImg = tmpCtx.createImageData(spriteSize, spriteSize);
  const outData = outImg.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = quantizeToPalette(
      data[i],      // red
      data[i + 1],  // green
      data[i + 2],  // blue
      data[i + 3],  // alpha
    );
    outData[i] = r;
    outData[i + 1] = g;
    outData[i + 2] = b;
    outData[i + 3] = a;
  }

  // Create a new canvas to draw the quantized image
  const [outCanvas, outCtx] = createCanvasWithCtx(spriteSize, spriteSize);
  outCtx.putImageData(outImg, 0, 0);

  // Create an image element from the canvas
  const img = new Image();
  img.src = outCanvas.toDataURL();
  return img;
};
```

#### Sound effects

Sound effects are small sound bites used in games. Meow Mountain has various sound effects when moving, attacking, taking damage, etc. As sound files are typically really large, JS13K game developers typically produce souds by rendering a sound wave and playing it with the Web Audio API. My "sound player" looks like this:

```ts
export const playSound = (f: (i: number) => number) => {
  // Create a new audio buffer.
  // This buffer has 96000 samples (audio "pixels)
  // and 48000 samples per second. More samples
  // per second allows for higher sound quality.
  const m = audioCtx.createBuffer(1,96e3,48e3);
  
  // Create an audio buffer, that will contain
  // the sound data.
  // Access a single channel data for mono sound.
  // For stereo, more channels can be used.
  const b = m.getChannelData(0);
  
  // This function expectes an f() function,
  // which generates a sound wave for each sample i
  for(let i = 96e3; i--;) b[i] = f(i);
  
  // The buffer source object controls the 
  // playback.
  const s = audioCtx.createBufferSource();

  // We connect the buffer to the source
  // and connect source to the audio destination
  // which by default is your devices speakers.
  s.buffer = m;
  s.connect(audioCtx.destination);
  
  // Start the audio.
  s.start();
};
```

The f() wave function can be any function that consumes `i` and returns a number.
For example, `f (i) => Math.sin(i)` returns a pure sine wave. The function that plays a step sound in Meow Mountain looks like this:

```ts
export const step = playSound((i: number) => {
  const n = 2e3;
  return i > n ? 0 : 0.15 * (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / n);
});
```

`Math.sin((Math.PI * i) / n)` provides a certain pitch to the sound, while `(Math.random() * 2 - 1)` provides random noise.
Noise helps the wave sound more "natural" and less like a pure wave.
In this example, `0.15` is used to reduce the amplitude of the wave (the sound volume) to 15%.

#### Music

To play music, I use an audio worklet (TODO: insert MDN link).
Worklets are small browser workers that run in the background doing some work on a separate thread, thus avoiding the main javascript thread from being blocked.
For example, to produce continuous music at a sample rate of 44000Hz, we would need to interrupt the main thread 44000 times per second. In comparison, the typical game cycle updates at 60Hz. Moving the music processing to a background worker frees up a lot of resources for the rest of the game.

Audio Worklets are a special kind of background worker that handles audio processing, and has access to special Web audio APIs not available in regular javascript, namely the `AudioWorkletProcessor` class. *I'm writing a longer article specifically about creating music with web audio, so stay tuned.*. But in essence it works the same as I described in the sound effects section. A wave function generates a stream of values that form a wave. Only in this case we continue to produce successive waves in different frequencies and amplitudes, forming a melody. In Meow Mountain, the wave function looks like this:

```ts
const SAMPLE_RATE = 40000;
const NOTE_LENGTH = SAMPLE_RATE / 4;
const BaseSound = (
  pitchOffset: number,
  sustainTime: number,
  volume: number,
  s: (t:number, p:number) => number,
) => (value: PitchLength) => {
  const [pitch, length] = value || [0, 1];
  let t = 0;
  const p = 2 ** ((pitch - pitchOffset * 12) / 12) * 1.24;
  const decay = Math.pow(0.9999, 2 / (length));
  return function render() {
    if (pitch === 0) return 0;
    ++t;
    if (t >= (length * NOTE_LENGTH)) {
      return undefined;
    };
    const sustain = t <= length * NOTE_LENGTH * sustainTime ? 1 : Math.pow(decay, t - length * NOTE_LENGTH * sustainTime);
    return s(t,p) * sustain * volume;
  };
}
```

The base sound function provides an evelope for each note, with a sustain and decay time. 
But the timbre of this sound is given by the s() param which can be something like `(t,p) => Math.tan(Math.cbrt(Math.sin((t * p) / 30)))`.
Explaining why I used tangent, cubic root, or sine in this example is beyond the scope of this article.
I encourage you to play around with wave functions to see how they sound like.

### Other game features

Now that we've explored some general technical concepts that can be reused in other games, we can delve into some game specific features.

#### "AI"

This was my first time implementing any sort of autonomous NPCs in a game. The algorithms are very rudimentary, and probably very inneficient.

(TODO: add screenshot of villagers)

##### The villager

![Screenshot: villagers](villagers.png)

The villager spawns somewhere in the radius of the village and then repeats this algorithm:

1. Look around for empty directions to move to
2. If it has a previous direction, move in that direction again with 80% chance
3. Otherwise pick another possible direction
4. Superstition subroutine
    - Look ahead 3 cells
    - While player in one of those cells, be scared
    - Repeat until player is not present
    - Otherwise, continue moving
5. Continue moving for a whole cell grid, then goto 1.

As I said above in "Ideas that didn't make it", I wanted to have complex villagers with proper paths, jobs, homes. For this first version, I decided that juts moving randomly was enough. However, this did mean that sometimes villagers get lost in the forest far awway from their home village. In particularly unlucky cases, villagers can get stuck in the player's path, making impossible to finish the game.

##### The spirit

The spirits spawn somewhere in the vincinity of their home cat altar.
They use a simple breadth-first algorithm to find a path to the player.

1. Look around in a 10x10 square for the player
2. If the player is found use breadth first search to find an empty path from the spirit to the player going around obstacles.
    - Other spirits are not seen as obstacles by the algorithm, allowing spirits to "gang up" on the player.
3. Take one step towards the player
4. Repeat

Again, this might not be the most efficient. Namely, the BFS algorithm is very simple and makes it fairly easy to evade spirits as they have a tendency to first move up and down before they move left or right. An improvement would be to move in the general direction of the player first.

#### Map generation

I wanted to create a grid-based map that felt organic and not monotonous. At the same time, I needed the map generation to be deterministic, to avoid cases where some players would find themselves on impossible-to-win maps. For this, I used a deterministic pseudo-random number generator based on a seed.
In order to do this in a size-efficient way, I developed a map-rendering algorithm:

1. Create a 160x160 grid
2. Fill the whole grid with trees
3. Empty out a list of paths in the map
    - A path is a series of coordinates and widths, for example [[10, 10, 2], [10, 20, 2], [20, 20, 3]] is a path with 3 vertexes and 2 edges, where the first segment has a width of 2 and the second segment has a width of 3.
    - For each path, apply a level of random jittering to the edges, making them look more organic.
    - Each path also can contain bushes in random cells.
4. Empty out a list of circles in the grid
    - Similarly to the paths algorithm, large circular clearings are cleared for some of the villages.
5. Place the villagers on the map from a list of villagers
    - Randomly place a number of houses within the village radius
    - Randomly place a number of villagers
    - Randomly place bushes
6. Place the cat altars on the map from a list
    - Clear a 3x3 area around the altar and fill it with bushes
    - This prevents the altar from being surrounded by trees, ensuring the player has access to it
7. Place the Obelisk in the center of the map
8. Place the starter spirit
9. Place the cat

## Final notes

In general, there's nothing revolutionary here. I was able to pack quite a bit of content in the game within the size limit. In retrospective, quite a few things could have been optimized if I had the time. Specially the things that I implemented early on when I was still not settled on all the game mechanics. The map generation is quite messy and overcomplicated at times. The NPCs could have been a bit smarter.

If you're curious about my code, the source if available on my github. (TODO: add github link)
