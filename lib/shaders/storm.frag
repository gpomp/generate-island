precision highp float;

varying vec2 vUv;
uniform float time;
uniform sampler2D texture;
varying float timePos;
varying float rand;
// chunk(fog_pars_fragment);

void main() {
  float limMin = smoothstep(0.0, 0.05, timePos);
  float limMax = 1.0 - smoothstep(0.95, 1.0, timePos);
  gl_FragColor = texture2D(texture, gl_PointCoord);
  gl_FragColor.rgb *= rand * 0.5;
  gl_FragColor.a *= 0.5 * limMin * limMax * rand;
  // chunk(fog_fragment);
}
