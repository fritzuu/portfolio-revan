# Creature reference sprites

Workspace assets: `public/sprites/jekek.png` and `public/sprites/darkrai.png`.
Prepared with the built-in **imagegen** tool, transparent background enabled. Source designs supplied by Revan in this chat. Phaser loads the local PNGs and samples them into 128px textures; row offsets animate coils/tail and ghost wisps. Source PNGs remain untouched during gameplay.

## Jekek prompt

Use case: background-extraction. Asset: pixel game sprite. Edit target: supplied golden coiled python pixel artwork. Remove ONLY white background and pink border, including white holes inside its coiled body, to actual transparent alpha. Preserve the supplied snake silhouette, front-facing head, coils, raised tail, tongue, exact blocky black outline and golden brown yellow patterns. No redesign, no added shadow, no smoothing, no text, no border. Center the isolated snake tightly in a square transparent canvas, preserving crisp square pixel edges.

## Darkrai prompt

Use case: background-extraction. Asset: pixel game sprite. Edit target: supplied pixel Darkrai. Remove the large black background to real transparent alpha, retaining Darkrai's complete black body silhouette as opaque. Preserve the original design precisely: wispy gray-white head plume, single bright blue eye, bright red angular necklace collar, black shadow body, lifted curling arms and pointed hanging lower body. Retain coarse square pixel style and exact front-facing pose. Do not redesign or add effects, shadow, scenery, text, or borders. Center the isolated character tightly in a square transparent canvas. Make the black silhouette distinguishable as opaque pixels even though the input background is also black.
