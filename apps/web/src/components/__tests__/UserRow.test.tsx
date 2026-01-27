import ReactDOMClient from 'react-dom/client';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { UserRow } from '../UserRow';
import { act } from 'react';

const mockShareDocument = vi.fn();
const mockUnshareDocument = vi.fn();
vi.mock("../../lib/supabase/sharing", () => {
    return {
        shareDocument: (docId: string, userId: string) => mockShareDocument(docId, userId),
        unshareDocument: (docId: string, userId: string) => mockUnshareDocument(docId, userId)
    }
})

describe('New Document component', () => {
  let container : any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });
  
  it('User Row renders with a profile already shared', async () => {
    await renderUserRow(true);
    
    expect(container.querySelectorAll('button').length).toBe(1);
    expect(container.querySelector('button').innerHTML).toContain("Remove");
  });

  it('User Row renders with a profile', async () => {
    await renderUserRow(false);
    
    expect(container.querySelectorAll('button').length).toBe(1);
    expect(container.querySelector('button').innerHTML).toContain("Add");
  });

  it('User shares with additional user', async () => {
    await renderUserRow(false);

    await clickShareButton();

    expect(mockShareDocument).toHaveBeenCalled();
    expect(mockShareDocument).toHaveBeenCalledWith("docId1", "userId1");
  });

  it('User removes share from additional user', async () => {
    await renderUserRow(true);

    await clickShareButton();

    expect(mockUnshareDocument).toHaveBeenCalled();
    expect(mockUnshareDocument).toHaveBeenCalledWith("docId1", "userId1");
  });

  async function renderUserRow(isShared : boolean) {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <UserRow 
            currentDocId={"docId1"} 
            profile={{
                display_name: "Test User", 
                is_shared: isShared,
                user_id: "userId1"
            }}
        />);
    });
  }

  async function clickShareButton() {
    await act(async () => {
      const shareButton = container.querySelector('button');
      if (shareButton) {
        shareButton.click();
      }
    });
  }
});
