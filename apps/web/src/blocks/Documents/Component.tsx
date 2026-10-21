import { ChevronDown } from 'lucide-react'
import React from 'react'

import type { DocumentsBlock as Props } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { Picture } from '@/components/Picture'

const action =
  'inline-flex items-center rounded-full bg-[#e8e8e8] px-6 py-3 text-base font-normal text-black transition-colors hover:bg-black hover:text-white max-md:px-4 max-md:py-2 max-md:text-sm'

/**
 * Uber Conta financial information: groups of documents, each row with its icon, name and an
 * "Acessar" button. Items with several links open a menu (native <details>, no JavaScript).
 */
export const DocumentsBlock: React.FC<Props> = ({ groups }) => (
  <div className="container max-md:px-0 min-[992px]:mb-24 min-[992px]:pt-8">
    {(groups ?? []).map((group, i) => (
      <div key={group.id ?? i}>
        <h2 className="mb-0 mt-12 text-base font-medium max-md:pl-4">{group.title}</h2>
        <ul className="m-0 list-none p-0">
          {(group.items ?? []).map((item, j) => {
            const links = item.links ?? []
            return (
              <li
                key={item.id ?? j}
                className="flex items-center border-b border-[#f3f3f3] px-4 py-8 transition-colors hover:bg-[#f3f3f3] max-md:py-4"
              >
                <span className="mr-4 flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e8e8e8]">
                  {item.icon && <Picture alt="" className="size-6" image={item.icon} />}
                </span>
                <h3 className="m-0 max-w-[215px] text-sm font-medium md:max-w-none md:text-xl">{item.title}</h3>
                <div className="ml-auto">
                  {links.length === 1 ? (
                    <CMSLink {...links[0].link} appearance="inline" className={action} label="Acessar" newTab />
                  ) : (
                    <details className="group relative">
                      <summary className={`${action} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                        Acessar
                        <ChevronDown aria-hidden className="ml-2 size-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <ul className="absolute right-0 z-10 mt-2 min-w-48 list-none rounded-lg bg-white p-0 py-2 shadow-[0_8px_35px_#00000026]">
                        {links.map((l, k) => (
                          <li key={l.id ?? k}>
                            <CMSLink {...l.link} appearance="inline" className="block px-4 py-2 font-light" newTab />
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    ))}
  </div>
)
