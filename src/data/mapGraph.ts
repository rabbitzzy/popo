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
// Default world map - Mobile optimized vertical layout
// ----------------------------------------------------------------------------

export const WORLD_MAP: WorldMapGraph = {
  // Vertical arrangement optimized for mobile screens
  // Nodes arranged in a diamond/vertical pattern for better space usage
  nodes: [
    { id: 'ember-crater',   label: 'Ember Crater',   x: 250, y:  60, color: '#e85d26' },  // Top center
    { id: 'tide-basin',     label: 'Tide Basin',      x: 380, y: 140, color: '#2e9fcc' },  // Upper right
    { id: 'verdant-vale',   label: 'Verdant Vale',    x: 250, y: 200, color: '#4caf50' },  // Center
    { id: 'frostpeak-zone', label: 'Frostpeak Zone',  x: 120, y: 280, color: '#80d8f0' },  // Lower left
    { id: 'wandering-path', label: 'Wandering Path',  x: 380, y: 320, color: '#a78bfa' },  // Bottom right
  ],
  edges: [
    // Curved paths connecting zones
    { from: 'ember-crater',   to: 'verdant-vale',    curve: { dx: -40, dy: -20 } },
    { from: 'tide-basin',     to: 'verdant-vale',    curve: { dx:  30, dy: -20 } },
    { from: 'verdant-vale',   to: 'frostpeak-zone',  curve: { dx: -30, dy:  20 } },
    { from: 'verdant-vale',   to: 'wandering-path',  curve: { dx:  40, dy:  30 } },
    { from: 'ember-crater',   to: 'tide-basin',      curve: { dx:  50, dy: -30 } },
    { from: 'frostpeak-zone', to: 'wandering-path',  curve: { dx:   0, dy:  40 } },
  ],
}
