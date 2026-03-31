import { useState } from 'react'
import { useGameStore, useInventory } from '../store/gameStore'
import { Button, Card, ConfirmDialog } from '../components'
import { SHOP_PRICES } from '../data/config'

type ShopItem = 'crystalOrb' | 'staminaPotion'

export default function Shop() {
  const setScreen = useGameStore(state => state.setScreen)
  const updateSaveState = useGameStore(state => state.updateSaveState)
  const inventory = useInventory()

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items: Array<{ id: ShopItem; name: string; description: string; price: number }> = [
    {
      id: 'crystalOrb',
      name: 'Crystal Orb',
      description: 'Powers evolution stones. Collect to unlock rare Berryvolutions.',
      price: SHOP_PRICES.crystalOrb,
    },
    {
      id: 'staminaPotion',
      name: `Stamina Potion (+${SHOP_PRICES.staminaPotionAmount})`,
      description: `Restores ${SHOP_PRICES.staminaPotionAmount} Stamina. Needed for Zone exploration.`,
      price: SHOP_PRICES.staminaPotion,
    },
  ]

  const canAfford = (price: number) => inventory.goldDust >= price

  const handlePurchase = () => {
    if (!selectedItem) return

    const item = items.find(i => i.id === selectedItem)
    if (!item) return

    if (!canAfford(item.price)) {
      setError('Not enough Gold Dust')
      setShowConfirm(false)
      return
    }

    // Apply purchase
    const currentInventory = inventory
    if (selectedItem === 'crystalOrb') {
      updateSaveState({
        inventory: {
          ...currentInventory,
          goldDust: currentInventory.goldDust - item.price,
          crystalOrbs: currentInventory.crystalOrbs + 1,
        },
      })
    } else if (selectedItem === 'staminaPotion') {
      updateSaveState({
        inventory: {
          ...currentInventory,
          goldDust: currentInventory.goldDust - item.price,
          stamina: currentInventory.stamina + SHOP_PRICES.staminaPotionAmount,
        },
      })
    }

    setSelectedItem(null)
    setShowConfirm(false)
    setError(null)
  }

  const handleItemClick = (itemId: ShopItem) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    if (!canAfford(item.price)) {
      setError('Not enough Gold Dust')
      setSelectedItem(null)
      return
    }

    setSelectedItem(itemId)
    setShowConfirm(true)
    setError(null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f9f8',
        padding: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Button variant="secondary" size="small" onClick={() => setScreen({ id: 'main-menu' })}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2d8b85' }}>
          Shop
        </h1>
      </div>

      {/* Balance card */}
      <Card style={{ marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        <div style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Gold Dust Balance
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#f57f17',
            }}
          >
            {inventory.goldDust}
          </div>
        </div>
      </Card>

      {/* Shop items */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
          Available Items
        </h2>
        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          {items.map(item => (
            <Card
              key={item.id}
              style={{
                cursor: canAfford(item.price) ? 'pointer' : 'not-allowed',
                opacity: canAfford(item.price) ? 1 : 0.6,
              }}
            >
              <div
                onClick={() => canAfford(item.price) && handleItemClick(item.id)}
                style={{
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {item.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#f57f17',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {item.price}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>Gold Dust</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            maxWidth: '600px',
            margin: '1rem auto 0',
            backgroundColor: '#ffebee',
            border: '1px solid #ff6b6b',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            color: '#d32f2f',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && selectedItem && (
        <ConfirmDialog
          title="Purchase Item?"
          description={`Spend ${items.find(i => i.id === selectedItem)?.price} Gold Dust?`}
          onConfirm={handlePurchase}
          onCancel={() => {
            setShowConfirm(false)
            setSelectedItem(null)
            setError(null)
          }}
        />
      )}
    </div>
  )
}
