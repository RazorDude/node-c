import { inBrowser } from 'vitepress';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import { MermaidZoom } from './mermaidZoom';

import './custom.css';

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp() {
    if (inBrowser) {
      const mermaidZoom = new MermaidZoom();
      mermaidZoom.listen();
    }
  }
};

export default theme;
