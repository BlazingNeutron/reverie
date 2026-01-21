import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { useDocStore } from '../../lib/stores/doc-store';

// Mock yjs Doc
// vi.mock('yjs', () => {
//   return {
//     Doc: class {
//       getText(name: string) {
//         return {
//           insert: () => {},
//           toString: () => 'mock',
//         };
//       }
//     }
//   };
// });

// // Mock SupabaseProvider so Editor does not perform network work
// vi.mock('../../lib/supabase/y-supabase-provider', () => ({
//   SupabaseProvider: class {
//     awareness = {};
//     constructor() {
//       // noop
//     }
//     findUserDocs = async () => {
//         return [
//             { doc_id: 'doc1', title: 'Document 1' },
//             { doc_id: 'doc2', title: 'Document 2' },
//         ];
//     }
//   },
// }));

import { DocumentItem } from '../DocumentItem';
import { Tooltip } from 'radix-ui';

describe('Document Item component', () => {
  beforeEach(() => {
    useDocStore.setState({ currentDocId: null });
  });
  it('Active Document in the side bar while open', async () => {
    const { container } = render(<DocumentItem sidebarOpen={true} doc={{doc_id:"doc1", title:"Document 1"}} isActive={true} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });

    expect(container.textContent).toContain('Document 1');
    expect(container.textContent).toContain('editing');
  });

  it('Inactive Document in the side bar while open', async () => {
    const { container } = render(<DocumentItem sidebarOpen={true} doc={{doc_id:"doc2", title:"Document 2"}} isActive={false} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });

    expect(container.textContent).toContain('Document 2');
    expect(container.textContent).not.toContain('editing');
  });

  it('Clicking inactive changes session currentDocId - sidebar open', async () => {
    const useDocStore = (await import('../../lib/stores/doc-store')).useDocStore;
    const { container } = render(<DocumentItem sidebarOpen={true} doc={{doc_id:"doc2", title:"Document 2"}} isActive={false} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });
    
    expect(useDocStore.getState().currentDocId).toBeNull();

    const inActiveDocumentButton = container.querySelector('button');
    if (inActiveDocumentButton) {
      inActiveDocumentButton.click();
    }
    expect(useDocStore.getState().currentDocId).toBe("doc2");
  });

  it('Clicking inactive changes session currentDocId - sidebar closed', async () => {
    const useDocStore = (await import('../../lib/stores/doc-store')).useDocStore;
    const { container } = render(
      <Tooltip.Provider>
        <DocumentItem sidebarOpen={false} doc={{doc_id:"doc2", title:"Document 2"}} isActive={false} />
      </Tooltip.Provider>
    );
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });
    
    expect(useDocStore.getState().currentDocId).toBeNull();

    const inActiveDocumentButton = container.querySelector('button');
    if (inActiveDocumentButton) {
      inActiveDocumentButton.click();
    }
    expect(useDocStore.getState().currentDocId).toBe("doc2");
  });

  it('Active Document - closed sidebar - has indicator', async () => {
    const { container } = render(<Tooltip.Provider>
      <DocumentItem sidebarOpen={false} doc={{doc_id:"doc1", title:"Document 1"}} isActive={true} />
    </Tooltip.Provider>);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });

    expect(container.querySelector('span')?.className).toContain('bg-green-400');
  });

  it('Inactive Document in the side bar while open', async () => {
    const { container } = render(<Tooltip.Provider>
      <DocumentItem sidebarOpen={false} doc={{doc_id:"doc2", title:"Document 2"}} isActive={false} />
    </Tooltip.Provider>);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });

    expect(container.querySelector('span')).toBeNull();
  });
  // it('Current document is highlighted', async () => {
  //   const { container } = render(<DocList />);
  //   await waitFor(() => {
  //     expect(container.querySelectorAll('li').length).toBe(2);
  //   });

  //   const firstDoc = container.querySelector('li');
  //   const highlightedStyle = 'font-weight: bold;';

  //   expect(firstDoc?.getAttribute('style')).toBe(highlightedStyle);
  //   expect(firstDoc).toBeTruthy();
  //   if (firstDoc) {
  //     expect(firstDoc.textContent).toBe('Document 1');
  //   }
  // });

  // it('Other documents are not highlighted', async () => {
  //   const { container } = render(<DocList />);
  //   await waitFor(() => {
  //     expect(container.querySelectorAll('li').length).toBe(2);
  //   });

  //   const secondDoc = container.querySelectorAll('li')[1];

  //   expect(secondDoc).toBeTruthy();
  //   if (secondDoc) {
  //     expect(secondDoc.getAttribute('style')).toBeNull();
  //     expect(secondDoc.textContent).toBe('Document 2');
  //   }
  // });

  // it('Clicking on a document changes the current document', async () => {
  //   const { container } = render(<DocList />);
  //   await waitFor(() => {
  //     expect(container.querySelectorAll('li').length).toBe(2);
  //   });

  //   const secondDoc = container.querySelectorAll('li')[1];
  //   expect(secondDoc).toBeTruthy();
  //   if (secondDoc) {
  //     secondDoc.click();
  //   }

  //   await waitFor(() => {
  //     const updatedSecondDoc = container.querySelectorAll('li')[1];
  //     expect(updatedSecondDoc?.getAttribute('style')).toBe('font-weight: bold;');
  //   });
  // });
});
