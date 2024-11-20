import { Button, createTheme } from '@mantine/core'

/*Overriding light/dark color schemas
@see https://stackoverflow.com/questions/78279141/how-to-change-body-bg-color-for-light-and-dark-mode-mantine-ui */

// https://mantine.dev/styles/css-variables/#css-variables-resolver

const theme = createTheme({
  fontFamily: '"Roboto", Monaco, Courier, monospace',
  fontFamilyMonospace: '"Roboto", Monaco, Courier, monospace',
  headings: {
    fontFamily: '"Lexend Deca", sans-serif',
    // sizes: { h4: { fontSize: rem(24) } },
    textWrap: 'wrap',
  },
  primaryColor: 'matcha',
  white: '#fdfaf6',
  colors: {
    matcha: [
      '#edf9ec',
      '#e1ece0',
      '#c5d6c4',
      '#a7bea5',
      '#8eaa8b',
      '#7d9d7a',
      '#749770',
      '#62845e',
      '#557552',
      '#466643',
    ],
    earth: [
      '#fbf5ec',
      '#f0e9df',
      '#ded2be',
      '#ccb99a',
      '#bda47b',
      '#b49667',
      '#af905b',
      '#9a7c4b',
      '#896e40',
      '#785e32',
    ],
    transparent: [
      '#00000000',
      '#00000000',
      '#00000000',
      '#00000000',
      '#00000000',
      '#00000000',
      '#00000000',
      '#00000000',
      '#00000000',
      '#00000000',
    ],
    'ocean-blue': [
      '#7AD1DD',
      '#5FCCDB',
      '#44CADC',
      '#2AC9DE',
      '#1AC2D9',
      '#11B7CD',
      '#09ADC3',
      '#0E99AC',
      '#128797',
      '#147885',
    ],
    'bright-pink': [
      '#F0BBDD',
      '#ED9BCF',
      '#EC7CC3',
      '#ED5DB8',
      '#F13EAF',
      '#F71FA7',
      '#FF00A1',
      '#E00890',
      '#C50E82',
      '#AD1374',
    ],
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        variant: 'filled',
      },
    }),
    // Paper: Paper.extend({
    //   defaultProps: {
    //     bd: '1 solid var(--mantine-color-matcha-2)',
    //   },
    // }),
    // Divider: Divider.extend({
    //   defaultProps: {
    //     bd: '1 solid var(--mantine-color-matcha-2)',
    //   },
    // }),
    // AppShell: {
    //   defaultProps: {
    //     bd: '1 solid var(--mantine-color-matcha-2)',
    //   },
    // },

    // AppShellHeader: {
    //   defaultProps: {
    //     bd: '1 solid var(--mantine-color-matcha-2)',
    //   },
    // },
    // AppShellMain: {
    //   defaultProps: {
    //     bd: '1 solid var(--mantine-color-matcha-2)',
    //   },
    // },
    // AppShellFooter: {
    //   defaultProps: {
    //     bd: '1 solid var(--mantine-color-matcha-2)',
    //   },
    // },
  },
})

export default theme
