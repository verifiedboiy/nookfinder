'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Property, PropertyType, ListingType, PropertyImage } from '@/types/property';
import { US_STATES, MAJOR_US_STATES } from '@/data/states';
import {
  getStoredProperties,
  saveStoredProperty,
  saveStoredPropertyAsync,
  deleteStoredProperty,
  deleteStoredPropertyAsync,
  syncWithServer,
} from '@/data/propertyStore';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Home,
  CheckCircle2,
  RefreshCw,
  Sliders,
  DollarSign,
  Upload,
  Building,
  Key,
  Calendar,
  Layers,
  MapPin,
  X,
  AlertCircle,
  FileText,
  UserCheck,
  Eye,
  Heart,
  Mail,
  MessageSquare,
  Send,
  Trees,
  TrendingUp,
} from 'lucide-react';

const STANDARD_AMENITIES = [
  'FHA Loan Grant Eligible',
  'Down Payment Assistance Available',
  'Under Market Value Appraisal',
  'In-Unit Washer & Dryer',
  'Central Air Conditioning & Heating',
  'Attached Garage / Reserved Parking',
  'Stainless Steel Kitchen Appliances',
  'Private Fenced Yard / Patio',
  'Water & Trash Included in Lease',
  'Pet Friendly (Zero Monthly Pet Fee)',
  'Energy Star High Efficiency Rated',
  'Walking Distance to Public Transit',
  'Hardwood Flooring Throughout',
  'Zero Broker Fee Guarantee',
];

function ControlPanelContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  // Tabs: 'sale' (For Sale Inventory), 'rent' (For Rent Inventory), 'editor' (Create / Edit Form), 'inquiries' (Tour & Showing Requests)
  const [activeTab, setActiveTab] = useState<'sale' | 'rent' | 'editor' | 'inquiries'>('sale');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields - Basic
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('house');
  const [price, setPrice] = useState('185000');
  const [isVerified, setIsVerified] = useState(true);
  const [fhaEligible, setFhaEligible] = useState(true);
  const [downPaymentAssistance, setDownPaymentAssistance] = useState(true);
  const [underMarketValue, setUnderMarketValue] = useState(true);

  // Form Fields - Location
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Atlanta');
  const [stateCode, setStateCode] = useState('GA');
  const [zipCode, setZipCode] = useState('30312');
  const [neighborhood, setNeighborhood] = useState('Riverside District');

  // Form Fields - Specs & Overview
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [squareFeet, setSquareFeet] = useState(1250); // Interior Living Area (sq ft)
  const [lotSizeSqFt, setLotSizeSqFt] = useState<string>('6500'); // Total Lot / Land Size (sq ft)
  const [lotSizeAcres, setLotSizeAcres] = useState<string>('0.15'); // Lot in Acres
  const [parkingSpaces, setParkingSpaces] = useState(1);
  const [yearBuilt, setYearBuilt] = useState(2021);

  // Form Fields - True Monthly Cost Breakdown
  const [monthlyPrincipalInterest, setMonthlyPrincipalInterest] = useState('980');
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState(1800);
  const [homeInsuranceMonthly, setHomeInsuranceMonthly] = useState(85);
  const [utilitiesMonthly, setUtilitiesMonthly] = useState(120);

  // Form Fields - Features & Inclusions (Amenities)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'FHA Loan Grant Eligible',
    'Down Payment Assistance Available',
    'Under Market Value Appraisal',
    'In-Unit Washer & Dryer',
    'Zero Broker Fee Guarantee',
  ]);
  const [customAmenity, setCustomAmenity] = useState('');

  // Form Fields - Photos (Starts EMPTY as requested by user)
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  // Form Fields - Staff Specialist
  const [agentName, setAgentName] = useState('Marcus Vance');
  const [isPublishing, setIsPublishing] = useState(false);

  // Form Fields - Demand & Status Badges
  const [marketDemandBadge, setMarketDemandBadge] = useState<string>('none');
  const [customDemandBadge, setCustomDemandBadge] = useState<string>('');

  // Form Fields - Views & Likes Engagement
  const [viewsCount, setViewsCount] = useState('1420');
  const [likesCount, setLikesCount] = useState('86');

  // Draft Persistence State
  const DRAFT_STORAGE_KEY = 'nookfinder_listing_form_draft';
  const [savedDraft, setSavedDraft] = useState<any | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastDraftSavedTime, setLastDraftSavedTime] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.inquiries)) {
          setInquiries(data.inquiries);
        }
      }
    } catch (err) {
      console.warn('Error fetching inquiries:', err);
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/inquiries?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.inquiries)) {
          setInquiries(data.inquiries);
          showNotification('Tour inquiry record removed.');
        }
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  useEffect(() => {
    const loadData = () => {
      const loaded = getStoredProperties();
      setProperties(loaded);
    };

    loadData();

    // Trigger server / IDB sync immediately
    syncWithServer().then((synced) => {
      if (Array.isArray(synced) && synced.length > 0) {
        setProperties(synced);
      }
    });

    fetchInquiries();

    // Check for saved draft in localStorage
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.title || parsed.street || parsed.editingId || (parsed.images && parsed.images.length > 0))) {
          setSavedDraft(parsed);
          setHasSavedDraft(true);
          if (parsed.savedAt) {
            setLastDraftSavedTime(new Date(parsed.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      }
    } catch (e) {
      console.warn('Could not read draft from localStorage:', e);
    }

    // Reactive listeners: automatically re-render when storage or background sync finishes
    window.addEventListener('nookfinder_storage_updated', loadData);
    window.addEventListener('storage', loadData);
    window.addEventListener('focus', loadData);
    window.addEventListener('visibilitychange', loadData);

    return () => {
      window.removeEventListener('nookfinder_storage_updated', loadData);
      window.removeEventListener('storage', loadData);
      window.removeEventListener('focus', loadData);
      window.removeEventListener('visibilitychange', loadData);
    };
  }, []);

  // Open edit form when ?edit=id is provided in URL
  useEffect(() => {
    const editId = searchParams?.get('edit');
    if (editId && properties.length > 0) {
      const target = properties.find((p) => p.id === editId);
      if (target) {
        editProperty(target);
      }
    }
  }, [searchParams, properties]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Auto-save draft when editor fields change
  useEffect(() => {
    const hasModifications =
      title.trim() ||
      tagline.trim() ||
      street.trim() ||
      description.trim() ||
      images.length > 0 ||
      editingId !== null;

    if (!hasModifications) return;

    const timeout = setTimeout(() => {
      try {
        const draftPayload = {
          editingId,
          title,
          tagline,
          description,
          listingType,
          propertyType,
          price,
          isVerified,
          fhaEligible,
          downPaymentAssistance,
          underMarketValue,
          street,
          city,
          stateCode,
          zipCode,
          neighborhood,
          bedrooms,
          bathrooms,
          squareFeet,
          lotSizeSqFt,
          lotSizeAcres,
          parkingSpaces,
          yearBuilt,
          monthlyPrincipalInterest,
          hoaMonthly,
          propertyTaxAnnual,
          homeInsuranceMonthly,
          utilitiesMonthly,
          selectedAmenities,
          images,
          agentName,
          marketDemandBadge,
          customDemandBadge,
          viewsCount,
          likesCount,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
        setSavedDraft(draftPayload);
        setHasSavedDraft(true);
        setLastDraftSavedTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      } catch (e) {
        console.warn('Auto-save error:', e);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [
    editingId,
    title,
    tagline,
    description,
    listingType,
    propertyType,
    price,
    isVerified,
    fhaEligible,
    downPaymentAssistance,
    underMarketValue,
    street,
    city,
    stateCode,
    zipCode,
    neighborhood,
    bedrooms,
    bathrooms,
    squareFeet,
    lotSizeSqFt,
    lotSizeAcres,
    parkingSpaces,
    yearBuilt,
    monthlyPrincipalInterest,
    hoaMonthly,
    propertyTaxAnnual,
    homeInsuranceMonthly,
    utilitiesMonthly,
    selectedAmenities,
    images,
    agentName,
    marketDemandBadge,
    customDemandBadge,
    viewsCount,
    likesCount,
  ]);

  // Auto-calculate approximate P&I for For Sale
  useEffect(() => {
    if (listingType === 'sale') {
      const numericPrice = Number(price) || 0;
      const loanAmount = numericPrice * 0.95;
      const monthlyRate = 0.065 / 12;
      const numPayments = 360;
      if (loanAmount > 0) {
        const monthly =
          (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
          (Math.pow(1 + monthlyRate, numPayments) - 1);
        setMonthlyPrincipalInterest(Math.round(monthly).toString());
      }
    }
  }, [price, listingType]);

  // High-performance client-side image compressor (prevents localStorage quota errors & lag)
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const rawUrl = loadEvent.target?.result as string;
        if (!rawUrl) return resolve('');

        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 960;
          let width = img.width || 800;
          let height = img.height || 600;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressed);
          } else {
            resolve(rawUrl);
          }
        };
        img.onerror = () => resolve(rawUrl);
        img.src = rawUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Gallery File Picker Handler (with automated HD compression)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 20 - images.length;
    if (remainingSlots <= 0) {
      alert('Maximum 20 photos reached. Please remove a photo before adding more.');
      return;
    }

    const filesToLoad = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToLoad) {
      const compressedDataUrl = await compressImageFile(file);
      if (compressedDataUrl) {
        const autoCaption = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/^[0-9]+\s*/, '');

        setImages((prev) => {
          if (prev.length >= 20) return prev;
          return [
            ...prev,
            {
              url: compressedDataUrl,
              caption: autoCaption || `Gallery photo ${prev.length + 1}`,
              isPrimary: prev.length === 0,
            },
          ];
        });
      }
    }

    e.target.value = '';
  };

  // Add Photo by URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    if (images.length >= 20) {
      alert('Maximum 20 photos allowed per listing.');
      return;
    }
    setImages([
      ...images,
      {
        url: newImageUrl.trim(),
        caption: newImageCaption.trim() || `Property view ${images.length + 1}`,
        isPrimary: images.length === 0,
      },
    ]);
    setNewImageUrl('');
    setNewImageCaption('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    if (images[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const handleSetPrimaryImage = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    }));
    setImages(updated);
  };

  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenity.trim()) return;
    if (!selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities([...selectedAmenities, customAmenity.trim()]);
    }
    setCustomAmenity('');
  };

  // Reset form for brand new listing
  const startNewListing = (type: ListingType = 'sale') => {
    setEditingId(null);
    setFormError(null);
    setListingType(type);
    setTitle('');
    setTagline('');
    setDescription('');
    setPropertyType(type === 'sale' ? 'house' : 'apartment');
    setPrice(type === 'sale' ? '210000' : '750');
    setIsVerified(true);
    setFhaEligible(type === 'sale');
    setDownPaymentAssistance(type === 'sale');
    setUnderMarketValue(true);

    setStreet('');
    setCity('Atlanta');
    setStateCode('GA');
    setZipCode('30312');
    setNeighborhood('Riverside District');

    setBedrooms(type === 'sale' ? 3 : 1);
    setBathrooms(type === 'sale' ? 2 : 1);
    setSquareFeet(type === 'sale' ? 1400 : 650);
    setLotSizeSqFt(type === 'sale' ? '7500' : '0');
    setLotSizeAcres(type === 'sale' ? '0.17' : '0');
    setParkingSpaces(1);
    setYearBuilt(2021);

    setMonthlyPrincipalInterest(type === 'sale' ? '1100' : '0');
    setHoaMonthly(0);
    setPropertyTaxAnnual(type === 'sale' ? 1950 : 0);
    setHomeInsuranceMonthly(type === 'sale' ? 85 : 25);
    setUtilitiesMonthly(120);

    // Photos start completely EMPTY as requested
    setImages([]);
    setSelectedAmenities([
      type === 'sale' ? 'FHA Loan Grant Eligible' : 'Water & Trash Included in Lease',
      'Under Market Value Appraisal',
      'In-Unit Washer & Dryer',
      'Zero Broker Fee Guarantee',
    ]);
    setAgentName('Marcus Vance');
    setMarketDemandBadge('none');
    setCustomDemandBadge('');
    setViewsCount('1420');
    setLikesCount('86');
    setActiveTab('editor');
  };

  // Populate form with existing listing data to EDIT
  const editProperty = (prop: Property) => {
    setEditingId(prop.id);
    setFormError(null);
    setListingType(prop.listingType);
    setTitle(prop.title);
    setTagline(prop.tagline || '');
    setDescription(prop.description || '');
    setPropertyType(prop.propertyType);
    setPrice(prop.price.toString());
    setIsVerified(prop.isVerified);
    setFhaEligible(prop.fhaEligible || false);
    setDownPaymentAssistance(prop.downPaymentAssistance || false);
    setUnderMarketValue(prop.underMarketValue || false);

    setStreet(prop.address.street);
    setCity(prop.address.city);
    setStateCode(prop.address.state);
    setZipCode(prop.address.zipCode);
    setNeighborhood(prop.address.neighborhood);

    setBedrooms(prop.specs.bedrooms);
    setBathrooms(prop.specs.bathrooms);
    setSquareFeet(prop.specs.squareFeet);
    setLotSizeSqFt(
      prop.specs.lotSizeSqFt
        ? prop.specs.lotSizeSqFt.toString()
        : prop.specs.lotSizeAcres
        ? Math.round(Number(prop.specs.lotSizeAcres) * 43560).toString()
        : '6500'
    );
    setLotSizeAcres(
      prop.specs.lotSizeAcres
        ? prop.specs.lotSizeAcres.toString()
        : prop.specs.lotSizeSqFt
        ? (prop.specs.lotSizeSqFt / 43560).toFixed(2)
        : '0.15'
    );
    setParkingSpaces(prop.specs.parkingSpaces || 1);
    setYearBuilt(prop.specs.yearBuilt);

    setHoaMonthly(prop.specs.hoaMonthly || 0);
    setPropertyTaxAnnual(prop.specs.propertyTaxAnnual || 0);
    setUtilitiesMonthly(prop.specs.estimatedUtilitiesMonthly || 120);

    if (prop.listingType === 'sale') {
      const loanAmount = prop.price * 0.95;
      const monthlyRate = 0.065 / 12;
      const numPayments = 360;
      const monthly =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
      setMonthlyPrincipalInterest(Math.round(monthly).toString());
    }

    setImages(prop.images || []);
    setSelectedAmenities(prop.amenities || STANDARD_AMENITIES.slice(0, 5));
    setAgentName(prop.agent.name);

    const standardBadges = [
      'High Buyer Interest',
      'High Demand Rental',
      'Hot Home',
      'Price Drop',
      'Newly Renovated',
      'Prime Location',
      'Rare Opportunity',
    ];
    if (!prop.marketDemandBadge || prop.marketDemandBadge === 'none') {
      setMarketDemandBadge('none');
      setCustomDemandBadge('');
    } else if (standardBadges.includes(prop.marketDemandBadge)) {
      setMarketDemandBadge(prop.marketDemandBadge);
      setCustomDemandBadge('');
    } else {
      setMarketDemandBadge('custom');
      setCustomDemandBadge(prop.marketDemandBadge);
    }

    setViewsCount((prop.views ?? 1420).toString());
    setLikesCount((prop.likes ?? 86).toString());
    setActiveTab('editor');
  };

  // Restore Draft into active form
  const restoreDraft = (draftToLoad?: any) => {
    const draft = draftToLoad || savedDraft;
    if (!draft) return;

    setEditingId(draft.editingId || null);
    setFormError(null);
    setListingType(draft.listingType || 'sale');
    setTitle(draft.title || '');
    setTagline(draft.tagline || '');
    setDescription(draft.description || '');
    setPropertyType(draft.propertyType || 'house');
    setPrice(draft.price || '185000');
    setIsVerified(draft.isVerified ?? true);
    setFhaEligible(draft.fhaEligible ?? true);
    setDownPaymentAssistance(draft.downPaymentAssistance ?? true);
    setUnderMarketValue(draft.underMarketValue ?? true);

    setStreet(draft.street || '');
    setCity(draft.city || 'Atlanta');
    setStateCode(draft.stateCode || 'GA');
    setZipCode(draft.zipCode || '30312');
    setNeighborhood(draft.neighborhood || 'Riverside District');

    setBedrooms(draft.bedrooms ?? 3);
    setBathrooms(draft.bathrooms ?? 2);
    setSquareFeet(draft.squareFeet ?? 1250);
    setLotSizeSqFt(draft.lotSizeSqFt || '6500');
    setLotSizeAcres(draft.lotSizeAcres || '0.15');
    setParkingSpaces(draft.parkingSpaces ?? 1);
    setYearBuilt(draft.yearBuilt ?? 2021);

    setMonthlyPrincipalInterest(draft.monthlyPrincipalInterest || '980');
    setHoaMonthly(draft.hoaMonthly ?? 0);
    setPropertyTaxAnnual(draft.propertyTaxAnnual ?? 1800);
    setHomeInsuranceMonthly(draft.homeInsuranceMonthly ?? 85);
    setUtilitiesMonthly(draft.utilitiesMonthly ?? 120);

    setImages(draft.images || []);
    setSelectedAmenities(draft.selectedAmenities || STANDARD_AMENITIES.slice(0, 5));
    setAgentName(draft.agentName || 'Marcus Vance');
    setMarketDemandBadge(draft.marketDemandBadge || 'none');
    setCustomDemandBadge(draft.customDemandBadge || '');
    setViewsCount(draft.viewsCount || '1420');
    setLikesCount(draft.likesCount || '86');

    setActiveTab('editor');
    showNotification(`Restored unsaved draft: "${draft.title || 'In-Progress Listing'}"`);
  };

  // Discard saved draft
  const discardDraft = () => {
    if (confirm('Discard your saved draft? Any unsaved edits will be cleared.')) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      setSavedDraft(null);
      setHasSavedDraft(false);
      setLastDraftSavedTime(null);
      showNotification('Saved draft discarded.');
    }
  };

  // Start fresh with clean slate
  const startFreshListing = (type: ListingType = 'sale') => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
    setSavedDraft(null);
    setHasSavedDraft(false);
    setLastDraftSavedTime(null);
    startNewListing(type);
    showNotification('Started fresh listing with a clean form.');
  };

  // Delete single property with confirmation
  const handleDelete = async (prop: Property) => {
    if (
      confirm(
        `Are you sure you want to permanently delete "${prop.title}" (ID: ${prop.id})?`
      )
    ) {
      const updated = await deleteStoredPropertyAsync(prop.id);
      setProperties(updated);
      showNotification(`"${prop.title}" was permanently removed.`);
    }
  };

  // Save handler (Create or Update)
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict validation
    if (!title.trim()) {
      const msg = 'Please enter a property headline / title.';
      setFormError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!street.trim() || !city.trim() || !zipCode.trim()) {
      const msg = 'Please complete the full address (Street, City, and Zip Code).';
      setFormError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!price || Number(price) <= 0) {
      const msg = 'Please specify a valid price.';
      setFormError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (images.length < 3) {
      const msg = `You currently have ${images.length} photo(s). At least 3 photos are required from your gallery so users can view the verified details.`;
      setFormError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsPublishing(true);

    try {
      const agentsMap: Record<string, any> = {
        'Marcus Vance': {
          name: 'Marcus Vance',
          title: 'Nookfinder Dedicated Property Specialist',
          phone: '+1 (404) 890-1244',
          email: 'nookkfinder@gmail.com',
          telegram: 'https://t.me/nook_finder',
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
          rating: 4.9,
          reviewCount: 42,
          verifiedLicense: 'NF-STAFF-40918',
          isNookfinderStaff: true,
        },
        'Sarah Chen': {
          name: 'Sarah Chen',
          title: 'Nookfinder Dedicated Property Specialist',
          phone: '+1 (614) 732-9011',
          email: 'nookkfinder@gmail.com',
          telegram: 'https://t.me/nook_finder',
          avatarUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
          rating: 4.8,
          reviewCount: 38,
          verifiedLicense: 'NF-STAFF-99120',
          isNookfinderStaff: true,
        },
        'David Reynolds': {
          name: 'David Reynolds',
          title: 'Nookfinder Dedicated Property Specialist',
          phone: '+1 (317) 412-8871',
          email: 'nookkfinder@gmail.com',
          telegram: 'https://t.me/nook_finder',
          avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
          rating: 5.0,
          reviewCount: 64,
          verifiedLicense: 'NF-STAFF-10293',
          isNookfinderStaff: true,
        },
      };

      const normalizedImages = images.map((img, idx) => ({
        ...img,
        isPrimary: images.some((i) => i.isPrimary) ? img.isPrimary : idx === 0,
      }));

      const savedProperty: Property = {
        id: editingId || `prop-${listingType}-${Date.now().toString().slice(-4)}`,
        title: title.trim(),
        tagline: tagline.trim() || 'Audited affordable residential housing in prime commuter setting.',
        description:
          description.trim() ||
          'Verified listing certified compliant with local fair housing guidelines and independent ownership audit.',
        price: Number(price) || 0,
        listingType,
        propertyType,
        status: 'available',
        isVerified,
        featured: true,
        fhaEligible: listingType === 'sale' ? fhaEligible : false,
        downPaymentAssistance: listingType === 'sale' ? downPaymentAssistance : false,
        underMarketValue,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: stateCode,
          zipCode: zipCode.trim(),
          neighborhood: neighborhood.trim() || 'Central Metro',
          coordinates: {
            lat: 33.749 + (Math.random() * 0.08 - 0.04),
            lng: -84.388 + (Math.random() * 0.08 - 0.04),
          },
        },
        specs: {
          bedrooms,
          bathrooms,
          squareFeet,
          lotSizeSqFt: Number(lotSizeSqFt) || (Number(lotSizeAcres) ? Math.round(Number(lotSizeAcres) * 43560) : 0),
          lotSizeAcres: Number(lotSizeAcres) || (Number(lotSizeSqFt) ? Number((Number(lotSizeSqFt) / 43560).toFixed(2)) : 0),
          parkingSpaces,
          yearBuilt,
          hoaMonthly,
          propertyTaxAnnual: listingType === 'sale' ? propertyTaxAnnual : 0,
          estimatedUtilitiesMonthly: utilitiesMonthly,
        },
        amenities: selectedAmenities.length > 0 ? selectedAmenities : ['Zero Broker Fee Guarantee'],
        images: normalizedImages,
        agent: agentsMap[agentName] || agentsMap['Marcus Vance'],
        views: Number(viewsCount) || 1420,
        likes: Number(likesCount) || 86,
        marketDemandBadge:
          marketDemandBadge === 'custom'
            ? customDemandBadge.trim() || undefined
            : marketDemandBadge !== 'none'
            ? marketDemandBadge
            : undefined,
        listedAt: new Date().toISOString(),
      };

      const updatedCatalog = await saveStoredPropertyAsync(savedProperty);
      setProperties(updatedCatalog);

      // Clear saved draft from localStorage on successful publish
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setSavedDraft(null);
        setHasSavedDraft(false);
        setLastDraftSavedTime(null);
      } catch (e) {}

      showNotification(
        editingId
          ? `Listing "${savedProperty.title}" successfully updated!`
          : `New listing "${savedProperty.title}" published live!`
      );

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveTab(listingType);
    } catch (err: any) {
      console.error('Error in handleSaveProperty:', err);
      setFormError(`Failed to save listing: ${err.message || 'Please check form inputs.'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const saleProperties = properties.filter((p) => p.listingType === 'sale');
  const rentProperties = properties.filter((p) => p.listingType === 'rent');

  const calcTotalMonthly = () => {
    if (listingType === 'sale') {
      const pi = Number(monthlyPrincipalInterest) || 0;
      const tax = (Number(propertyTaxAnnual) || 0) / 12;
      const ins = Number(homeInsuranceMonthly) || 0;
      const hoa = Number(hoaMonthly) || 0;
      const util = Number(utilitiesMonthly) || 0;
      return Math.round(pi + tax + ins + hoa + util);
    } else {
      const rent = Number(price) || 0;
      const util = Number(utilitiesMonthly) || 0;
      return Math.round(rent + util);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-emerald-700 flex items-center justify-center text-white shadow-md">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-display">
                Nookfinder Control Panel
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                Private Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live inventory management, 3–20 gallery photo uploader, and staff dispatch
            </p>
          </div>
        </div>

        {/* Global Inventory Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shadow-xs"
          >
            <Eye className="w-4 h-4" />
            <span>Open Public Site</span>
          </Link>
        </div>
      </header>

      {/* Flash Notification Banner */}
      {notification && (
        <div className="bg-emerald-700 text-white px-4 py-3 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* DRAFT RECOVERY / AUTO-SAVE PROMPT BANNER */}
      {hasSavedDraft && savedDraft && (
        <div className="bg-amber-950/90 border-b border-amber-600/70 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-900 border border-amber-500 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-200">
                  Unsaved Listing Draft Recovered
                </span>
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-900/80 text-amber-300 font-mono">
                  {lastDraftSavedTime ? `Saved at ${lastDraftSavedTime}` : 'Active draft'}
                </span>
              </div>
              <p className="text-xs text-amber-100/80 mt-0.5">
                {savedDraft.editingId ? `Editing existing property ${savedDraft.editingId}` : `New ${savedDraft.listingType === 'rent' ? 'Rental' : 'For Sale'} Home`}:{' '}
                <span className="font-semibold text-white">&quot;{savedDraft.title || 'Untitled'}&quot;</span> ({savedDraft.images?.length || 0} photos, {savedDraft.city || 'No city'}, {savedDraft.stateCode || 'GA'}).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => restoreDraft()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{savedDraft.editingId ? 'Continue Editing' : 'Continue Listing'}</span>
            </button>

            <button
              type="button"
              onClick={() => startFreshListing(savedDraft.listingType || 'sale')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-semibold border border-amber-800/60 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Start Afresh</span>
            </button>

            <button
              type="button"
              onClick={discardDraft}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 transition-colors cursor-pointer"
              title="Discard draft and cancel"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard / Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs - Cleanly Separated for For Sale vs For Rent */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* TAB: For Sale */}
            <button
              type="button"
              onClick={() => setActiveTab('sale')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'sale'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>For Sale Homes ({saleProperties.length})</span>
            </button>

            {/* TAB: For Rent */}
            <button
              type="button"
              onClick={() => setActiveTab('rent')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'rent'
                  ? 'bg-sky-700 text-white shadow-md'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>For Rent Properties ({rentProperties.length})</span>
            </button>

            {/* TAB: Create / Edit */}
            <button
              type="button"
              onClick={() => startNewListing(activeTab === 'rent' ? 'rent' : 'sale')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800/90 text-amber-300 hover:bg-slate-800 hover:text-amber-200 border border-amber-500/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === 'editor' && editingId
                  ? 'Editing Property'
                  : '+ List New House / Rental'}
              </span>
            </button>

            {/* TAB: Tour Inquiries & Leads */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('inquiries');
                fetchInquiries();
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-slate-800/90 text-purple-300 hover:bg-slate-800 hover:text-white border border-purple-500/30'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>
                Tour Inquiries ({inquiries.length})
              </span>
            </button>
          </div>

          {/* Quick Metrics Header */}
          <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            <span>
              Total Live Listings: <strong className="text-white">{properties.length}</strong>
            </span>
            <span>•</span>
            <span>
              Affordable Rentals Under $800:{' '}
              <strong className="text-emerald-400">
                {rentProperties.filter((p) => p.price <= 800).length}
              </strong>
            </span>
            <span>•</span>
            <span>
              Starter Homes Under $250k:{' '}
              <strong className="text-emerald-400">
                {saleProperties.filter((p) => p.price <= 250000).length}
              </strong>
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: FOR SALE INVENTORY TAB */}
        {/* ============================================================ */}
        {activeTab === 'sale' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-400" />
                  <span>Verified For Sale Catalog ({saleProperties.length} Properties)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Starter residences, condos, and single-family homes with FHA and grant compatibility.
                </p>
              </div>

              <button
                type="button"
                onClick={() => startNewListing('sale')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add For Sale Home</span>
              </button>
            </div>

            {saleProperties.length === 0 ? (
              <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Home className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No For Sale Listings Yet</h3>
                  <p className="text-xs text-slate-400">
                    Your For Sale catalog is clean. Click below to add your first verified house with 3–20 photos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startNewListing('sale')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Your First House</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-4">Property</th>
                        <th className="p-4 text-center">Manage Actions</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Specs</th>
                        <th className="p-4">Photos</th>
                        <th className="p-4">Assigned Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {saleProperties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-900/60 transition-colors">
                          {/* Col 1: Property Info */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                                {prop.images[0]?.url ? (
                                  <Image
                                    src={prop.images[0].url}
                                    alt={prop.title}
                                    fill
                                    unoptimized={prop.images[0].url.startsWith('data:')}
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-white text-sm block">
                                  {prop.title}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400">
                                  ID: {prop.id}
                                </span>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold uppercase">
                                    {prop.propertyType}
                                  </span>
                                  {prop.fhaEligible && (
                                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                                      FHA Grant
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-2">
                                    <span className="inline-flex items-center gap-0.5">
                                      <Eye className="w-3 h-3 text-slate-500" />
                                      <span>{prop.views ?? 1420}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-0.5">
                                      <Heart className="w-3 h-3 text-rose-400" />
                                      <span>{prop.likes ?? 86}</span>
                                    </span>
                                    {prop.marketDemandBadge && prop.marketDemandBadge !== 'none' && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-semibold">
                                        {prop.marketDemandBadge}
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {/* Mobile Quick Actions directly under title */}
                                <div className="flex items-center gap-2 pt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => editProperty(prop)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(prop)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                  <Link
                                    href={`/listings/${prop.id}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px]"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>View</span>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Prominent Manage Actions */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => editProperty(prop)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shadow-xs cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(prop)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-rose-900 hover:bg-rose-700 text-white border border-rose-700/60 transition-colors shadow-xs cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Listing</span>
                              </button>
                            </div>
                          </td>

                          {/* Col 3: Price */}
                          <td className="p-4">
                            <span className="font-bold font-mono text-sm text-emerald-400 block">
                              ${prop.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Est. ${Math.round(prop.price * 0.007).toLocaleString()}/mo
                            </span>
                          </td>

                          {/* Col 4: Location */}
                          <td className="p-4">
                            <span className="font-semibold text-white block">
                              {prop.address.city}, {prop.address.state}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                              {prop.address.street}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {prop.address.zipCode}
                            </span>
                          </td>

                          {/* Col 5: Specs */}
                          <td className="p-4 text-slate-300">
                            <span className="font-medium text-white block">
                              {prop.specs.bedrooms} bed • {prop.specs.bathrooms} bath
                            </span>
                            <span className="text-[11px] text-emerald-400 font-medium block">
                              Living: {prop.specs.squareFeet?.toLocaleString()} sq ft
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Lot: {prop.specs.lotSizeAcres ? `${prop.specs.lotSizeAcres} ac` : prop.specs.lotSizeSqFt ? `${prop.specs.lotSizeSqFt?.toLocaleString()} sq ft` : '0.15 ac'} • Built {prop.specs.yearBuilt}
                            </span>
                          </td>

                          {/* Col 6: Photos */}
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${
                                prop.images.length >= 3
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{prop.images.length} Photos</span>
                            </span>
                          </td>

                          {/* Col 7: Assigned Agent */}
                          <td className="p-4">
                            <span className="text-white font-semibold block">{prop.agent.name}</span>
                            <span className="text-[10px] text-emerald-400 font-mono block">
                              Telegram: {prop.agent.telegram ? '@' + prop.agent.telegram.split('/').pop() : 'Direct'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: FOR RENT INVENTORY TAB */}
        {/* ============================================================ */}
        {activeTab === 'rent' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Building className="w-5 h-5 text-sky-400" />
                  <span>Verified Rental Catalog ({rentProperties.length} Properties)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Affordable rentals starting under $800/month with zero upfront broker fees and verified landlords.
                </p>
              </div>

              <button
                type="button"
                onClick={() => startNewListing('rent')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rental Unit</span>
              </button>
            </div>

            {rentProperties.length === 0 ? (
              <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Building className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Rental Properties Yet</h3>
                  <p className="text-xs text-slate-400">
                    Your rental catalog is clean. Click below to add your first affordable rental with 3–20 photos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startNewListing('rent')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Your First Rental</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-4">Rental Unit</th>
                        <th className="p-4 text-center">Manage Actions</th>
                        <th className="p-4">Monthly Rent</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Specs</th>
                        <th className="p-4">Photos</th>
                        <th className="p-4">Assigned Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {rentProperties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-900/60 transition-colors">
                          {/* Col 1: Property Info */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                                {prop.images[0]?.url ? (
                                  <Image
                                    src={prop.images[0].url}
                                    alt={prop.title}
                                    fill
                                    unoptimized={prop.images[0].url.startsWith('data:')}
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-white text-sm block">
                                  {prop.title}
                                </span>
                                <span className="text-[10px] font-mono text-sky-400">
                                  ID: {prop.id}
                                </span>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-semibold uppercase">
                                    {prop.propertyType}
                                  </span>
                                  {prop.price <= 800 && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                                      Under $800
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-2">
                                    <span className="inline-flex items-center gap-0.5">
                                      <Eye className="w-3 h-3 text-slate-500" />
                                      <span>{prop.views ?? 1420}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-0.5">
                                      <Heart className="w-3 h-3 text-rose-400" />
                                      <span>{prop.likes ?? 86}</span>
                                    </span>
                                    {prop.marketDemandBadge && prop.marketDemandBadge !== 'none' && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-semibold">
                                        {prop.marketDemandBadge}
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {/* Mobile Quick Actions directly under title */}
                                <div className="flex items-center gap-2 pt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => editProperty(prop)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(prop)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                  <Link
                                    href={`/listings/${prop.id}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px]"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>View</span>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Prominent Manage Actions */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => editProperty(prop)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-sky-700 hover:bg-sky-600 text-white transition-colors shadow-xs cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(prop)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-rose-900 hover:bg-rose-700 text-white border border-rose-700/60 transition-colors shadow-xs cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Listing</span>
                              </button>
                            </div>
                          </td>

                          {/* Col 3: Monthly Rent */}
                          <td className="p-4">
                            <span className="font-bold font-mono text-sm text-sky-400 block">
                              ${prop.price}/mo
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Zero Broker Fee
                            </span>
                          </td>

                          {/* Col 4: Location */}
                          <td className="p-4">
                            <span className="font-semibold text-white block">
                              {prop.address.city}, {prop.address.state}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                              {prop.address.street}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {prop.address.zipCode}
                            </span>
                          </td>

                          {/* Col 5: Specs */}
                          <td className="p-4 text-slate-300">
                            <span className="font-medium text-white block">
                              {prop.specs.bedrooms} bed • {prop.specs.bathrooms} bath
                            </span>
                            <span className="text-[11px] text-sky-400 font-medium block">
                              Living: {prop.specs.squareFeet?.toLocaleString()} sq ft
                            </span>
                            {(prop.specs.lotSizeAcres || prop.specs.lotSizeSqFt) && (
                              <span className="text-[10px] text-slate-400 block">
                                Lot: {prop.specs.lotSizeAcres ? `${prop.specs.lotSizeAcres} ac` : `${prop.specs.lotSizeSqFt?.toLocaleString()} sq ft`}
                              </span>
                            )}
                          </td>

                          {/* Col 6: Photos */}
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${
                                prop.images.length >= 3
                                  ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{prop.images.length} Photos</span>
                            </span>
                          </td>

                          {/* Col 7: Assigned Agent */}
                          <td className="p-4">
                            <span className="text-white font-semibold block">{prop.agent.name}</span>
                            <span className="text-[10px] text-sky-400 font-mono block">
                              Telegram: {prop.agent.telegram ? '@' + prop.agent.telegram.split('/').pop() : 'Direct'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW: TOUR INQUIRIES & CLIENT LEADS */}
        {/* ============================================================ */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <span>Prospective Buyer & Renter Inquiries ({inquiries.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing and tour inquiries submitted by website visitors on property detail pages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchInquiries}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-purple-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Tour Inquiries Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    When visitors submit showing requests on property pages, their contact details and messages will appear here in real time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-4">Applicant / Prospect</th>
                        <th className="p-4">Property Inquired</th>
                        <th className="p-4">Message / Showing Request</th>
                        <th className="p-4">Date Received</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {inquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-900/50 transition-colors">
                          {/* Prospect */}
                          <td className="p-4">
                            <span className="font-bold text-white block text-sm">{inq.userName}</span>
                            <a
                              href={`mailto:${inq.userEmail}`}
                              className="text-emerald-400 hover:underline font-mono text-xs block mt-0.5"
                            >
                              {inq.userEmail}
                            </a>
                            {inq.userPhone && (
                              <span className="text-[11px] text-slate-400 block">{inq.userPhone}</span>
                            )}
                          </td>

                          {/* Property */}
                          <td className="p-4">
                            <span className="font-semibold text-white block">{inq.propertyTitle}</span>
                            <span className="text-[11px] text-slate-400 block">{inq.propertyAddress}</span>
                            {inq.propertyId && inq.propertyId !== 'general' && (
                              <Link
                                href={`/listings/${inq.propertyId}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline mt-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View Listing</span>
                              </Link>
                            )}
                          </td>

                          {/* Message */}
                          <td className="p-4 max-w-md">
                            <p className="text-xs text-slate-200 bg-slate-900/80 p-2.5 rounded-md border border-slate-800/80 leading-relaxed">
                              {inq.message}
                            </p>
                          </td>

                          {/* Date */}
                          <td className="p-4 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                            {new Date(inq.submittedAt).toLocaleString()}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <a
                                href={`mailto:${inq.userEmail}?subject=Re:%20Showing%20Inquiry%20regarding%20${encodeURIComponent(inq.propertyTitle)}&body=Hello%20${encodeURIComponent(inq.userName)},\n\nThank%20you%20for%20contacting%20Nookfinder%20regarding%20${encodeURIComponent(inq.propertyTitle)}.\n\n`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Reply</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => deleteInquiry(inq.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: COMPREHENSIVE PROPERTY CREATOR & EDITOR FORM */}
        {/* ============================================================ */}
        {activeTab === 'editor' && (
          <form
            onSubmit={handleSaveProperty}
            className="bg-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-8 shadow-2xl"
          >
            {/* Header with Title, Auto-Save Status, and Cancel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {editingId ? 'Modify Active Listing' : 'Create New Residential Listing'}
                  </span>
                  {lastDraftSavedTime && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[10px] font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Auto-saved ({lastDraftSavedTime})
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white font-display">
                  {editingId ? `Editing Listing: ${editingId}` : 'Publish Verified House or Rental'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provide complete property overview, 3–20 gallery photos, verified features, and true monthly cost breakdown.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startFreshListing(listingType)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer border border-slate-700"
                  title="Clear form and start fresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Afresh</span>
                </button>

                {hasSavedDraft && (
                  <button
                    type="button"
                    onClick={discardDraft}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold cursor-pointer border border-rose-800/50"
                    title="Delete saved draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Draft</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab(listingType)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel & Return</span>
                </button>
              </div>
            </div>

            {/* Validation Error Alert */}
            {formError && (
              <div className="p-4 rounded-lg bg-rose-950 border border-rose-600 text-rose-200 text-xs font-bold flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* SECTION 1: Category & Pricing Type */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>1. Listing Type & Core Category</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Listing Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as ListingType)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-white font-semibold"
                  >
                    <option value="sale">For Sale (Home Purchase)</option>
                    <option value="rent">For Rent (Monthly Rental)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Property Architecture <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-white"
                  >
                    <option value="house">Single Family Home</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="condo">Starter Condo</option>
                    <option value="apartment">Garden Apartment</option>
                    <option value="duplex">Duplex Residence</option>
                    <option value="studio">Minimalist Studio</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {listingType === 'sale' ? 'Purchase Price ($ USD)' : 'Monthly Rent ($ USD / mo)'}{' '}
                    <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-emerald-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded pl-8 pr-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>100% Audited Title & Deed (Verified Badge)</span>
                </label>

                {listingType === 'sale' && (
                  <>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={fhaEligible}
                        onChange={(e) => setFhaEligible(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>FHA Loan Eligible</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={downPaymentAssistance}
                        onChange={(e) => setDownPaymentAssistance(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Down Payment Assistance Compatible</span>
                    </label>
                  </>
                )}

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={underMarketValue}
                    onChange={(e) => setUnderMarketValue(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Priced Under Regional Market Median</span>
                </label>
              </div>
            </div>

            {/* SECTION 2: Property Overview & Narrative */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>2. Property Overview & Description</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Property Headline <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Brick Starter Home with Energy-Efficient HVAC"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Short Tagline / Value Proposition <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Certified affordable residential residence in a prime commuter location."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Comprehensive Property Narrative <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the architectural layout, room finishes, natural lighting, neighborhood amenities, proximity to grocery and transit, and any recent renovations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded p-3 text-white leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Geographic Location & 25+ States */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>3. Geographic Location (25+ Major US States)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Street Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 142 Oak Creek Trail"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Neighborhood / District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Riverside District"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    City / Municipality <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atlanta"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    State <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-medium"
                  >
                    {US_STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Zip Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="30312"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Interior Living Space vs. Land / Lot Size */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>4. Home Interior Living Space vs. Total Land / Lot Size</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">1 Acre = 43,560 sq ft</span>
              </div>

              {/* Row 1: Interior Rooms & Livable Finished Space */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Bedrooms <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Bathrooms <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-emerald-400 block mb-1">
                    Interior Living (sq ft) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={squareFeet}
                    onChange={(e) => setSquareFeet(Number(e.target.value))}
                    className="w-full text-xs bg-slate-900 border border-emerald-600/80 rounded px-3 py-2 text-white font-mono font-bold"
                    placeholder="e.g. 2400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Heated/cooled interior</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(Number(e.target.value))}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Year Built
                  </label>
                  <input
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(Number(e.target.value))}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Land Parcel / Total Lot Size (The Land the House Sits On) */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Trees className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Total Land Parcel / Lot Size (Total Ground the House Sits On)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Automatic Unit Sync</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Total Lot Size in Sq Ft
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 4856"
                      value={lotSizeSqFt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLotSizeSqFt(val);
                        const num = Number(val);
                        if (val && !isNaN(num) && num > 0) {
                          setLotSizeAcres((num / 43560).toFixed(2));
                        } else if (val === '') {
                          setLotSizeAcres('');
                        }
                      }}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Total deeded ground footprint (e.g. 4,856 sq ft)</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Lot Size in Acres (ac)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0.11"
                      value={lotSizeAcres}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLotSizeAcres(val);
                        const num = Number(val);
                        if (val && !isNaN(num) && num > 0) {
                          setLotSizeSqFt(Math.round(num * 43560).toString());
                        } else if (val === '') {
                          setLotSizeSqFt('');
                        }
                      }}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. 0.11 Acres (~4,856 sq ft)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: Verified Features & Inclusions */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>5. Verified Features & Inclusions ({selectedAmenities.length} selected)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Select the certified property features and inclusions that will show on the verified details page:
              </p>

              {/* Standard Amenity Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {STANDARD_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => handleToggleAmenity(amenity)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-700'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Amenity Adder */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add custom feature (e.g. EV Charger Installed, Screened Porch...)"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAmenity();
                    }
                  }}
                  className="w-full max-w-md text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                >
                  + Add Feature
                </button>
              </div>

              {/* Active Custom Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedAmenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAmenity(amenity)}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* SECTION 6: True Monthly Cost Breakdown */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>6. True Monthly Cost Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Full disclosure of every recurring expense. Shows transparency on the live detail page.
                  </p>
                </div>

                <div className="bg-emerald-950/80 border border-emerald-700/80 px-4 py-2 rounded-lg text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                    Calculated All-In Monthly Cost
                  </span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    ${calcTotalMonthly().toLocaleString()} / mo
                  </span>
                </div>
              </div>

              {listingType === 'sale' ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Principal & Interest ($/mo)
                    </label>
                    <input
                      type="number"
                      value={monthlyPrincipalInterest}
                      onChange={(e) => setMonthlyPrincipalInterest(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Est. 5% down / 6.5%</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Annual Property Tax ($)
                    </label>
                    <input
                      type="number"
                      value={propertyTaxAnnual}
                      onChange={(e) => setPropertyTaxAnnual(Number(e.target.value))}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      ${Math.round(propertyTaxAnnual / 12)}/mo
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Home Insurance ($/mo)
                    </label>
                    <input
                      type="number"
                      value={homeInsuranceMonthly}
                      onChange={(e) => setHomeInsuranceMonthly(Number(e.target.value))}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Monthly HOA Fee ($)
                    </label>
                    <input
                      type="number"
                      value={hoaMonthly}
                      onChange={(e) => setHoaMonthly(Number(e.target.value))}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Est. Utilities ($/mo)
                    </label>
                    <input
                      type="number"
                      value={utilitiesMonthly}
                      onChange={(e) => setUtilitiesMonthly(Number(e.target.value))}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Base Rent ($/mo)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Est. Utilities ($/mo)
                    </label>
                    <input
                      type="number"
                      value={utilitiesMonthly}
                      onChange={(e) => setUtilitiesMonthly(Number(e.target.value))}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Water / Trash ($/mo)
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Included / $0"
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-3 py-2 text-emerald-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Broker / Application Fee
                    </label>
                    <input
                      type="text"
                      disabled
                      value="$0 Guaranteed"
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-3 py-2 text-emerald-400 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 7: Multi-Photo Gallery (Starts Empty, 3-20 Photos from User Gallery) */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>
                      7. Property Photo Gallery ({images.length} of 20 Added • Minimum 3 Required){' '}
                      <span className="text-rose-400">*</span>
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload 3 to 20 photos from your laptop or phone gallery. When users click &apos;View Verified Details&apos;, all photos will display in the interactive lightbox gallery.
                  </p>
                </div>

                {images.length < 3 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/80 border border-amber-600 text-amber-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>{3 - images.length} more photo(s) required to publish</span>
                  </span>
                )}
              </div>

              {/* Gallery Direct File Upload Box */}
              <div className="p-5 bg-slate-900/90 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-colors text-center space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center mx-auto text-emerald-400">
                  <Upload className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Photos from Gallery / Device</span>
                  </button>
                  <p className="text-xs text-slate-400">
                    Select 3 to 20 photos (JPG, PNG, WEBP). Directly loads from your phone or computer.
                  </p>
                </div>
              </div>

              {/* URL fallback adder */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="url"
                  placeholder="Or paste an image web URL: https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 text-xs bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Caption (e.g. Master Bedroom)"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  className="sm:w-48 text-xs bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                >
                  Add URL
                </button>
              </div>

              {/* Photo Previews Grid */}
              {images.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-lg border border-slate-800 text-slate-500 text-xs">
                  No photos added yet. Click &apos;Choose Photos from Gallery / Device&apos; above to add 3 to 20 photos.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative rounded-lg overflow-hidden border bg-slate-900 flex flex-col justify-between ${
                        img.isPrimary
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                          : 'border-slate-700'
                      }`}
                    >
                      <div className="relative aspect-4/3 w-full bg-slate-800">
                        <Image
                          src={img.url}
                          alt={img.caption || `Photo ${idx + 1}`}
                          fill
                          unoptimized={img.url.startsWith('data:')}
                          className="object-cover"
                          sizes="160px"
                        />
                        {img.isPrimary && (
                          <span className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm">
                            Primary Cover
                          </span>
                        )}
                      </div>

                      <div className="p-2 space-y-1 bg-slate-950">
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => {
                            const updated = [...images];
                            updated[idx].caption = e.target.value;
                            setImages(updated);
                          }}
                          placeholder="Caption..."
                          className="text-[10px] bg-transparent border-b border-slate-800 text-slate-300 w-full focus:outline-none focus:border-emerald-500 truncate"
                        />
                        <div className="flex items-center justify-between pt-1">
                          {!img.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="text-[9px] text-emerald-400 hover:underline cursor-pointer"
                            >
                              Set Cover
                            </button>
                          ) : (
                            <span className="text-[9px] text-emerald-500 font-bold">Cover</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                            title="Remove Photo"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 8: Market Demand Badge & Engagement Metrics */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>8. Market Demand Badge & Engagement Stats</span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose an optional institutional market demand badge and set initial visible interest metrics for public listings:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Market Demand Badge Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Market Demand Badge
                  </label>
                  <select
                    value={marketDemandBadge}
                    onChange={(e) => setMarketDemandBadge(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-medium"
                  >
                    <option value="none">None (Standard Listing - No Badge)</option>
                    <option value="High Buyer Interest">High Buyer Interest</option>
                    <option value="High Demand Rental">High Demand Rental</option>
                    <option value="Hot Home">Hot Home (Fast Moving)</option>
                    <option value="Price Drop">Price Drop / Discounted</option>
                    <option value="Newly Renovated">Newly Renovated</option>
                    <option value="Prime Location">Prime Commuter Location</option>
                    <option value="Rare Opportunity">Rare Opportunity</option>
                    <option value="custom">Custom Badge Text...</option>
                  </select>
                </div>

                {/* Listing Total Views Count */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Listing Total Views Count
                  </label>
                  <div className="relative">
                    <Eye className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      value={viewsCount}
                      onChange={(e) => setViewsCount(e.target.value)}
                      placeholder="1420"
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded pl-9 pr-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Listing Likes / Saves Count */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Listing Likes / Saves Count
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 absolute left-3 top-2.5 text-rose-400" />
                    <input
                      type="number"
                      min="0"
                      value={likesCount}
                      onChange={(e) => setLikesCount(e.target.value)}
                      placeholder="86"
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded pl-9 pr-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Badge Text Input (Only if custom is chosen) */}
              {marketDemandBadge === 'custom' && (
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 animate-in fade-in">
                  <label className="text-xs font-semibold text-amber-300 block">
                    Custom Market Badge Text:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Builder Special • Quick Close Eligible"
                    value={customDemandBadge}
                    onChange={(e) => setCustomDemandBadge(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-amber-600/60 rounded px-3 py-2 text-white font-medium"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    This custom tag will display as an institutional pill badge on the property card and detail page (zero emojis).
                  </span>
                </div>
              )}
            </div>

            {/* SECTION 9: In-House Nookfinder Staff Specialist */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>9. Assigned In-House Nookfinder Specialist</span>
              </h3>
              <p className="text-xs text-slate-400">
                All leads and visitor inquiries route directly to our verified staff advisors via Telegram and Email:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: 'Marcus Vance',
                    role: 'Affordable Housing & FHA Specialist',
                    tg: '@nook_finder',
                    email: 'nookkfinder@gmail.com',
                  },
                  {
                    name: 'Sarah Chen',
                    role: 'Suburban & Single-Family Advisor',
                    tg: '@nook_finder',
                    email: 'nookkfinder@gmail.com',
                  },
                  {
                    name: 'David Reynolds',
                    role: 'Rental Leasing & Grant Coordinator',
                    tg: '@nook_finder',
                    email: 'nookkfinder@gmail.com',
                  },
                ].map((agent) => (
                  <button
                    key={agent.name}
                    type="button"
                    onClick={() => setAgentName(agent.name)}
                    className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      agentName === agent.name
                        ? 'bg-emerald-950/80 border-emerald-500 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{agent.name}</span>
                      {agentName === agent.name && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <span className="block text-[11px] text-emerald-400 mt-0.5">
                      {agent.role}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                      Telegram: {agent.tg} • {agent.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Form Actions & Inline Error */}
            <div className="space-y-4 pt-6 border-t border-slate-800">
              {formError && (
                <div className="p-3.5 rounded-lg bg-rose-950 border border-rose-600 text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab(listingType)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel & Return
                </button>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer ${
                    isPublishing
                      ? 'bg-emerald-800 opacity-70 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-600'
                  }`}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing to Catalog...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{editingId ? 'Save & Update Listing' : 'Publish to Live Catalog'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default function ControlPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white text-sm">Loading Control Panel...</div>}>
      <ControlPanelContent />
    </Suspense>
  );
}
