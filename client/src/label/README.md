# Labeling App

The labeling app is probably the most complex part of the app so far. To reduce its complexity the following separation is made:

- Labeling - manage the high-level structures, figures, labels, etc
- Canvas - handle drawing interactions, rendering of figures, a lot of UI elements implemented in Leaflet

## Parts of Labeling

The various state and logic is separated into several higher-order components (HOC) each managing a separate aspect.
The layers cover things like: fetching the metadata and syncing it back to the server, manage the history state, load image data into addressable array (for path tracing algorithms).

On the other dimension, the app is split into UI components covering different parts of the screen: Sidebar, Hotkeys panel, etc.

## Canvas

Ideally Canvas should not be concerned how the data is modified or transformed, it should mostly render figures into Leaflet and respond to the interactions providing the necessary interactivity.
