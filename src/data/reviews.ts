/**
 * Client reviews and testimonials.
 *
 * Intentionally empty. Publishing invented testimonials or star ratings is deceptive, breaches
 * the FTC's rules on fake reviews and Google's review-snippet policy, and puts the domain at
 * risk of a manual action. Add entries here only with the client's written permission.
 *
 * When this list has entries:
 *  - the homepage testimonial carousel shows them instead of the commitments carousel;
 *  - AggregateRating is added to the LocalBusiness schema automatically.
 */
import type { Review } from '@/lib/seo';

export interface Testimonial extends Review {
  role: string;
  company: string;
  service: string;
}

export const testimonials: Testimonial[] = [];
