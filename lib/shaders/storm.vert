#define M_PI 3.1415926535897932384626433832795

attribute vec4 position;
attribute vec2 uv;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform vec3 stormPos;

uniform float time;
attribute float speed;
attribute float size;

varying vec2 vUv;
varying float timePos;
varying float rand;
void main() {
  vUv = uv;
  vec3 pos = vec3(0.0);
  timePos = mod(time * (speed + size), 1.0);
  rand = speed * size;

  pos.x = stormPos.x + cos(speed * M_PI * 2.0 + M_PI * 2.0 * timePos) * (25.0 * size + speed * 25.0) * (1.0 - timePos);
  pos.y = stormPos.y + sin(speed * M_PI * 2.0 + M_PI * 2.0 * timePos) * (25.0 * size + speed * 25.0) * (1.0 - timePos);
  pos.z = -55.0 + sin(time * (speed + size)) * 3.5;

  vec4 worldPosition = modelMatrix * vec4( pos.xyz, 1.0 );
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_PointSize = (1000.0 + size * 3000.0 + (speed * 2.0 - 1.0) * 400.0) / length( mvPosition.xyz );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
