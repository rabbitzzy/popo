import { PartyMember, BerryvolutionId, BerryvolutionDef } from '../data/types'
import { getBerryvolutionById } from '../data/berryvolutions'
import { BERRY } from '../data/berry'
import Card from './Card'
import StatBar from './StatBar'
import TypeBadge from './TypeBadge'
import Sprite from './Sprite'

interface BerryvolutionCardProps {
  member: PartyMember
  onClick?: () => void
  selected?: boolean
  compact?: boolean
}

export default function BerryvolutionCard({ member, onClick, selected = false, compact = false }: BerryvolutionCardProps) {
  const def = member.defId === 'berry' ? BERRY : getBerryvolutionById(member.defId as BerryvolutionId)
  const type = member.defId === 'berry' ? null : (def as BerryvolutionDef).type

  if (compact) {
    return (
      <Card onClick={onClick} selected={selected}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
            <Sprite
              spriteUrl={`/sprites/${member.defId}.svg`}
              alt={def.name}
              size="md"
            />
          </div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'capitalize', fontSize: '0.875rem' }}>{def.name}</h4>
          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginBottom: '0.5rem', alignItems: 'center' }}>
            {type && <TypeBadge type={type} size="small" />}
            <span style={{ fontSize: '0.75rem', color: '#666' }}>Lv. {member.level}</span>
          </div>
          <StatBar label="HP" current={member.currentStats.hp} max={member.maxHp} color="#FF6B6B" showValues={false} />
        </div>
      </Card>
    )
  }

  return (
    <Card onClick={onClick} selected={selected}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ height: '96px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Sprite
            spriteUrl={`/sprites/${member.defId}.svg`}
            alt={def.name}
            size="lg"
          />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', textTransform: 'capitalize' }}>{def.name}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {type && <TypeBadge type={type} size="medium" />}
            <span style={{ fontSize: '0.875rem', color: '#666', padding: '0.375rem 0.75rem', backgroundColor: '#f5f5f5', borderRadius: '0.25rem' }}>
              Level {member.level}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            <div>
              XP: {member.xp} / Next Level
            </div>
            {member.unlockedMoveIds.length > 0 && <div>Moves: {member.unlockedMoveIds.length} unlocked</div>}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <StatBar label="HP" current={member.currentStats.hp} max={member.maxHp} color="#FF6B6B" />
        <StatBar label="ATK" current={member.currentStats.atk} max={member.currentStats.atk} color="#FFE66D" showValues={false} />
        <StatBar label="DEF" current={member.currentStats.def} max={member.currentStats.def} color="#95E77D" showValues={false} />
        <StatBar label="SPD" current={member.currentStats.spd} max={member.currentStats.spd} color="#4ECDC4" showValues={false} />
        <StatBar label="NRG" current={member.currentStats.nrg} max={member.currentStats.nrg} color="#A0E7E5" showValues={false} />
      </div>
    </Card>
  )
}
