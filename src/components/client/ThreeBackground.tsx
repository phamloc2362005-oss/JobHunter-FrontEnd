import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   3D Math helpers (no library needed)
───────────────────────────────────────────── */
type Vec3 = [number, number, number];

function rotateX(v: Vec3, a: number): Vec3 {
    const [x, y, z] = v;
    return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
}
function rotateY(v: Vec3, a: number): Vec3 {
    const [x, y, z] = v;
    return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
}
function rotateZ(v: Vec3, a: number): Vec3 {
    const [x, y, z] = v;
    return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
}

/* Project 3D → 2D with perspective */
function project(v: Vec3, fov: number, cx: number, cy: number): [number, number, number] {
    const z = v[2] + fov;
    const scale = fov / Math.max(z, 1);
    return [cx + v[0] * scale, cy + v[1] * scale, scale];
}

/* ─────────────────────────────────────────────
   Polyhedra vertex/edge data
───────────────────────────────────────────── */
function makeCube(s: number): { verts: Vec3[]; edges: [number, number][] } {
    const h = s / 2;
    const verts: Vec3[] = [
        [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
        [-h, -h,  h], [h, -h,  h], [h, h,  h], [-h, h,  h],
    ];
    const edges: [number, number][] = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7],
    ];
    return { verts, edges };
}

function makeOctahedron(r: number): { verts: Vec3[]; edges: [number, number][] } {
    const verts: Vec3[] = [
        [0, r, 0], [0, -r, 0],
        [r, 0, 0], [-r, 0, 0],
        [0, 0, r], [0, 0, -r],
    ];
    const edges: [number, number][] = [
        [0,2],[0,3],[0,4],[0,5],
        [1,2],[1,3],[1,4],[1,5],
        [2,4],[4,3],[3,5],[5,2],
    ];
    return { verts, edges };
}

function makeTetrahedron(r: number): { verts: Vec3[]; edges: [number, number][] } {
    const a = r;
    const verts: Vec3[] = [
        [0, a, 0],
        [a * Math.sin(2.094), -a * 0.333, a * Math.cos(2.094)],
        [a * Math.sin(4.189), -a * 0.333, a * Math.cos(4.189)],
        [0, -a * 0.333, a],
    ];
    const edges: [number, number][] = [
        [0,1],[0,2],[0,3],[1,2],[2,3],[3,1],
    ];
    return { verts, edges };
}

/* ─────────────────────────────────────────────
   Shape object
───────────────────────────────────────────── */
interface Shape {
    verts: Vec3[];
    edges: [number, number][];
    pos: Vec3;
    rot: Vec3;
    rotSpeed: Vec3;
    color: string;
    alpha: number;
    floatOffset: number;
    floatSpeed: number;
    size: number;
}

function randomRange(a: number, b: number) { return a + Math.random() * (b - a); }

function createShapes(count: number): Shape[] {
    const shapes: Shape[] = [];
    const factories = [makeCube, makeOctahedron, makeTetrahedron];
    const colors = [
        'rgba(14,165,233,',    // sky blue
        'rgba(139,92,246,',    // violet
        'rgba(34,211,238,',    // cyan
        'rgba(99,102,241,',    // indigo
        'rgba(244,114,182,',   // pink (rare)
    ];

    for (let i = 0; i < count; i++) {
        const size = randomRange(18, 55);
        const factory = factories[Math.floor(Math.random() * factories.length)];
        const { verts, edges } = factory(size);
        const col = colors[Math.floor(Math.random() * colors.length)];

        shapes.push({
            verts, edges,
            pos: [randomRange(-600, 600), randomRange(-300, 300), randomRange(-200, 400)],
            rot: [randomRange(0, Math.PI * 2), randomRange(0, Math.PI * 2), randomRange(0, Math.PI * 2)],
            rotSpeed: [
                randomRange(-0.003, 0.003),
                randomRange(-0.004, 0.004),
                randomRange(-0.002, 0.002),
            ],
            color: col,
            alpha: randomRange(0.25, 0.65),
            floatOffset: randomRange(0, Math.PI * 2),
            floatSpeed: randomRange(0.3, 0.8),
            size,
        });
    }
    return shapes;
}

/* ─────────────────────────────────────────────
   Particles
───────────────────────────────────────────── */
interface Particle {
    pos: Vec3;
    vel: Vec3;
    r: number;
    color: string;
    alpha: number;
}

