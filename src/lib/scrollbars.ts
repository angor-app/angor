import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';

// Initialize OverlayScrollbars with default options
export const initScrollbars = () => {
  // Apply to all elements with custom scrollbar class
  const elements = document.querySelectorAll('[data-overlayscrollbars-initialize]');
  
  elements.forEach((element) => {
    OverlayScrollbars(element as HTMLElement, {
      scrollbars: {
        theme: 'os-theme-dark',
        visibility: 'auto',
        autoHide: 'move',
        autoHideDelay: 800,
      },
      overflow: {
        x: 'hidden',
        y: 'scroll',
      },
    });
  });
};

// Create scrollbar options for React components
export const scrollbarOptions = {
  scrollbars: {
    theme: 'os-theme-dark',
    visibility: 'auto' as const,
    autoHide: 'move' as const,
    autoHideDelay: 800,
  },
  overflow: {
    x: 'hidden' as const,
    y: 'scroll' as const,
  },
};
