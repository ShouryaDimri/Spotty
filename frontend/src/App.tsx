import { Route, Routes } from "react-router-dom"
import AuthCallbackPg from "./pages/authCallback/authCallbackPg"
import HomePg from "./pages/home/homPg"
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react"



function App() {
  // token=> auth 

  return (
    <>
    <Routes>
      <Route path = "/" element = {<HomePg />}></Route>
      <Route path = "/sso-callback" element = {<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"}/>}>
      </Route>
      <Route path = "/auth-callback" element = {<AuthCallbackPg />}></Route>
    </Routes>
    </>
  )
}

export default App
