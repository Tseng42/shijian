"use client";

import { useEffect, useRef, useState } from "react";

type TunableParams = {
  blueish: number;
  scale: number;
  illumination: number;
  surfaceDistortion: number;
  waterDistortion: number;
};

export type WaterRippleImageProps = Partial<TunableParams> & {
  /** Real image to distort — no built-in fallback source, so a caller always supplies genuine project imagery rather than a stock placeholder. */
  src: string;
  /** Freezes the shader's time uniform when false, instead of tearing the WebGL context down — resuming picks the ripple back up rather than restarting it. */
  playing?: boolean;
  /** Decorative by default: the image behind it carries no information text doesn't already give. */
  alt?: string;
  className?: string;
};

const VERT = `
precision mediump float;
varying vec2 vUv;
attribute vec2 a_position;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;

varying vec2 vUv;
uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_blueish;
uniform float u_scale;
uniform float u_illumination;
uniform float u_surface_distortion;
uniform float u_water_distortion;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m = m*m;
  m = m*m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

mat2 rotate2D(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

float surface_noise(vec2 uv, float t, float scale) {
  vec2 n = vec2(.1);
  vec2 N = vec2(.1);
  mat2 m = rotate2D(.5);
  for (int j = 0; j < 10; j++) {
    uv *= m;
    n *= m;
    vec2 q = uv * scale + float(j) + n + (.5 + .5 * float(j)) * (mod(float(j), 2.) - 1.) * t;
    n += sin(q);
    N += cos(q) / scale;
    scale *= 1.2;
  }
  return (N.x + N.y + .1);
}

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  uv.x *= u_ratio;

  float t = .002 * u_time;
  vec3 color = vec3(0.);
  float opacity = 0.;

  float outer_noise = snoise((.3 + .1 * sin(t)) * uv + vec2(0., .2 * t));
  vec2 surface_noise_uv = 2. * uv + (outer_noise * .2);

  float surf = surface_noise(surface_noise_uv, t, u_scale);
  surf *= pow(uv.y, .3);
  surf = pow(surf, 2.);

  vec2 img_uv = vUv;
  img_uv -= .5;
  if (u_ratio > u_img_ratio) {
    img_uv.x = img_uv.x * u_ratio / u_img_ratio;
  } else {
    img_uv.y = img_uv.y * u_img_ratio / u_ratio;
  }
  float scale_factor = 1.4;
  img_uv *= scale_factor;
  img_uv += .5;
  img_uv.y = 1. - img_uv.y;

  img_uv += (u_water_distortion * outer_noise);
  img_uv += (u_surface_distortion * surf);

  vec4 img = texture2D(u_image_texture, img_uv);
  img *= (1. + u_illumination * surf);

  color += img.rgb;
  color += u_illumination * vec3(1. - u_blueish, 1., 1.) * surf;
  opacity += img.a;

  float edge_width = .02;
  float edge_alpha = smoothstep(0., edge_width, img_uv.x) * smoothstep(1., 1. - edge_width, img_uv.x);
  edge_alpha *= smoothstep(0., edge_width, img_uv.y) * smoothstep(1., 1. - edge_width, img_uv.y);
  color *= edge_alpha;
  opacity *= edge_alpha;

  gl_FragColor = vec4(color, opacity);
}
`;

function compileShader(gl: WebGLRenderingContext, src: string, type: number) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader compile error: ${info || "unknown"}`);
  }
  return sh;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const v = compileShader(gl, vs, gl.VERTEX_SHADER);
  const f = compileShader(gl, fs, gl.FRAGMENT_SHADER);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(`Program link error: ${info || "unknown"}`);
  }
  return prog;
}

export default function WaterRippleImage({
  blueish = 0.55,
  scale = 7,
  illumination = 0.15,
  surfaceDistortion = 0.07,
  waterDistortion = 0.03,
  src,
  playing = true,
  alt = "",
  className = "",
}: WaterRippleImageProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const texRef = useRef<WebGLTexture | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animRef = useRef<number | null>(null);
  const playingRef = useRef(playing);
  const [glUnavailable, setGlUnavailable] = useState(false);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // 觸控裝置/低效能裝置或 prefers-reduced-motion 時，只畫一張靜止的水波
  // 紋理當底圖，不跑逐幀迴圈——跟其餘動效遵守同一套「靜止但不是空白」原則。
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const onChange = () => setReduceMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: true }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      setGlUnavailable(true);
      return;
    }
    glRef.current = gl;

    const program = createProgram(gl, VERT, FRAG);
    gl.useProgram(program);

    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const info = gl.getActiveUniform(program, i);
      if (!info) continue;
      uniformsRef.current[info.name] = gl.getUniformLocation(program, info.name);
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const u = uniformsRef.current;
    gl.uniform1f(u["u_blueish"], blueish);
    gl.uniform1f(u["u_scale"], scale);
    gl.uniform1f(u["u_illumination"], illumination);
    gl.uniform1f(u["u_surface_distortion"], surfaceDistortion);
    gl.uniform1f(u["u_water_distortion"], waterDistortion);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 用容器（Hero 那個會縮放的畫框）自己的尺寸，不是 window.innerWidth/innerHeight，
    // 才能正確跟著 Hero 捲動時的 pin/縮放邏輯走，而不是假設自己吃滿整個視窗。
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(u["u_ratio"], canvas.width / canvas.height);
      if (imgRef.current) {
        gl.uniform1f(u["u_img_ratio"], imgRef.current.naturalWidth / imgRef.current.naturalHeight);
      }
    };

    const loadImage = (srcUrl: string) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        imgRef.current = image;
        const texture = gl.createTexture()!;
        texRef.current = texture;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(u["u_image_texture"], 0);
        resize();
        if (reduceMotion) {
          gl.uniform1f(u["u_time"], 0);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      };
      image.src = srcUrl;
    };

    loadImage(src);
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    if (!reduceMotion) {
      const render = () => {
        if (playingRef.current) {
          gl.uniform1f(u["u_time"], performance.now());
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        animRef.current = requestAnimationFrame(render);
      };
      animRef.current = requestAnimationFrame(render);
    }

    return () => {
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (texRef.current) gl.deleteTexture(texRef.current);
      gl.useProgram(null);
      gl.deleteProgram(program);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, reduceMotion]);

  if (glUnavailable) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} aria-hidden={alt === ""} className={`h-full w-full object-cover ${className}`} />;
  }

  return (
    <div ref={wrapRef} className={`relative h-full w-full ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
      {alt && <span className="sr-only">{alt}</span>}
    </div>
  );
}

export { WaterRippleImage };
