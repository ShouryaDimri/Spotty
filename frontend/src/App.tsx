import { Route, Routes } from "react-router-dom"
import HomePg from "./pages/home/homPg"
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react"
import AuthCallbackPage from "./pages/authCallback/authCallbackPg.tsx"



function App() {
  // token=> auth 

  return (
    <>
    <Routes>
      <Route path = "/" element = {<HomePg />}></Route>
      <Route path = "/sso-callback" element = {<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"}/>}>
      </Route>
      <Route path = "/auth-callback" element = {<AuthCallbackPage />}></Route>
    </Routes>
    </>
  )
}

export default App
