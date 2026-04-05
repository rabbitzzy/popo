// ============================================================================
// World Map Graph — edit this file to reshape the world
// ============================================================================
// Coordinate system: SVG viewBox 0 0 500 500
//   x: 0 (left) → 500 (right)
//   y: 0 (top)  → 500 (bottom)
//
// NODE LAYOUT OVERVIEW
// ─────────────────────────────────────────────
//  Northern Plateau   Crystal Spire · Ember Crater · Ashfall Summit · Stormcliff Ridge
//  Eastern Coast      Tide Basin · Coral Shallows
//  Central Heartlands Verdant Vale · Thornwood · Dusty Badlands
//  Western Reaches    Glacial Rift · Frostpeak Zone · Shadowmere Bog
//  Southern Basin     Mossy Cavern · Home (hub) · Sunbaked Dunes · Wandering Path
//
// TOPOLOGY NOTES
//  • All nodes are in one connected component — no islands.
//  • Peninsula tips (degree-1 or single-entry chains):
//      Crystal Spire  — enter via Ember Crater OR Glacial Rift
//      Sunbaked Dunes — enter via Home OR Wandering Path
//  • Notable loops create route variety:
//      Northern loop:  Ember Crater → Ashfall Summit → Stormcliff Ridge → Tide Basin → Ember Crater (via Verdant Vale)
//      Western loop:   Glacial Rift → Crystal Spire → Ember Crater → Verdant Vale → Frostpeak Zone → Glacial Rift
//      Southern basin: Home → Mossy Cavern → Shadowmere Bog → Dusty Badlands → Wandering Path → Home

export interface MapNode {
  /** Must match a ZoneDef.id (or 'home' for the hub) */
  id: string
  label: string
  /** SVG coordinate within the 500×500 viewBox */
  x: number
  y: number
  color: string
}

export interface MapEdge {
  from: string
  to: string
  /** Bezier control-point offset from the midpoint — tweak to avoid visual overlap */
  curve?: { dx: number; dy: number }
}

export interface WorldMapGraph {
  nodes: MapNode[]
  edges: MapEdge[]
}

// ── Constants ────────────────────────────────────────────────────────────────

/** The non-explorable home hub where every new game starts. */
export const HOME_LOCATION = 'home'

/**
 * Returns the IDs of all locations directly connected to the given location.
 * Movement is only allowed along existing edges.
 */
export function getAdjacentZoneIds(locationId: string): string[] {
  const adjacent = new Set<string>()
  for (const edge of WORLD_MAP.edges) {
    if (edge.from === locationId) adjacent.add(edge.to)
    if (edge.to   === locationId) adjacent.add(edge.from)
  }
  return Array.from(adjacent)
}

// ── World Map ─────────────────────────────────────────────────────────────────

