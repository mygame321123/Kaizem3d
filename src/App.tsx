import { useRef, useEffect, useState, Suspense, lazy, useMemo } from 'react';
import { motion, useInView, useScroll, useSpring, animate, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Truck, Calendar, UtensilsCrossed, Monitor, Package, ShoppingBag, QrCode, Wifi, Database, Activity, BarChart3, CheckCircle2, Signal, ArrowUpRight, MessageCircle, Mail, Instagram, ArrowUp, Globe, Plus, Minus, Search, PenTool, Code2, Rocket, ArrowRight } from 'lucide-react';

// ============ 3D SCENE ============
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  uniform float uTime;
  uniform float uHover;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    vec3 pos = position;
    
    // Multi-layered noise for more dramatic displacement
    float noise1 = snoise(pos * 2.0 + uTime * 0.4) * 0.25;
    float noise2 = snoise(pos * 4.0 + uTime * 0.6) * 0.15;
    float noise3 = snoise(pos * 8.0 + uTime * 0.8) * 0.08;
    
    float totalNoise = noise1 + noise2 + noise3;
    totalNoise *= (1.0 + uHover * 0.8);
    
    pos += normal * totalNoise;
    
    vDisplacement = totalNoise;
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;

  void main() {
    vec3 color1 = vec3(0.65, 0.55, 0.98); // violet
    vec3 color2 = vec3(0.13, 0.83, 0.93); // cyan
    vec3 color3 = vec3(0.98, 0.45, 0.09); // orange
    vec3 color4 = vec3(0.95, 0.25, 0.55); // pink
    vec3 color5 = vec3(0.1, 0.95, 0.5); // green
    
    // Complex pattern with multiple frequencies
    float pattern1 = sin(vUv.x * 30.0 + uTime * 2.0) * cos(vUv.y * 30.0 + uTime * 1.5);
    float pattern2 = sin(vUv.x * 15.0 - uTime * 1.2) * sin(vUv.y * 15.0 + uTime * 0.8);
    float pattern3 = cos(length(vUv - 0.5) * 20.0 - uTime * 3.0);
    
    float combinedPattern = (pattern1 + pattern2 + pattern3) / 3.0;
    combinedPattern = smoothstep(0.2, 0.8, combinedPattern * 0.5 + 0.5);
    
    // Dynamic color mixing based on position, time AND displacement
    float colorMix1 = sin(uTime * 0.5 + vUv.x * 3.0 + vDisplacement * 5.0) * 0.5 + 0.5;
    float colorMix2 = cos(uTime * 0.3 + vUv.y * 2.0 + vDisplacement * 3.0) * 0.5 + 0.5;
    float colorMix3 = sin(vDisplacement * 10.0 + uTime) * 0.5 + 0.5;
    
    vec3 baseColor = mix(color1, color2, colorMix1);
    baseColor = mix(baseColor, color3, combinedPattern * 0.6);
    baseColor = mix(baseColor, color4, colorMix2 * 0.4);
    baseColor = mix(baseColor, color5, colorMix3 * 0.2);
    
    // Enhanced fresnel with chromatic aberration effect
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    vec3 fresnelColor = mix(vec3(0.5, 0.3, 1.0), vec3(0.2, 0.9, 1.0), fresnel);
    fresnelColor = mix(fresnelColor, vec3(1.0, 0.5, 0.2), vDisplacement * 2.0);
    
    // Pulsing glow effect
    float pulse = sin(uTime * 2.0) * 0.3 + 0.7;
    float glow = fresnel * (1.5 + uHover * 1.0) * pulse;
    
    // Final composition with more vibrancy
    vec3 finalColor = baseColor * 0.6 + fresnelColor * glow;
    finalColor += vec3(0.2, 0.1, 0.3) * fresnel;
    
    // Add sparkle based on displacement
    float sparkle = pow(combinedPattern, 8.0) * 0.6;
    sparkle += pow(abs(vDisplacement), 3.0) * 0.8;
    finalColor += sparkle;
    
    // Add rim lighting
    float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 4.0);
    finalColor += rim * vec3(0.8, 0.4, 1.0) * 0.5;
    
    gl_FragColor = vec4(finalColor, 0.98);
  }
