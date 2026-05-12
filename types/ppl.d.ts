import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ppl-access-point-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'api-key'?: string;
        'language'?: string;
        'view-mode'?: string;
        'access-point-types'?: string;
        'access-point-code'?: string;
      }, HTMLElement>;
    }
  }
}
