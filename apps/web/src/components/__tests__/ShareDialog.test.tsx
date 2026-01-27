import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { ShareDialog } from '../ShareDialog';
import ReactDOMClient from 'react-dom/client';
import { act } from 'react';

describe('Share Dialog component', () => {
  let container : any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('Share Dialog trigger button', async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<ShareDialog />);
    });
    
    expect(container.querySelector('button')).toHaveTextContent("Share");
  });

  it('Share Dialog opens', async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<ShareDialog />);
    });
    
    await act(async () => {
      const shareButton = container.querySelector('button');
      if (shareButton) {
        shareButton.click();
      }
    });

    expect(container.querySelector('#shareDialog')).toHaveTextContent("Share this document");
  });
});
