// Shared GLSL. Colors are written in sRGB directly (the canvas runs with
// `linear` + `flat`, so no colour management is applied on top).

export const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const noise = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
  }
`

// Slow crimson smoke over a maroon base that leans toward the cursor.
export const smokeFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uIntro;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec2 uFocus;
  varying vec2 vUv;
  ${noise}

  void main() {
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    vec2 p = (vUv - 0.5) * aspect;
    float t = uTime * 0.045;

    vec2 m = (uMouse - 0.5) * aspect;
    vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 - t + 3.1));
    float f = fbm(p * 1.3 + q * 1.9 + vec2(t * 0.7, -t) + m * 0.15);

    vec3 black   = vec3(0.059, 0.008, 0.020); // maroon base (#0f0205)
    vec3 blood   = vec3(0.290, 0.031, 0.051);
    vec3 crimson = vec3(0.898, 0.035, 0.078);

    float smoke = smoothstep(0.38, 0.95, f);
    vec3 col = mix(black, blood, smoke);

    // Warm pool of light behind the portrait + a softer one under the cursor.
    vec2 focus = (uFocus - 0.5) * aspect;
    float pool  = smoothstep(0.85, 0.0, length((p - focus) * vec2(0.9, 1.2)));
    float hover = smoothstep(0.55, 0.0, length(p - m));
    col = mix(col, crimson, pow(smoke, 2.4) * (0.22 + pool * 0.45 + hover * 0.25));
    col += blood * pool * 0.35;

    // Keep edges and the text side dark for legibility.
    float vig = smoothstep(1.25, 0.25, length(p * vec2(0.75, 1.0)));
    col = mix(black, col, vig);

    // Fade into the page black along the bottom edge.
    col = mix(vec3(0.031), col, smoothstep(0.0, 0.3, vUv.y));

    gl_FragColor = vec4(mix(black, col, uIntro), 1.0);
  }
`
