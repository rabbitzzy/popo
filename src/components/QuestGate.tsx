import { useState, useEffect } from 'react'
import { QuestContext, QuestQuestion, pickQuestion } from '../data/questQuestions'
import styles from '../screens/TriviaQuest.module.css'

// ── Props ────────────────────────────────────────────────────────────────────

export interface QuestGateProps {
  questContext: QuestContext
  /** Short description shown on the card, e.g. "Before you search Frostpeak Zone…" */
  actionLabel: string
  onPass: () => void
  onFail: () => void
  /**
   * When true (used by the full-screen TriviaQuest wrapper) the footer shows
   * a "Main Menu" escape button after answering.  In inline usage this is false
   * so the player always returns to the calling screen.
   */
  showMainMenuEscape?: boolean
  onMainMenu?: () => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const DIFF_CLASS: Record<string, string> = {
  easy:   styles.diffEasy,
  medium: styles.diffMedium,
  hard:   styles.diffHard,
}

// ── Component ────────────────────────────────────────────────────────────────

export default function QuestGate({
  questContext,
  actionLabel,
  onPass,
  onFail,
  showMainMenuEscape = false,
  onMainMenu,
}: QuestGateProps) {
  const [question] = useState<QuestQuestion>(() => pickQuestion(questContext))
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [revealed, setRevealed] = useState(false)

  const passed = revealed && selected === question.answer

  // Small delay before revealing so the selection feels intentional
  useEffect(() => {
    if (selected === null) return
    const t = setTimeout(() => setRevealed(true), 350)
    return () => clearTimeout(t)
  }, [selected])

  function handleSelect(letter: 'A' | 'B' | 'C' | 'D') {
    if (selected !== null) return
    setSelected(letter)
  }

  function optionClass(letter: 'A' | 'B' | 'C' | 'D') {
    const base = `${styles.option} ${selected !== null ? styles.optionDisabled : ''}`
    if (!revealed) return base
    if (letter === question.answer) {
      return `${base} ${passed ? styles.optionCorrect : styles.optionRevealCorrect}`
    }
    if (letter === selected) return `${base} ${styles.optionWrong}`
    return base
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.icon}>📜</span>
          <h2 className={styles.title}>Knowledge Quest</h2>
        </div>
        <hr className={styles.divider} />
        <p className={styles.actionLabel}>{actionLabel}</p>

        {/* Meta */}
        <div className={styles.meta}>
          <span className={`${styles.diffBadge} ${DIFF_CLASS[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className={styles.categoryLabel}>{question.category}</span>
        </div>

        {/* Question */}
        <p className={styles.question}>{question.question}</p>

        {/* Options */}
        <div className={styles.options}>
          {question.options.map(opt => (
            <button
              key={opt.letter}
              className={optionClass(opt.letter)}
              onClick={() => handleSelect(opt.letter)}
              disabled={selected !== null}
            >
              <span className={styles.optionLetter}>{opt.letter}</span>
              {opt.text}
            </button>
          ))}
        </div>

        {/* Result banner */}
        {revealed && (
          <div className={`${styles.result} ${passed ? styles.resultPass : styles.resultFail}`}>
            <span className={styles.resultIcon}>{passed ? '✓' : '✗'}</span>
            <div className={styles.resultText}>
              <p className={styles.resultHeadline}>
                {passed ? 'Correct! Quest complete.' : 'Not quite…'}
              </p>
              <p className={styles.resultExplanation}>{question.explanation}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          {!revealed ? (
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onFail}>
              Skip quest
            </button>
          ) : passed ? (
            <>
              {showMainMenuEscape && onMainMenu && (
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onMainMenu}>
                  Main Menu
                </button>
              )}
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onPass}>
                Continue →
              </button>
            </>
          ) : (
            <>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onFail}>
                Go back
              </button>
              {showMainMenuEscape && onMainMenu && (
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onMainMenu}>
                  Main Menu
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
