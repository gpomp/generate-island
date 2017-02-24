precision highp float;

varying vec2 vUv;
uniform float time;
uniform sampler2D texture;
// chunk(fog_pars_fragment);

void main() {
  
  gl_FragColor = texture2D(texture, gl_PointCoord);
  gl_FragColor.a *= 0.1;
  // chunk(fog_fragment);
}
