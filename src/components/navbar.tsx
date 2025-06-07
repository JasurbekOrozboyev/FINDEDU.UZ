import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import MenuBar from './menuBar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { SelectChangeEvent } from '@mui/material';
import { Box, FormControl, Select, MenuItem } from '@mui/material';

import * as React from 'react';
import Menu from '@mui/material/Menu';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

function Navbar() {
  const [language, setLanguage] = useState('eng');
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const Register = () => navigate('/register');
  const Login = () => navigate('/login');
  const Home = () => navigate('/');
  const Resources = () => navigate('/Resources');

  const handleChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setUser(null);
      return;
    }

    fetch('https://findcourse.net.uz/api/users/mydata', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('User ma\'lumotlari olinmadi');
        return res.json();
      })
      .then((json) => {
        if (json.data) {
          setUser({
            firstName: json.data.firstName,
            lastName: json.data.lastName,
            email: json.data.email,
          });
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setUser(null);
      });
  }, []);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    handleClose();
    navigate('/');
  };

  return (
    <div>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end p-4">
          <button onClick={() => setSidebarOpen(false)} className="text-gray-600 font-bold text-xl">×</button>
        </div>
        <ul className="flex flex-col gap-4 p-4 text-lg">
          <li onClick={() => { setSidebarOpen(false); Home(); }}>Home</li>
          <li onClick={() => { setSidebarOpen(false); Resources(); }}>Resources</li>
          <li onClick={() => setSidebarOpen(false)}>About</li>

          {/* Til tanlash faqat sidebar ichida (faqat kichik ekranlar uchun) */}
          <li className="lg:hidden">
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <Select
                  id="sidebar-language-select"
                  value={language}
                  onChange={handleChange}
                  size="small"
                >
                  <MenuItem value="uz">O'zbek tili</MenuItem>
                  <MenuItem value="ru">Русский</MenuItem>
                  <MenuItem value="eng">English</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </li>

          {user && (
            <>
              <li>Favorites</li>
              <li>Appointments</li>
              <li onClick={() => { setSidebarOpen(false); navigate('/profile'); }}>Edit Profile</li>
              <li onClick={() => { setSidebarOpen(false); handleLogout(); }}>Logout</li>
            </>
          )}
          {!user && (
            <>
              <li onClick={() => { setSidebarOpen(false); Login(); }}>Login</li>
              <li onClick={() => { setSidebarOpen(false); Register(); }}>Register</li>
            </>
          )}
        </ul>
      </div>

      {/* Top Navbar */}
      <div className="flex justify-between items-center pl-5 pr-5 p-3 shadow-xl">
        <ul onClick={Home}>
          <li>
            <p className="text-2xl font-serif font-bold text-[#1976D5]">EDUCATION</p>
          </li>
        </ul>

        <ul className="hidden lg:flex justify-between items-center gap-3">
          <li onClick={Home}><Stack><Button>Home</Button></Stack></li>
          <li><Stack><Button>About</Button></Stack></li>
          <li onClick={Resources}><Stack><Button>Resources</Button></Stack></li>
          {user && (
            <>
              <li><Stack><Button>Favorites</Button></Stack></li>
              <li><Stack><Button>Appointments</Button></Stack></li>
            </>
          )}
          <li><MenuBar /></li>
        </ul>

        <ul className="flex justify-between items-center gap-5">
          {/* Til tanlash - faqat katta ekranlar uchun */}
          <li className="hidden lg:block">
            <Box sx={{ minWidth: 150, minHeight: 40 }}>
              <FormControl fullWidth>
                <Select
                  id="language-select"
                  value={language}
                  onChange={handleChange}
                >
                  <MenuItem value="uz">O'zbek tili</MenuItem>
                  <MenuItem value="ru">Русский</MenuItem>
                  <MenuItem value="eng">English</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </li>

          {user ? (
            <li className="text-[#1976D5] font-semibold">
              <div>
                <Button
                  id="basic-button"
                  aria-controls={open ? 'basic-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  onClick={handleClick}
                >
                  {user.firstName} {user.lastName}
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>
                    <ul>
                      <li className="text-xl font-bold font-serif">{user.firstName} {user.lastName}</li>
                      <li className="text-[12px] text-gray-500">{user.email}</li>
                    </ul>
                  </MenuItem>
                  <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Edit Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Log out</MenuItem>
                </Menu>
              </div>
            </li>
          ) : (
            <>
              <li className="hidden lg:block">
                <button onClick={Login} className="border text-[#1976D5] shadow-xl px-5 py-2 rounded-full hover:bg-white hover:text-[#1976D5]">
                  Login
                </button>
              </li>
              <li className="hidden lg:block">
                <button onClick={Register} className="border text-[#1976D5] shadow-xl px-5 py-2 rounded-full hover:bg-white hover:text-[#1976D5]">
                  Register
                </button>
              </li>
            </>
          )}

          <li className="lg:hidden">
            <button onClick={() => setSidebarOpen(true)}>
              <FontAwesomeIcon icon={faBars} size="2x" className="text-[#1976D5]" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
