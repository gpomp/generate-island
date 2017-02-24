precision highp float;
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

varying vec2 vUv;
uniform float time;

void main() {
  float ratio = 1.0;
  float n = snoise3(vec3(vUv, time) * ratio);
  n += snoise3(vec3(vUv, time) * ratio * 2.0) * 0.5;
  n += snoise3(vec3(vUv, time) * ratio * 4.0) * 0.25;
  n += snoise3(vec3(vUv, time) * ratio * 8.0) * 0.125;
  gl_FragColor = vec4((n + 1.0) * 0.5);
  // gl_FragColor = vec4(vec3(fog), 1.0);
}
