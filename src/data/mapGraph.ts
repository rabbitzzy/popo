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
}

export interface WorldMapGraph {
  nodes: MapNode[]
  edges: MapEdge[]
}

// ----------------------------------------------------------------------------
// Default world map
// ----------------------------------------------------------------------------

export const WORLD_MAP: WorldMapGraph = {
  nodes: [
    { id: 'ember-crater',  label: 'Ember Crater',   x: 110, y:  80, color: '#e85d26' },
    { id: 'tide-basin',    label: 'Tide Basin',      x: 390, y:  90, color: '#2e9fcc' },
    { id: 'verdant-vale',  label: 'Verdant Vale',    x: 250, y: 190, color: '#4caf50' },
    { id: 'frostpeak-zone',label: 'Frostpeak Zone',  x: 110, y: 300, color: '#80d8f0' },
    { id: 'wandering-path',label: 'Wandering Path',  x: 390, y: 300, color: '#a78bfa' },
  ],
  edges: [
    { from: 'ember-crater',   to: 'verdant-vale'   },
    { from: 'tide-basin',     to: 'verdant-vale'   },
    { from: 'verdant-vale',   to: 'frostpeak-zone' },
    { from: 'verdant-vale',   to: 'wandering-path' },
    { from: 'ember-crater',   to: 'frostpeak-zone' },
    { from: 'tide-basin',     to: 'wandering-path' },
  ],
}
