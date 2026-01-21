import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useDocStore } from '../../lib/stores/doc-store';

// Mock yjs Doc
vi.mock('yjs', () => {
  return {
    Doc: class {
      getText(name: string) {
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

import { Sidebar } from '../Sidebar';
import { Tooltip } from 'radix-ui';

describe('Sidebar component', () => {
  beforeEach(() => {
    useDocStore.setState({ currentDocId: null });
  });
  it('Sidebar renders open', async () => {
    const { container } = render(<Tooltip.Provider>
      <Sidebar />
    </Tooltip.Provider>);
    await waitFor(() => {
      expect(container.querySelector('aside')).toBeTruthy();
    });
    expect(container.querySelector('aside')?.className).contains("w-72");

    const hamburgerMenuButton = container.querySelector('button');
    if (hamburgerMenuButton) {
      hamburgerMenuButton.click();
    }
    await waitFor(() => {
      expect(container.querySelector('aside')).toBeTruthy();
    });
    expect(container.querySelector('aside')?.className).contains("w-16");
  });
});
