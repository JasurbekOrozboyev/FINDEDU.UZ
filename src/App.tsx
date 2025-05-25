import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./page/Home";
import Register from "./Authentication/register";
import Login from "./Authentication/login"
import VerifyOtpPage from "./Authentication/verifyOTP";

function App() {

  return (
   <div>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nav" element={<Navbar />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifyOtpPage" element={<VerifyOtpPage />} />
      </Routes>
    </Router>
   </div>
  )
}

export default App
