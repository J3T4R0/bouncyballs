attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor; 
uniform mat4 uMVMatrix; 
uniform mat4 uPMatrix; 
uniform mat4 uNMatrix; 
uniform vec3 uLightPosition; 
uniform vec4 uMaterialDiffuse; 
uniform bool uWireframe; 
uniform bool uPerVertexColor; 
uniform bool uUpdateLight; 
varying vec3 vNormal; 
varying vec3 vLightRay;
varying vec3 vEyeVec; 
varying vec4 vFinalColor; 
void main(void) { 
    if (uWireframe) { 
        if (uPerVertexColor){ 
            vFinalColor = aVertexColor;
            } 
            else{ 
                vFinalColor = uMaterialDiffuse;
                } 
            } 
            //Transformed vertex position 
            vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);
             //Transformed normal position 
            vNormal = vec3(uNMatrix * vec4(aVertexNormal, 1.0)); 
            //Transformed light position 
            vec4 light = vec4(uLightPosition,1.0);
             if(uUpdateLight){ 
                 light = uMVMatrix * vec4(uLightPosition,1.0);
                } 
                //Light position
                vLightRay = vertex.xyz-light.xyz;
                //Vector Eye 
                vEyeVec = -vec3(vertex.xyz);
                //Final vertex position 
                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); 
            }
