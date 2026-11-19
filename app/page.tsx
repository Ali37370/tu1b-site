import { About } from "@/components/about";
import { Content } from "@/components/content";
import { Footer } from "@/components/footer";
import { Cursor } from "@/components/cursor";
import { Hero } from "@/components/hero";
import { Intro } from "@/components/intro";
import { Journey } from "@/components/journey";
import { Legends } from "@/components/legends";
import { LiveMode } from "@/components/live-mode";
import { LiveSection } from "@/components/live";
import { Nav } from "@/components/nav";
import { Schedule } from "@/components/schedule";
import { Socials } from "@/components/socials";
import { Sponsor } from "@/components/sponsor";

export default function Home() {
  return (
    <>
      <Intro />
      <Cursor />
      <Nav />
      <LiveMode />
      <main id="main">
        <Hero />
        <LiveSection />
        <Socials />
        <About />
        <Journey />
        <Legends />
        <Content />
        <Schedule />
        <Sponsor />
      </main>
      <Footer />
    </>
  );
}
