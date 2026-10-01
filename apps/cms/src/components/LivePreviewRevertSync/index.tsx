'use client'

import { useDocumentEvents, useDocumentInfo } from '@payloadcms/ui'
import React from 'react'

/**
 * "Revert to published" only resets the admin form: it never reports a document event, and the
 * live preview iframe refreshes only on those events (RefreshRouteOnSave), so it kept showing
 * the discarded draft. The revert drops the unpublished versions, so when their count falls to
 * zero without a publish we report an update ourselves. After a publish the Edit view reports
 * its own; one extra refresh is harmless.
 */
export const LivePreviewRevertSync: React.FC = () => {
  const { collectionSlug, id, unpublishedVersionCount } = useDocumentInfo()
  const { reportUpdate } = useDocumentEvents()
  const previousCount = React.useRef(unpublishedVersionCount)

  React.useEffect(() => {
    const previous = previousCount.current
    previousCount.current = unpublishedVersionCount

    // `doc` is required: relationship fields read `mostRecentUpdate.doc.id` on every event.
    if (previous > 0 && unpublishedVersionCount === 0 && collectionSlug && id) {
      reportUpdate({
        id,
        doc: { id },
        entitySlug: collectionSlug,
        operation: 'update',
        updatedAt: new Date().toISOString(),
      })
    }
  }, [unpublishedVersionCount, collectionSlug, id, reportUpdate])

  return null
}
