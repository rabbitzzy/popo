import styles from './Sprite.module.css'

export type SpriteSize = 'sm' | 'md' | 'lg'
export type SpriteAnimState = 'idle' | 'attack' | 'faint'

interface SpriteProps {
  spriteUrl: string
  alt?: string
  size?: SpriteSize
  animState?: SpriteAnimState
  /** Mirror the sprite horizontally — used for the enemy side in battle */
  flipped?: boolean
}

export default function Sprite({
  spriteUrl,
  alt = '',
  size = 'md',
  animState = 'idle',
  flipped = false,
}: SpriteProps) {
  // Transform class (flip / faint) and attack flash are independent — compute separately
  // so flipped + attack can apply both classes simultaneously.
  const transformClass =
    animState === 'faint'
      ? styles.faintFlipped
      : flipped
      ? styles.flipped
      : ''

  const classes = [
    styles.sprite,
    styles[size],
    transformClass,
    animState === 'attack' ? styles.attack : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <img
      src={spriteUrl}
      alt={alt}
      className={classes}
      draggable={false}
    />
  )
}
