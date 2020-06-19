"use strict";
// https://modelviewer.dev/examples/model-formats.html


const Trackball = require('trackball-controller');
const dat = require('dat.gui');
const saveAs = require('file-saver').saveAs;
const createRenderer = require('./renderer.js');


// const canvas = document.getElementById('render-canvas');
const canvas = document.getElementsByTagName("canvas");



const renderer = createRenderer(canvas);

var camera = null;
var interactor = null; 
var transforms = null; 
var sceneTime = 0.0; 
var ball = []; 
var BALL_GRAVITY = 9.8; 
var NUM_BALLS = 50; 
function generatePosition(){ 
  var x = Math.floor(Math.random()*50); 
  var y = Math.floor(Math.random()*30)+50; 
  var z = Math.floor(Math.random()*50);
  var flagX = Math.floor(Math.random()*10); 
  var flagZ = Math.floor(Math.random()*10); 
  if (flagX >= 5) {x=-x;} 
  if (flagZ >= 5) {z=-z;} return [x,y,z];
} 
 
 function BouncingBall(){ 
   this.position = generatePosition(); 
   this.H0 = this.position[1]; //y-coord
   this.V0 = 0; 
   this.VF = Math.sqrt(2 * BALL_GRAVITY * this.H0);
   this.HF = 0; 
   this.bouncing_time = 0;
    this.BOUNCINESS = (Math.random()+0.5); 
    this.color = [Math.random(), Math.random(), Math.random(),1.0];
  } 
  BouncingBall.prototype.update = function(time) {
     //update time 
     var t = time - this.bouncing_time; 
     //update position 
     var h = this.position[1]; 
     // y-coordinate 
     h = this.H0 + (this.V0 * t) - (0.5 * BALL_GRAVITY * t * t);
     if (h <= 0){ 
       //bounce
        this.bouncing_time = time; 
        this.V0 = this.VF * this.BOUNCINESS; 
        this.HF = (this.V0 * this.V0) / (2 * BALL_GRAVITY); 
        this.VF = Math.sqrt(2*BALL_GRAVITY* this.HF); 
        this.H0 = 0; 
      } else{ this.position[1] = h; }
     } 
    function configure(){ 
      gl.clearColor(0.3,0.3,0.3, 1.0);
      gl.clearDepth(100.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL); //Creates and sets up the camera location 
      camera = new Camera(CAMERA_ORBITING_TYPE); 
      camera.goHome([0,2,70]); 
      camera.setFocus([0.0,0.0,0.0]); 
      camera.hookRenderer = draw; //Creates and sets up the mouse and keyboard interactor
      interactor = new CameraInteractor(camera, document.getElementById('render-canvas')); 
      //Scene Transforms
       transforms = new SceneTransforms(camera); 
       //init transforms
        transforms.init(); 
    } /** * Loads the scene */ 
    function load() { 
      Floor.build(80,2); 
      Scene.addObject(Floor);
       for (var i=0;i<NUM_BALLS;i++) { 
         ball.push(new BouncingBall()); 
         var loader = new THREE.GLTFLoader();
				 loader.load( 'model.gltf', function ( gltf ) {
					gltf.scene.traverse( function ( node ) {
						if ( node.isMesh ) mesh = node;
					}); 
        });
        }} 
       
    function draw() { 
      gl.viewport(0, 0, c_width, c_height); 
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      transforms.updatePerspective();
      try{ gl.uniform1i(prg.uUpdateLight,updateLightPosition); 
      for (var i = 0; i < Scene.objects.length; i++) { var object = Scene.objects[i]; 
      transforms.calculateModelView();
       transforms.push(); 
       if (object.alias.substring(0,4) == 'ball') { 
         var index = parseInt(object.alias.substring(4,8)); 
         var ballTransform = transforms.mvMatrix; 
         mat4.translate(ballTransform,ball[index].position);
          object.diffuse = ball[index].color; } 
          transforms.setMatrixUniforms(); 
          transforms.pop(); 
          //Setting uniforms 
          gl.uniform4fv(prg.uMaterialDiffuse, object.diffuse); 
          gl.uniform4fv(prg.uMaterialSpecular, object.specular);
          gl.uniform4fv(prg.uMaterialAmbient, object.ambient);
          gl.uniform1i(prg.uWireframe,object.wireframe); 
          gl.uniform1i(prg.uPerVertexColor, object.perVertexColor);
           //Setting attributes 
          gl.enableVertexAttribArray(prg.aVertexPosition); 
          gl.disableVertexAttribArray(prg.aVertexNormal); 
          gl.disableVertexAttribArray(prg.aVertexColor);
          gl.bindBuffer(gl.ARRAY_BUFFER, object.vbo);
          gl.vertexAttribPointer(prg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(prg.aVertexPosition); 
          if(!object.wireframe){ 
            gl.bindBuffer(gl.ARRAY_BUFFER, object.nbo);
            gl.vertexAttribPointer(prg.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(prg.aVertexNormal);
           } 
          if (object.perVertexColor){ 
            gl.bindBuffer(gl.ARRAY_BUFFER, object.cbo);
            gl.vertexAttribPointer(prg.aVertexColor,4,gl.FLOAT, false, 0,0);
            gl.enableVertexAttribArray(prg.aVertexColor); 
          } 
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
          if (object.wireframe){ 
            gl.drawElements(gl.LINES, object.indices.length, gl.UNSIGNED_SHORT,0);
          }
          else {
             gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT,0);
          }
          gl.bindBuffer(gl.ARRAY_BUFFER, null);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); 
        } 
      } 
      catch(err) {
         alert(err); 
         console.error(err.description); 
        } 
      } 
      var animationRate = 15; /* 15 ms */ 
      var elapsedTime = undefined; 
      var initialTime = undefined; 
      function animate() { 
        for (var i = 0; i<ball.length; i++) { 
          ball[i].update(sceneTime); 
        } 
      sceneTime += 33/1000;
       //simulation time 
       draw(); 
      } 
      function onFrame() {
         elapsedTime = (new Date).getTime() - initialTime; 
         if (elapsedTime < animationRate) {
            return;
          }
          //come back later
         var steps = Math.floor(elapsedTime / animationRate); 
         while(steps > 0){ 
           animate(); steps -= 1; 
          } 
          initialTime = (new Date).getTime(); 
        } 
        function startAnimation(){ 
          initialTime = (new Date).getTime(); 
          setInterval(onFrame,animationRate/1000); 
          // animation rate 
        } 


