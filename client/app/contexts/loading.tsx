import { createContext, useContext, useState } from "react";



type loadingcontextType = {
    loading: boolean,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>

}

export const loadingcontext = createContext<loadingcontextType | undefined>(undefined)

export default function LoadingContextComponent({children}: {children: React.ReactNode}){
    const [loading, setLoading] = useState<boolean>(false)

    return(
        <loadingcontext.Provider value={{loading, setLoading}}>
            {children}
        </loadingcontext.Provider>
    )


}

export function useLoadingContext(){
    const context = useContext(loadingcontext)

    if (!context){
        throw new Error("Loading context not found")
    }

    return context
}