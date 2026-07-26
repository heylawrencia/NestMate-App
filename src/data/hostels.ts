import { Hostel } from '../types/hostel';

/**
 * Seed data for hostels and apartments.
 */
export const MOCK_HOSTELS: Hostel[] = [
  {
    id: 'evandy-hostel',
    name: 'Evandy Hostel',
    shortName: 'Evandy',
    category: 'Hostels',
    location: 'Ayeduase',
    distanceNote: '10 min walk to campus',
    rating: 4.3,
    bedsAvailable: 9,
    fromPricePerYear: 3500,
    photoCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    amenities: ['Wi-Fi', 'Security', 'Water', 'Kitchen'],
    roomTypes: [
      {
        id: '2-in-a-room',
        label: '2 in a room',
        pricePerYear: 6000,
        capacity: 2,
        bedsLeft: 1,
        studentsMatching: 6,
      },
      {
        id: '4-in-a-room',
        label: '4 in a room',
        pricePerYear: 3500,
        capacity: 4,
        bedsLeft: 8,
        studentsMatching: 21,
      },
      {
        id: '3-in-a-room',
        label: '3 in a room',
        pricePerYear: 4500,
        capacity: 3,
        bedsLeft: 0,
      },
    ],
  },
  {
    id: 'unity-hostel',
    name: 'Unity Hostel',
    shortName: 'Unity',
    category: 'Hostels',
    location: 'Kotei',
    distanceNote: '15 min walk to campus',
    rating: 4.1,
    bedsAvailable: 12,
    fromPricePerYear: 2800,
    photoCount: 4,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    amenities: ['Wi-Fi', 'Water', 'Shared Kitchen'],
    roomTypes: [
      {
        id: '4-in-a-room',
        label: '4 in a room',
        pricePerYear: 2800,
        capacity: 4,
        bedsLeft: 12,
        studentsMatching: 14,
      },
    ],
  },
  {
    id: 'ayeduase-court',
    name: 'Ayeduase Court Apartments',
    shortName: 'Ayeduase Court',
    category: 'Apartments',
    location: 'Ayeduase',
    distanceNote: '12 min walk to campus',
    rating: 4.6,
    bedsAvailable: 4,
    fromPricePerYear: 7000,
    photoCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: ['Wi-Fi', 'Security', 'Water', 'Kitchen', 'Parking'],
    roomTypes: [
      {
        id: '2-in-a-room',
        label: '2 in a room',
        pricePerYear: 7000,
        capacity: 2,
        bedsLeft: 4,
        studentsMatching: 5,
      },
    ],
  },
];
