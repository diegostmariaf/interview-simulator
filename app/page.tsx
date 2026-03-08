import LandingHero from "@/components/LandingHero";

// The root landing page — renders the hero section and feature grid.
// This is a server component by default; LandingHero handles any client interactivity.
export default function Home() {
  return <LandingHero />;
}