function reflow() {
  if (window.innerHeight > window.innerWidth) {
    // canvas.style.width = '100%';
    // canvas.style.height = `${canvas.clientWidth}px`;
  } else {
    // canvas.style.height = '100%';
    // canvas.style.width = `${canvas.clientHeight}px`;
  }
};


const Control = function() {
  this.resolution = 512;
  this.samples = 1;
  this.converge = true;
  this.antialias = true;
  this.saveButton = function() {
    canvas.toBlob(function(blob) {
      saveAs(blob, "caffeine.png");
    });
  }
  this.atom_roughness = 0.0;
  this.roughness = 0.0;
  this.light_radius = 4.0;
  this.light_intensity = 4.1;
  this.light_angle = 4.73;
  this.bounces = 3;
  this.focal_plane = 3.0;
  this.focal_length = 0.1;
}

const control = new Control();
const gui = new dat.GUI({width: 300});
if(gui) {
gui.add(control, 'resolution', [128, 256, 512, 1024, 2048]).name('Resolution').onChange(function() {
  renderer.resize(control.resolution)
});
gui.add(control, 'samples').name('Samples/Frame').min(1).max(16).step(1);
gui.add(control, 'antialias').name('Antialias').onChange(renderer.reset);
gui.add(control, 'converge').name('Converge');
gui.add(control, 'atom_roughness').name('Atom Roughness').min(0).max(1).onChange(renderer.reset);
gui.add(control, 'roughness').name('Roughness').min(0).max(1).onChange(renderer.reset);
gui.add(control, 'light_radius').name('Light Radius').min(0.01).max(4.0).onChange(renderer.reset);
gui.add(control, 'light_intensity').name('Light Intensity').min(0.01).max(16.0).onChange(renderer.reset);
gui.add(control, 'light_angle').name('Light Angle').min(0).max(Math.PI*2).onChange(renderer.reset);
gui.add(control, 'bounces').name('Bounces').min(0).max(10).step(1).onChange(renderer.reset);
gui.add(control, 'focal_plane').name('Focal Plane').min(-5).max(5).onChange(renderer.reset);
gui.add(control, 'focal_length').name('Focal Length').min(0).max(1).onChange(renderer.reset);
gui.add(control, 'saveButton').name('Save Image');
}
// const trackball = new Trackball(canvas, {
//   drag: 0.05,
//   onRotate: renderer.reset,
// });

// trackball.spin(17, 47);


function loop() {
  reflow();
  const eye = [0, 0, 10];
  const target = [0, 0, 0];
  for (let i = 0; i < control.samples; i++) {
    renderer.sample({
      eye: eye,
      target: target,
      model: trackball.rotation,
      atom_roughness: control.atom_roughness,
      roughness: control.roughness,
      light_radius: control.light_radius,
      light_intensity: control.light_intensity,
      light_angle: control.light_angle,
      bounces: control.bounces,
      focal_plane: control.focal_plane,
      focal_length: control.focal_length,
      antialias: control.antialias,
    });
  }
  renderer.display();
  if (!control.converge) renderer.reset();
  requestAnimationFrame(loop);
}



requestAnimationFrame(loop);
