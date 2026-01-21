import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { useDocStore } from '../../lib/stores/documentStore';
import { DocumentItem } from '../DocumentItem';
import { Tooltip } from 'radix-ui';

describe('Document Item component', () => {
  beforeEach(() => {
    useDocStore.setState({ currentDocId: null });
  });
  it('Active Document in the side bar while open', async () => {
    const { container } = render(<DocumentItem open={true} doc={{doc_id:"doc1", title:"Document 1"}} isActive={true} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });

    expect(container.textContent).toContain('Document 1');
    expect(container.textContent).toContain('editing');
  });

  it('Inactive Document in the side bar while open', async () => {
    const { container } = render(<DocumentItem open={true} doc={{doc_id:"doc2", title:"Document 2"}} isActive={false} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });

    expect(container.textContent).toContain('Document 2');
    expect(container.textContent).not.toContain('editing');
  });

  it('Clicking inactive changes session currentDocId - sidebar open', async () => {
    const useDocStore = (await import('../../lib/stores/documentStore')).useDocStore;
    const { container } = render(<DocumentItem open={true} doc={{doc_id:"doc2", title:"Document 2"}} isActive={false} />);
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
    const useDocStore = (await import('../../lib/stores/documentStore')).useDocStore;
    const { container } = render(
      <Tooltip.Provider>
        <DocumentItem open={false} doc={{doc_id:"doc2", title:"Document 2"}} isActive={false} />
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
      <DocumentItem open={false} doc={{doc_id:"doc1", title:"Document 1"}} isActive={true} />
    </Tooltip.Provider>);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });

    expect(container.querySelector('span')?.className).toContain('bg-green-400');
  });

  it('Inactive Document in the side bar while open', async () => {
    const { container } = render(<Tooltip.Provider>
      <DocumentItem open={false} doc={{doc_id:"doc2", title:"Document 2"}} isActive={false} />
    </Tooltip.Provider>);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(1);
    });

    expect(container.querySelector('span')).toBeNull();
  });
});
