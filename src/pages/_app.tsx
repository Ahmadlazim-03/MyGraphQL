import { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import React from 'react';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const MP = MantineProvider as any;
  return (
    <MP
      withGlobalStyles
      withNormalizeCSS
      theme={{
        // cast to any to avoid strict theme typing differences across Mantine versions
        ...( { colorScheme: 'dark', primaryColor: 'teal' } as any ),
      }}
    >
      <Component {...pageProps} />
    </MP>
  );
}
