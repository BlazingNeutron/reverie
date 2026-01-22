import ReactDOMClient from 'react-dom/client';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useDocStore } from '../../lib/stores/documentStore';
import { NewDocument } from '../NewDocument';
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
  
  it('New Document does not render when closed', async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<NewDocument open={false} />);
    });
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('New Document renders when open', async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<NewDocument open={true} />);
    });
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('Clicking New Document button reveals textbox, cancel and create buttons', async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<NewDocument open={true} />);
    });
    
    await act(async () => {
      const newDocumentButton = container.querySelector('button');
      if (newDocumentButton) {
          newDocumentButton.click();
      }
    });
    
    expect(container.querySelectorAll('input').length).toBe(1);
    expect(container.querySelectorAll('button').length).toBe(2);
  });
});
