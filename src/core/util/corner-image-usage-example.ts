// Example usage of the corner image with drawEngine methods

import { drawEngine } from "@/core/draw-engine";
import { GameAssets } from "@/game/game-assets";

// Usage examples:

// 1. Draw on background layer (ctx1)
drawEngine.drawBackgroundImage(GameAssets.cornerImage, x, y);

// 2. Draw on foreground layer (ctx2) 
drawEngine.drawForegroundImage(GameAssets.cornerImage, x, y);

// 3. Draw on UI layer (ctx3)
drawEngine.drawUIImage(GameAssets.cornerImage, x, y);

// 4. Draw mirrored
drawEngine.drawBackgroundImage(GameAssets.cornerImage, x, y, true);

// 5. Draw with custom size
drawEngine.drawBackgroundImage(GameAssets.cornerImage, x, y, false, 32, 32);

// Note: The image is 16x16 with transparent background and purple4 colored 3x3 corners
// It can be used as a selection indicator, cursor, or any other UI element
