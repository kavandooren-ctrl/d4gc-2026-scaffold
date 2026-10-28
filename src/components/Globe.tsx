import { useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { SatelliteRecord } from "../data/types";
import { REGIME_COLORS } from "../data/types";
import { getLatestObservation, getDisplayAltitude } from "../data/loadSatellites";

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_UNITS = 1;
const KM_TO_UNITS = EARTH_RADIUS_UNITS / EARTH_RADIUS_KM;

function latLonToVector3(
  latDeg: number,
  lonDeg: number,
  altKm: number,
): THREE.Vector3 {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const r = (EARTH_RADIUS_KM + altKm) * KM_TO_UNITS;
  const x = r * Math.cos(lat) * Math.cos(lon);
  const y = r * Math.sin(lat);
  const z = -r * Math.cos(lat) * Math.sin(lon);
  return new THREE.Vector3(x, y, z);
}

interface MarkerProps {
  sat: SatelliteRecord;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

function SatelliteMarker({ sat, isSelected, onSelect, onHover }: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const position = useMemo(() => {
    const obs = getLatestObservation(sat);
    if (!obs || obs.latitude === null || obs.longitude === null || obs.altitudeKm === null) {
      return null;
    }
    return latLonToVector3(obs.latitude, obs.longitude, obs.altitudeKm);
  }, [sat]);

  useFrame(() => {
    if (meshRef.current && (isSelected || hovered)) {
      const scale = isSelected ? 1.8 + Math.sin(Date.now() * 0.005) * 0.15 : 1.4;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(sat.noradId);
    },
    [sat.noradId, onSelect],
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(true);
      onHover(sat.noradId);
      document.body.style.cursor = "pointer";
    },
    [sat.noradId, onHover],
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(false);
      onHover(null);
      document.body.style.cursor = "default";
    },
    [],
  );

  if (!position) return null;

  const color = REGIME_COLORS[sat.orbitRegime] ?? REGIME_COLORS.Unknown;
  const size = isSelected ? 0.018 : 0.012;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[size, 12, 12]} />
      <meshBasicMaterial
        color={isSelected ? "#ffffff" : color}
        transparent
        opacity={isSelected ? 1 : hovered ? 0.95 : 0.8}
      />
    </mesh>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 64, 64]} />
        <meshPhongMaterial
          color="#1a2a3a"
          emissive="#0a1520"
          specular="#1e3a5f"
          shininess={10}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS_UNITS * 1.005, 64, 64]} />
        <meshBasicMaterial
          color="#2a5a8a"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

interface GlobeProps {
  satellites: SatelliteRecord[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

function CameraController({ resetKey }: { resetKey: number }) {
  const { camera } = useThree();
  useMemo(() => {
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);
  }, [resetKey, camera]);
  return null;
}

export function Globe({
  satellites,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
}: GlobeProps) {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1);
    onSelect(null);
  }, [onSelect]);

  const markers = useMemo(
    () =>
      satellites.map((sat) => (
        <SatelliteMarker
          key={sat.noradId}
          sat={sat}
          isSelected={selectedId === sat.noradId}
          onSelect={onSelect}
          onHover={onHover}
        />
      )),
    [satellites, selectedId, onSelect, onHover],
  );

  const hoveredSat = hoveredId
    ? satellites.find((s) => s.noradId === hoveredId)
    : null;

  return (
    <div className="globe-container">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 50, near: 0.01, far: 100 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#05080f"]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} />
        <Stars
          radius={50}
          depth={20}
          count={2000}
          factor={3}
          saturation={0}
          fade
          speed={0.5}
        />
        <Earth />
        {markers}
        <CameraController resetKey={resetKey} />
        <OrbitControls
          enablePan={false}
          minDistance={1.3}
          maxDistance={6}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>

      {hoveredSat && (
        <div className="globe-tooltip">
          <span className="tooltip-name">{hoveredSat.name}</span>
          <span className="tooltip-row">
            {hoveredSat.orbitRegime} · {hoveredSat.group}
          </span>
          <span className="tooltip-row">
            Alt: {getDisplayAltitude(hoveredSat)?.toLocaleString() ?? "—"} km
          </span>
          <span className="tooltip-row">
            Inc: {hoveredSat.inclinationDeg?.toFixed(1) ?? "—"}°
          </span>
        </div>
      )}

      <button className="globe-reset-btn" onClick={handleReset} aria-label="Reset view and selection">
        Reset View
      </button>

      <div className="globe-legend">
        {Object.entries(REGIME_COLORS).map(([regime, color]) => (
          <span key={regime} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {regime}
          </span>
        ))}
      </div>

      <div className="globe-disclaimer">Simulated positions — illustrative only</div>
    </div>
  );
}
