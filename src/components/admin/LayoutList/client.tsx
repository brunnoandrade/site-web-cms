'use client'

import { Button, Gutter, useConfig } from '@payloadcms/ui'
import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import { useRouter } from 'next/navigation'
import React from 'react'

export type LayoutRow = {
  tenantID: number | string
  name: string
  siteUrl: string
  docID: number | string | null
  updatedAt: string | null
}

type Props = {
  collectionSlug: 'header' | 'footer'
  rows: LayoutRow[]
  title: string
}

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'

/** One row per property: picking it selects that property (cookie and menu selector) and opens its document. */
export const LayoutListClient: React.FC<Props> = ({ collectionSlug, rows, title }) => {
  const router = useRouter()
  const { setTenant } = useTenantSelection()
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()

  const open = (row: LayoutRow) => {
    // Without refresh: the navigation below loads the document of the property just selected.
    setTenant({ id: row.tenantID, refresh: false })
    router.push(
      `${admin}/collections/${collectionSlug}/${row.docID === null ? 'create' : row.docID}`,
    )
  }

  const cell: React.CSSProperties = {
    padding: 'calc(var(--base) * 0.6) var(--base)',
    borderBottom: '1px solid var(--theme-elevation-100)',
    textAlign: 'left',
  }

  return (
    <Gutter>
      <h1 style={{ marginBottom: 'calc(var(--base) * 0.5)' }}>{title}</h1>
      <p style={{ color: 'var(--theme-elevation-600)', marginBottom: 'var(--base)' }}>
        Um por propriedade. Escolha de qual propriedade você quer editar.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: 'var(--theme-elevation-600)' }}>
            <th style={cell}>Propriedade</th>
            <th style={cell}>Site</th>
            <th style={cell}>Situação</th>
            <th style={cell}>Última modificação</th>
            <th style={cell} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.tenantID}>
              <td style={{ ...cell, fontWeight: 600 }}>{row.name}</td>
              <td style={cell}>{row.siteUrl}</td>
              <td style={cell}>{row.docID === null ? 'Ainda não criado' : 'Configurado'}</td>
              <td style={cell}>{formatDate(row.updatedAt)}</td>
              <td style={{ ...cell, textAlign: 'right' }}>
                <Button
                  buttonStyle={row.docID === null ? 'primary' : 'secondary'}
                  onClick={() => open(row)}
                  size="small"
                >
                  {row.docID === null ? 'Criar' : 'Editar'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Gutter>
  )
}
