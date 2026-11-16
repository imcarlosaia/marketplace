'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { fetchListing, photoUrl } from '@/lib/listings';
import { isConfigured } from '@/lib/supabase';
import type { Listing } from '@/lib/types';
import { ListingDetails } from './ListingDetails';
import { MessageSeller } from './MessageSeller';
import { NotConfigured } from './NotConfigured';

const NOT_FOUND = "This listing doesn't exist or was removed.";
const LOAD_FAILED = "Couldn't load this listing. Try again.";

type State = { id: string; attempt: number; listing: Listing | null; failed: boolean; now: Date };

function BackLink() {
  return (
    <Link href="/" className="mb-4 inline-flex items-center gap-1.5 font-semibold text-brand-ink hover:underline focus-visible:outline-2 focus-visible:outline-brand">
      <ArrowLeft size={18} aria-hidden="true" />
      Back to listings
    </Link>
  );
}

export function ListingSkeleton() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6">
      <div className="mb-4 h-6 w-36 rounded bg-surface" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-surface motion-reduce:animate-none" />
        <div className="h-96 rounded-2xl bg-surface" />
      </div>
    </div>
  );
}

export function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    if (!isConfigured) return;
    let cancelled = false;
    fetchListing(id).then(
      (listing) => {
        if (!cancelled) setState({ id, attempt, listing, failed: false, now: new Date() });
      },
      () => {
        if (!cancelled) setState({ id, attempt, listing: null, failed: true, now: new Date() });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6">
        <NotConfigured />
      </div>
    );
  }

  if (!state || state.id !== id || state.attempt !== attempt) return <ListingSkeleton />;

  if (state.failed || !state.listing) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6">
        <BackLink />
        <div role="alert" className="rounded-2xl bg-surface p-6">
          <p className={state.failed ? 'text-danger' : ''}>{state.failed ? LOAD_FAILED : NOT_FOUND}</p>
          {state.failed && (
            <button type="button" onClick={() => setAttempt((n) => n + 1)}
              className="mt-3 rounded-full border border-line px-4 py-1.5 font-semibold hover:bg-chip focus-visible:outline-2 focus-visible:outline-brand">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const listing = state.listing;
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6">
      <BackLink />
      <ListingDetails
        now={state.now}
        view={{
          title: listing.title,
          price: listing.price,
          category: listing.category,
          description: listing.description,
          sellerEmail: listing.seller_email,
          location: listing.location,
          createdAt: listing.created_at,
          photoSrc: photoUrl(listing.image_path),
        }}
      >
        <MessageSeller listingId={listing.id} />
      </ListingDetails>
    </div>
  );
}
