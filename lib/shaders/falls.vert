#define M_PI 3.1415926535897932384626433832795

uniform float time;
uniform float angle;
attribute float speed;
attribute float alpha;
varying float v_alpha;

void main() {
  v_alpha = alpha;
  vec3 pos = position;
  float dep = mod(time * speed, 1.0);
  pos.x += cos(angle) * dep * 20.0;
  pos.y += sin(angle) * dep * 20.0;
  pos.z += log((1.0 - dep) - dep * 0.4) * -15.0;

  vec4 worldPosition = modelMatrix * vec4( pos.xyz, 1.0 );
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_PointSize = (1000.0 - 100.0 * dep) / length( mvPosition.xyz );
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