`;

function AnimatedSphere({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const hoverRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      materialRef.current.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
      const targetHover = Math.min(1, Math.sqrt(mouse.current.x ** 2 + mouse.current.y ** 2) * 2);
      hoverRef.current += (targetHover - hoverRef.current) * 0.05;
      materialRef.current.uniforms.uHover.value = hoverRef.current;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15 + mouse.current.x * 0.3;
      meshRef.current.rotation.x = mouse.current.y * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 64]} />
        <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent />
      </mesh>
    </Float>
  );
}

function OrbitalRing({ radius, speed, color, opacity = 0.3 }: { radius: number; speed: number; color: string; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.getElapsedTime() * speed;
      ref.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.getElapsedTime() * 0.2) * 0.15;
      ref.current.rotation.y = Math.cos(state.clock.getElapsedTime() * 0.15) * 0.1;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <torusGeometry args={[radius, 0.008, 16, 120]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.03, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.2} />
      </mesh>
    </group>
  );
}

// Energy beam effect
function EnergyBeam() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.rotation.z = t * 0.5;
      ref.current.scale.x = 1 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -2]}>
      <planeGeometry args={[0.1, 8, 1, 50]} />
      <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

function FloatingParticles() {
  const count = 150;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      // Multi-color particles
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.65; colors[i * 3 + 1] = 0.55; colors[i * 3 + 2] = 0.98; // violet
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.13; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 0.93; // cyan
      } else {
        colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.09; // orange
      }
    }
    return { positions: pos, colors };
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.08;
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[positions.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Floating geometric shapes
function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05;
    }
  });

  const shapes = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 3 + Math.random();
      return {
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 3,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
        scale: 0.1 + Math.random() * 0.15,
        color: ['#a78bfa', '#22d3ee', '#f97316'][i % 3],
      };
    });
  }, []);

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <mesh key={i} position={shape.position} rotation={shape.rotation} scale={shape.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color={shape.color} 
            metalness={0.9} 
            roughness={0.1} 
            emissive={shape.color}
            emissiveIntensity={0.5}
            wireframe={i % 2 === 0}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene3D() {
  const mouse = useRef({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  return (
    <div className="absolute inset-0 w-full h-full" onMouseMove={handleMouseMove}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#a78bfa" distance={10} />
        <pointLight position={[-5, -5, 5]} intensity={1} color="#22d3ee" distance={10} />
        <pointLight position={[0, 5, -5]} intensity={0.8} color="#f97316" distance={8} />
        <pointLight position={[0, -5, 5]} intensity={0.6} color="#ec4899" distance={8} />
        <spotLight position={[0, 10, 0]} intensity={0.7} color="#ffffff" angle={0.3} penumbra={1} />
        
        <AnimatedSphere mouse={mouse} />
        
        {/* Multiple orbital rings with different speeds and sizes */}
        <OrbitalRing radius={2.3} speed={0.3} color="#a78bfa" opacity={0.5} />
        <OrbitalRing radius={2.7} speed={-0.25} color="#22d3ee" opacity={0.4} />
        <OrbitalRing radius={3.1} speed={0.2} color="#f97316" opacity={0.35} />
        <OrbitalRing radius={3.5} speed={-0.15} color="#ec4899" opacity={0.3} />
        <OrbitalRing radius={3.9} speed={0.1} color="#10b981" opacity={0.25} />
        
        <FloatingParticles />
        <FloatingShapes />
        <EnergyBeam />
        
        {/* Additional floating orbs */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`orb-${i}`} position={[
            Math.cos(i * 1.2) * 4,
            Math.sin(i * 1.5) * 2,
            Math.cos(i * 0.8) * 3
          ]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial 
              color={['#a78bfa', '#22d3ee', '#f97316', '#ec4899', '#10b981'][i]}
              emissive={['#a78bfa', '#22d3ee', '#f97316', '#ec4899', '#10b981'][i]}
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}
        
        <Environment preset="night" />
        <fog attach="fog" args={['#050507', 5, 15]} />
      </Canvas>
    </div>
  );
}

// ============ MANIFESTO 3D SCENE ============
function ManifestoScene() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central glowing sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color="#a78bfa" 
          metalness={1} 
          roughness={0} 
          emissive="#a78bfa"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Orbiting rings */}
      {[1.5, 2, 2.5].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, i * 0.5, 0]}>
          <torusGeometry args={[radius, 0.015, 16, 100]} />
          <meshBasicMaterial 
            color={['#a78bfa', '#22d3ee', '#f97316'][i]} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Floating particles around */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const radius = 2.5 + Math.random() * 0.5;
        const y = (Math.random() - 0.5) * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        );
      })}
    </group>
  );
}

function ManifestoScene3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#a78bfa" />
        <pointLight position={[-5, -5, 5]} intensity={0.7} color="#22d3ee" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#f97316" />
        <ManifestoScene />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

// ============ PRELOADER ============
function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#050507] flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-display font-bold text-3xl text-white">K</div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 rounded-2xl border-2 border-violet-400/30" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
              <div className="font-display text-2xl font-bold mb-2">KAIZEM</div>
              <div className="mono text-[10px] tracking-[0.3em] text-white/40 mb-6">SISTEMAS • DIGITAL TOQUE</div>
              <div className="w-48 h-px bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.3 }} className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" />
              </div>
              <div className="mono text-xs text-white/30 mt-3">{Math.floor(Math.min(progress, 100))}%</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ CUSTOM CURSOR ============
function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);

    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => setIsHovering(true));
      el.addEventListener('mouseleave', () => setIsHovering(false));
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', () => setIsHovering(true));
        el.removeEventListener('mouseleave', () => setIsHovering(false));
      });
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference hidden md:block"
        animate={{ x: mousePosition.x - (isHovering ? 20 : 8), y: mousePosition.y - (isHovering ? 20 : 8), scale: isHovering ? 2.5 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
      >
        <div className={`rounded-full bg-white transition-all duration-200 ${isHovering ? 'w-10 h-10 opacity-50' : 'w-4 h-4 opacity-100'}`} />
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9997] hidden md:block"
        animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.8 }}
      >
        <div className="w-8 h-8 rounded-full border border-violet-400/30" />
      </motion.div>
    </>
  );
}

// ============ SCROLL PROGRESS ============
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:block" style={{ height: '200px' }}>
      <div className="absolute inset-0 w-px bg-white/[0.06] rounded-full" />
      <motion.div className="absolute top-0 left-0 w-px bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full origin-top" style={{ scaleY, height: '100%' }} />
    </motion.div>
  );
}

// ============ FLOATING BUTTONS ============
function WhatsAppButton() {
  return (
    <motion.a
      href="#"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-shadow duration-300 group"
      aria-label="WhatsApp"
    >
      <MessageCircle size={24} className="text-white" />
      <motion.div className="absolute inset-0 rounded-full bg-green-500" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
    </motion.a>
  );
}

function BackToTop() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{ opacity }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 left-8 z-[100] w-12 h-12 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-colors duration-300"
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={20} className="text-white/60" />
    </motion.button>
  );
}

// ============ HEADER ============
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Sobre', href: '#about' },
    { label: 'Sistemas', href: '#sistemas' },
    { label: 'Digital Toque', href: '#digital-toque' },
    { label: 'Projetos', href: '#projetos' },
    { label: 'Contato', href: '#contato' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-[#050507]/70 border-b border-white/[0.04]' : ''}`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-display font-bold text-sm text-white">K</div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 opacity-0 group-hover:opacity-40 blur-lg transition-opacity" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-semibold tracking-tight text-[15px]">KAIZEM</span>
              <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase mt-0.5">Sistemas</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="relative px-4 py-2 text-[13px] text-white/60 hover:text-white transition-colors group">
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-violet-400 to-cyan-400 group-hover:w-4/5 transition-all duration-300" />
              </a>
            ))}
          </nav>

          <a href="#contato" className="hidden md:block relative px-5 py-2.5 rounded-full text-[13px] font-medium text-white overflow-hidden group">
            <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-500 group-hover:from-violet-500 group-hover:to-cyan-500 transition-all duration-500" />
            <span className="absolute inset-[1px] rounded-full bg-[#050507] group-hover:bg-transparent transition-all duration-500" />
            <span className="relative">Iniciar projeto →</span>
          </a>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5" aria-label="Menu">
            <span className={`w-5 h-px bg-white transition-all ${mobileOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`w-5 h-px bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </button>
        </div>
        <div className="h-px bg-white/[0.03]">
          <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-[#050507]/98 backdrop-blur-2xl md:hidden">
            <nav className="flex flex-col pt-32 px-8 gap-2">
              {navItems.map((item, i) => (
                <motion.a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="font-display text-3xl font-medium py-3 border-b border-white/[0.05] text-white/80">
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============ HERO ============
function Hero() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMouse({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const tickerItems = ['SISTEMAS WEB', 'NFC', 'DELIVERY', 'PDV', 'CARDÁPIO DIGITAL', 'EVENTOS', 'DASHBOARDS'];

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}><Scene3D /></Suspense>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-transparent to-[#050507] z-[1] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-transparent to-[#050507] z-[1] pointer-events-none opacity-60" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] mono text-white/60 tracking-wider">DISPONÍVEL PARA NOVOS PROJETOS</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="display font-bold text-[clamp(3rem,9vw,8rem)] mb-6" style={{ transform: `translate(${mouse.x * 0.1}px, ${mouse.y * 0.1}px)`, transition: 'transform 0.3s' }}>
              <span className="block text-white/90">Transformo</span>
              <span className="block text-gradient">ideias em</span>
              <span className="block text-white/90">sistemas.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-lg md:text-xl text-white/50 max-w-xl mb-10 leading-relaxed">
              Fundador da <span className="text-white/80">Kaizem Sistemas</span> e <span className="text-white/80">Digital Toque</span>. Construo produtos digitais, soluções comerciais e experiências conectadas por tecnologia.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex flex-wrap items-center gap-4">
              <a href="#projetos" className="group relative px-7 py-3.5 rounded-full font-medium text-sm overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-500" />
                <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center gap-2">Ver projetos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
              </a>
              <a href="#sistemas" className="px-7 py-3.5 rounded-full font-medium text-sm border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />Explorar ecossistema
              </a>
            </motion.div>
          </div>

          <div className="hidden lg:block lg:col-span-5 relative h-[500px]">
            {[
              { label: 'NFC', x: '10%', y: '20%', delay: 1.2 },
              { label: 'PDV', x: '75%', y: '15%', delay: 1.4 },
              { label: 'API', x: '85%', y: '60%', delay: 1.6 },
              { label: 'IoT', x: '5%', y: '70%', delay: 1.8 },
              { label: 'SaaS', x: '50%', y: '85%', delay: 2.0 },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }} transition={{ delay: item.delay, duration: 0.5, y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' } }} className="absolute mono text-[10px] tracking-[0.3em] text-white/30 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm" style={{ left: item.x, top: item.y }}>
                {item.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/[0.04] bg-[#050507]/80 backdrop-blur-sm overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="mx-8 flex items-center gap-8">
              <span className="mono text-xs tracking-[0.3em] text-white/30">{item}</span>
              <span className="w-1 h-1 rounded-full bg-violet-400/40" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ ABOUT ============
function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-gradient-to-r from-violet-400 to-transparent" />
                <span className="mono text-[10px] tracking-[0.3em] text-violet-400">01 / SOBRE</span>
              </div>
              <h2 className="display text-4xl md:text-5xl font-bold leading-[0.95] mb-6">Quem está por trás dos sistemas.</h2>
              <div className="aspect-square max-w-[280px] rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/[0.06] p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="display text-6xl font-bold text-gradient mb-2">K</div>
                  <div className="mono text-[10px] tracking-[0.3em] text-white/40">KAIZEM</div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="lg:col-span-8 space-y-16">
            <motion.p initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="display text-2xl md:text-4xl font-light leading-[1.2] text-white/80">
              Por trás de cada sistema existe uma tentativa de resolver um <span className="text-gradient font-medium">problema real</span>.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} className="grid md:grid-cols-2 gap-8 text-white/50 leading-relaxed">
              <p>Kaizem é o fundador e desenvolvedor por trás da <span className="text-white/80">Kaizem Sistemas</span> e da <span className="text-white/80">Digital Toque</span>.</p>
              <p>Não se trata apenas de escrever código. Trata-se de entender operações, mapear processos e construir soluções digitais.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ MANIFESTO ============
function Manifesto() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Suspense fallback={null}>
          <ManifestoScene3D />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-transparent to-[#050507] z-[1] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1 }}>
          <div className="mono text-[10px] tracking-[0.3em] text-white/30 mb-8">MANIFESTO</div>
          <h2 className="display text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] max-w-5xl mx-auto">
            <span className="text-white/30">Não é sobre fazer sites.</span><br />
            <span className="text-white/60">É sobre construir</span><br />
            <span className="text-gradient">soluções que funcionam.</span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}

// ============ KAIZEM SISTEMAS ============
function KaizemSistemas() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const modules = [
    { icon: Truck, title: 'Delivery', desc: 'Operação completa de pedidos', color: '#a78bfa', size: 'large' },
    { icon: Monitor, title: 'PDV', desc: 'Ponto de venda inteligente', color: '#22d3ee', size: 'small' },
    { icon: UtensilsCrossed, title: 'Cardápio Digital', desc: 'Experiência digital de pedidos', color: '#f97316', size: 'small' },
    { icon: Calendar, title: 'Eventos', desc: 'Gestão de eventos', color: '#ec4899', size: 'medium' },
    { icon: Package, title: 'Produtos', desc: 'Gerenciamento completo', color: '#10b981', size: 'medium' },
    { icon: ShoppingBag, title: 'Loja', desc: 'Varejo e moda', color: '#f59e0b', size: 'small' },
  ];

  return (
    <section id="sistemas" ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-[#08080d] to-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* 3D Scene Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full z-0 opacity-30">
        <Suspense fallback={null}>
          <SistemasScene3D />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-gradient-to-l from-[#050507] via-transparent to-transparent z-[1] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
            <span className="mono text-[10px] tracking-[0.3em] text-cyan-400">02 / KAIZEM SISTEMAS</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95]">
            Um ecossistema<br /><span className="text-gradient">completo.</span>
          </motion.h2>
        </div>
        <div className="grid grid-cols-12 gap-4 auto-rows-[180px] md:auto-rows-[200px]">
          {modules.map((mod, i) => {
            const sizeClasses = { large: 'col-span-12 md:col-span-7 row-span-2', medium: 'col-span-12 md:col-span-5 row-span-1', small: 'col-span-6 md:col-span-3 row-span-1' }[mod.size as 'large' | 'medium' | 'small'];
            return (
              <motion.div key={mod.title} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.08 }} className={`group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a0a0f] hover-lift ${sizeClasses}`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(circle at 30% 30%, ${mod.color}10, transparent 70%)` }} />
                <div className="relative h-full p-6 md:p-8 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110" style={{ background: `${mod.color}15`, borderColor: `${mod.color}30` }}>
                      <mod.icon size={22} style={{ color: mod.color }} />
                    </div>
                    <span className="mono text-[10px] tracking-[0.2em] text-white/20">0{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="display text-xl md:text-2xl font-bold mb-2">{mod.title}</h3>
                    <p className="text-sm text-white/40">{mod.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============ CONTACT 3D SCENE ============
function ContactScene() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Multiple interconnected spheres */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 2;
        return (
          <group key={i}>
            <mesh position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
              <sphereGeometry args={[0.2, 32, 32]} />
              <meshStandardMaterial 
                color={['#a78bfa', '#22d3ee', '#f97316', '#ec4899'][i % 4]}
                metalness={0.9}
                roughness={0.1}
                emissive={['#a78bfa', '#22d3ee', '#f97316', '#ec4899'][i % 4]}
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* Connection lines to center */}
            <mesh position={[Math.cos(angle) * radius / 2, Math.sin(angle) * radius / 2, 0]}>
              <cylinderGeometry args={[0.005, 0.005, radius, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
          </group>
        );
      })}
      
      {/* Central core */}
      <mesh>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color="#ffffff"
          metalness={1}
          roughness={0}
          emissive="#a78bfa"
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>
    </group>
  );
}

function ContactScene3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#a78bfa" />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#22d3ee" />
        <ContactScene />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

// ============ CONTACT ============
function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="contato" ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0 opacity-25">
        <Suspense fallback={null}>
          <ContactScene3D />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-transparent to-[#050507] z-[1] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-gradient-to-r from-violet-400 to-transparent" />
              <span className="mono text-[10px] tracking-[0.3em] text-violet-400">06 / CONTATO</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] mb-8">
              Tem uma ideia?<br /><span className="text-gradient">Vamos construir.</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="text-white/50 text-lg leading-relaxed max-w-xl mb-12">
              Cada projeto começa com uma conversa. Se você precisa de uma solução digital — estou pronto.
            </motion.p>
            <motion.a initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} href="#" className="group relative inline-flex px-7 py-4 rounded-full font-medium text-sm overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-500" />
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center gap-2">Iniciar projeto <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></span>
            </motion.a>
          </div>
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }} className="space-y-3">
              {[
                { icon: MessageCircle, label: 'WhatsApp', desc: 'Conversa direta', color: '#10b981' },
                { icon: Mail, label: 'E-mail', desc: 'Propostas e projetos', color: '#a78bfa' },
                { icon: Instagram, label: 'Instagram', desc: 'Bastidores', color: '#ec4899' },
              ].map((method, i) => (
                <motion.a key={method.label} href="#" initial={{ opacity: 0, x: 20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.5 + i * 0.1 }} className="group flex items-center gap-5 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:border-white/[0.1] transition-all">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${method.color}15`, border: `1px solid ${method.color}30` }}>
                    <method.icon size={20} style={{ color: method.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white/80">{method.label}</div>
                    <div className="text-xs text-white/40">{method.desc}</div>
                  </div>
                  <ArrowUpRight size={16} className="text-white/20 group-hover:text-white/60 transition-all" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ FOOTER ============
function Footer() {
  return (
    <footer className="relative bg-[#050507] border-t border-white/[0.04]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Kaizem. Todos os direitos reservados.</p>
          <p className="text-xs text-white/20 flex items-center gap-2">
            <span>Construído por</span>
            <span className="text-white/50 font-medium">Kaizem</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============ NFC 3D SCENE ============
function NFCScene() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central NFC tag */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#f97316" metalness={0.8} roughness={0.2} emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Signal rings */}
      {[1.5, 2, 2.5].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.6 - i * 0.15} />
        </mesh>
      ))}
      
      {/* Floating data points */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 2 + Math.random();
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, Math.random() - 0.5]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#a78bfa" />
          </mesh>
        );
      })}
    </group>
  );
}

function NFCScene3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#f97316" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#22d3ee" />
        <NFCScene />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

// ============ SISTEMAS 3D SCENE ============
function SistemasScene() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
  });

  const modules = [
    { color: '#a78bfa', pos: [0, 1.5, 0] as [number, number, number] },
    { color: '#22d3ee', pos: [1.3, 0.75, 0] as [number, number, number] },
    { color: '#f97316', pos: [1.3, -0.75, 0] as [number, number, number] },
    { color: '#ec4899', pos: [0, -1.5, 0] as [number, number, number] },
    { color: '#10b981', pos: [-1.3, -0.75, 0] as [number, number, number] },
    { color: '#f59e0b', pos: [-1.3, 0.75, 0] as [number, number, number] },
  ];

  return (
    <group ref={groupRef}>
      {/* Central core */}
      <mesh>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial color="#a78bfa" metalness={0.9} roughness={0.1} emissive="#a78bfa" emissiveIntensity={0.4} wireframe />
      </mesh>
      
      {/* Orbiting modules */}
      {modules.map((mod, i) => (
        <mesh key={i} position={mod.pos}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color={mod.color} metalness={0.7} roughness={0.3} emissive={mod.color} emissiveIntensity={0.3} />
        </mesh>
      ))}
      
      {/* Connection lines */}
      {modules.map((mod, i) => (
        <mesh key={`line-${i}`}>
          <cylinderGeometry args={[0.01, 0.01, 1.5, 8]} />
          <meshBasicMaterial color={mod.color} transparent opacity={0.3} />
          <group position={[mod.pos[0] / 2, mod.pos[1] / 2, mod.pos[2] / 2]}>
            <primitive object={new THREE.Object3D()} lookAt={new THREE.Vector3(...mod.pos)} />
          </group>
        </mesh>
      ))}
    </group>
  );
}

function SistemasScene3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#a78bfa" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#22d3ee" />
        <SistemasScene />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

// ============ DIGITAL TOQUE ============
function DigitalToque() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeStep, setActiveStep] = useState(0);
  const flowSteps = [
    { icon: QrCode, label: 'TAG NFC', desc: 'Instalada no ambiente' },
    { icon: Wifi, label: 'APROXIMAÇÃO', desc: 'Dispositivo se aproxima' },
    { icon: Database, label: 'REGISTRO', desc: 'Evento capturado' },
    { icon: Activity, label: 'PROCESSAMENTO', desc: 'Dados analisados' },
    { icon: BarChart3, label: 'ANÁLISE', desc: 'Insights gerados' },
  ];

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => setActiveStep((prev) => (prev + 1) % flowSteps.length), 2000);
    return () => clearInterval(interval);
  }, [isInView]);

  const demoStats = [
    { label: 'Tags ativas', value: 24 },
    { label: 'Acessos hoje', value: 156 },
    { label: 'Quartos', value: 12 },
    { label: 'Uptime', value: 99.8, suffix: '%' },
  ];

  return (
    <section id="digital-toque" ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Suspense fallback={null}>
          <NFCScene3D />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-transparent to-[#050507] z-[1] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-orange-400 to-transparent" />
            <span className="mono text-[10px] tracking-[0.3em] text-orange-400">03 / DIGITAL TOQUE</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95]">
            Tecnologia<br /><span className="text-gradient-warm">NFC inteligente.</span>
          </motion.h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} className="mb-16">
          <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 p-4 md:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.01]">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex-1 flex items-center">
                <div className={`flex-1 relative p-4 md:p-6 rounded-xl transition-all duration-500 cursor-pointer ${activeStep === i ? 'bg-white/[0.04] border border-white/[0.08]' : 'border border-transparent'}`} onClick={() => setActiveStep(i)}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-500 ${activeStep === i ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                    <step.icon size={18} className={activeStep === i ? 'text-orange-400' : 'text-white/40'} />
                  </div>
                  <div className="mono text-[10px] tracking-[0.2em] text-white/60 mb-1">{step.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }} className="relative rounded-2xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <Signal size={16} className="text-cyan-400" />
              <span className="font-display font-semibold text-sm">Digital Toque — Painel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="mono text-[10px] tracking-wider text-white/40">LIVE</span>
              <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40">Dados demonstrativos</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04]">
            {demoStats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.7 + i * 0.1 }} className="bg-[#0a0a0f] p-5 md:p-6">
                <div className="mono text-[10px] tracking-wider text-white/40 mb-2 uppercase">{stat.label}</div>
                <div className="display text-3xl md:text-4xl font-bold text-white/90">{stat.value}{stat.suffix || ''}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ PROJECTS ============
