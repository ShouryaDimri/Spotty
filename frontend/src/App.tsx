import { Route, Routes } from "react-router-dom"
import AuthCallbackPg from "./pages/authCallback/authCallbackPg"
import HomePg from "./pages/home/homPg"
import { axiosInstance } from "./lib/axios"



function App() {
  // token=> auth 

  return (
    <>
    <Routes>
      <Route path = "/" element = {<HomePg />}></Route>
      <Route path = "/auth-callback" element = {<AuthCallbackPg />}></Route>
    </Routes>
    </>
  )
}

export default App
