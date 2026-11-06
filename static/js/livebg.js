// Live wallpaper: brings the background art to life with one WebGL pass —
// falling code, rain, lightning over the hood, glowing/blinking eyes,
// pulsing claw slashes, flickering neon, holo scans, rippling water,
// a hovering car, drifting fog and rising sparks.
// The static .bg-wallpaper stays underneath as the fallback: if WebGL, the
// image or the device's speed isn't up to it, nothing changes. Never runs
// with prefers-reduced-motion or Save-Data. ?livebg=off disables it.
(function () {
  var cv = document.getElementById("bg-live");
  if (!cv) return;
  var qs = location.search;
  var debug = /[?&]livebg=debug/.test(qs);
  if (/[?&]livebg=off/.test(qs)) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn = navigator.connection;
  if (!debug && (reduce || (conn && conn.saveData))) return;

  var gl = null;
  try {
    gl = cv.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: "low-power" });
  } catch (e) {}
  if (!gl) return;

  var VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform vec2 uRes, uImg;
uniform float uT, uFlash, uBlink;
uniform vec4 uBolt;   // start x, seed, end x, end y

float ss(float a, float b, float x){ float t = clamp((x - a) / (b - a), 0., 1.); return t * t * (3. - 2. * t); }
float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h12(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h12(i), h12(i + vec2(1., 0.)), u.x), mix(h12(i + vec2(0., 1.)), h12(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + vec2(17.1, 9.2); a *= .5; } return s; }
float n1(float x){ float i = floor(x), f = fract(x); return mix(h11(i), h11(i + 1.), f * f * (3. - 2. * f)); }
float box(vec2 p, vec4 r, float f){ return ss(r.x - f, r.x + f, p.x) * ss(r.z + f, r.z - f, p.x) * ss(r.y - f, r.y + f, p.y) * ss(r.w + f, r.w - f, p.y); }
float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }
float flick(float t, float s){
  float win = step(.955, h11(floor(t * 1.7 + s * 3.7) + s * 13.));
  float st = step(.4, h11(floor(t * 18.) + s * 7.));
  return 1. - win * st * .55;
}
// jagged path from (x0, 0) to (x1, len); wiggle fades out at the strike point
float boltX(float y, float x0, float x1, float len, float s){
  float k = clamp(y / len, 0., 1.);
  float w = 1. - k * k;
  return mix(x0, x1, k) + w * ((n1(y * .02 + s) - .5) * 60. + (n1(y * .09 + s * 3.) - .5) * 16.) + (n1(y * .35 + s * 5.) - .5) * 5.;
}
float rainL(vec2 q, float cols, float spd, float len, float seed){
  q.x += q.y * .17;
  float cx = floor(q.x * cols);
  float h = h11(cx * 1.37 + seed);
  float y = fract(q.y * (.55 + h * .6) - uT * spd * (.75 + h * .5) + h * 11.);
  float streak = ss(1. - len, 1., y) * step(.5, h);
  float dx = abs(fract(q.x * cols) - .5) / cols * uRes.y;
  return streak * (1. - ss(.35, 1.1, dx));
}
// breathing: slow inhale (~2.2 s), slower exhale (~3 s)
float breathAmt(float t){ float ph = fract(t / 5.2); return ph < .42 ? ss(0., .42, ph) : 1. - ss(.42, 1., ph); }
// where to sample from so the hood + shoulders rise ~3px and the chest widens a touch;
// content at p shows up at roughly p - breathOff(p)
vec2 breathOff(vec2 p, float b){
  float hood = ss(1.05, .7, length((p - vec2(780., 280.)) / vec2(190., 250.)));
  float torso = ss(1.05, .7, length((p - vec2(765., 600.)) / vec2(345., 230.)));
  float m = max(hood, torso) * ss(900., 520., p.y);
  return vec2(-(p.x - 780.) * .0045, 2.8) * b * m;
}

