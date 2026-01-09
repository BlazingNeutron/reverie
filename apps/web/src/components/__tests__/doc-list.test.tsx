import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

// Mock SupabaseProvider so Editor does not perform network work
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

import DocList from '../doc-list';

describe('DocList component', () => {
  it('Grabs the list of documents for this user', async () => {
    const { container } = render(<DocList />);
    // wait for list items to appear (mocked)
    await waitFor(() => {
      expect(container.querySelectorAll('li').length).toBe(2);
    });

    expect(container.textContent).toContain('Document 1');
    expect(container.textContent).toContain('Document 2');
  });

  it('Current document is highlighted', async () => {
    const { container } = render(<DocList />);
    // wait for list items to appear (mocked)
    await waitFor(() => {
      expect(container.querySelectorAll('li').length).toBe(2);
    });

    const firstDoc = container.querySelector('li');
    const highlightedStyle = 'font-weight: bold;';

    expect(firstDoc?.getAttribute('style')).toBe(highlightedStyle);
    expect(firstDoc).toBeTruthy();
    if (firstDoc) {
      expect(firstDoc.textContent).toBe('Document 1');
    }
  });

  it('Other documents are not highlighted', async () => {
    const { container } = render(<DocList />);
    // wait for list items to appear (mocked)
    await waitFor(() => {
      expect(container.querySelectorAll('li').length).toBe(2);
    });

    const secondDoc = container.querySelectorAll('li')[1];

    expect(secondDoc).toBeTruthy();
    if (secondDoc) {
      expect(secondDoc.getAttribute('style')).toBeNull();
      expect(secondDoc.textContent).toBe('Document 2');
    }
  });
});
