let self = this;

(function main(){
    Promise.all([
            load('gl-matrix')
        ]).then(a => {
            a.forEach(b => Object.keys(b).forEach(k => self[k] = b[k]));
            draw();
        });
})();

//
// start here
//
let canvas;

function draw() {
    canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec2 aVertexTextCoord;
        varying vec2 fragTextCoord;

        uniform mat4 uWorldMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        void main() {
            fragTextCoord  = aVertexTextCoord;
            gl_Position = uProjectionMatrix * uModelViewMatrix * uWorldMatrix * aVertexPosition;
        }
    `;
    const fsSource = `
        precision mediump float;
        
        varying vec2 fragTextCoord;
        uniform sampler2D sampler;

        void main() {
            gl_FragColor = texture2D(sampler, fragTextCoord);
        }
    `;
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexTextCoord: gl.getAttribLocation(shaderProgram, 'aVertexTextCoord')
        },
        uniformLocations: {
            worldMatrix: gl.getUniformLocation(shaderProgram, 'uWorldMatrix'),
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };
    drawScene(gl, programInfo, initBuffers(gl))
}


//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Create the shader program
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
  
    return shaderProgram;
}
  
//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
  
    gl.shaderSource(shader, source);
  
    // Compile the shader program
  
    gl.compileShader(shader);
  
    // See if it compiled successfully
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
  
    return shader;
}

const boxVertices = 
[ // X, Y, Z           U, V
    // Top
    -1.0, 1.0, -1.0,   0, 0,
    -1.0, 1.0, 1.0,    0, 1,
    1.0, 1.0, 1.0,     1, 1,
    1.0, 1.0, -1.0,    1, 0,

    // Left
    -1.0, 1.0, 1.0,    0, 0,
    -1.0, -1.0, 1.0,   1, 0,
    -1.0, -1.0, -1.0,  1, 1,
    -1.0, 1.0, -1.0,   0, 1,

    // Right
    1.0, 1.0, 1.0,    1, 1,
    1.0, -1.0, 1.0,   0, 1,
    1.0, -1.0, -1.0,  0, 0,
    1.0, 1.0, -1.0,   1, 0,

    // Front
    1.0, 1.0, 1.0,    1, 1,
    1.0, -1.0, 1.0,    1, 0,
    -1.0, -1.0, 1.0,    0, 0,
    -1.0, 1.0, 1.0,    0, 1,

    // Back
    1.0, 1.0, -1.0,    0, 0,
    1.0, -1.0, -1.0,    0, 1,
    -1.0, -1.0, -1.0,    1, 1,
    -1.0, 1.0, -1.0,    1, 0,

    // Bottom
    -1.0, -1.0, -1.0,   1, 1,
    -1.0, -1.0, 1.0,    1, 0,
    1.0, -1.0, 1.0,     0, 0,
    1.0, -1.0, -1.0,    0, 1,
];

const boxIndices =
[
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23
];

function initBuffers(gl) {

    // Create a buffer for the square's positions.
  
    const positionBuffer = gl.createBuffer();
  
    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
  
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Now create an array of positions for the square.
  
    // const positions = [
    // //    1.0,  1.0,
    //    0.0,  1.0,
    //    1.0, -1.0,
    //   -1.0, -1.0,
    // ];
  
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    // index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    // texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('create-image'))
    gl.bindTexture(gl.TEXTURE_2D, null);

    return {
      position: positionBuffer,
      index: indexBuffer,
      texture: texture
    };
}








function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	// gl.enable(gl.CULL_FACE);
	// gl.frontFace(gl.CCW);
	// gl.cullFace(gl.BACK);
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
  
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [-0.0, 0.0, -6.0]);  // amount to translate

    // Create mat4 world matrix
    const worldMatrix = mat4.create();
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponentsPosition = 3;  // pull out 2 values per iteration
        const numComponentsTextCoord = 2;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 5 * Float32Array.BYTES_PER_ELEMENT;         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
        const offsetPosition = 0;         // how many bytes inside the buffer to start from
        const offsetColor = 3 * Float32Array.BYTES_PER_ELEMENT;
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.index);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponentsPosition,
            type,
            normalize,
            stride,
            offsetPosition);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexTextCoord,
            numComponentsTextCoord,
            type,
            normalize,
            stride,
            offsetColor);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexTextCoord);
    }

    
  
    // Tell WebGL to use our program when drawing
  
    gl.useProgram(programInfo.program);

    // mat4.identity(worldMatrix);
	mat4.lookAt(modelViewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	// mat4.perspective(projectionMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
  
    // Set the shader uniforms
  
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.worldMatrix,
        false,
        worldMatrix);
  
    {
        const offset = 0;
        
        // gl.drawArrays(gl.TRIANGLE_STRIP, offset, 3);
        let xRotationMatrix = mat4.create();
	    let yRotationMatrix = mat4.create();

        const identityMatrix = mat4.create();
        mat4.identity(identityMatrix);
        let angle = 0;

        let loop = () => {
            angle = performance.now() / 1000 / 6 * 2 * Math.PI;
            mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
            mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
            mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
            gl.uniformMatrix4fv(programInfo.uniformLocations.worldMatrix, gl.FALSE, worldMatrix);

            gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.bindTexture(gl.TEXTURE_2D, buffers.texture);
            gl.activeTexture(gl.TEXTURE0);

            gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, offset);

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
