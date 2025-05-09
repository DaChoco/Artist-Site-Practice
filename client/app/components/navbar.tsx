
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router"

export default function Navbar(){
    const [showClose, setShowClose] = useState<Boolean>(false)
    const [hideList, setHideList] = useState<Boolean>(false)
    const [width, setWidth] = useState(0)
   
    const navigator = useNavigate()
   
    useEffect(()=>{

        const handleResize = ()=>{
            setWidth(window.innerWidth)
            console.log(window.innerWidth)
        }
        window.addEventListener("resize", handleResize)

        return ()=>{
            window.removeEventListener("resize", handleResize)
        }
    },[])




    const handleShowSearchBar = () =>{
        setShowClose(!showClose)
        setHideList(!hideList)
    }

    const handleIndexNavigate = ()=>{
        navigator("/")
        
    }

    return (
        <nav className="flex flex-row items-center justify-between bg-white dark:bg-[var(--dark-background-col)] p-4">
    
            <svg xmlns="http://www.w3.org/2000/svg" onClick={handleIndexNavigate} id="main-logo" className="w-10 h-10 dark:fill-white" data-name="Layer 1" viewBox="0 0 122.88 103.78"><title>paint-brush</title><path className="cls-1" d="M0,103.78c11.7-8.38,30.46.62,37.83-14a16.66,16.66,0,0,0,.62-13.37,10.9,10.9,0,0,0-3.17-4.35,11.88,11.88,0,0,0-2.11-1.35c-9.63-4.78-19.67,1.91-25,10-4.9,7.43-7,16.71-8.18,23.07ZM54.09,43.42a54.31,54.31,0,0,1,15,18.06l50.19-49.16c3.17-3,5-5.53,2.3-10.13A6.5,6.5,0,0,0,117.41,0,7.09,7.09,0,0,0,112.8,1.6L54.09,43.42Zm-16.85,22c2.82,1.52,6.69,5.25,7.61,9.32L65.83,64c-3.78-7.54-8.61-14-15.23-18.58-6.9,9.27-5.5,11.17-13.36,20Z"/></svg>

            {showClose && (<div className="search-container relative w-6/12 flex flex-col border-black-100 dark:border-white border-3 p-1 focus-within:border-[var(--accent-col)]">
                <label htmlFor="art-search" className="text-sm">Search</label>
                <input type="text" id="art-search" className="bg-transparent focus:outline-none" />

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="w-10 h-10 dark:fill-white absolute right-2 bottom-1/2 translate-y-2/4">
                    <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                </svg>
            </div>)}

            <ul className={` menuitems flex flex-row space-x-5 ${hideList ? "hidden": "flex"}`}>
        
                <li className="flex items-center font-semibold"><Link to="/about">About</Link></li>
                <li className="flex items-center font-semibold"><Link to={{"pathname": "/collection/all", "search": "?page=1"}}>Collection</Link></li>
                <li className="flex items-center font-semibold"><Link to={"/contact"}>Contact</Link></li>
            
            </ul>
            <div className="flex flex-row items-center space-x-5">
                {showClose ? (<svg onClick={handleShowSearchBar} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="w-10 h-10 dark:fill-white  my-auto">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>) :
                (<svg onClick={handleShowSearchBar} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="w-10 h-10 dark:fill-white my-auto ">
                    <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                </svg>)}
                <svg className="w-10 h-10 dark:fill-white my-auto " xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                <svg className="w-10 h-10 dark:fill-white my-auto " xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" ><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z" /></svg>
            </div>

        </nav>
    )
}

