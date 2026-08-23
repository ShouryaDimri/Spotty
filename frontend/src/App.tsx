import { Route, Routes } from "react-router-dom"  //Importing Route and Routes components from react-router-dom to define client-side routing in the application.
import AuthCallbackPg from "./pages/authCallback/authCallbackPg" //Importing the AuthCallbackPg component to handle authentication callback logic.
import HomePg from "./pages/home/homPg" //Importing the HomePg component which serves as the homepage of the application.
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react" //Importing AuthenticateWithRedirectCallback component from Clerk to handle authentication redirection callbacks.
import MainLayout from "./layouts/MainLayout" //Importing MainLayout component which defines the main layout structure for the application.
import ChatPg from "./pages/Chatpage/ChatPg" //Importing ChatPg component which serves as the chat page of the application.
import AlbumPg from "./pages/album/AlbumPg" //Importing AlbumPg component which serves as the album page of the application.
import SearchPg from "./pages/search/SearchPg"  //Importing SearchPg component which serves as the search page of the application.
import AdminPg from "./pages/admin/AdminPg" //Importing AdminPg component which serves as the admin page of the application.  
import ProfilePg from "./pages/profile/ProfilePg" //Importing ProfilePg component which serves as the user profile page of the application.




function App() {
  return (
    <Routes>
      <Route
        path="/sso-callback"
        element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl="/auth-callback" />}
      />
      <Route path="/auth-callback" element={<AuthCallbackPg />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePg />} />
        <Route path="/search" element={<SearchPg />} />
        <Route path="/chat" element={<ChatPg />} />
        <Route path="/messages" element={<ChatPg />} />
        <Route path="/profile" element={<ProfilePg />} />
        <Route path="/admin" element={<AdminPg />} />
        <Route path="/albums/:albumId" element={<AlbumPg />} />
        {/* Catch-all route */}
        <Route path="*" element={<HomePg />} />
      </Route>
    </Routes>
  );
}

export default App
