import ReactDOMClient from 'react-dom/client';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useDocStore } from '../../lib/stores/documentStore';
import { NewDocument } from '../NewDocument';
import { act } from 'react';
import userEvent from '@testing-library/user-event'
import { fireEvent, waitFor } from '@testing-library/react';

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
// // Mock SupabaseProvider so it does not perform network work
vi.mock('../../lib/supabase/ySupabaseProvider', () => ({
  SupabaseProvider: class {
    awareness = {};
    constructor() {
      // noop
    }
    findUserDocs = async () => mockFindUserDocs()
    createDocument = vi.fn().mockReturnValue("new-doc-id")
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

  it('Clicking New Document button then ESC does cancel', async () => {
    
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
    await act(async () => {
      const titleInput = container.querySelector('input');
      titleInput.focus();
      expect(titleInput).toHaveFocus();
      fireEvent.keyDown(titleInput, {key: 'Escape', code: 'Escape'})
    });
    
    expect(container.querySelectorAll('input').length).toBe(0);
  });

  it('Clicking New Document button then Enter saves a new document', async () => {
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
    const titleInput = container.querySelector('input');
    await act(async () => {
      titleInput.focus();
      userEvent.type(titleInput, 'foo')
    });
    
    await waitFor(() => {
      expect(titleInput.value).toBe('foo');
    });
    
    await act(async () => {
      fireEvent.keyDown(titleInput, {key: 'Enter', code: 'Enter'});
    });
    
    expect(container.querySelectorAll('input').length).toBe(0);
  });
});
