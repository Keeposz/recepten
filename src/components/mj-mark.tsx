type Props = {
  className?: string
  title?: string
}

/**
 * Merged MJ monogram. The M's rightmost downstroke extends past its baseline
 * and hooks back to form the J — so M and J share a single vertical stroke.
 *
 * ViewBox is tight to the glyph bounds — use a flex container with
 * items-center + justify-center to center it inside a parent box.
 */
export function MJMark({ className, title = 'M & J' }: Props) {
  return (
    <svg
      viewBox="0 0 54 89"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      {/* M body */}
      <polygon points="0,0 0,64 12,64 12,26 27,46 42,26 42,64 54,64 54,0 42,0 27,16 12,0" />
      {/* J hook continuing from M's right leg */}
      <path d="M 42 60 L 54 60 L 54 77 C 54 87 45 91 36 89 C 26 87 20 81 17 73 L 27 69 C 28 75 31 78 36 78 C 40 78 42 76 42 74 Z" />
    </svg>
  )
}
