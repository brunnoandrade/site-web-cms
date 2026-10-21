import React from 'react'

/**
 * Text from the CMS with line breaks (`\n`) and **highlighted** parts (rendered with the class
 * given in `highlightClassName`; without it the `**` markers are simply dropped).
 */
export const Lines: React.FC<{ text: string; highlightClassName?: string }> = ({ text, highlightClassName }) => (
  <>
    {text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <span key={j} className={highlightClassName}>
              {part.slice(2, -2)}
            </span>
          ) : (
            part
          ),
        )}
      </React.Fragment>
    ))}
  </>
)

/** Paragraphs separated by a blank line. */
export const Paragraphs: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <>
    {text
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map((paragraph, i) => (
        <p key={i} className={className}>
          <Lines text={paragraph} />
        </p>
      ))}
  </>
)
