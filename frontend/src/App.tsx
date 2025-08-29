import { Route, Routes } from "react-router-dom"
import AuthCallbackPg from "./pages/authCallback/authCallbackPg"
import HomePg from "./pages/home/homPg"
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react"
import MainLayout from "./layouts/MainLayout"
import ChatPg from "./pages/Chatpage/ChatPg"




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
      <Route path = "/chat" element = {<ChatPg />}></Route>

      </Route>
    </Routes>
    </>
  )
}

export default App