function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const projects = [
    { title: 'Sistema de Delivery', category: 'Kaizem Sistemas', description: 'Plataforma completa para gestão de pedidos e entregas.', tags: ['Web App', 'PDV'], accent: '#a78bfa' },
    { title: 'Cardápio Digital', category: 'Kaizem Sistemas', description: 'Experiência digital moderna para restaurantes.', tags: ['Mobile', 'UX'], accent: '#22d3ee' },
    { title: 'Digital Toque', category: 'Digital Toque', description: 'Sistema de controle e análise de tags NFC.', tags: ['NFC', 'IoT'], accent: '#f97316' },
    { title: 'PDV Inteligente', category: 'Kaizem Sistemas', description: 'Ponto de venda completo com gestão de produtos.', tags: ['PDV', 'SaaS'], accent: '#10b981' },
  ];

  return (
    <section id="projetos" ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-[#08080d] to-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-violet-400 to-transparent" />
            <span className="mono text-[10px] tracking-[0.3em] text-violet-400">04 / PROJETOS</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95]">
            O que já<br /><span className="text-gradient">foi construído.</span>
          </motion.h2>
        </div>
        <div className="space-y-8">
          {projects.map((project, i) => (
            <motion.article key={project.title} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 + i * 0.1 }} className="group relative grid md:grid-cols-12 gap-6 md:gap-10 p-6 md:p-10 rounded-3xl border border-white/[0.06] bg-[#0a0a0f] hover:border-white/[0.1] transition-all duration-500 overflow-hidden">
              <div className="absolute top-6 right-6 md:top-10 md:right-10 mono text-[10px] tracking-[0.3em] text-white/20">0{i + 1}</div>
              <div className="md:col-span-5 relative aspect-[4/3] md:aspect-auto rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  <div className="relative w-full max-w-[320px] aspect-[4/3] rounded-xl bg-[#0a0a0f] border border-white/[0.08] overflow-hidden">
                    <div className="h-7 bg-white/[0.03] border-b border-white/[0.06] flex items-center px-3 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400/50" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                      <div className="w-2 h-2 rounded-full bg-green-400/50" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-3 rounded bg-white/[0.06] w-2/3" />
                      <div className="h-2 rounded bg-white/[0.04] w-1/2" />
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="aspect-square rounded-lg bg-white/[0.04]" />
                        <div className="aspect-square rounded-lg bg-white/[0.03]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-7 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: project.accent }} />
                  <span className="mono text-[10px] tracking-[0.2em] text-white/40 uppercase">{project.category}</span>
                </div>
                <h3 className="display text-2xl md:text-4xl font-bold mb-4">{project.title}</h3>
                <p className="text-white/50 leading-relaxed mb-6 max-w-lg">{project.description}</p>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/[0.06] text-white/40">{tag}</span>
                  ))}
                </div>
                <a href="#" className="inline-flex items-center gap-2 text-sm font-medium group/link" style={{ color: project.accent }}>
                  <span>Ver projeto</span>
                  <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CAPABILITIES ============
