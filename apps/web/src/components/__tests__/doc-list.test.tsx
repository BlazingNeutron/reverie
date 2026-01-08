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
            { id: 'doc1', title: 'Document 1' },
            { id: 'doc2', title: 'Document 2' },
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
});