function createParticles(count: number): Particle[] {
    const colors = ['#38bdf8', '#a78bfa', '#22d3ee', '#6366f1', '#34d399'];
    return Array.from({ length: count }, () => ({
        pos: [randomRange(-700, 700), randomRange(-400, 400), randomRange(-300, 500)] as Vec3,
        vel: [randomRange(-0.3, 0.3), randomRange(-0.5, -0.1), randomRange(-0.1, 0.1)] as Vec3,
        r: randomRange(1, 3),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: randomRange(0.3, 0.8),
    }));
}

/* ─────────────────────────────────────────────
   React component
───────────────────────────────────────────── */
interface Props {
    style?: React.CSSProperties;
}

const ThreeBackground: React.FC<Props> = ({ style }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let t = 0;

        /* Resize canvas to fill parent */
        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);

        const shapes = createShapes(22);
        const particles = createParticles(80);
        const FOV = 500;

        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            const cx = W / 2;
            const cy = H / 2;
            t += 0.01;

            /* Clear */
            ctx.clearRect(0, 0, W, H);

            /* ── Draw polyhedra ── */
            for (const shape of shapes) {
                /* Update rotation */
                shape.rot[0] += shape.rotSpeed[0];
                shape.rot[1] += shape.rotSpeed[1];
                shape.rot[2] += shape.rotSpeed[2];

                /* Float up/down */
                const floatY = Math.sin(t * shape.floatSpeed + shape.floatOffset) * 18;

                /* Transform vertices */
                const projected = shape.verts.map(v => {
                    let p: Vec3 = [...v];
                    p = rotateX(p, shape.rot[0]);
                    p = rotateY(p, shape.rot[1]);
                    p = rotateZ(p, shape.rot[2]);
                    p = [p[0] + shape.pos[0], p[1] + shape.pos[1] + floatY, p[2] + shape.pos[2]];
                    return project(p, FOV, cx, cy);
                });

                /* Draw edges */
                for (const [a, b] of shape.edges) {
                    const pa = projected[a];
                    const pb = projected[b];
                    /* Skip if behind camera */
                    if (pa[2] <= 0 || pb[2] <= 0) continue;
                    /* Depth-based alpha */
                    const depthAlpha = Math.min(pa[2], pb[2]) * 0.6;
                    ctx.save();
                    ctx.strokeStyle = `${shape.color}${(shape.alpha * depthAlpha).toFixed(2)})`;
                    ctx.lineWidth = Math.min(pa[2], pb[2]) * 1.5;
                    ctx.shadowColor = `${shape.color}0.5)`;
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.moveTo(pa[0], pa[1]);
                    ctx.lineTo(pb[0], pb[1]);
                    ctx.stroke();
                    ctx.restore();
                }

                /* Vertex dots */
                for (const p of projected) {
                    if (p[2] <= 0) continue;
                    ctx.save();
                    ctx.fillStyle = `${shape.color}${(shape.alpha * p[2] * 0.8).toFixed(2)})`;
                    ctx.shadowColor = `${shape.color}0.8)`;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(p[0], p[1], Math.min(p[2] * 1.5, 3), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            /* ── Draw particles ── */
            for (const p of particles) {
                /* Move up, wrap around */
                p.pos[1] += p.vel[1];
                p.pos[0] += p.vel[0];
                if (p.pos[1] < -400) { p.pos[1] = 400; p.pos[0] = randomRange(-700, 700); }

                const proj = project(p.pos, FOV, cx, cy);
                if (proj[2] <= 0) continue;

                const depthAlpha = proj[2] * p.alpha;
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.min(depthAlpha, 0.8);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(proj[0], proj[1], p.r * proj[2], 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            /* ── Connect nearby particles with lines ── */
            ctx.save();
            for (let i = 0; i < particles.length; i++) {
                const pi = project(particles[i].pos, FOV, cx, cy);
                for (let j = i + 1; j < particles.length; j++) {
                    const pj = project(particles[j].pos, FOV, cx, cy);
                    const dx = pi[0] - pj[0];
                    const dy = pi[1] - pj[1];
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80) {
                        const alpha = (1 - dist / 80) * 0.12;
                        ctx.strokeStyle = `rgba(14,165,233,${alpha.toFixed(3)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(pi[0], pi[1]);
                        ctx.lineTo(pj[0], pj[1]);
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();

            animId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animId);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                ...style,
            }}
        />
    );
};

export default ThreeBackground;
