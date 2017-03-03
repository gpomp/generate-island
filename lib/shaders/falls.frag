precision highp float;

uniform float time;
uniform sampler2D texture;
varying float v_alpha;

void main() {
  // gl_FragColor = texture2D(texture, gl_PointCoord);
  // gl_FragColor.a *= v_alpha;
  gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
