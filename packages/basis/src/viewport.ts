/**
 * -   `scrollX`: The horizontal scroll position of the canvas.
-   `scrollY`: The vertical scroll position of the canvas.
-   `zoom`: An object containing the current zoom level (`value`).
-   `width`: The width of the canvas area in the browser window.
-   `height`: The height of the canvas area in the browser window.
-   `offsetLeft`: The horizontal offset of the canvas from the left edge of the window.
-   `offsetTop`: The vertical offset of the canvas from the top edge of the window.
 */

export type Viewport = Readonly<{
  scrollX: number;
  scrollY: number;
  zoom: { value: number };
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
}>;

export type FrameNameBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
};