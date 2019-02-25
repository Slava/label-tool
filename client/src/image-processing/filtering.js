import { vertexShader, fragmentShader } from './shaders';
import webglUtils from './webgl-utils';

// Code copied and later modified from this example:
// https://webglfundamentals.org/webgl/lessons/webgl-image-processing-continued.html

const kernels = {
  gaussianBlur: [
    1 / 16,
    1 / 8,
    1 / 16,
    1 / 8,
    1 / 4,
    1 / 8,
    1 / 16,
    1 / 8,
    1 / 16,
  ],
  unsharpen: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  sobelHorizontal: [
    47 / 47,
    162 / 47,
    47 / 47,
    0,
    0,
    0,
    -47 / 47,
    -162 / 47,
    -47 / 47,
  ],
  sobelVertical: [
    47 / 47,
    0,
    -47 / 47,
    162 / 47,
    0,
    -162 / 47,
    47 / 47,
    0,
    -47 / 47,
  ],
  normal: [0, 0, 0, 0, 1, 0, 0, 0, 0],
};

function render(image, usedKernels, scaleFactor = 1.0) {
  const canvas = document.createElement('canvas');
  let { height, width } = image;
  height = Math.floor(scaleFactor * height);
  width = Math.floor(scaleFactor * width);
  canvas.height = height;
  canvas.width = width;

  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('webgl is not available');
  }

  // setup GLSL program
  const program = webglUtils.createProgramFromSources(gl, [
    vertexShader,
    fragmentShader,
  ]);

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordLocation = gl.getAttribLocation(program, 'a_texCoord');

  // Create a buffer to put three 2d clip space points in
  const positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, width, height);

  // provide texture coordinates for the rectangle.
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      1.0,
      1.0,
      0.0,
      1.0,
      1.0,
    ]),
    gl.STATIC_DRAW
  );

  function createAndSetupTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  }

  // Create a texture and put the image in it.
  const originalImageTexture = createAndSetupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // create 2 textures and attach them to framebuffers.
  const textures = [];
  const framebuffers = [];
  for (let ii = 0; ii < 2; ++ii) {
    const texture = createAndSetupTexture(gl);
    textures.push(texture);

    // make the texture the same size as the image
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    // Create a framebuffer
    const fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Attach a texture to it.
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
  }

  // lookup uniforms
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize');
  const kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]');
  const kernelWeightLocation = gl.getUniformLocation(program, 'u_kernelWeight');
  const flipYLocation = gl.getUniformLocation(program, 'u_flipY');

  function computeKernelWeight(kernel) {
    const weight = kernel.reduce((prev, curr) => prev + curr);
    return weight <= 0 ? 1 : weight;
  }

  function drawEffects(inputKernels) {
    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
      texcoordLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // set the size of the image
    gl.uniform2f(textureSizeLocation, width, height);

    // start with the original image
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    // don't y flip images while drawing to the textures
    gl.uniform1f(flipYLocation, 1);

    // loop through each effect we want to apply.
    inputKernels.forEach((kernel, i) => {
      // Setup to draw into one of the framebuffers.
      setFramebuffer(framebuffers[i % 2], width, height);

      drawWithKernel(kernel);

      // for the next draw, use the texture we just rendered to.
      gl.bindTexture(gl.TEXTURE_2D, textures[i % 2]);
    });

    // finally draw the result to the canvas.
    gl.uniform1f(flipYLocation, -1); // need to y flip for canvas
    setFramebuffer(null, gl.canvas.width, gl.canvas.height);
    drawWithKernel(kernels.normal);
  }

  function setFramebuffer(fbo, width, height) {
    // make this the framebuffer we are rendering to.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Tell the shader the resolution of the framebuffer.
    gl.uniform2f(resolutionLocation, width, height);

    // Tell webgl the viewport setting needed for framebuffer.
    gl.viewport(0, 0, width, height);
  }

  function drawWithKernel(kernel) {
    // set the kernel and it's weight
    gl.uniform1fv(kernelLocation, kernel);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernel));

    // Draw the rectangle.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }

  drawEffects(usedKernels);

  return canvas;
}

function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}

export async function sobelVert(image, scaleFactor) {
  await makeAsync();
  const glCanvas = render(
    image,
    //[kernels.gaussianBlur, kernels.unsharpen, kernels.sobelVertical],
    [kernels.unsharpen, kernels.sobelVertical],
    scaleFactor
  );

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = glCanvas.width;
  offscreenCanvas.height = glCanvas.height;
  const ctx = offscreenCanvas.getContext('2d');

  ctx.drawImage(glCanvas, 0, 0);
  return ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
}

export async function sobelHoriz(image, scaleFactor) {
  await makeAsync();
  const glCanvas = render(
    image,
    //[kernels.gaussianBlur, kernels.unsharpen, kernels.sobelHorizontal],
    [kernels.unsharpen, kernels.sobelHorizontal],
    scaleFactor
  );

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = glCanvas.width;
  offscreenCanvas.height = glCanvas.height;
  const ctx = offscreenCanvas.getContext('2d');

  ctx.drawImage(glCanvas, 0, 0);
  return ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
}

async function makeAsync() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}

export function pointToId(data, x, y) {
  return (data.height - y) * (data.width * 4) + x * 4;
}

export function idToPoint(data, id) {
  const x = (id % (data.width * 4)) / 4;
  const y = data.height - Math.floor(id / (data.width * 4));
  return { x, y };
}

export function readPixel(data, x, y) {
  return data.data[pointToId(data, x, y)];
}
