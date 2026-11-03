'use client'

import React, { createContext, useContext } from 'react'

import { defaultUiTexts, type UiTexts } from '@/lib/uiTexts'

const UiTextsContext = createContext<UiTexts>(defaultUiTexts)

/** Makes the property's interface texts available to client components (`useUiTexts`). */
export const UiTextsProvider: React.FC<{ value: UiTexts; children: React.ReactNode }> = ({
  value,
  children,
}) => <UiTextsContext.Provider value={value}>{children}</UiTextsContext.Provider>

export const useUiTexts = () => useContext(UiTextsContext)
