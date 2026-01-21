import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useDocStore } from '../../lib/stores/documentStore';
import { NewDocument } from '../NewDocument';

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

let mockFindUserDocs = async () => {
        return [
            { doc_id: 'doc1', title: 'Document 1' },
            { doc_id: 'doc2', title: 'Document 2' },
        ];
    };
// // Mock SupabaseProvider so Editor does not perform network work
vi.mock('../../lib/supabase/y-supabase-provider', () => ({
  SupabaseProvider: class {
    awareness = {};
    constructor() {
      // noop
    }
    findUserDocs = async () => mockFindUserDocs()
  },
}));

describe('New Document component', () => {
  beforeEach(() => {
    useDocStore.setState({ currentDocId: null });
  });
  
  it('New Document does not render when closed', async () => {
    const { container } = render(<NewDocument open={false} />);
    await waitFor(() => {
      expect(container.querySelectorAll('div').length).toBe(1);
    });
  });

  it('New Document renders when open', async () => {
    const { container } = render(<NewDocument open={true} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });
  });

  it('Clicking New Document button reveals textbox, cancel and create buttons', async () => {
    const { container } = render(<NewDocument open={true} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });
    const newDocumentButton = container.querySelector('button');
    if (newDocumentButton) {
        newDocumentButton.click();
    }
    await waitFor(() => {
      expect(container.querySelectorAll('input').length).toBe(1);
    });
    expect(container.querySelectorAll('button').length).toBe(2);
  });
});
