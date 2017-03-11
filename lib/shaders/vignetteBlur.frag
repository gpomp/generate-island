precision highp float;
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tBlur;
uniform float radius;
uniform float glow;
uniform float time;
uniform float speed;
uniform vec2 mousePos;

void main () {
  float dist = clamp(distance(vUv, vec2(0.5, 0.5)) / radius, 0.0, 1.0);

  vec3 baseColor = texture2D(tDiffuse, vUv).rgb;
  float lim = 0.075 + sin(time) * 0.075 + speed;
  float rawNoise = snoise3(vec3(vUv, time * 2.0) * 20.0);
  float noise = clamp((rawNoise + 1.0) * 0.5 * lim, 0.0, lim);
  vec3 blurColor = texture2D(tBlur, vUv).rgb;
  float mouseRatio = floor(1.0 - clamp(distance(vUv, mousePos) / (0.1 + noise), 0.0, 1.0) + 0.5);
  // vec3 mixColor = mix(baseColor, blurColor, dist);
  // vec2 mvUv = vUv - vec2(0.5);
  // float distCircle = sqrt(mvUv.x * mvUv.x + mvUv.y * mvUv.y);
  // float distn = floor((distCircle + noise) / 0.4); // snoise2(vUv - vec2(0.5)) *   
  vec3 glowCol = clamp(blurColor - baseColor, 0.0, 1.0) * glow;
  vec3 bgCol = mix(1.0 - glowCol, clamp(baseColor * 2.0, 0.0, 1.0), mouseRatio * 0.5 + 0.5);
  // gl_FragColor.rgb = mix(bgCol, abs(floor((rawNoise + 1.0) * 0.5 + 0.5) - glowCol), mouseRatio);
  gl_FragColor.rgb = bgCol;
  gl_FragColor.a = 1.0;
}
