import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colors: {
    gray: [
      '#FFFFFF',
      '#f1f5f9',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8',
      '#64748b',
      '#475569',
      '#334155',
      '#1e293b',
      '#0f172a',
    ],
    blue: [
      '#eef5fb',
      '#d9e8f5',
      '#b7d2ea',
      '#8bb4d8',
      '#6096c5',
      '#3f78ad',
      '#2e6090',
      '#244d75',
      '#1d4165',
      '#17365d',
    ],
  },
  primaryColor: 'blue',
  primaryShade: { light: 7, dark: 4 },
  defaultRadius: 'md',
  components: {
    Paper: {
      styles: {
        root: {
          '--paper-border-color': 'var(--mantine-color-gray-2)',
          backgroundColor: 'var(--mantine-color-white)',
        },
      },
    },
  },
});

export const cssVariablesResolver = (theme) => ({
  variables: {},
  light: {
    '--mantine-color-body': theme.colors.gray[0],
    '--mantine-color-text': theme.colors.gray[8],
    '--mantine-color-dimmed': theme.colors.gray[5],
  },
  dark: {},
});
