import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSearch from '@/components/home/HeroSearch';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import AffordablePillars from '@/components/home/AffordablePillars';
import SellerShowcase from '@/components/home/SellerShowcase';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSearch />
        <FeaturedProperties />
        <AffordablePillars />
        <SellerShowcase />
      </main>
      <Footer />
    </div>
  );
}
