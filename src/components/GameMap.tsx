import React, { useState, useRef, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force'
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force'
import { ZoneDef } from '../data/types'
import { WORLD_MAP } from '../data/mapGraph'
import styles from './GameMap.module.css'

interface GameMapProps {
  zones: ZoneDef[]
  currentLocationId: string
  reachableIds: string[]
  cooldownUntil: Record<string, number>
  onSearch: (zone: ZoneDef) => void
  onTravel: (locationId: string) => void
}

const NODE_R      = 34
const ICON_SIZE   = 46
const TOUCH_R     = 44
const TRAVEL_MS   = 1400
const BERRY_SIZE  = 30
const BERRY_HALF  = BERRY_SIZE / 2

// World map dimensions — the map's coordinate space, independent of device.
// The window is a viewport into this world; users pan to explore on any screen.
// Increase these values as more zones are added.
const MAP_W = 1200
const MAP_H = 900
// Padding from map edge to outermost node centres
const EDGE_PAD = 80

type NodeRelation = 'current' | 'reachable' | 'locked'

interface TravelAnim { fromId: string; toId: string; key: number }
interface NodePos    { x: number; y: number }

// ── d3-force layout ──────────────────────────────────────────────────────────

interface FNode extends SimulationNodeDatum { id: string }

function runForceLayout(canvasW: number, canvasH: number): Record<string, NodePos> {
  // Seed with scaled versions of the hand-crafted hints so the force engine
  // starts from a geographically sensible state.
  const nodes: FNode[] = WORLD_MAP.nodes.map(n => ({
    id: n.id,
    x: (n.x / 500) * canvasW,
    y: (n.y / 500) * canvasH,
  }))

  const links: SimulationLinkDatum<FNode>[] = WORLD_MAP.edges.map(e => ({
    source: e.from as unknown as FNode,
    target: e.to   as unknown as FNode,
  }))

  // Link distance scales with canvas so layout feels balanced at any size.
  const linkDist = Math.min(canvasW, canvasH) * 0.2

  const sim = forceSimulation<FNode>(nodes)
    .force(
      'link',
      forceLink<FNode, SimulationLinkDatum<FNode>>(links)
        .id(d => d.id)
        .distance(linkDist)
        .strength(0.65),
    )
    .force('charge',    forceManyBody<FNode>().strength(-500))
    .force('center',    forceCenter<FNode>(canvasW / 2, canvasH / 2))
    // Collision radius accounts for node circle + label clearance
    .force('collision', forceCollide<FNode>(NODE_R + 48))
    .stop()

  sim.tick(500)

  // Normalise so all nodes sit within [EDGE_PAD, canvas - EDGE_PAD]
  const xs = nodes.map(n => n.x!)
  const ys = nodes.map(n => n.y!)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  const availW = canvasW - 2 * EDGE_PAD
  const availH = canvasH - 2 * EDGE_PAD
  const scale  = Math.min(availW / rangeX, availH / rangeY)
  // Centre the scaled layout within the available area
  const offX   = EDGE_PAD + (availW - rangeX * scale) / 2
  const offY   = EDGE_PAD + (availH - rangeY * scale) / 2

  const out: Record<string, NodePos> = {}
  for (const n of nodes) {
    out[n.id] = {
      x: offX + (n.x! - minX) * scale,
      y: offY + (n.y! - minY) * scale,
    }
  }
  return out
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBezierCP(
  fromId: string,
  toId: string,
  pos: Record<string, NodePos>,
) {
  const from = pos[fromId] ?? { x: 0, y: 0 }
  const to   = pos[toId]   ?? { x: 0, y: 0 }
  const edge = WORLD_MAP.edges.find(
    e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId),
  )
  const { dx = 0, dy = 0 } = edge?.curve ?? {}
  return { from, to, mx: (from.x + to.x) / 2 + dx, my: (from.y + to.y) / 2 + dy }
}

function quadBezier(p0: number, p1: number, p2: number, t: number) {
  const u = 1 - t
  return u * u * p0 + 2 * u * t * p1 + t * t * p2
}

function fmtMs(ms: number): string {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
}

function HomeIcon({ size }: { size: number }) {
  const s = size / 2
  return (
    <g transform={`translate(${-s}, ${-s})`}>
      <polygon points={`${size*.5},${size*.08} ${size*.05},${size*.46} ${size*.95},${size*.46}`} fill="#fff" opacity={0.9} />
      <rect x={size*.18} y={size*.44} width={size*.64} height={size*.46} fill="#fff" opacity={0.9} />
      <rect x={size*.38} y={size*.62} width={size*.24} height={size*.28} fill="#e8c07a" rx={size*.04} />
    </g>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function GameMap({
  zones, currentLocationId, reachableIds, cooldownUntil, onSearch, onTravel,
}: GameMapProps) {
  const travelImgRef  = useRef<SVGImageElement>(null)
  const animKeyRef    = useRef(0)
  const posRef        = useRef<Record<string, NodePos>>({})

  const [nodePositions, setNodePositions] = useState<Record<string, NodePos>>({})
  const [hoveredId,    setHoveredId]    = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<ZoneDef | null>(null)
  const [travelAnim,   setTravelAnim]   = useState<TravelAnim | null>(null)
  const [now,          setNow]          = useState(() => Date.now())

  // ── Run force layout once on mount against the fixed world dimensions ──────
  useEffect(() => {
    const positions = runForceLayout(MAP_W, MAP_H)
    posRef.current  = positions
    setNodePositions(positions)
  }, [])

  // ── Cooldown ticker ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedZone) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [selectedZone])

  // ── RAF travel animation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!travelAnim) return
    const { from, to, mx, my } = getBezierCP(travelAnim.fromId, travelAnim.toId, posRef.current)
    const el = travelImgRef.current
    if (!el) return
    const start = performance.now()
    let rafId: number
    const step = (ts: number) => {
      const t = Math.min((ts - start) / TRAVEL_MS, 1)
      el.setAttribute('x', String(quadBezier(from.x, mx, to.x, t) - BERRY_HALF))
      el.setAttribute('y', String(quadBezier(from.y, my, to.y, t) - BERRY_HALF))
      if (t < 1) rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [travelAnim?.key])

  // ── Derived state ──────────────────────────────────────────────────────────
  const zoneById: Record<string, ZoneDef> = {}
  for (const z of zones) zoneById[z.id] = z
  const reachableSet = new Set(reachableIds)

  function getRelation(id: string): NodeRelation {
    if (id === currentLocationId) return 'current'
    if (reachableSet.has(id))     return 'reachable'
    return 'locked'
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNodeClick = (nodeId: string) => {
    if (travelAnim) return
    const rel = getRelation(nodeId)
    if (rel === 'current') {
      const zone = zoneById[nodeId]
      if (zone) setSelectedZone(zone)
    } else if (rel === 'reachable') {
      animKeyRef.current += 1
      const key = animKeyRef.current
      setTravelAnim({ fromId: currentLocationId, toId: nodeId, key })
      setTimeout(() => { onTravel(nodeId); setTravelAnim(null) }, TRAVEL_MS)
    }
  }

  const handleSearch = () => {
    if (selectedZone) { onSearch(selectedZone); setSelectedZone(null) }
  }

  const travelSprite = (() => {
    if (!travelAnim) return '/sprites/berry.svg'
    const fromPos = posRef.current[travelAnim.fromId]
    const toPos   = posRef.current[travelAnim.toId]
    return (toPos?.y ?? 0) < (fromPos?.y ?? 0) ? '/sprites/berry_north.svg' : '/sprites/berry_south.svg'
  })()

  const hasLayout = Object.keys(nodePositions).length > 0

  return (
    <div className={styles.wrapper}>
      {hasLayout && (
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={1}
          centerOnInit
          limitToBounds
          panning={{ velocityDisabled: false }}
          wheel={{ disabled: true }}
          pinch={{ disabled: true }}
          doubleClick={{ disabled: true }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: MAP_W, height: MAP_H }}
          >
            <svg
              width={MAP_W}
              height={MAP_H}
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              className={styles.svg}
              aria-label="World map"
              draggable={false}
              onDragStart={e => e.preventDefault()}
            >
              <defs>
                <filter id="nodeShadow"      x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="3"  stdDeviation="4"  floodOpacity="0.22" />
                </filter>
                <filter id="nodeGlow"        x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0"  stdDeviation="8"  floodOpacity="0.55" />
                </filter>
                <filter id="nodeGlowCurrent" x="-60%" y="-60%" width="220%" height="220%">
                  <feDropShadow dx="0" dy="0"  stdDeviation="12" floodOpacity="0.7"  />
                </filter>
              </defs>

              {/* ── Edges ─────────────────────────────────────────── */}
              {WORLD_MAP.edges.map((edge, i) => {
                const from = nodePositions[edge.from]
                const to   = nodePositions[edge.to]
                if (!from || !to) return null
                const { dx = 0, dy = 0 } = edge.curve ?? {}
                const mx = (from.x + to.x) / 2 + dx
                const my = (from.y + to.y) / 2 + dy
                const isActive =
                  edge.from === currentLocationId || edge.to === currentLocationId
                return (
                  <path
                    key={i}
                    d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                    className={isActive ? styles.edgeActive : styles.edge}
                    fill="none"
                  />
                )
              })}

              {/* ── Nodes ─────────────────────────────────────────── */}
              {WORLD_MAP.nodes.map(node => {
                const pos     = nodePositions[node.id]
                if (!pos) return null
                const zone      = zoneById[node.id]
                const hovered   = hoveredId === node.id
                const relation  = getRelation(node.id)
                const isCurrent = relation === 'current'
                const isLocked  = relation === 'locked'
                const isHome    = node.id === 'home'
                const half      = ICON_SIZE / 2
                const cdExpiry  = cooldownUntil[node.id] ?? 0
                const onCooldown = cdExpiry > Date.now()

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className={`${styles.nodeGroup} ${isLocked ? styles.nodeGroupLocked : ''}`}
                    onClick={() => handleNodeClick(node.id)}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    role="button"
                    tabIndex={isLocked ? -1 : 0}
                    aria-label={`${node.label}${isCurrent ? ' (you are here)' : isLocked ? ' (locked)' : ''}`}
                    onKeyDown={e => !isLocked && e.key === 'Enter' && handleNodeClick(node.id)}
                    style={{ opacity: isLocked ? 0.3 : 1 }}
                  >
                    <circle r={TOUCH_R} fill="transparent" className={styles.touchTarget} />

                    {isCurrent && (
                      <>
                        <circle r={NODE_R + 14} fill="none" stroke="#fff" strokeWidth={3} className={styles.currentGlowRing} />
                        <circle r={NODE_R + 6}  fill="none" stroke={node.color} strokeWidth={2} className={styles.currentPulseRing} />
                      </>
                    )}

                    {relation === 'reachable' && (
                      <circle
                        r={NODE_R + 9}
                        fill="none" stroke="#fff" strokeWidth={2.5}
                        strokeDasharray="6 4"
                        opacity={hovered ? 1 : 0.7}
                      />
                    )}

                    <circle
                      r={NODE_R}
                      fill={node.color}
                      opacity={hovered ? 1 : isCurrent ? 0.95 : 0.88}
                      filter={isCurrent ? 'url(#nodeGlowCurrent)' : hovered ? 'url(#nodeGlow)' : 'url(#nodeShadow)'}
                      className={styles.nodeDot}
                      stroke={isCurrent ? '#fff' : 'none'}
                      strokeWidth={isCurrent ? 3 : 0}
                    />

                    {isHome ? (
                      <HomeIcon size={ICON_SIZE} />
                    ) : (
                      <image
                        href={`/sprites/zone-${node.id}.svg`}
                        x={-half} y={-half}
                        width={ICON_SIZE} height={ICON_SIZE}
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}

                    {onCooldown && (
                      <>
                        <circle r={NODE_R} fill="rgba(10,10,20,0.52)" />
                        <text
                          x={NODE_R - 8} y={-(NODE_R - 14)}
                          textAnchor="middle" fontSize={13}
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          💤
                        </text>
                      </>
                    )}

                    <text
                      y={NODE_R + 16}
                      textAnchor="middle"
                      className={`${styles.nodeLabel} ${hovered ? styles.nodeLabelHovered : ''}`}
                    >
                      {node.label}
                    </text>

                    {isCurrent && !travelAnim && (
                      <g className={styles.berryMarker} transform={`translate(0, ${-(NODE_R + 20)})`}>
                        <image
                          href="/sprites/berry.svg"
                          x={-11} y={-11} width={22} height={22}
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </g>
                    )}

                    {hovered && zone && !isLocked && (
                      <g>
                        <rect x={-50} y={-(NODE_R + 36)} width={100} height={28} rx={5} fill="rgba(0,0,0,0.62)" />
                        <text y={-(NODE_R + 24)} textAnchor="middle" className={styles.statLine}>
                          Lv {zone.wildBerryLevelRange[0]}–{zone.wildBerryLevelRange[1]}
                          {'  '}{Math.round(zone.berryEncounterRate * 100)}% enc.
                        </text>
                        {zone.stoneDrops[0] && (
                          <text y={-(NODE_R + 11)} textAnchor="middle" className={styles.statLine}>
                            💎 {zone.stoneDrops[0].stone}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                )
              })}

              {/* ── Traveling Berry ───────────────────────────────── */}
              <image
                ref={travelImgRef}
                href={travelSprite}
                x={-BERRY_HALF} y={-BERRY_HALF}
                width={BERRY_SIZE} height={BERRY_SIZE}
                style={{
                  display: travelAnim ? 'block' : 'none',
                  imageRendering: 'pixelated',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }}
                className={styles.berryWalking}
              />
            </svg>
          </TransformComponent>
        </TransformWrapper>
      )}

      {/* ── Zone modal ──────────────────────────────────────────── */}
      {selectedZone && (
        <div className={styles.backdrop} onClick={() => setSelectedZone(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <img src={`/sprites/zone-${selectedZone.id}.svg`} width={40} height={40} style={{ imageRendering: 'pixelated' }} alt="" />
              <h2 className={styles.modalTitle}>{selectedZone.name}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedZone(null)}>✕</button>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Level Range</span>
                <span className={styles.infoValue}>{selectedZone.wildBerryLevelRange[0]}–{selectedZone.wildBerryLevelRange[1]}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Encounter</span>
                <span className={styles.infoValue}>{Math.round(selectedZone.berryEncounterRate * 100)}%</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Gold Dust</span>
                <span className={styles.infoValue}>{selectedZone.goldDustRange[0]}–{selectedZone.goldDustRange[1]}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Stones</span>
                <span className={styles.infoValue}>{selectedZone.stoneDrops.length} type{selectedZone.stoneDrops.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className={styles.stoneList}>
              {selectedZone.stoneDrops.map(drop => (
                <span key={drop.stone} className={styles.stoneTag}>
                  💎 {drop.stone} ({Math.round(drop.dropRate * 100)}%)
                </span>
              ))}
            </div>
            {(() => {
              const cdExpiry  = cooldownUntil[selectedZone.id] ?? 0
              const remaining = Math.max(0, cdExpiry - now)
              const ready     = remaining === 0
              return (
                <div className={styles.modalFooter}>
                  {ready ? (
                    <button className={styles.exploreBtn} onClick={handleSearch}>
                      🔍 Search Zone
                    </button>
                  ) : (
                    <div className={styles.cooldownBanner}>
                      💤 Recovering — {fmtMs(remaining)}
                    </div>
                  )}
                  <button className={styles.cancelBtn} onClick={() => setSelectedZone(null)}>
                    Cancel
                  </button>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
