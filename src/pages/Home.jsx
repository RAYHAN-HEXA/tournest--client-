import useTitle from "../hooks/useTitle";
import HeroSection from "./home/HeroSection";
import CategorySection from "./home/CategorySection";
import GuidesSection from "./home/GuidesSection";
import ToursSection from "./home/ToursSection";
import WhyChooseSection from "./home/WhyChooseSection";
import HowItWorksSection from "./home/HowItWorksSection";
import TestimonialsSection from "./home/TestimonialsSection";
import StatsSection from "./home/StatsSection";
import GuideCtaSection from "./home/GuideCtaSection";

export default function Home() {
  useTitle("Discover Local Tours & Guides");

  return (
    <>
      <HeroSection />
      <CategorySection />
      <GuidesSection />
      <ToursSection />
      <WhyChooseSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <StatsSection />
      <GuideCtaSection />
    </>
  );
}
