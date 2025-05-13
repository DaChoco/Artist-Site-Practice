import { createContext, useState, useContext } from "react"
export type cartContextState = {
    _id: string,
    price: number,
    title: string,
    url: string,
    createdAt: number,
    stock: number
}

type contextgiver = {
    currentCart: cartContextState[]
    setCurrentCart: React.Dispatch<React.SetStateAction<cartContextState[]>>
}

const cartcontext = createContext<contextgiver| undefined>(undefined)

export default function CartContextSelector({children}: {children: React.ReactNode}){
    const [currentCart, setCurrentCart] = useState<cartContextState[]>([])

    return (
        <cartcontext.Provider value={{currentCart, setCurrentCart}}>
            {children}
        </cartcontext.Provider>
    )
}

export function useCartContext(){
    const context = useContext(cartcontext)

    if (!context){
        console.warn("CART CONTEXT:")
        throw new Error("No cart context found, apologies")
    }

    return context

}