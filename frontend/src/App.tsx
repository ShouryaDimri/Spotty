import { Route, Routes } from "react-router-dom"
import AuthCallbackPg from "./pages/authCallback/authCallbackPg"
import HomePg from "./pages/home/homPg"
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react"
import MainLayout from "./layouts/MainLayout"
import ChatPg from "./pages/Chatpage/ChatPg"
import AlbumPg from "./pages/album/AlbumPg"
import SearchPg from "./pages/search/SearchPg"
import AdminPg from "./pages/admin/AdminPg"




function App() {
  // token=> auth 

  return (
    <>
    <Routes>
      
      <Route path = "/sso-callback" element = {<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"}/>}>
      </Route>
      <Route path = "/auth-callback" element = {<AuthCallbackPg />}></Route>

      <Route element={<MainLayout />}>
        <Route path = "/" element = {<HomePg />}></Route>
        <Route path = "/search" element = {<SearchPg />}></Route>
        <Route path = "/chat" element = {<ChatPg />}></Route>
        <Route path = "/admin" element = {<AdminPg />}></Route>
        <Route path = "/albums/:albumId" element = {<AlbumPg />}></Route>
        {/* Catch-all route for 404s */}
        <Route path="*" element={<HomePg />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
