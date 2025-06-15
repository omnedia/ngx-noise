# ngx-noise

<a href="https://ngxui.com" target="_blank" style="display: flex;gap: .5rem;align-items: center;cursor: pointer; padding: 0 0 0 0; height: fit-content;">
  <img src="https://ngxui.com/assets/img/ngxui-logo.png" style="width: 64px;height: 64px;">
</a>

This library is part of the NGXUI ecosystem.
View all available components at [https://ngxui.com](https://ngxui.com)

`@omnedia/ngx-noise` is an Angular standalone component for rendering real-time, animated noise (grain) overlays on your UI. Uses canvas for performance and supports color, opacity, scale, speed, and pixel size customization. SSR-safe and written for Angular v20+ with signals.

## Features

* Animated noise/grain overlay with smooth performance (canvas-based)
* Fully customizable: pattern size, color, scale, opacity, and animation speed
* Reacts to resizing and visibility (performance-optimized)
* SSR-safe, standalone, no NgZone required
* Color can be any valid CSS color (named, hex, rgb)
* Easy drop-in for backgrounds, overlays, UI chrome

## Installation

```
npm install @omnedia/ngx-noise
```

## Usage

Import the `NgxNoiseComponent` in your Angular module or component:

```typescript
import { NgxNoiseComponent } from '@omnedia/ngx-noise';

@Component({
  ...
  imports: [
    ...
    NgxNoiseComponent,
  ],
  ...
})
```

Use the component in your template:

```html
<om-noise
  [patternSize]="250"
  [patternScaleX]="1"
  [patternScaleY]="1"
  [patternRefreshInterval]="2"
  [patternAlpha]="40"
  [color]="'rgba(0,0,0,1)'"
  styleClass="custom-noise"
></om-noise>
```

## API

```html
<om-noise
  [patternSize]="patternSize"              // Pixel size of noise pattern tile (default: 250)
  [patternScaleX]="patternScaleX"          // Horizontal scale (default: 1)
  [patternScaleY]="patternScaleY"          // Vertical scale (default: 1)
  [patternRefreshInterval]="refreshInterval" // Animation speed: smaller = faster (default: 2)
  [patternAlpha]="patternAlpha"            // Alpha channel [0-255] (default: 50)
  [color]="color"                          // CSS color: 'red', '#fff', 'rgba(...)', etc. (default: 'white')
  styleClass="your-custom-class"
></om-noise>
```

* `patternSize` (optional): Size of each noise tile (default: 250)
* `patternScaleX`, `patternScaleY` (optional): Stretch/compress noise pattern
* `patternRefreshInterval` (optional): How many frames before new noise pattern (default: 2)
* `patternAlpha` (optional): Opacity per noise pixel \[0-255] (default: 50)
* `color` (optional): CSS color for noise (any valid value)
* `styleClass` (optional): Add your own class for positioning/layout (optional)

## Styling

The noise overlay canvas fills its container. To overlay full page/background:

```css
.om-noise-canvas, .noise-overlay {
  position: absolute;
  left: 0; top: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: overlay;
}
```

You can use custom classes for local overlays, or globally for site backgrounds.

## Example

```html
<div class="noise-bg-wrapper">
  <om-noise [color]="'rgba(0,0,0,0.8)'" [patternAlpha]="80" [patternScaleX]="1.5"></om-noise>
  <h1>Text on noisy background</h1>
</div>
```

## Notes

* If you set `color` to e.g. `'red'` or `'#0af'` the noise is colored.
* For monochrome noise, use gray values (`#888` or `rgb(150,150,150)`)
* The noise effect is randomized and updated on every animation frame (by default every 2 frames)
* Resizes and visibility changes are handled automatically
* No external dependencies

## Contributing

Contributions are welcome. Please submit a pull request or open an issue to discuss your ideas.

## License

MIT
