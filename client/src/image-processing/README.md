# Live-Wire

Implementation of Live-Wire algorithm using Dijkstra.

The variant implemented is described in the following paper: Flexible Live-Wire:
Image Segmentation with Floating Anchors by Summa, Brian and Faraj, Noura and Licorish, Cody and Pascucci, Valerio
[pdf](https://www.cs.tulane.edu/~bsumma/pdfs/Flexible_Livewire.pdf) [web](http://www.cs.tulane.edu/~bsumma/publications/flexible_livewire/index.html).

## General Algorithm Overview

Given anchor areas as sets of points, find a path that goes through each area in the given order and minimizes the total sum of the path lengths. The path length is defined by the inverse (reciprocal or a complement) of the difference between pixels orthogonal to the path. I.e. the path wants to go along the edges.

Using the Dijkstra path-finding algorithm, find sets of paths with the corresponding lengths between each consecutive pair of anchor sets. Then connect the paths in such a way that the goal conditions are satisfied closing the loop.

In practice, after each iteration of the Dijkstra algorithm, the collected paths are extended in the next iteration and finally the algorithm chooses one final path and follows its history to recover the full loop.

## Practical Considerations

A natural way to express the differences between adjacent pixels is to calculate the Sobel filter of the image or similar. Usually that is achieved by running 2 passes of convolution with a 3x3 kernel to get the vertical and horizontal filtered images and combining the two.

In practice, calculating the filter of the whole image can be too costly on a large image, especially when interactivity is important and the environment in single-threaded (web browser and JavaScript).

Hence, in this implementation the algorithm is calculating the differences on the go, and unlike Sobel filter only the difference between 2 or 4 pixels is considered.

To make smoother paths, we consider moving in eight different directions between pixels. But to make the calculations more even, the difference on the diagonal steps produce path lengths multiplied by sqrt(2).

There was an attempt to calculate Sobel filters on GPU using WebGL 1.0, but I found the approach to be too slow (perhaps the time it takes to copy the image to a texture is too long).

## Optimizations

A possible optimization is algorithmic - heuristics such as A\* relying on manhattan distance or similar. I found these heuristics to not have a significant effect in this project. It is hard to come up with a good heuristic since the paths depend on the image edges - something that is hard to predict in advance.

Reducing the search space - a heuristic that improves the performance drastically in expense of accuracy. Instead of searching a path between two anchor sets through the whole image, only consider points in the bounding box. This speeds up the algorithm as the considered search space typically is orders of magnitude smaller. That might lead to inaccurate paths, that require more inputs from the user if the best path is a giant arc that goes outside of the bounding box and comes back in the end. This also means that the diagonal paths are searched better than strictly horizontal or strictly vertical ones (as the bounding box sides are parallel to the axes).

# Segmentation Vectorization

Some ML models return the semantic segmentation in a format of a bitmap image, where each pixel is labeled with an integer corresponding to a label. Since this labeling app works in vector shapes, rather than pixel-perfect labels, there is a need for an algorithm to vectorize the bitmaps.

It turns out a simple algorithm catches most of the cases well enough.

First, run BFS and separate each connected component of a different color/label. Logically this operation creates separate bitmaps for each labeled segment, although we never explicitly store the bitmaps.

Then starting from the left-most pixel of the top-most row belonging to each segment, start tracing in the clock-wise direction. The traversal of the shape is simple if we consider the 2x2 squares of pixels and calculate the direction of movement based on that. In code, this is implemented by manually specifying the direction change based on the 4-bit bitmask representing the four pixels, where 1 means the pixel belongs to the segment and 0 means it doesn't.

```
+-------+-------+
|       |       |
|   0   |   1   |
|       |       |
+-------P-------+
|       |       |
|   3   |   2   |
|       |       |
+-------+-------+
```

The diagram above shows the order of pixels represented in the mask, where P is an imaginary point. There is an assumption that the traversal is happening on the outer edge in the clock-wise direction, so the shape is always on the right.

After the traversal comes back to the left-most pixel of the top-most row the algorithm terminates.

Note, that this algorithm can handle both convex and non-convex shapes. But it fails to traverse the holes in the shapes (like a doughnut or a bagel shape). For the most part this is acceptable, since the current version of the labeling app doesn't provide tools to draw such shapes in the user interface anyway.
