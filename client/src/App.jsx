import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home      from "./pages/Home";
import Login     from "./pages/Login";
import Signup    from "./pages/Signup";
import Client    from "./pages/Client";
import Assistant from "./pages/Assistant";
import Admin     from "./pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/signup"    element={<Signup />} />
          <Route path="/client"    element={<Client />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/admin"     element={<Admin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


