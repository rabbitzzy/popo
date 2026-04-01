// ============================================================================
// World Map Graph — configurable data structure
// ============================================================================
// The game world is modeled as a graph of nodes (zones) connected by edges
// (traversable paths). Modify this file to add new zones, change layout, or
// reconnect areas without touching any UI code.

export interface MapNode {
  /** Must match a ZoneDef.id */
  id: string
  /** Display label on the map */
  label: string
  /** SVG coordinate within a 500×380 viewBox (0–500 x, 0–380 y) */
  x: number
  y: number
  /** Node accent color */
  color: string
}

export interface MapEdge {
  from: string  // MapNode.id
  to: string    // MapNode.id
  /** Optional bezier control-point offset from the midpoint (dx, dy) */
  curve?: { dx: number; dy: number }
}

export interface WorldMapGraph {
  nodes: MapNode[]
  edges: MapEdge[]
}

// ----------------------------------------------------------------------------
// Default world map
// ----------------------------------------------------------------------------

export const WORLD_MAP: WorldMapGraph = {
  // Deliberately uneven — avoids a rigid grid look.
  // Ember (top-left, pushed in), Tide (top-right, shifted down a bit),
  // Verdant (off-center), Frostpeak (mid-left, lower), Wandering (far right, low).
  nodes: [
    { id: 'ember-crater',   label: 'Ember Crater',   x:  95, y:  70, color: '#e85d26' },
    { id: 'tide-basin',     label: 'Tide Basin',      x: 400, y: 105, color: '#2e9fcc' },
    { id: 'verdant-vale',   label: 'Verdant Vale',    x: 220, y: 205, color: '#4caf50' },
    { id: 'frostpeak-zone', label: 'Frostpeak Zone',  x: 130, y: 320, color: '#80d8f0' },
    { id: 'wandering-path', label: 'Wandering Path',  x: 405, y: 295, color: '#a78bfa' },
  ],
  edges: [
    // Winding paths — control-point offsets give each trail a unique bend
    { from: 'ember-crater',   to: 'verdant-vale',    curve: { dx: -55, dy:  25 } },
    { from: 'tide-basin',     to: 'verdant-vale',    curve: { dx:  40, dy: -30 } },
    { from: 'verdant-vale',   to: 'frostpeak-zone',  curve: { dx: -45, dy:  20 } },
    { from: 'verdant-vale',   to: 'wandering-path',  curve: { dx:  50, dy:  30 } },
    { from: 'ember-crater',   to: 'frostpeak-zone',  curve: { dx: -50, dy:   0 } },
    { from: 'tide-basin',     to: 'wandering-path',  curve: { dx:  55, dy:  10 } },
  ],
}
