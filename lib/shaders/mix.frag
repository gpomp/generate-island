precision highp float;
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D tBlur;
uniform sampler2D tMask;
uniform float time;
uniform vec2 resolution;

void main() {
  vec3 diffCol = texture2D(tDiffuse, vUv).rgb;
  vec4 blurCol = texture2D(tBlur, vUv);
  vec3 f1 = mix(diffCol, blurCol.rgb, blurCol.a);
  // float n = snoise3(vec3(vUv - vec2(0.5), time) * 20.0) * 0.01;
  vec2 mVuV = vUv - vec2(0.5);
  mVuV.x *= resolution.x / resolution.y;

  float mask = texture2D(tMask, mVuV + vec2(0.5)).r;

  // vec2 modUv = vec2((vUv.x - 0.5) * -1.0 + 0.5, vUv.y);
  // diffCol = texture2D(tDiffuse, modUv).rgb;
  // blurCol = texture2D(tBlur, modUv);
  // vec3 f2 = mix(diffCol, blurCol.rgb, blurCol.a);

  // gl_FragColor = vec4(mix(f1, vec3(1.0) - f1, mask), 1.0);
  gl_FragColor = vec4(f1, 1.0);
}
