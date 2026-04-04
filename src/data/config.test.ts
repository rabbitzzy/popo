import { describe, it, expect } from 'vitest'
import { computeArenaTier } from './config'

describe('computeArenaTier', () => {
  it('returns Bronze at 0 points', () => {
    expect(computeArenaTier(0, 0)).toBe('Bronze')
  })

  it('returns Bronze just below Silver threshold', () => {
    expect(computeArenaTier(299, 0)).toBe('Bronze')
  })

  it('returns Silver at 300 points', () => {
    expect(computeArenaTier(300, 0)).toBe('Silver')
  })

  it('returns Gold at 600 points', () => {
    expect(computeArenaTier(600, 0)).toBe('Gold')
  })

  it('returns Crystal at 900 points', () => {
    expect(computeArenaTier(900, 0)).toBe('Crystal')
  })

  it('returns Crystal at 1400 points without all 8 Berryvolutions', () => {
    expect(computeArenaTier(1400, 7)).toBe('Crystal')
  })

  it('returns Apex at 1400 points with all 8 Berryvolutions', () => {
    expect(computeArenaTier(1400, 8)).toBe('Apex')
  })

  it('returns Apex above 1400 points with all 8 Berryvolutions', () => {
    expect(computeArenaTier(1700, 8)).toBe('Apex')
  })

  it('clamps negative points to Bronze', () => {
    expect(computeArenaTier(-50, 0)).toBe('Bronze')
  })
})
