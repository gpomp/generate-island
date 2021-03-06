#define M_PI 3.1415926535897932384626433832795
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#define PHONG
varying vec3 vViewPosition;
uniform float time;
#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif
uniform vec2 waterfalls;
varying vec2 vUv;
// chunk(common);
// chunk(uv_pars_vertex);
// chunk(uv2_pars_vertex);
// chunk(displacementmap_pars_vertex);
// chunk(envmap_pars_vertex);
// chunk(color_pars_vertex);
// chunk(morphtarget_pars_vertex);
// chunk(skinning_pars_vertex);
// chunk(shadowmap_pars_vertex);
// chunk(logdepthbuf_pars_vertex);
// chunk(clipping_planes_pars_vertex);

void main() {
  // chunk(uv_vertex);
  // chunk(uv2_vertex);
  // chunk(color_vertex);
  // chunk(beginnormal_vertex);
  // chunk(morphnormal_vertex);
  // chunk(skinbase_vertex);
  // chunk(skinnormal_vertex);
  // chunk(defaultnormal_vertex);
  // chunk(begin_vertex);
  // chunk(displacementmap_vertex);
  // chunk(morphtarget_vertex);
  // chunk(skinning_vertex);
  // chunk(project_vertex);
  // chunk(logdepthbuf_vertex);
  // chunk(clipping_planes_vertex);
  // chunk(worldpos_vertex);
  // chunk(envmap_vertex);
  // chunk(shadowmap_vertex);
  vUv = uv;
  vec3 pos = position;
  pos.z += snoise3(vec3(uv.x, uv.y, time) * 20.0) * 3.0;
  float dist = 1.0 - min(distance(vec2(waterfalls.x, waterfalls.y), uv), 0.2) / 0.2;
  pos.z += cos(dist * 10.0 + time * 200.0) * -2.0 * dist;
  vec4 wPos = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -wPos.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
