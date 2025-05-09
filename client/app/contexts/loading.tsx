import { createContext, useState } from "react";



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