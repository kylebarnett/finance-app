import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MarketDashboard from "@/components/MarketDashboard";
import CompanySearch from "@/components/CompanySearch";
import NewsSection from "@/components/news/NewsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Search & Markets Section - Combined flow */}
      <section id="learn" className="scroll-mt-8">
        {/* Company Search first */}
        <CompanySearch />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="border-t border-[var(--cream-dark)]" />
        </div>

        {/* Market Dashboard below */}
        <div id="markets" className="scroll-mt-8">
          <MarketDashboard />
        </div>
      </section>

      {/* News Section */}
      <NewsSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
