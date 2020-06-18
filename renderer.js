"use strict";


const glsl = require('glslify');
const REGL = require('regl');
const mat4 = require('gl-matrix').mat4;
const vec3 = require('gl-matrix').vec3;
const vec2 = require('gl-matrix').vec2;


module.exports = function(canvas) {

  const regl = REGL({
    canvas: canvas,
    extensions: ['OES_texture_float'],
    attributes: {
      preserveDrawingBuffer: true,
    },
  });


  const randsize = 1024;


  const dRand2Uniform = new Float32Array(randsize*randsize*2);
  for (let i = 0; i < randsize * randsize; i++) {
    const r = [Math.random(), Math.random()];
    dRand2Uniform[i * 2 + 0] = r[0];
    dRand2Uniform[i * 2 + 1] = r[1];
  }


  const tRand2Uniform = regl.texture({
    width: randsize,
    height: randsize,
    data: dRand2Uniform,
    type: 'float',
    format: 'luminance alpha',
    wrap: 'repeat',
  });


  const dRand2Normal = new Float32Array(randsize*randsize*2);
  for (let i = 0; i < randsize * randsize; i++) {
    const r = vec2.random([]);
    dRand2Normal[i * 2 + 0] = r[0];
    dRand2Normal[i * 2 + 1] = r[1];
  }


  const tRand2Normal = regl.texture({
    width: randsize,
    height: randsize,
    data: dRand2Normal,
    type: 'float',
    format: 'luminance alpha',
    wrap: 'repeat',
  });


  const dRand3Normal = new Float32Array(randsize*randsize*3);
  for (let i = 0; i < randsize * randsize; i++) {
    const r = vec3.random([]);
    dRand3Normal[i * 3 + 0] = r[0];
    dRand3Normal[i * 3 + 1] = r[1];
    dRand3Normal[i * 3 + 2] = r[2];
  }


  const tRand3Normal = regl.texture({
    width: randsize,
    height: randsize,
    data: dRand3Normal,
    type: 'float',
    format: 'rgb',
    wrap: 'repeat',
  });

  // Instead of rendering directly to the display each frame, we’ll create two framebuffers (essentially, textures that can be rendered to), and alternate reading and writing to them each frame. Once we’ve rendered to our current write framebuffer, we’ll render it to the screen

  const pingpong = [
    regl.framebuffer({width: canvas.width, height: canvas.height, colorType: 'float'}),
    regl.framebuffer({width: canvas.width, height: canvas.height, colorType: 'float'}),
  ];

// implement variables ping and count and set them to 0


  const cSample = regl({
    vert: glsl('./glsl/sample.vert'),
    frag: glsl('./glsl/sample.frag'),
    // create object attributes that holds array positions of the screen
    uniforms: {
      invpv: regl.prop('invpv'),
      eye: regl.prop('eye'),
      source: regl.prop('source'),
      tRand2Uniform: tRand2Uniform,
      tRand2Normal: tRand2Normal,
      tRand3Normal: tRand3Normal,
      model: regl.prop('model'),
      resolution: regl.prop('resolution'),
      rand: regl.prop('rand'),
      atom_roughness: regl.prop('atom_roughness'),
      coffee_roughness: regl.prop('coffee_roughness'),
      light_radius: regl.prop('light_radius'),
      light_intensity: regl.prop('light_intensity'),
      light_angle: regl.prop('light_angle'),
      bounces: regl.prop('bounces'),
      focal_plane: regl.prop('focal_plane'),
      focal_length: regl.prop('focal_length'),
      antialias: regl.prop('antialias'),
      randsize: randsize,
    },
    framebuffer: regl.prop('destination'),
    viewport: regl.prop('viewport'),
    depth: { enable: false },
    count: 6,
  });


  const cDisplay = regl({
    vert: glsl('./glsl/display.vert'),
    frag: glsl('./glsl/display.frag'),
    attributes: {
      position: [-1,-1, 1,-1, 1,1, -1,-1, 1,1, -1,1],
    },
    uniforms: {
      source: regl.prop('source'),
      count: regl.prop('count'),
    },
    framebuffer: regl.prop('destination'),
    viewport: regl.prop('viewport'),
    depth: { enable: false },
    count: 6,
  });


  function sample(opts) {
    // create constant view that is a mat4 with built in function lookAt
    // arguments are [], opts.eye, opts.target, [0, 1, 0] 
    const projection = mat4.perspective([], Math.PI/3, canvas.width/canvas.height, 0.1, 1000);
    const pv = mat4.multiply([], projection, view);
    const invpv = mat4.invert([], pv);

    cSample({
      invpv: invpv,
      eye: opts.eye,
      resolution: [canvas.width, canvas.height],
      rand: [Math.random(), Math.random()],
      model: opts.model,
      destination: pingpong[1 - ping],
      source: pingpong[ping],
      atom_roughness: opts.atom_roughness,
      coffee_roughness: opts.coffee_roughness,
      light_radius: opts.light_radius,
      light_intensity: opts.light_intensity,
      light_angle: opts.light_angle,
      bounces: opts.bounces,
      focal_plane: opts.focal_plane,
      focal_length: opts.focal_length,
      antialias: opts.antialias,
      viewport: {x: 0, y: 0, width: canvas.width, height: canvas.height},
    });
    count++;
    ping = 1 - ping;
  }


  function display() {
    cDisplay({
      destination: null,
      source: pingpong[ping],
      count: count,
      viewport: {x: 0, y: 0, width: canvas.width, height: canvas.height},
    });
  }

// function reset 
// regl.clear ->
//    -> {color: [0,0,0,1], depth: 1, framebuffer: pingpong[0]}
//    -> {color: [0,0,0,1], depth: 1, framebuffer: pingpong[1] }
// set count to 0

// function resize with arg resolution
// canvas.height = canvas.width = resolution;
// pingpong[i].resize with args canvas width and height, do with 0 and 1
// reset at end

  // return the data structure with values sample, display, reset, resize. Assign the keys with the same values

}
