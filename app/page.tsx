import { AppDemo } from "@/components/sections/app-demo";
import { Builds } from "@/components/sections/builds";
import { Closing } from "@/components/sections/closing";
import { Hero } from "@/components/sections/hero";
import { Inside } from "@/components/sections/inside";
import { Questions } from "@/components/sections/questions";
import { Nav } from "@/components/shared/nav";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Inside />
        <Builds />
        <AppDemo />
        <Questions />
        <Closing />
      </main>
    </>
  );
}
