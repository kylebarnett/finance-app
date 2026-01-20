import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MarketDashboard from "@/components/MarketDashboard";
import CompanySearch from "@/components/CompanySearch";
import Glossary from "@/components/Glossary";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Live Market Dashboard */}
      <section id="markets" className="scroll-mt-8">
        <MarketDashboard />
      </section>

      {/* Company Search Section */}
      <section id="learn" className="scroll-mt-8">
        <CompanySearch />
      </section>

      {/* Glossary Section */}
      <Glossary />

      {/* Footer */}
      <Footer />
    </main>
  );
}
