import { notFound } from 'next/navigation';

/**
 * Catch-all route to ensure multi-segment unmatched paths
 * properly delegate to the custom not-found handler.
 */
export default function CatchAllNotFound() {
  notFound();
}
