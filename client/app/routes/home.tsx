import Navbar from "~/components/navbar"
import { FooterPage } from "~/components/footer"
import { useState, useEffect } from "react"
import { Link } from "react-router"
import type { productType } from "./item"
import UserCartService from "~/helpers/cartHandle"






export default function Home() {
  const [width, setWidth] = useState<number>(501)
  const [height, setHeight] = useState<number>(501)
  const [featured, setFeatured] = useState<productType>()

  const arrIDs = ["681b7c4c423ee947ec118c73", "681b9104423ee947ec118c81", "6821bed4fefec9bcd12fcf01", "681b7c4c423ee947ec118c75"]

  useEffect(() => {

    const handleResize = () => {
      setWidth(window.innerWidth)

    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }

  }, [])

  useEffect(() => {
    function randomNumberArr() {

      return Math.floor(Math.random() * 4)

    }
    const handleRetrieveArtSelected = async () => {
      try {
        const url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/${arrIDs[randomNumberArr()]}`
        const response = await fetch(url, { method: "GET" })

        if (!response.ok) {
          throw new Error("The API fetch request has failed")
        }

        const data = await response.json()
        setFeatured(data)



      }
      catch (error) {
        console.log("An error has occured: ", error)

      }
    }

    handleRetrieveArtSelected()
  }, [])


  return (
    <>
      <Navbar></Navbar>
      <main className="w-full h-full overflow-hidden">
        <header id="hero-section" className="text-white bg-center   bg-[url(https://dgyirn4ilc3bc.cloudfront.net/Random-Art-Fluff-1-001/Random-Art-Fluff/IMG_0199-V2.webp)] bg-cover h-[60vh]">
          <div className="flex flex-col items-center justify-center p-5 space-y-2">
            <p className="italic font-semibold">Our site, our experience</p>
            <h1 className="text-5xl font-bold">A love for art?</h1>
            <p>At The Jacko shop, you can browse various illustrations done by him if you would like to get a poster added to your home</p>
            <Link to={"/collection/all"}><button type="button" className="font-['Inter'] bg-[var(--accent-col)]  text-white p-5 font-bold">Explore catalog</button></Link>
          </div>
        </header>

        <section className=" animate-scroll space-y-5 md:space-y-0  flex flex-row flex-wrap justify-around round-the-children children-padding p-8 min-h-[50vh] max-w-[100vw] overflow-hidden">

          <div className="container-achievements max-w-[300px] md:h-auto border-2  border-b-5 border-current dark:border-[var(--accent-col)]">
            <img className="w-full h-auto" src="https://www.shutterstock.com/image-photo/receiving-package-delivery-man-picking-600nw-2489804985.jpg" alt="" />
            <p className="text-xl font-semibold">2000+ satisfied customers</p>
            <p>We have had resounding success in providing affordable art prints, delivered at blazing speeds</p>
          </div>

          <div className="container-achievements max-w-[300px] md:h-auto border-2 border-b-5 border-current dark:border-[var(--accent-col)]">
            <img className="w-full h-auto" src="https://www.shutterstock.com/image-photo/arts-craft-supplies-corrugated-color-600nw-351226619.jpg" alt="" />
            <p className="text-xl font-semibold">A varied catalog</p>
            <p>From stickers, to portraits, to depictions of characters with landscapes, you'll find something to love</p>
          </div>

          <div className="container-achievements max-w-[300px] md:h-auto border-2  border-b-5 dark:border-[var(--accent-col)]">
            <img className="w-full h-auto" src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" alt="" />
            <p className="text-xl font-semibold">Excellent communication</p>
            <p>Not particularly satisfied? Checked out but want to add more to the same delivery? We strive to make it easy for you to personalize your experience</p>
          </div>


        </section>

        <section className="featured p-6 item w-full md:max-h-[100dvh] inline-block md:grid md:grid-cols-2 md:grid-rows-1">
          <div id="left-grid-landing" className="space-y-5">
            <h2 className="font-semibold text-5xl">Featured Art</h2>
            <p className="font-semibold text-2xl text-[var(--accent-col)]">{featured?.title ?? "Franchise"}</p>

            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti recusandae dolorem odit, et officia consequatur possimus harum. Ipsam, repudiandae, quod voluptates necessitatibus sint cumque nobis neque magni sunt consequatur perferendis, porro placeat iste! Quibusdam neque in, nam recusandae, mollitia consectetur at minus ad cupiditate consequuntur ab facilis temporibus maxime aliquam!</p>

            <div className="flex flex-row space-x-10">
              <div className="p-3">
                <p className="font-['Inter'] font-extrabold text-2xl">{featured?.copyright ?? "n/a"}</p>
                <h3>Copyright</h3>
              </div>

              <div className="border-l-4 border-stone-500 p-3">
                <p className="font-['Inter'] font-extrabold text-2xl">{featured?.size ?? "30cm x 90cm"}</p>
                <h3>Size:</h3>
              </div>

            </div>
            {width > 500 && (<div id="buynow" className="flex flex-row space-x-5 text-3xl items-center font-['Inter']">
              <p>R{featured?.price ?? "R0.00"}</p> <Link to={`/collection/681b7c4c423ee947ec118c73`} className="bg-[var(--accent-col)] text-white p-5 font-bold">BUY NOW</Link>
            </div>)}
          </div>

          <div id="right-grid">
            <img className="h-full w-auto mx-auto rounded-xl" src={featured?.url ?? "https://dgyirn4ilc3bc.cloudfront.net/Random-Art-Fluff-1-001/Random-Art-Fluff/3b949068-dd65-4835-a512-a19afab19585.PNG"} alt="A picture of an artwork we sell on this site" />

            {width < 500 && width > 0 ? (<div id="buynow-small" className="flex flex-row space-x-5 text-3xl items-center justify-around font-['Inter'] my-5">
              <p>R{featured?.price ?? "R0.00"}</p> <Link to={`/collection/681b7c4c423ee947ec118c73`} className="bg-[var(--accent-col)] text-white p-5 font-bold">BUY NOW</Link>
            </div>) : (null)}
          </div>
        </section>

      </main>
      <FooterPage></FooterPage>
    </>
  )
}
