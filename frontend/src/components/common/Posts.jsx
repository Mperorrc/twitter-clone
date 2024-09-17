import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({feedType}) => {

	const getPostEndPoint = ()=>{
		switch(feedType){
			case "forYou":
				return "api/post/all";
			case "following":
				return "api/post/following";
			default:
				return "api/post/all";
		}
	}

	const POST_ENDPOINT = getPostEndPoint();

	const {data:posts,isLoading,refetch,isRefetching} = useQuery({
		queryKey:["Posts"],
		queryFn: async ()=>{
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();

				if(data.error || !res.ok){
					throw new Error(data.error || "Cannot Fetch Posts");
				}

				return data;

			} catch (error) {
				throw new Error(error);
			}
		},
		retry:false,
	})

	useEffect(() => {
	  refetch();
	}, [feedType,refetch])
	

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;