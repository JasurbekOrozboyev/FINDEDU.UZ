import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route,} from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { type PaletteMode } from '@mui/material'; 
import Navbar from "./components/navbar";
import Home from "./page/Home";
import Register from "./Authentication/register";
import Login from "./Authentication/login";
import VerifyOtpPage from "./Authentication/verifyOTP";
import Profile from "./page/profile";
import Allcenters from './centers/Allcenters';
import CenterDetail from "./centers/CenterDetail"; 
import Resources from './page/Resources';
import Allcategories from './Categories/Allcategories';
import CreateCenter from './page/CreateCenter';
import MyCenters from "./centers/mycenter";
import About from "./page/About";
import Appointments from "./page/Appointments";
import EditCenterPage from "./centers/editcenter";
import Favorites from "./page/Favorites";
import Footer from './components/footer';

function App() {
  const [mode, setMode] = useState<PaletteMode>('light'); 

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode, 
          primary: {
            main: '#00000', 
            contrastText: '#ffffff', 
          },
          secondary: {
            main: '#9c27b0', 
          },
          error: {
            main: '#d32f2f', 
          },
          text: {
            primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff', 
            secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)', 
          },
          background: {
            default: mode === 'light' ? '#f4f6f8' : '#121212', 
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e', 
          },
        },
      }),
    [mode],
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <Router>
          <Navbar toggleColorMode={toggleColorMode} currentMode={mode} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/allcategories" element={<Allcategories />} />
            <Route path="/createcenter" element={<CreateCenter />} />
            <Route path="/mycenters" element={<MyCenters />} />
            <Route path="/nav" element={<Navbar toggleColorMode={toggleColorMode} currentMode={mode} />} /> 
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verifyOtpPage" element={<VerifyOtpPage />} />
            <Route path="/allcenters" element={<Allcenters />} />
            <Route path="/centerdetail/:id" element={<CenterDetail />} />
            <Route path="/editcenter/:id" element={<EditCenterPage />} />
          </Routes>
          <Footer/>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;