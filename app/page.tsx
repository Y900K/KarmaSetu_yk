import HeroSection from '@/components/home/HeroSection';
import StatsRow from '@/components/home/StatsRow';
import FeaturesSection from '@/components/home/FeaturesSection';
import DomainsSection from '@/components/home/DomainsSection';
import FAQSection from '@/components/home/FAQSection';
import BlogPreviewSection from '@/components/home/BlogPreviewSection';
import CTASection from '@/components/home/CTASection';
import LandingMascotWidget from '@/components/home/LandingMascotWidget';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsRow />
      <FeaturesSection />
      <DomainsSection />
      <FAQSection />
      <BlogPreviewSection />
      <CTASection />
      <LandingMascotWidget />
    </>
  );
}
