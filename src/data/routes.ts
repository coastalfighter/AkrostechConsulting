/**
 * Route strips for the service-area heroes: from each city to the Wilmington office, and for
 * Wilmington itself the short downtown run from the train station. Waypoints are public places
 * on the way (stations, interstate landmarks); journey times come from each location's own
 * "distance" copy in data/locations, so nothing here adds a claim of its own.
 */
import type { LatLng } from '@/lib/geo';

export interface Waypoint extends LatLng {
  name: string;
  note: string;
}

export interface Route {
  /** How the journey in the location copy is made. */
  mode: string;
  /** Start and end, as the strip names them. */
  from: string;
  to: string;
  waypoints: Waypoint[];
  /** A line under the strip, for the other way to make the trip. */
  footnote: string;
}

const office: Waypoint = { name: '1207 Delaware Ave', note: 'Akrostech headquarters, Wilmington, DE 19806', latitude: 39.7563, longitude: -75.5634 };

export const routes: Record<string, Route> = {
  'wilmington-de': {
    mode: 'Downtown, by car or taxi',
    from: 'Wilmington station',
    to: '1207 Delaware Ave',
    waypoints: [
      { name: 'Wilmington station', note: 'Amtrak and SEPTA, Martin Luther King Jr. Blvd', latitude: 39.7369, longitude: -75.5513 },
      { name: 'Rodney Square', note: 'Market Street business district', latitude: 39.7458, longitude: -75.548 },
      { name: 'Delaware Avenue (DE-52)', note: 'Heading northwest out of downtown', latitude: 39.7527, longitude: -75.5585 },
      office,
    ],
    footnote: 'I-95 exit 7 meets Delaware Avenue a few blocks from the office. Visits are by appointment.',
  },
  'philadelphia-pa': {
    mode: 'Drive, I-95 South',
    from: 'Center City',
    to: '1207 Delaware Ave',
    waypoints: [
      { name: 'Center City', note: 'City Hall, Philadelphia', latitude: 39.9524, longitude: -75.1636 },
      { name: 'Philadelphia International Airport', note: 'I-95 South', latitude: 39.873, longitude: -75.2437 },
      { name: 'Chester, PA', note: 'I-95 South', latitude: 39.8496, longitude: -75.3557 },
      { name: 'Delaware state line', note: 'Claymont, DE', latitude: 39.807, longitude: -75.438 },
      { name: 'I-95 exit 7', note: 'Delaware Avenue (DE-52)', latitude: 39.753, longitude: -75.5555 },
      office,
    ],
    footnote: 'Or take Amtrak or SEPTA Regional Rail to Wilmington station, a short ride.',
  },
  'new-york-ny': {
    mode: 'Amtrak, Northeast Corridor',
    from: 'Penn Station',
    to: '1207 Delaware Ave',
    waypoints: [
      { name: 'New York Penn Station', note: 'Midtown Manhattan', latitude: 40.7506, longitude: -73.9935 },
      { name: 'Newark Penn Station', note: 'Newark, NJ', latitude: 40.7347, longitude: -74.1644 },
      { name: 'Trenton', note: 'Trenton Transit Center, NJ', latitude: 40.2178, longitude: -74.7553 },
      { name: 'Philadelphia 30th Street', note: 'Philadelphia, PA', latitude: 39.9557, longitude: -75.182 },
      { name: 'Wilmington station', note: 'Wilmington, DE', latitude: 39.7369, longitude: -75.5513 },
      office,
    ],
    footnote: 'Our phone line is a 332 New York number, so the first conversation does not need a train.',
  },
};
