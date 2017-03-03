
attribute vec3 offset;
attribute vec3 realPos;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
