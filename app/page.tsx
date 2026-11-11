import { About } from "@/components/about";
import { Content } from "@/components/content";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { LiveSection } from "@/components/live";
import { Nav } from "@/components/nav";
import { Schedule } from "@/components/schedule";
import { Socials } from "@/components/socials";
import { Sponsor } from "@/components/sponsor";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <LiveSection />
        <Socials />
        <About />
        <Content />
        <Schedule />
        <Sponsor />
      </main>
      <Footer />
    </>
  );
}