export const WORLD_MAP: WorldMapGraph = {
  // --------------------------------------------------------------------------
  // NODES  (x: 50–450, y: 45–460)
  // --------------------------------------------------------------------------
  nodes: [
    // ── Northern Plateau ───────────────────────────────────────────────────
    { id: 'crystal-spire',    label: 'Crystal Spire',    x:  72, y:  55, color: '#9b59b6' },
    { id: 'ember-crater',     label: 'Ember Crater',     x: 235, y:  48, color: '#e85d26' },
    { id: 'ashfall-summit',   label: 'Ashfall Summit',   x: 385, y:  72, color: '#c0392b' },
    { id: 'stormcliff-ridge', label: 'Stormcliff Ridge', x: 455, y: 115, color: '#e6b800' },

    // ── Eastern Coast ───────────────────────────────────────────────────────
    { id: 'tide-basin',       label: 'Tide Basin',       x: 368, y: 155, color: '#2e9fcc' },
    { id: 'coral-shallows',   label: 'Coral Shallows',   x: 450, y: 220, color: '#ff6b6b' },

    // ── Central Heartlands ──────────────────────────────────────────────────
    { id: 'verdant-vale',     label: 'Verdant Vale',     x: 210, y: 158, color: '#4caf50' },
    { id: 'thornwood',        label: 'Thornwood',        x: 192, y: 248, color: '#27ae60' },
    { id: 'dusty-badlands',   label: 'Dusty Badlands',   x: 328, y: 245, color: '#c8a96e' },

    // ── Western Reaches ─────────────────────────────────────────────────────
    { id: 'glacial-rift',     label: 'Glacial Rift',     x:  52, y: 162, color: '#a8d8ea' },
    { id: 'frostpeak-zone',   label: 'Frostpeak Zone',   x:  80, y: 248, color: '#80d8f0' },
    { id: 'shadowmere-bog',   label: 'Shadowmere Bog',   x: 105, y: 335, color: '#6c3483' },

    // ── Southern Basin ──────────────────────────────────────────────────────
    { id: 'wandering-path',   label: 'Wandering Path',   x: 355, y: 338, color: '#a78bfa' },
    { id: 'mossy-cavern',     label: 'Mossy Cavern',     x: 160, y: 408, color: '#52734d' },
    { id: 'home',             label: 'Home',             x: 262, y: 442, color: '#e8c07a' },
    { id: 'sunbaked-dunes',   label: 'Sunbaked Dunes',   x: 400, y: 418, color: '#e8b84b' },
  ],

  // --------------------------------------------------------------------------
  // EDGES  (curve dx/dy offset from midpoint — positive dx bows right, positive dy bows down)
  // --------------------------------------------------------------------------
  edges: [
    // ── Northern Plateau ───────────────────────────────────────────────────
    { from: 'crystal-spire',  to: 'ember-crater',     curve: { dx:   0, dy: -22 } },  // arches above
    { from: 'ember-crater',   to: 'ashfall-summit',   curve: { dx:   0, dy: -18 } },
    { from: 'ashfall-summit', to: 'stormcliff-ridge', curve: { dx:  18, dy: -12 } },

    // ── Northern ↔ Central ──────────────────────────────────────────────────
    { from: 'ember-crater',   to: 'verdant-vale',     curve: { dx: -18, dy:   0 } },
    { from: 'stormcliff-ridge', to: 'tide-basin',     curve: { dx:  20, dy:   0 } },

    // ── Eastern Coast ───────────────────────────────────────────────────────
    { from: 'tide-basin',     to: 'verdant-vale',     curve: { dx:   0, dy: -15 } },
    { from: 'tide-basin',     to: 'coral-shallows',   curve: { dx:  22, dy:   0 } },
    { from: 'coral-shallows', to: 'wandering-path',   curve: { dx:  28, dy:   0 } },

    // ── Central Heartlands ──────────────────────────────────────────────────
    { from: 'verdant-vale',   to: 'thornwood',        curve: { dx: -15, dy:   0 } },
    { from: 'verdant-vale',   to: 'dusty-badlands',   curve: { dx:   0, dy:  15 } },
    { from: 'thornwood',      to: 'dusty-badlands',   curve: { dx:   0, dy:  18 } },
    { from: 'dusty-badlands', to: 'wandering-path',   curve: { dx:  18, dy:   0 } },

    // ── Western Reaches ─────────────────────────────────────────────────────
    { from: 'crystal-spire',  to: 'glacial-rift',     curve: { dx: -18, dy:   0 } },
    { from: 'glacial-rift',   to: 'frostpeak-zone',   curve: { dx: -16, dy:   0 } },
    { from: 'frostpeak-zone', to: 'shadowmere-bog',   curve: { dx: -16, dy:   0 } },

    // ── West ↔ Central ───────────────────────────────────────────────────────
    { from: 'shadowmere-bog', to: 'dusty-badlands',   curve: { dx:   0, dy:  18 } },

    // ── Southern Basin ──────────────────────────────────────────────────────
    { from: 'shadowmere-bog', to: 'mossy-cavern',     curve: { dx: -18, dy:   0 } },
    { from: 'mossy-cavern',   to: 'home',             curve: { dx: -15, dy:  15 } },
    { from: 'home',           to: 'wandering-path',   curve: { dx:  18, dy:  15 } },
    { from: 'home',           to: 'sunbaked-dunes',   curve: { dx:  15, dy:  18 } },
    { from: 'wandering-path', to: 'sunbaked-dunes',   curve: { dx:  22, dy:   0 } },

    // ── Frostpeak ↔ Home (western entry to southern basin) ──────────────────
    { from: 'frostpeak-zone', to: 'home',             curve: { dx: -28, dy:  12 } },
  ],
}
