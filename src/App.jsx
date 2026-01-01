import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import MemeFeed from "./MemeFeed";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";

import "./App.css";

export default function App() {
  const location = useLocation();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [showUpload, setShowUpload] =
    useState(false);

  const openPostId =
    location.state?.openPostId || null;

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <>
     
      {!isAuthPage && user && (
        <Header
          user={user}
          setUser={setUser}
          onUpload={() => setShowUpload(true)}
        />
      )}

      <Routes>
      
        <Route
          path="/"
          element={
            user ? (
              <MemeFeed
                openPostId={openPostId}
                showUpload={showUpload}
                closeUpload={() =>
                  setShowUpload(false)
                }
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={
            user ? (
              <Profile />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

       
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        />

     
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />

       
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <Signup />
            )
          }
        />
      </Routes>

     
      {user && !isAuthPage && (
        <BottomNav />
      )}
    </>
  );
}
