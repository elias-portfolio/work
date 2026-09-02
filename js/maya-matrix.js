/**
 * Interactive Maya Compute Matrix (GPU World ParadigmGrid replica for Maya Glyphs)
 * Real-time 5x5 WebGL shader matrix with PrettyColors palette and cursor physics.
 */

(function () {
    const GLYPH_DATA = [
        { id: 'T100', hex: '#FF5D0D', name: 'Vivid Tangerine' },
        { id: 'T101', hex: '#63C1F7', name: 'Electric Sky Blue' },
        { id: 'T200', hex: '#FFD919', name: 'Canary Gold' },
        { id: 'T300', hex: '#7EEB09', name: 'Electric Acid Lime' },
        { id: 'T301', hex: '#FFA6EC', name: 'Bubblegum Pink' },
        { id: 'T302', hex: '#53C9DB', name: 'Bright Turquoise Cyan' },
        { id: 'T400', hex: '#BB78FF', name: 'Bright Amethyst' },
        { id: 'T500', hex: '#FCD18D', name: 'Warm Apricot Peach' },
        { id: 'T600', hex: '#FF6868', name: 'Vibrant Coral Red' },
        { id: 'T700', hex: '#65F0A3', name: 'Bright Seafoam Green' },
        { id: 'T800', hex: '#CE9DEE', name: 'Soft Lavender Lilac' },
        { id: 'T900', hex: '#C18B78', name: 'Dusty Terracotta' },
        { id: 'T1000', hex: '#8DA8FC', name: 'Periwinkle Cornflower' },
        { id: 'T1100', hex: '#D1D6B2', name: 'Pale Olive Stone' },
        { id: 'T1200', hex: '#ED8ED1', name: 'Orchid Rose' },
        { id: 'T1201', hex: '#FFF766', name: 'Vintage Lemon Butter' },
        { id: 'T1300', hex: '#00C4A7', name: 'Electric Seafoam Teal' },
        { id: 'T1301', hex: '#8E6ED4', name: 'Royal Amethyst Violet' },
        { id: 'T1302', hex: '#2DD243', name: 'Fresh Spring Meadow' },
        { id: 'T1303', hex: '#FFB300', name: 'Golden Honey Amber' },
        { id: 'T1400', hex: '#FF6B8B', name: 'Warm Coral Rosebud' },
        { id: 'T1500', hex: '#FFAA00', name: 'Bright Marigold Yellow' },
        { id: 'T1501', hex: '#99FF00', name: 'Electric Chartreuse Lime' },
        { id: 'T1600', hex: '#FF388E', name: 'Vivid Neon Ruby' },
        { id: 'T1601', hex: '#05B3ED', name: 'Cerulean Capri Blue' }
    ];

    function hexToRgb01(hex) {
        const c = hex.replace('#', '');
        return [
            parseInt(c.substring(0, 2), 16) / 255.0,
            parseInt(c.substring(2, 4), 16) / 255.0,
            parseInt(c.substring(4, 6), 16) / 255.0
        ];
    }

    const VERTEX_SHADER_SRC = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
            v_uv = (a_position + 1.0) * 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const FRAGMENT_SHADER_SRC = `
        precision highp float;
        varying vec2 v_uv;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;
        uniform float u_hover;
        uniform sampler2D u_atlas;
        uniform vec3 u_colors[25];

        // Rounded box SDF
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
            vec2 d = abs(p) - b + vec2(r);
            return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
        }

        void main() {
            vec2 st = v_uv;
            st.y = 1.0 - st.y; // Top-to-bottom

            float cols = 5.0;
            float rows = 5.0;

            vec2 cellCoord = floor(st * vec2(cols, rows));
            vec2 cellUv = fract(st * vec2(cols, rows));

            if (cellCoord.x < 0.0 || cellCoord.x >= cols || cellCoord.y < 0.0 || cellCoord.y >= rows) {
                gl_FragColor = vec4(0.04, 0.04, 0.04, 1.0);
                return;
            }

            int cellIdx = int(cellCoord.y * cols + cellCoord.x);

            // SDF cell box
            vec2 p = cellUv - 0.5;
            float box = roundedBoxSDF(p, vec2(0.44), 0.08);
            float cellMask = 1.0 - smoothstep(-0.015, 0.015, box);
            float borderGlow = 1.0 - smoothstep(0.0, 0.05, abs(box));

            // Mouse proximity & physics
            vec2 mouseNorm = vec2(u_mouse.x, 1.0 - u_mouse.y);
            float distToMouse = distance(st, mouseNorm);
            float mouseInfluence = exp(-distToMouse * distToMouse * 18.0) * u_hover;

            // Organic breathing wave
            float wave = sin(u_time * 1.8 + cellCoord.x * 0.9 + cellCoord.y * 0.7) * 0.5 + 0.5;

            // Color lookup from 25 PrettyColors array
            vec3 baseColor = vec3(0.9);
            for (int i = 0; i < 25; i++) {
                if (i == cellIdx) {
                    baseColor = u_colors[i];
                    break;
                }
            }

            // Cell vignette & 3D bevel lighting
            float cellCenterDist = length(p);
            float vignette = 1.0 - smoothstep(0.15, 0.55, cellCenterDist) * 0.22;

            // Sample glyph from 5x5 atlas texture
            vec2 glyphAtlasUv = (cellCoord + cellUv) / vec2(cols, rows);
            glyphAtlasUv.y = 1.0 - glyphAtlasUv.y;
            vec4 glyphTex = texture2D(u_atlas, glyphAtlasUv);
            float glyphAlpha = glyphTex.a;

            // Composite active cell
            vec3 activeBg = mix(baseColor * vignette, baseColor + vec3(0.18), mouseInfluence * 0.75);
            activeBg += vec3(wave * 0.07);

            // Ink color reacts to cursor heat
            vec3 inkColor = mix(vec3(0.08), vec3(0.95), mouseInfluence * 0.35);
            vec3 cellComposite = mix(activeBg, inkColor, glyphAlpha);

            // Inter-cell substrate & thermal glow seams (GPU World style)
            vec3 substrate = vec3(0.05, 0.045, 0.04);
            vec3 seamGlow = mix(vec3(1.0, 0.35, 0.05), vec3(0.05, 0.8, 1.0), sin(u_time + cellCoord.x * 0.5) * 0.5 + 0.5);
            substrate += seamGlow * borderGlow * (0.28 + mouseInfluence * 0.72);

            vec3 finalColor = mix(substrate, cellComposite, cellMask);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    class MayaMatrix {
        constructor(canvas, hudInfo) {
            this.canvas = canvas;
            this.hudInfo = hudInfo;
            this.gl = canvas.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: false });
            if (!this.gl) {
                console.warn('WebGL not supported, falling back to 2D canvas');
                this.init2DFallback();
                return;
            }

            this.targetMouse = [0.5, 0.5];
            this.currentMouse = [0.5, 0.5];
            this.hover = 0.0;
            this.targetHover = 0.0;
            this.startTime = performance.now();
            this.active = true;

            this.initGL();
            this.initEvents();
            this.render = this.render.bind(this);
            requestAnimationFrame(this.render);
        }

        initGL() {
            const gl = this.gl;

            // Shader compile helper
            function createShader(gl, type, source) {
                const s = gl.createShader(type);
                gl.shaderSource(s, source);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                    console.error('Shader compile error:', gl.getShaderInfoLog(s));
                    gl.deleteShader(s);
                    return null;
                }
                return s;
            }

            const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
            const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);

            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error('Program link error:', gl.getProgramInfoLog(prog));
                return;
            }

            this.program = prog;
            gl.useProgram(prog);

            // Quad buffer
            const posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                -1,  1,
                 1, -1,
                 1,  1
            ]), gl.STATIC_DRAW);

            const posLoc = gl.getAttribLocation(prog, 'a_position');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            // Uniform locations
            this.uResolution = gl.getUniformLocation(prog, 'u_resolution');
            this.uMouse = gl.getUniformLocation(prog, 'u_mouse');
            this.uTime = gl.getUniformLocation(prog, 'u_time');
            this.uHover = gl.getUniformLocation(prog, 'u_hover');
            this.uAtlas = gl.getUniformLocation(prog, 'u_atlas');

            // Pass 25 PrettyColors
            const colorsFlat = [];
            for (let i = 0; i < 25; i++) {
                const rgb = hexToRgb01(GLYPH_DATA[i].hex);
                colorsFlat.push(rgb[0], rgb[1], rgb[2]);
            }
            const uColorsLoc = gl.getUniformLocation(prog, 'u_colors');
            gl.uniform3fv(uColorsLoc, new Float32Array(colorsFlat));

            // Load Atlas Texture
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            // 1x1 placeholder pixel
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            };
            img.src = 'maya/references/maya-glyph-atlas-5x5.png';

            this.resize();
        }

        resize() {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = Math.floor(rect.width * dpr);
            const h = Math.floor(rect.height * dpr);
            if (this.canvas.width !== w || this.canvas.height !== h) {
                this.canvas.width = w;
                this.canvas.height = h;
                if (this.gl) {
                    this.gl.viewport(0, 0, w, h);
                }
            }
        }

        initEvents() {
            const updateMouse = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                this.targetMouse = [
                    Math.max(0, Math.min(1, x)),
                    Math.max(0, Math.min(1, y))
                ];
                this.targetHover = 1.0;

                // Update HUD
                if (this.hudInfo) {
                    const col = Math.floor(this.targetMouse[0] * 5);
                    const row = Math.floor(this.targetMouse[1] * 5);
                    const idx = Math.min(24, Math.max(0, row * 5 + col));
                    const glyph = GLYPH_DATA[idx];
                    this.hudInfo.textContent = `CELL [${col}, ${row}]: ${glyph.id} (${glyph.name}) • ${glyph.hex}`;
                }
            };

            this.canvas.addEventListener('mousemove', updateMouse);
            this.canvas.addEventListener('mouseenter', () => {
                this.targetHover = 1.0;
            });
            this.canvas.addEventListener('mouseleave', () => {
                this.targetHover = 0.0;
                if (this.hudInfo) this.hudInfo.textContent = 'CELL: -- (HOVER / SWIPE MATRIX)';
            });

            // Touch support for mobile
            this.canvas.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    updateMouse(e.touches[0]);
                }
            }, { passive: true });
            this.canvas.addEventListener('touchstart', (e) => {
                this.targetHover = 1.0;
                if (e.touches.length > 0) updateMouse(e.touches[0]);
            }, { passive: true });
            this.canvas.addEventListener('touchend', () => {
                this.targetHover = 0.0;
            });

            window.addEventListener('resize', () => this.resize());
        }

        render(timestamp) {
            if (!this.active) return;

            // Smooth spring/damp physics (similar to GPU World i.Damp)
            this.currentMouse[0] += (this.targetMouse[0] - this.currentMouse[0]) * 0.09;
            this.currentMouse[1] += (this.targetMouse[1] - this.currentMouse[1]) * 0.09;
            this.hover += (this.targetHover - this.hover) * 0.08;

            const time = (timestamp - this.startTime) * 0.001;

            if (this.gl) {
                const gl = this.gl;
                this.resize();
                gl.useProgram(this.program);

                gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
                gl.uniform2f(this.uMouse, this.currentMouse[0], this.currentMouse[1]);
                gl.uniform1f(this.uTime, time);
                gl.uniform1f(this.uHover, this.hover);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.uniform1i(this.uAtlas, 0);

                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }

            requestAnimationFrame(this.render);
        }

        destroy() {
            this.active = false;
        }

        init2DFallback() {
            // Graceful 2D canvas fallback
            const ctx = this.canvas.getContext('2d');
            const img = new Image();
            img.src = 'maya/references/maya-glyph-atlas-5x5.png';
            img.onload = () => {
                ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            };
        }
    }

    // Global initializer called when Maya section is mounted
    let activeMatrixInstance = null;
    window.initMayaMatrix = function () {
        const canvas = document.getElementById('maya-matrix-canvas');
        const hud = document.getElementById('maya-matrix-info');
        if (!canvas) return;

        if (activeMatrixInstance) {
            activeMatrixInstance.destroy();
            activeMatrixInstance = null;
        }
        activeMatrixInstance = new MayaMatrix(canvas, hud);
    };
})();
