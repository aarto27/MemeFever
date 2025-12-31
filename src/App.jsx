import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Header from "./components/Header";
import MemeFeed from "./MemeFeed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  return (
    <>
      {/* Pass setUser to Header so it can clear the app state on logout */}
      {user && <Header setUser={setUser} />}

      <Routes>
        <Route
          path="/"
          element={user ? <MemeFeed /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />
        <Route
          path="/signup"
          element={<Signup />}
        />
      </Routes>
    </>
  );
}