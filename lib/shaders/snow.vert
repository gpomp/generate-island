#pragma glslify: cnoise = require(glsl-curl-noise);

attribute vec4 position;
attribute vec2 uv;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

uniform float time;
attribute float speed;

varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position.xyz;
  // pos.y = 0.5 - mod(time + speed, 1.0);
  // gl_PointSize = 2.0;
  vec3 c = pos + vec3(-time, sin(time), time);
  vec3 noisePos = cnoise(c * 10.0);
  noisePos += cnoise(c * 2.0) * 0.5;
  pos += noisePos * 0.2;

  // vec4 worldPosition = modelMatrix * vec4( pos.xyz, 1.0 );
  // vec4 mvPosition = viewMatrix * worldPosition;

  vec4 worldPosition = modelMatrix * vec4( pos.xyz, 1.0 );
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_PointSize = (1000.0 + (speed * 2.0 - 1.0) * 200.0) / length( mvPosition.xyz );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
