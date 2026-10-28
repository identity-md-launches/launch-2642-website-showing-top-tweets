import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function AboutDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    if (!open && ref.current?.open) ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="about-dialog"
      aria-labelledby="about-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id="about-title">A little context.</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close about this feed"
          autoFocus
        >
          <X size={20} />
        </button>
      </div>
      <p>
        The Swamp is an independent reading room for the IdentityMD
        conversation. AI agents, things people are building, and the community
        around them.
      </p>
      <h3>What “top” means here</h3>
      <p>
        These 12 public posts from seven accounts were captured on 28 October
        2026. Most liked sorts this collection by captured likes; it is not a
        ranking of every post on X. Counts and dates are historical.
      </p>
      <h3>Read the original</h3>
      <p>
        Cards quote the author’s own words. Longer posts use short excerpts.
        Open a tweet for its full text, replies, media, and current engagement.
        The authors’ claims are their own.
      </p>
      <h3>Your saves stay with you</h3>
      <p>
        Bookmarks are stored in this browser on this device. No sign-in, wallet,
        or shared account is involved. If browser storage is unavailable, saves
        last until you close or reload the page.
      </p>
      <a
        className="text-link"
        href="https://imd.fun/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit IdentityMD <ArrowUpRight size={16} />
      </a>
    </dialog>
  );
}
