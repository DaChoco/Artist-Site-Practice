import Navbar from "~/components/navbar"
import { FooterPage } from "~/components/footer"
export default function ContactPage(){

    return (<>
    <Navbar></Navbar>
    <main className="md:max-w-[800px] mx-auto p-5 space-y-2" >
        <h1 className="text-5xl">Contact Page</h1>
        <p className="font-mono">Need a more custom commission after seeing the collection? Have a deeper question about the store or our policies? Then fill in these details to get in touch, we'll be sure to respond to you</p>
        
        <form className="flex flex-col space-y-5 children-padding">
            <input className="bg-slate-200 text-black outline-none border-2" type="text" placeholder="Type your email" />
            <input className="bg-slate-200 text-black outline-none border-2"  type="text" placeholder="Type your name"/>
            <input className="bg-slate-200 text-black outline-none border-2"  type="text" placeholder="Type your Phone Number" />
            <textarea className="bg-slate-200 text-black outline-none border-2"  placeholder="Comment"></textarea>
            <button type="submit" className="bg-[var(--accent-col)] border-5 border-white text-white">Send</button>
        </form>
    </main>
    
    <FooterPage></FooterPage>
    </>

    )
}