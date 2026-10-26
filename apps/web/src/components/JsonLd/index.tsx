import React from 'react'

/** One <script type="application/ld+json"> per node (`<` escaped so the data cannot close the tag). */
export const JsonLd: React.FC<{ data: Record<string, unknown> | Record<string, unknown>[] }> = ({
  data,
}) => (
  <>
    {(Array.isArray(data) ? data : [data]).map((node, i) => (
      <script
        key={i}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', ...node }).replace(
            /</g,
            '\\u003c',
          ),
        }}
        type="application/ld+json"
      />
    ))}
  </>
)