void main(){
  float t = uT;
  // same framing as the static layer: cover, center 22%, scale(1.03)
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 c = uRes * .5;
  vec2 e = c + (p - c) / 1.03;
  float s = max(uRes.x / uImg.x, uRes.y / uImg.y);
  vec2 off = vec2((uRes.x - uImg.x * s) * .5, (uRes.y - uImg.y * s) * .22);
  vec2 ip = (e - off) / (uImg * s) * vec2(1600., 1000.);

  // ---- displacement: breathing, water ripple, cape sway, hovering car
  float br = breathAmt(t);
  vec2 d = breathOff(ip, br);
  vec2 eo = breathOff(vec2(780., 335.), br);
  float wm = max(max(box(ip, vec4(160., 690., 430., 805.), 14.), box(ip, vec4(1150., 640., 1440., 765.), 14.)), box(ip, vec4(0., 850., 390., 1010.), 18.));
  d.x += wm * sin(ip.y * .8 + t * 2.3 + sin(ip.x * .035 + t * .9) * 1.6) * 1.4;
  d.y += wm * sin(ip.x * .05 + t * 1.3) * .4;
  float below = ip.y - (600. + (ip.x - 1050.) * .51);
  float cw = ss(-10., 60., below) * ss(1050., 1380., ip.x);
  d += cw * vec2(sin(t * 1.25 + ip.y * .011 - ip.x * .006), .6 * cos(t * .95 + ip.x * .009)) * 4.5;
  float car = ss(1., .55, length((ip - vec2(1358., 411.)) / vec2(58., 24.)));
  float eyeZone = ss(1., .6, length((ip - vec2(780., 335.) + eo) / vec2(78., 24.)));
  d.y += eyeZone * uBlink * (ip.y - 335. + eo.y) * 2.6;
  d.y += car * sin(t * 1.7) * 2.2;
  vec3 col = texture2D(uTex, clamp((ip + d) / vec2(1600., 1000.), vec2(.0005), vec2(.9995))).rgb;

  float mx = max(col.r, max(col.g, col.b));
  float sat = mx - min(col.r, min(col.g, col.b));
  float lum = dot(col, vec3(.2126, .7152, .0722));
  float nm = ss(.22, .55, mx) * ss(.12, .35, sat);
  vec3 add = vec3(0.);

  // ---- matrix code: green streams fall
  float gm = ss(.06, .2, col.g - max(col.r, col.b)) * ss(400., 300., ip.y) * ss(120., 150., ip.x);
  if (gm > .001) {
    float ch = h11(floor(ip.x / 8.));
    float fl = fract(ip.y / (150. + ch * 170.) - t * (.3 + ch * .45) + ch * 7.);
    col = mix(col, col * (.3 + 1.15 * pow(fl, 1.5)), gm);
    add += vec3(.45, 1., .55) * pow(fl, 14.) * gm * .6;
  }

  // ---- neon signs: slow breath + the odd faulty-tube stutter
  float k = 1.;
  #define SIGN(R, S, B) { float m = box(ip, R, 6.) * nm; k *= mix(1., flick(t, S) * (1. + B * sin(t * (.9 + S * .17) + S * 2.1)), m); }
  SIGN(vec4(25., 30., 130., 135.), 1., .18)
  SIGN(vec4(15., 140., 125., 335.), 2., .14)
  SIGN(vec4(45., 595., 130., 790.), 3., .14)
  SIGN(vec4(190., 260., 290., 650.), 4., .12)
  SIGN(vec4(1470., 290., 1585., 770.), 5., .16)
  SIGN(vec4(1385., 490., 1445., 585.), 6., .2)
  SIGN(vec4(1305., 130., 1505., 315.), 7., .12)
  SIGN(vec4(1110., 490., 1230., 595.), 8., .12)
  SIGN(vec4(300., 55., 560., 265.), 9., .1)
  SIGN(vec4(265., 300., 500., 530.), 10., .1)
  SIGN(vec4(1285., 535., 1325., 605.), 11., .2)
  col *= k;

  // ---- holo panels: a scan band rolls down each one
  #define HOLO(R, S, C) { float b = box(ip, R, 8.); float pv = (ip.y - R.y) / (R.w - R.y); float band = exp(-pow((pv - (fract(t * .11 + S * .37) * 1.4 - .2)) * 11., 2.)); add += C * b * band * (.025 + .55 * nm); }
  HOLO(vec4(300., 55., 560., 265.), 9., vec3(.25, .85, 1.))
  HOLO(vec4(265., 300., 500., 530.), 10., vec3(.3, .7, 1.))
  HOLO(vec4(1305., 130., 1505., 315.), 7., vec3(1., .3, .6))
  HOLO(vec4(1110., 490., 1230., 595.), 8., vec3(.7, .5, 1.))

  // ---- targeting reticle: radar sweep
  vec2 rv = ip - vec2(980., 191.);
  float rr = length(rv);
  if (rr < 90.) {
    float ring = ss(60., 52., rr) * ss(3., 9., rr);
    float sw = pow(fract(atan(rv.y, rv.x) / 6.2831853 - t * .2), 12.) * ring;
    float mg = ss(.08, .28, min(col.r, col.b) - col.g) * ss(80., 60., rr);
    add += vec3(1., .25, .75) * (sw * (.07 + .9 * mg) + mg * .12 * (.5 + .5 * sin(t * 2.6)));
  }

  // ---- claw slashes: energy surges up the cuts, embers crackle
  float sb = box(ip, vec4(1010., 0., 1420., 360.), 10.);
  if (sb > .001) {
    float rm = ss(.12, .4, col.r - max(col.g, col.b) * 1.05) * sb;
    float al = dot(ip - vec2(1030., 340.), vec2(.45, -.893));
    float surge = pow(fract(al / 380. - t * .42), 7.);
    float crk = h12(floor(ip / 5.) + floor(t * 16.));
    float br = .5 + .5 * sin(t * 1.6);
    col *= 1. + rm * (.12 * br + .22 * (crk - .5));
    add += vec3(1., .22, .32) * rm * (surge * 1.1 + .1 * br);
    float sd = min(min(seg(ip, vec2(1030., 332.), vec2(1196., 0.)), seg(ip, vec2(1105., 348.), vec2(1308., 0.))), seg(ip, vec2(1165., 285.), vec2(1398., 8.)));
    add += vec3(1., .15, .3) * exp(-sd / 22.) * (.05 + .1 * br + .18 * surge) * sb;
  }

  // ---- eyes: breathing glow, a flare now and then, and a blink
  vec2 eB = (ip - vec2(742., 334.) + eo) * vec2(1., 1.6);
  vec2 eR = (ip - vec2(818., 336.) + eo) * vec2(1., 1.6);
  float db = length(eB), dr = length(eR);
  if (min(db, dr) < 160.) {
    float flare = pow(.5 + .5 * sin(t * .37), 12.);
    float pB = (.8 + .2 * sin(t * 2.2) + .3 * flare) * (.92 + .16 * br);
    float pR = (.8 + .2 * sin(t * 2.2 + 1.3) + .3 * pow(.5 + .5 * sin(t * .37 + 1.), 12.)) * (.92 + .16 * br);
    float em = min(ss(22., 8., db) + ss(22., 8., dr), 1.) * ss(.3, .7, mx);
    col *= 1. - uBlink * .92 * em;
    float on = 1. - uBlink;
    add += on * (vec3(.35, .5, 1.) * (exp(-db * db / 220.) * .9 + exp(-db / 38.) * .22) * pB
               + vec3(1., .18, .25) * (exp(-dr * dr / 220.) * .9 + exp(-dr / 38.) * .22) * pR);
  }

  // ---- hood ridge + chest line: energy drips down
  float lx = 780. + max(ip.y - 362., 0.) * .045;
  float lm = ss(12., 3., abs(ip.x - lx)) * box(ip, vec4(700., 125., 880., 780.), 20.);
  if (lm > .001) {
    float lp = ss(.1, .3, max(col.r, col.b) - col.g) * ss(.2, .5, mx);
    float ld = pow(fract(ip.y / 320. - t * .5), 10.);
    add += vec3(.72, .38, 1.) * lm * ld * (lp * 1.3 + .12);
  }

  // ---- fingerprint: biometric scan line
  vec2 fp = (ip - vec2(538., 521.) + breathOff(vec2(538., 521.), br)) / vec2(52., 60.);
  float fe = ss(1.08, .9, length(fp));
  if (fe > .001) {
    float cy = ss(.06, .25, min(col.g, col.b) - col.r);
    float sy = 455. - breathOff(vec2(538., 521.), br).y + fract(t * .26) * 135.;
    float band = exp(-pow((ip.y - sy) / 5., 2.));
    float band2 = exp(-pow((ip.y - sy) / 22., 2.));
    add += vec3(.3, 1., .95) * fe * (band * (.15 + 1.2 * cy) + band2 * .25 * cy);
  }

  // ---- RZ emblem: slow pulse
  float rzd = length(ip - vec2(793., 604.) + breathOff(vec2(793., 604.), br));
  if (rzd < 120.) {
    float pm = ss(.1, .3, max(col.r, col.b) - col.g) * ss(.25, .5, mx) * ss(52., 40., rzd);
    float rzp = .5 + .5 * sin(t * 1.5);
    add += vec3(.62, .32, 1.) * (pm * .55 * rzp + exp(-rzd * rzd / 2600.) * .09 * (.4 + rzp));
  }

  // ---- red network shoulder: nodes light up out of step
  float nb = box(ip, vec4(880., 465., 1095., 650.), 10.);
  if (nb > .001) {
    float rn = ss(.15, .4, col.r - max(col.g, col.b) * 1.1) * nb * ss(.3, .6, mx);
    col *= 1. + rn * .55 * (.5 + .5 * sin(t * 2.3 + h12(floor(ip / 24.)) * 6.283));
  }

  // ---- hovering car: nav lights
  float cd = length(ip - vec2(1380., 411.) - vec2(0., car * sin(t * 1.7) * 2.2));
  add += vec3(1., .25, .3) * (exp(-cd * cd / 8.) * 1.3 + exp(-cd / 9.) * .22) * step(.8, fract(t * .8));
  float ce = length(ip - vec2(1327., 417.) - vec2(0., car * sin(t * 1.7) * 2.2));
  add += vec3(.4, .7, 1.) * exp(-ce / 7.) * (.25 + .15 * sin(t * 9.));

  // ---- sky: drifting cloud light + lightning
  float sky = ss(430., 260., ip.y) * ss(.42, .18, lum);
  if (sky > .001) {
    float cn = fbm(ip * .0045 + vec2(t * .018, t * .006));
    add += vec3(.3, .16, .55) * sky * cn * cn * .22;
    add += vec3(.7, .62, 1.) * uFlash * sky * (.12 + cn * cn * 1.3) * .75;
  }
  if (uFlash > .01 && uBolt.w > 1. && ip.y < uBolt.w + 60.) {
    float len = uBolt.w;
    float bx = boltX(ip.y, uBolt.x, uBolt.z, len, uBolt.y);
    float dd = abs(ip.x - bx);
    float ym = ss(-6., 8., ip.y) * ss(len + 4., len - 6., ip.y);
    float y0 = len * .38;
    float dir = sign(h11(uBolt.y) - .5);
    float xb = boltX(y0, uBolt.x, uBolt.z, len, uBolt.y) + (ip.y - y0) * .7 * dir + (n1(ip.y * .12 + uBolt.y * 9.) - .5) * 12.;
    float db2 = abs(ip.x - xb) * .8;
    float yb = ss(y0, y0 + 6., ip.y) * ss(y0 + len * .4, y0 + len * .18, ip.y);
    float hit = exp(-length(ip - vec2(uBolt.z, len)) / 26.) * ss(len - 40., len, ip.y + 20.);
    add += vec3(.85, .8, 1.) * uFlash * ((exp(-dd * 1.1) * 1.8 + exp(-dd * .09) * .35 + exp(-dd * .02) * .12) * ym
                                      + (exp(-db2 * 1.3) * 1.2 + exp(-db2 * .12) * .2) * yb + hit * .6);
  }

  // ---- low fog, blue left / red right
  float fogm = ss(620., 1000., ip.y);
  if (fogm > .001) {
    float fg = fbm(ip * .0032 + vec2(t * .025, -t * .006));
    add += mix(vec3(.15, .25, .75), vec3(.8, .12, .3), ss(450., 1150., ip.x)) * fogm * fg * fg * .35;
  }

  // ---- rising sparks
  vec2 sq = ip + vec2(0., t * 26.);
  vec2 cell = floor(sq / 85.);
  float hs = h12(cell);
  if (hs < .28) {
    vec2 pos = (vec2(h12(cell + 3.1), h12(cell + 7.7)) * .8 + .1) * 85.;
    pos.x += sin(t * .9 + hs * 40.) * 9.;
    vec2 dv = fract(sq / 85.) * 85. - pos;
    float sp = exp(-dot(dv, dv) / 2.5) * (.55 + .45 * sin(t * 3.1 + hs * 60.));
    add += mix(vec3(.5, .45, 1.), vec3(1., .3, .35), ss(650., 950., ip.x)) * sp * ss(260., 420., ip.y) * .9;
  }

  // ---- rain (screen space, two depths)
  vec2 q = p / uRes.y;
  add += vec3(.7, .8, 1.) * (rainL(q, 70., .9, .14, 1.) * .2 + rainL(q, 150., .6, .08, 7.) * .1);

  // a slow light wave across every neon
  col *= 1. + nm * .08 * sin(t * .8 - ip.x * .004);
  col += add;
  col *= 1. + uFlash * .06;
  // match the static layer's CSS filter: saturate(1.22) contrast(1.08)
  col = mix(vec3(dot(col, vec3(.2126, .7152, .0722))), col, 1.22);
  col = (col - .5) * 1.08 + .5;
  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}`;

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (debug) console.warn("[livebg]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  var pr = gl.createProgram();
  gl.attachShader(pr, vs);
  gl.attachShader(pr, fs);
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aLoc = gl.getAttribLocation(pr, "a");
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ["uTex", "uRes", "uImg", "uT", "uFlash", "uBlink", "uBolt"].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

  // ---- deterministic events (same on every page, so they don't restart) ----
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function lightning(t) {
    var P = 9, k = Math.floor(t / P), at = 1 + hash(k + 0.5) * 5, dt = t - k * P - at;
    if (hash(k) > 0.7 || dt < 0 || dt > 0.8) return null;
    var f = Math.exp(-dt / 0.06);
    if (dt >= 0.16) f = Math.max(f, 0.85 * Math.exp(-(dt - 0.16) / 0.12));
    if (dt >= 0.4) f = Math.max(f, 0.45 * Math.exp(-(dt - 0.4) / 0.1));
    var r = hash(k + 0.9), x0, x1, len;
    if (r < 0.45) {           // left sky, fades out above the city
      x0 = 572 + hash(k + 0.7) * 65; x1 = x0 + (hash(k + 0.6) - 0.5) * 50; len = 250 + hash(k + 0.2) * 70;
    } else if (r < 0.8) {     // right sky, strikes the needle tower's spire
      x0 = 1240 + hash(k + 0.7) * 60; x1 = 1222; len = 292;
    } else {                  // sheet lightning only
      x0 = x1 = len = 0;
    }
    return [f, x0, hash(k + 0.3) * 100, x1, len];
  }
  function blink(t) {
    var P = 7.5, k = Math.floor(t / P), dt = t - k * P - (1 + hash(k + 11.1) * 5);
    if (dt < 0 || dt > 0.22) return 0;
    return dt < 0.07 ? dt / 0.07 : dt < 0.12 ? 1 : 1 - (dt - 0.12) / 0.1;
  }

  // ---- sizing: never above 1 canvas px per CSS px, longest side <= 1600 ----
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  var quality = coarse ? 0.7 : 1;
  function resize() {
    var w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight;
    var sc = Math.min(window.devicePixelRatio || 1, 1) * quality;
    var big = Math.max(w, h) * sc;
    if (big > 1600) sc *= 1600 / big;
    var cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(h * sc));
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
    gl.viewport(0, 0, cw, ch);
    gl.uniform2f(U.uRes, cw, ch);
  }
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });

  function draw(t) {
    t = ((t % 3600) + 3600) % 3600;
    gl.uniform1f(U.uT, t);
    var L = lightning(t);
    gl.uniform1f(U.uFlash, L ? L[0] : 0);
    gl.uniform4f(U.uBolt, L ? L[1] : 0, L ? L[2] : 0, L ? L[3] : 0, L ? L[4] : 0);
    gl.uniform1f(U.uBlink, blink(t));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // time continues across page loads instead of restarting at 0
  var t0 = performance.now(), epoch = (Date.now() / 1000) % 3600;
  function now() { return epoch + (performance.now() - t0) / 1000; }

  var FPS = 30, raf = 0, last = 0, shown = false, dead = false;
  var warmUntil = 0, winStart = 0, winFrames = 0, downgrades = 0;
  function show() {
    if (shown) return;
    shown = true;
    cv.classList.add("on");
    document.documentElement.classList.add("live-bg");
  }
  function giveUp() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(raf);
    cv.classList.remove("on");
    document.documentElement.classList.remove("live-bg");
    setTimeout(function () { var x = gl.getExtension("WEBGL_lose_context"); if (x) x.loseContext(); }, 800);
  }
  // performance guard: measure real fps over 2 s windows; if it can't hold
  // 20 fps, drop resolution (twice at most), then bow out to the still image
  function guard(ts) {
    if (!warmUntil) { warmUntil = ts + 1200; return; }
    if (ts < warmUntil) return;
    if (!winStart) { winStart = ts; winFrames = 0; return; }
    winFrames++;
    var el = ts - winStart;
    if (el < 2000) return;
    var fps = winFrames * 1000 / el;
    winStart = 0;
    if (fps < 20) {
      if (downgrades >= 2) { giveUp(); return; }
      downgrades++;
      quality *= 0.7;
      resize();
      warmUntil = ts + 600;
    }
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) { winStart = 0; warmUntil = performance.now() + 800; }
  });
  function frame(ts) {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    if (ts - last < 1000 / FPS - 2) return;
    last = ts;
    draw(now());
    show();
    if (!debug) guard(ts);
  }

  cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); giveUp(); });

  var img = new Image();
  img.decoding = "async";
  img.onload = function () {
    if (dead) return;
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(U.uTex, 0);
    gl.uniform2f(U.uImg, img.naturalWidth, img.naturalHeight);
    resize();
    if (debug) {
      window.__liveBg = {
        draw: function (t) { cancelAnimationFrame(raf); dead = true; resize(); draw(t); show(); },
        lightning: lightning, blink: blink
      };
    }
    raf = requestAnimationFrame(frame);
  };
  img.src = cv.getAttribute("data-src");
})();
