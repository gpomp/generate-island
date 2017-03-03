#define PHONG
#define USE_COLOR
varying vec3 vViewPosition;
uniform float time;
attribute vec3 color;
varying vec2 vUv;

#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif
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
  vViewPosition = - mvPosition.xyz;
  // chunk(worldpos_vertex);
  // chunk(envmap_vertex);
  // chunk(shadowmap_vertex);
  vUv = uv;
  vec4 wPos = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -wPos.xyz;
}
