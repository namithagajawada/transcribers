// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import VoiceInput from "./components/VoiceInput";
// import Dashboard from "./pages/Dashboard";
// import Home from "./pages/Home";

// export default function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-100 flex flex-col items-center">

//         {/* HEADER */}
//         <h1 className="text-3xl font-bold mt-6 mb-4">
//           ScribeConnect 🚀
//         </h1>

//         {/* NAVBAR */}
//         <div className="flex gap-4 mb-6">
//           <Link
//             to="/"
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//           >
//             Home
//           </Link>

//           <Link
//             to="/dashboard"
//             className="bg-green-500 text-white px-4 py-2 rounded"
//           >
//             Dashboard
//           </Link>
//         </div>

//         {/* ROUTES */}
//         <div className="w-full max-w-xl bg-white p-6 rounded shadow">
//           <Routes>
//             {/* <Route path="/" element={<Home />} />
//             <Route path="/" element={<VoiceInput />} />
//             <Route path="/dashboard" element={<Dashboard />} /> */}
//             <Route path="/" element={<Home />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/client" element={<ClientDashboard />} />
//             <Route path="/assistant" element={<AssistantDashboard />} />
//           </Routes>
//         </div>

//       </div>
//     </Router>
//   );
// }

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// // ✅ ADD THESE IMPORTS
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Client from "./pages/Client";
// import Assistant from "./pages/Assistant";

// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/client" element={<Client />} />
//         <Route path="/assistant" element={<Assistant />} />
//       </Routes>
//     </Router>
//   );
// }


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home      from "./pages/Home";
import Login     from "./pages/Login";
import Signup    from "./pages/Signup";
import Client    from "./pages/Client";
import Assistant from "./pages/Assistant";

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}