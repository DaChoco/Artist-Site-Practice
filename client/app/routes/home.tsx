import Navbar from "~/components/navbar"
import { FooterPage } from "~/components/footer"




export default function Home() {
  return (
  <>
  <Navbar></Navbar>
  <main className="w-full h-full">
    <section className="hero-section w-full h-[90dvh]">
        <div className="hero-text">
            <h1 className="text-5xl font-semibold">Welcome to Jacko's Art</h1>
            <p className="text-3xl">A collection of art by Jacko</p>
        </div>
    </section>
  </main>
  <FooterPage></FooterPage>
  </>
  )
}
