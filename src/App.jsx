import { useState } from "react";
import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Header from "./components/Header";
import MemeFeed from "./MemeFeed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const location = useLocation();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

 
  const openPostId =
    location.state?.openPostId || null;

  return (
    <>
      <Header user={user} setUser={setUser} />

      <Routes>
        <Route
          path="/"
          element={
            <MemeFeed openPostId={openPostId} />
          }
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
