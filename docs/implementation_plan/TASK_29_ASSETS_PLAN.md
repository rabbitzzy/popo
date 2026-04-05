# TASK-29: Pixel Art Assets & UI Decoration

## Current Assets ✅
- 9 character sprites (Berry + 8 Berryvolutions) - 16x16 pixel art

## New Assets to Create

### 1. Decorative Elements (16x16 pixel grid)
- **Nature**: Grass tuft, tree, flower (red/blue/yellow), rock, water drop
- **UI Badges**: Star, gem, flame, leaf, water drop icons
- **Borders**: Corner pieces, horizontal/vertical edges (for card decoration)
- **Items**: Potion bottle, crystal orb, stamina potion, evolution stone icons

### 2. Zone/Area Backgrounds
- Subtle repeating patterns (grass, sand, snow, waves) as CSS patterns or small PNG tiles

### 3. UI Integration Points

#### MainMenu
- Corner decorative elements (grass, flowers)
- Berry sprite as main visual focus
- Subtle background pattern

#### Tutorial
- Decorative arrows, highlighted elements
- Berry animations (subtle float/bob)

#### PartyScreen / BerryvolutionDetail
- Small nature decorations around party members
- Star/gem badges for evolution form
- Card borders with consistent pixel art style

#### BerryLog
- Grid cells with subtle borders
- Lock icon on unrevealed entries
- Progress bar with decorative caps

#### ZoneSelect
- Zone cards with icon/landscape representation
- Consistent card borders
- Small badge showing difficulty/rewards

#### EncounterScreen
- Grass/nature elements around wild berry display
- Capture meter with decorative style

#### TeamBuilder / Battle
- Simple arena border decoration
- Status effect icons (small pixel versions)
- HP/NRG bars with decorative caps

#### Arena Ladder
- Tier badges with pixel art
- Progress indicators with decorative styling
- Current tier highlight with ornament

#### Shop
- Item icons (orb, potion, stone)
- Gold dust indicator with coin icon
- Consistent card styling

#### Settings
- Small icons for each section
- Subtle decorative separators

## Design Principles
1. **Consistent Palette**: Use the same color set across all assets
2. **Pixel Perfect**: All at 16x16 or 32x32 for even scaling
3. **Kid-Friendly**: Bright colors, rounded shapes, no dark/scary elements
4. **Not Cluttered**: Decorations enhance, don't overwhelm
5. **Reusable**: Assets appear consistently across screens

## Implementation Order
1. Create all sprite assets (SVG files)
2. Create CSS utility classes for decorative patterns
3. Update MainMenu as showcase screen
4. Update other screens systematically
5. Ensure consistent spacing and visual hierarchy

## Color Palette (from existing sprites)
- Reds: #AA2200, #FF4400, #FF9966
- Yellows: #FFAA00, #FFCC00, #FFEE00
- Blues: #0099FF (typical game blue)
- Greens: #00BB00 (from nature/grass)
- Neutrals: #333, #666, #999
- Backgrounds: #f0f9f8 (light cyan), #fff
