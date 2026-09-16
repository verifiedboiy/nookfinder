export type PropertyType = 'house' | 'apartment' | 'townhouse' | 'condo' | 'duplex' | 'studio';
export type ListingType = 'sale' | 'rent';

export interface PropertyImage {
  url: string;
  caption: string;
  isPrimary?: boolean;
}

export interface PropertyAgent {
  name: string;
  title: string;
  phone: string;
  email: string;
  telegram: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  verifiedLicense: string;
  isNookfinderStaff: boolean;
}

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PropertySpecs {
  bedrooms: number;
  bathrooms: number;
  squareFeet: number; // Interior Finished Living Area (sq ft)
  lotSizeSqFt?: number; // Total Lot / Land Parcel Size (sq ft)
  lotSizeAcres?: number; // Total Lot / Land Size in Acres (e.g. 0.25)
  parkingSpaces: number;
  yearBuilt: number;
  hoaMonthly: number;
  propertyTaxAnnual: number;
  estimatedUtilitiesMonthly: number;
}

export interface Property {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  listingType: ListingType;
  propertyType: PropertyType;
  status: 'available' | 'under_contract' | 'off_market';
  isVerified: boolean;
  featured: boolean;
  fhaEligible?: boolean;
  downPaymentAssistance?: boolean;
  underMarketValue?: boolean;
  address: PropertyAddress;
  specs: PropertySpecs;
  amenities: string[];
  images: PropertyImage[];
  agent: PropertyAgent;
  listedAt: string;
  views?: number;
  likes?: number;
  marketDemandBadge?: string;
}

export interface FilterState {
  listingType: ListingType;
  query: string;
  location: string;
  state: string;
  propertyType: PropertyType | 'all';
  minPrice: number;
  maxPrice: number;
  bedrooms: number | 'any';
  bathrooms: number | 'any';
  verifiedOnly: boolean;
  fhaOnly: boolean;
  underMarketOnly: boolean;
}
