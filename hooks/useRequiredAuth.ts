import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRequireAuth = () =>{
    const {isLoggedIn, loading} =  useAuth();
    const router = useRouter();

    useEffect(() =>{
        if(!loading && !isLoggedIn){
            router.push('/pages/login');
        }
    }, [isLoggedIn, loading]);

    return {isLoggedIn, loading}
}