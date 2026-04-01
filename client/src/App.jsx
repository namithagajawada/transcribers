import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VoiceInput from "./components/VoiceInput";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mt-6 mb-4">
          ScribeConnect 🚀
        </h1>

        {/* NAVBAR */}
        <div className="flex gap-4 mb-6">
          <Link
            to="/"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Home
          </Link>

          <Link
            to="/dashboard"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Dashboard
          </Link>
        </div>

        {/* ROUTES */}
        <div className="w-full max-w-xl bg-white p-6 rounded shadow">
          <Routes>
            <Route path="/" element={<VoiceInput />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}