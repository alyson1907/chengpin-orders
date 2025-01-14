import { useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useMemo } from 'react'

export const bp = {
  base: 0,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
}

/**
 *
 * @returns `0` - base
 * @returns `1` - xs
 * @returns `2` - sm
 * @returns `3` - md
 * @returns `4` - lg
 * @returns `5` - xl
 */
export const useBreakpoint = (): any => {
  const xs = useMediaQuery('(min-width: 36em') // 576
  const sm = useMediaQuery('(min-width: 48em') // 768
  const md = useMediaQuery('(min-width: 62em') // 992
  const lg = useMediaQuery('(min-width: 75em') // 1200
  const xl = useMediaQuery('(min-width: 88em') // 1408

  const results = [true, xs as boolean, sm as boolean, md as boolean, lg as boolean, xl as boolean, false]
  return results.findIndex((value) => !value)
}

export const isScreenLarger = (currentBp: number, bpName: 'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'): boolean => {
  return currentBp > bp[bpName]
}

export const isScreenSmaller = (currentBp: number, bpName: 'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'): boolean => {
  return !isScreenLarger(currentBp, bpName)
}
/** Receives a callback function with rules to apply depending on screen size and applies returns the proper object
 * @param fn function that receives the current `breakpoint` (`base, sm, md...`) , resolves it and returns a object for each case
 */
export const useResolveSizes = (fn: (currentBp: number) => Record<string, any>) => {
  const bp = useBreakpoint()
  return useMemo(() => fn(bp), [bp, fn])
}

export const useMantineColor = (colorName: string, invertShade = false) => {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'
  const darkThemeColor = theme.colors[colorName][4]
  const lightThemeColor = theme.colors[colorName][8]
  if (invertShade) {
    return isDark ? lightThemeColor : darkThemeColor
  }
  return isDark ? darkThemeColor : lightThemeColor
}
