import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () =>{

    const queryClient = useQueryClient();

    const {mutate:followMutation, isPending} = useMutation({
        mutationFn:async (userId)=>{
            try {
                const res = await fetch(`/api/user/follow/${userId}`,{
                    method:"POST",
                });

                const data = await res.json();

                if(data.error||!res.ok){
                    throw new Error(data.json || "Couldn't Follow User");
                }

                return data;
                
            } catch (error) {
                throw new Error(error);
            }
        },
        onSuccess:()=>{
            Promise.all([
                queryClient.invalidateQueries({queryKey:["Posts"]}),
                queryClient.invalidateQueries({queryKey:["authUser"]}),
                queryClient.invalidateQueries({queryKey:["suggestedUsers"]})
            ])
        },
        onError:()=>{
            toast.error(error?.message || "Couldn't Follow User");
        }

    });

    return {followMutation,isPending};
}

export default useFollow;


