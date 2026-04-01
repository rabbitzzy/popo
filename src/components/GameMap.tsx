import React, { useState } from 'react'
import { ZoneDef } from '../data/types'
import { WORLD_MAP, MapNode } from '../data/mapGraph'
import styles from './GameMap.module.css'

interface GameMapProps {
  zones: ZoneDef[]
  onZoneClick: (zone: ZoneDef) => void
}

const SVG_W = 500
const SVG_H = 380
const NODE_R = 36  // circle radius

export default function GameMap({ zones, onZoneClick }: GameMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<ZoneDef | null>(null)

  // Build id→ZoneDef lookup
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
      {/* ── SVG Graph ─────────────────────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className={styles.svg}
        aria-label="World map"
      >
        {/* Edges */}
        {WORLD_MAP.edges.map((edge, i) => {
          const from = WORLD_MAP.nodes.find(n => n.id === edge.from)
          const to   = WORLD_MAP.nodes.find(n => n.id === edge.to)
          if (!from || !to) return null
          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x}   y2={to.y}
              className={styles.edge}
            />
          )
        })}

        {/* Nodes */}
        {WORLD_MAP.nodes.map(node => {
          const zone    = zoneById[node.id]
          const hovered = hoveredId === node.id

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
              {/* Glow ring on hover */}
              {hovered && (
                <circle
                  r={NODE_R + 10}
                  fill={node.color}
                  opacity={0.25}
                  className={styles.glowRing}
                />
              )}

              {/* Main circle */}
              <circle
                r={NODE_R}
                fill={node.color}
                className={`${styles.nodeDot} ${hovered ? styles.nodeDotHovered : ''}`}
                stroke="#fff"
                strokeWidth={3}
              />

              {/* Pulse ring (always visible, subtle) */}
              <circle
                r={NODE_R + 4}
                fill="none"
                stroke={node.color}
                strokeWidth={2}
                opacity={hovered ? 0.7 : 0.3}
                className={styles.pulseRing}
              />

              {/* Label below circle */}
              <text
                y={NODE_R + 18}
                textAnchor="middle"
                className={`${styles.nodeLabel} ${hovered ? styles.nodeLabelHovered : ''}`}
              >
                {node.label}
              </text>

              {/* Quick stats on hover */}
              {hovered && zone && (
                <>
                  <text y={-(NODE_R + 14)} textAnchor="middle" className={styles.statLine}>
                    Lv {zone.wildBerryLevelRange[0]}–{zone.wildBerryLevelRange[1]}
                  </text>
                  <text y={-(NODE_R + 2)} textAnchor="middle" className={styles.statLine}>
                    {Math.round(zone.berryEncounterRate * 100)}% encounter
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>

      {/* ── Zone Detail Modal ─────────────────────────────────────────────── */}
      {selectedZone && (
        <div className={styles.backdrop} onClick={() => setSelectedZone(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedZone.name}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedZone(null)}>✕</button>
            </div>

            {/* Info grid */}
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

            {/* Stone drops */}
            <div className={styles.stoneList}>
              {selectedZone.stoneDrops.map(drop => (
                <span key={drop.stone} className={styles.stoneTag}>
                  💎 {drop.stone} ({Math.round(drop.dropRate * 100)}%)
                </span>
              ))}
            </div>

            {/* Actions */}
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
