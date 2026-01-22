import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useDocStore } from '../../lib/stores/documentStore';
import { Sidebar } from '../Sidebar';
import { Tooltip } from 'radix-ui';
import ReactDOMClient from 'react-dom/client';
import { act } from 'react';

// Mock yjs Doc
vi.mock('yjs', () => {
  return {
    Doc: class {
      getText() {
        return {
          insert: () => {},
          toString: () => 'mock',
        };
      }
    }
  };
});

// // Mock SupabaseProvider so Editor does not perform network work
vi.mock('../../lib/supabase/y-supabase-provider', () => ({
  SupabaseProvider: class {
    awareness = {};
    constructor() {
      // noop
    }
    findUserDocs = async () => {
        return [
            { doc_id: 'doc1', title: 'Document 1' },
            { doc_id: 'doc2', title: 'Document 2' },
        ];
    }
  },
}));

describe('Sidebar component', () => {
  let container : any;

  beforeEach(() => {
    useDocStore.setState({ currentDocId: null });
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('Sidebar renders open', async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<Tooltip.Provider>
        <Sidebar />
      </Tooltip.Provider>);
    });
    
    expect(container.querySelector('aside')).toBeTruthy();
    expect(container.querySelector('aside')?.className).contains("w-72");

    await act(async () => {
      const hamburgerMenuButton = container.querySelector('button');
      if (hamburgerMenuButton) {
        hamburgerMenuButton.click();
      }
    });
    
    expect(container.querySelector('aside')).toBeTruthy();
    expect(container.querySelector('aside')?.className).contains("w-16");
  });
});
