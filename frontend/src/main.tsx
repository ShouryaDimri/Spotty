import { StrictMode } from 'react'  //Wrap your root component in <StrictMode> to enable helpful development warnings.
import { createRoot } from 'react-dom/client' //createRoot is the new method to initialize a React application in React 18 and above.
import './index.css' //Importing global CSS styles for the application.
import App from './App.tsx' //Importing the main App component which serves as the root of the React component tree.
import { ClerkProvider } from '@clerk/clerk-react' //Importing ClerkProvider to integrate Clerk authentication services into the React application.
import { BrowserRouter } from 'react-router-dom' //Importing BrowserRouter to enable client-side routing in the React application.
import AuthProvider from './providers/authProvider.tsx' //Importing a custom AuthProvider component to manage authentication state and logic.


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY; //Retrieving the Clerk publishable key from environment variables for secure authentication setup.

if (!PUBLISHABLE_KEY) {
  //Throwing an error if the publishable key is missing to prevent application from running without proper authentication configuration.
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ClerkProvider>
  </StrictMode>,
)
