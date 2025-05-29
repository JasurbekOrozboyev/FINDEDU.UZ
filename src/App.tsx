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
import Headers from "./components/header";
import Profile from "./page/profile";
import Allcenters from './centers/Allcenters'
import CenterDetail from "./centers/CenterDetail";
import Resources from './page/Resources'
import Allcategories from './Categories/Allcategories'
import CreateCenter from './page/CreateCenter'
import MyCenters from "./centers/mycenter";

function App() {

  return (
   <div>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/allcategories" element={<Allcategories />} />
        <Route path="/createcenter" element={<CreateCenter />} />
        <Route path="/mycenters" element={<MyCenters />} />
        <Route path="/header" element={<Headers />} />
        <Route path="/nav" element={<Navbar />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/verifyOtpPage" element={<VerifyOtpPage />} />
        <Route path="/allcenters" element={<Allcenters />} />
        <Route path="/centerdetail/:id" element={<CenterDetail />} />
      </Routes>
    </Router>
   </div>
  )
}

export default App
