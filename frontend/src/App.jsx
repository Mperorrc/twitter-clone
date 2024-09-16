import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage.jsx";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import SignupPage from "./pages/auth/signup/SignupPage.jsx";
import Sidebar from "./components/common/SideBar.jsx";
import RightPanel from "./components/common/RightPanel.jsx";
import NotificationPage from "./pages/notification/NotificationPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

function App() {

  const {data:authUser, isLoading, isError, error} = useQuery({
    queryKey: ['authUser'],
    queryFn: async() =>{
      try {
        const res = await fetch("api/auth/user");

        const data = await res.json();
        if(data.error) return null;
        if(!res.ok){
          throw new Error(data.error || "something went wrong");
        }
        
        console.log("user: ",data);
        return data;

      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    retry:false,
  });

  if(isLoading){
    return(
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size='lg'/>
      </div>
    )
  }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar/>}
      <Routes>
        <Route path='/' element={ authUser? <HomePage />: <Navigate to= '/login'/>}/>
        <Route path='/login' element={ !authUser? <LoginPage />: <Navigate to= '/'/>}/>
        <Route path='/signup' element={ !authUser? <SignupPage />: <Navigate to= '/'/>}/>
        <Route path='/notifications' element={authUser? <NotificationPage />: <Navigate to= '/login'/>}/>
        <Route path='/profile/:username' element={authUser? <ProfilePage />: <Navigate to= '/login'/>}/>
      </Routes>
      {authUser && <RightPanel/>}
      <Toaster/>
    </div>
  )
}

export default App;