function Capabilities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const capabilities = [
    { category: 'Desenvolvimento', items: ['Front-end', 'Back-end', 'APIs REST', 'Sistemas Web', 'Arquitetura'], color: '#a78bfa' },
    { category: 'Produtos', items: ['SaaS', 'Dashboards', 'PDV', 'Delivery', 'Comércio'], color: '#22d3ee' },
    { category: 'Experiências', items: ['NFC', 'Automação', 'Integrações', 'IoT', 'Mobile'], color: '#f97316' },
    { category: 'Infraestrutura', items: ['Cloud', 'Banco de Dados', 'Deploy', 'Performance', 'Segurança'], color: '#10b981' },
  ];

  return (
    <section ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-[#08080d] to-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-emerald-400 to-transparent" />
            <span className="mono text-[10px] tracking-[0.3em] text-emerald-400">05 / CAPACIDADES</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95]">
            O que eu<br /><span className="text-gradient">construo.</span>
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap, i) => (
            <motion.div key={cap.category} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 + i * 0.1 }} className="group p-8 rounded-2xl border border-white/[0.06] bg-[#0a0a0f] hover:border-white/[0.1] transition-all duration-500">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full" style={{ background: cap.color }} />
                <span className="mono text-[10px] tracking-[0.2em] text-white/40 uppercase">{cap.category}</span>
              </div>
              <div className="space-y-2">
                {cap.items.map((item) => (
                  <div key={item} className="text-sm text-white/60 group-hover:text-white/80 transition-colors py-1.5 border-b border-white/[0.03] last:border-0">{item}</div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ FAQ ============
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const faqs = [
    { q: 'Como funciona o processo de desenvolvimento?', a: 'Começamos com uma conversa para entender seu negócio, mapeamos os processos e desenvolvemos do zero.' },
    { q: 'Qual a diferença entre Kaizem Sistemas e Digital Toque?', a: 'Kaizem Sistemas é o ecossistema de soluções para comércio. Digital Toque é a tecnologia NFC para controle de interações.' },
    { q: 'Os sistemas podem ser integrados?', a: 'Sim. Todos os módulos são projetados para funcionar de forma independente ou integrada.' },
    { q: 'Quanto tempo leva para desenvolver um sistema?', a: 'Depende da complexidade. Um cardápio digital pode ficar pronto em 2-3 semanas.' },
  ];

  return (
    <section ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-gradient-to-r from-violet-400 to-transparent" />
                <span className="mono text-[10px] tracking-[0.3em] text-violet-400">FAQ</span>
              </div>
              <h2 className="display text-4xl md:text-5xl font-bold leading-[0.95] mb-6">Perguntas<br /><span className="text-gradient">frequentes.</span></h2>
            </motion.div>
          </div>
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0f] p-6 md:p-8">
              {faqs.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-b border-white/[0.06] last:border-0">
                  <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full py-6 flex items-center justify-between text-left group">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="mono text-[10px] tracking-[0.2em] text-white/20">0{i + 1}</span>
                      <h3 className="text-lg md:text-xl font-medium text-white/80 group-hover:text-white transition-colors">{item.q}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center flex-shrink-0 ml-4 transition-all ${openIndex === i ? 'bg-violet-500/20 border-violet-500/30' : 'bg-white/[0.02]'}`}>
                      {openIndex === i ? <Minus size={14} className="text-violet-400" /> : <Plus size={14} className="text-white/40" />}
                    </div>
                  </button>
                  <motion.div initial={false} animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="pb-6 pl-12 text-white/50 leading-relaxed">{item.a}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ FINAL CTA ============
function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/[0.04] rounded-full blur-[200px]" />
      </div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <div className="mono text-[10px] tracking-[0.3em] text-white/30 mb-8">PRÓXIMO PASSO</div>
          <h2 className="display text-4xl md:text-6xl lg:text-8xl font-bold leading-[0.95] mb-8">
            <span className="text-white/40">Sua ideia.</span><br />
            <span className="text-white/90">Meu código.</span><br />
            <span className="text-gradient">Sistema funcionando.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto mb-12 leading-relaxed">Chega de ideias paradas. Vamos construir algo que funciona de verdade.</p>
          <a href="#contato" className="group relative inline-flex px-8 py-4 rounded-full font-medium text-sm overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-500" />
            <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center gap-2">Vamos conversar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ============ MAIN APP ============
function App() {
  return (
    <div className="relative min-h-screen bg-[#050507] text-white grain">
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <WhatsAppButton />
      <BackToTop />
      <Header />
      <main className="relative z-10">
        <Hero />
        <About />
        <Manifesto />
        <KaizemSistemas />
        <DigitalToque />
        <Projects />
        <Capabilities />
        <FAQ />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
