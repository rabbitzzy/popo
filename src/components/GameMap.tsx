import React, { useState } from 'react'
import { ZoneDef } from '../data/types'
import { WORLD_MAP, MapNode } from '../data/mapGraph'
import styles from './GameMap.module.css'

interface GameMapProps {
  zones: ZoneDef[]
  onZoneClick: (zone: ZoneDef) => void
}

const SVG_W = 500
const SVG_H = 390
const NODE_R = 32       // hit-area / icon half-size
const ICON_SIZE = 44    // pixel art icon rendered width/height

/** Compute the quadratic bezier control point from a midpoint + offset */
function controlPoint(x1: number, y1: number, x2: number, y2: number, dx: number, dy: number) {
  const mx = (x1 + x2) / 2 + dx
  const my = (y1 + y2) / 2 + dy
  return { mx, my }
}

export default function GameMap({ zones, onZoneClick }: GameMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<ZoneDef | null>(null)

  const zoneById: Record<string, ZoneDef> = {}
  for (const z of zones) zoneById[z.id] = z

  const handleNodeClick = (node: MapNode) => {
    const zone = zoneById[node.id]
    if (zone) setSelectedZone(zone)
  }

  const handleExplore = () => {
    if (selectedZone) {
      onZoneClick(selectedZone)
      setSelectedZone(null)
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* ── SVG Graph ─────────────────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className={styles.svg}
        aria-label="World map"
      >
        {/* Defs for reusable patterns / filters */}
        <defs>
          <filter id="nodeShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.22" />
          </filter>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* Curved edges */}
        {WORLD_MAP.edges.map((edge, i) => {
          const from = WORLD_MAP.nodes.find(n => n.id === edge.from)
          const to   = WORLD_MAP.nodes.find(n => n.id === edge.to)
          if (!from || !to) return null
          const { dx = 0, dy = 0 } = edge.curve ?? {}
          const { mx, my } = controlPoint(from.x, from.y, to.x, to.y, dx, dy)
          return (
            <path
              key={i}
              d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
              className={styles.edge}
              fill="none"
            />
          )
        })}

        {/* Nodes */}
        {WORLD_MAP.nodes.map(node => {
          const zone    = zoneById[node.id]
          const hovered = hoveredId === node.id
          const half    = ICON_SIZE / 2

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className={styles.nodeGroup}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              role="button"
              tabIndex={0}
              aria-label={node.label}
              onKeyDown={e => e.key === 'Enter' && handleNodeClick(node)}
            >
              {/* Pulse ring */}
              <circle
                r={NODE_R + 6}
                fill="none"
                stroke={node.color}
                strokeWidth={2}
                opacity={hovered ? 0.6 : 0.25}
                className={styles.pulseRing}
              />

              {/* Background disc */}
              <circle
                r={NODE_R}
                fill={node.color}
                opacity={hovered ? 1 : 0.88}
                filter={hovered ? 'url(#nodeGlow)' : 'url(#nodeShadow)'}
                className={styles.nodeDot}
              />

              {/* Pixel art zone icon */}
              <image
                href={`/sprites/zone-${node.id}.svg`}
                x={-half}
                y={-half}
                width={ICON_SIZE}
                height={ICON_SIZE}
                style={{ imageRendering: 'pixelated' }}
                className={styles.nodeIcon}
              />

              {/* Label */}
              <text
                y={NODE_R + 16}
                textAnchor="middle"
                className={`${styles.nodeLabel} ${hovered ? styles.nodeLabelHovered : ''}`}
              >
                {node.label}
              </text>

              {/* Quick stat callout on hover */}
              {hovered && zone && (
                <g>
                  <rect
                    x={-52} y={-(NODE_R + 38)}
                    width={104} height={30}
                    rx={5}
                    fill="rgba(0,0,0,0.62)"
                  />
                  <text
                    y={-(NODE_R + 25)}
                    textAnchor="middle"
                    className={styles.statLine}
                  >
                    Lv {zone.wildBerryLevelRange[0]}–{zone.wildBerryLevelRange[1]}
                    {'  '}
                    {Math.round(zone.berryEncounterRate * 100)}% enc.
                  </text>
                  {zone.stoneDrops[0] && (
                    <text
                      y={-(NODE_R + 13)}
                      textAnchor="middle"
                      className={styles.statLine}
                    >
                      💎 {zone.stoneDrops[0].stone}
                    </text>
                  )}
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* ── Zone Detail Modal ──────────────────────────────────────────── */}
      {selectedZone && (
        <div className={styles.backdrop} onClick={() => setSelectedZone(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <img
                src={`/sprites/zone-${selectedZone.id}.svg`}
                width={40}
                height={40}
                style={{ imageRendering: 'pixelated' }}
                alt=""
              />
              <h2 className={styles.modalTitle}>{selectedZone.name}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedZone(null)}>✕</button>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Level Range</span>
                <span className={styles.infoValue}>
                  {selectedZone.wildBerryLevelRange[0]}–{selectedZone.wildBerryLevelRange[1]}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Encounter</span>
                <span className={styles.infoValue}>
                  {Math.round(selectedZone.berryEncounterRate * 100)}%
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Gold Dust</span>
                <span className={styles.infoValue}>
                  {selectedZone.goldDustRange[0]}–{selectedZone.goldDustRange[1]}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Stones</span>
                <span className={styles.infoValue}>
                  {selectedZone.stoneDrops.length} type{selectedZone.stoneDrops.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className={styles.stoneList}>
              {selectedZone.stoneDrops.map(drop => (
                <span key={drop.stone} className={styles.stoneTag}>
                  💎 {drop.stone} ({Math.round(drop.dropRate * 100)}%)
                </span>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.exploreBtn} onClick={handleExplore}>
                🔍 Search Zone
              </button>
              <button className={styles.cancelBtn} onClick={() => setSelectedZone(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
