import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { SelectChangeEvent } from '@mui/material';
import { Box, FormControl, Select, MenuItem, IconButton, Avatar } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { type PaletteMode } from '@mui/material';
import MenuList from './menuBar'; 
import * as React from 'react'; 
import Menu from '@mui/material/Menu';
import { useTranslation } from 'react-i18next'; 

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
}

interface NavbarProps {
  toggleColorMode: () => void;
  currentMode: PaletteMode;
}

function Navbar({ toggleColorMode }: NavbarProps) {
  const { t, i18n } = useTranslation(); 

  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const BASE_URL = 'https://findcourse.net.uz'; 

  const Register = () => navigate('/register');
  const About = () => navigate('/about');
  const Login = () => navigate('/login');
  const Home = () => navigate('/');
  const Resources = () => navigate('/Resources');
  const Appointments = () => navigate('/appointments');
  const Favorites = () => navigate("/favorites");

  const handleChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value); 
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setUser(null);
      return;
    }

    fetch(`${BASE_URL}/api/users/mydata`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            navigate('/login');
          }
          throw new Error("user ma'lumotlari kelmadi");
        }
        return res.json();
      })
      .then((json) => {
        if (json.data) {
            const userImagePath = json.data.image;
            let fullImageUrl = '/default-profile.png'; 

            if (userImagePath) {
                if (userImagePath.startsWith('http://') || userImagePath.startsWith('https://')) {
                    fullImageUrl = userImagePath;
                } else {
                    fullImageUrl = `${BASE_URL}/api/image/${userImagePath}`;
                }
            }

          setUser({
            firstName: json.data.firstName,
            lastName: json.data.lastName, 
            email: json.data.email,
            image: fullImageUrl,
          });
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setUser(null);
      });
  }, [navigate]);

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
    window.location.href = '/'; 
  };

  return (
    <div>
      <div className={`fixed top-0 left-0 h-full w-64 ${theme.palette.mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end p-4">
          <button onClick={() => setSidebarOpen(false)} className={`${theme.palette.mode === 'dark' ? 'text-gray-300' : 'text-gray-600'} font-bold text-xl`}>{t('close')}</button>
        </div>
        <ul className="flex flex-col gap-4 p-4 text-lg">
          <li onClick={() => { setSidebarOpen(false); Home(); }}>{t('home')}</li>
          <li onClick={() => { setSidebarOpen(false); Resources(); }}>{t('resources')}</li>
          <li onClick={() => { setSidebarOpen(false); About(); }}>{t('about')}</li>

          <li className="lg:hidden">
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <Select
                  id="sidebar-language-select"
                  value={i18n.language || 'uz'}
                  onChange={handleChange}
                  size="small"
                  sx={{ color: theme.palette.text.primary }}>
                  <MenuItem value="uz">{t('uzbekLanguage')}</MenuItem>
                  <MenuItem value="ru">{t('russianLanguage')}</MenuItem>
                  <MenuItem value="eng">{t('englishLanguage')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </li>

          {user && (
            <div>
              <li onClick={() => { setSidebarOpen(false); Favorites(); }}>{t('favorites')}</li>
              <li onClick={() => { setSidebarOpen(false); Appointments(); }}>{t('appointments')}</li>
              <li><MenuList/></li> 
              <li onClick={() => { setSidebarOpen(false); navigate('/profile'); }}>{t('editProfile')}</li>
              <li onClick={() => { setSidebarOpen(false); handleLogout(); }}>{t('logout')}</li>
            </div>
          )}
          {!user && (
            <div>
              <li onClick={() => { setSidebarOpen(false); Login(); }}>{t('login')}</li>
              <li onClick={() => { setSidebarOpen(false); Register(); }}>{t('register')}</li>
            </div>
          )}
          <li className="flex items-center gap-2 mt-4">
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <span className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {theme.palette.mode === 'dark' ? t('lightMode') : t('darkMode')}
            </span>
          </li>
        </ul>
      </div>

      <div className={`flex justify-between items-center pl-5 pr-5 p-3 shadow-xl ${theme.palette.mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <ul onClick={Home}>
          <li>
            <p className="text-2xl font-serif font-bold text-[#461773] hidden sm:block">{t('education')}</p>
          </li>
        </ul>

        <ul className="hidden lg:flex justify-between items-center gap-3">
          <li onClick={Home}><Stack><Button sx={{ color: theme.palette.text.primary }}>{t('home')}</Button></Stack></li>
          <li onClick={About}><Stack><Button sx={{ color: theme.palette.text.primary }}>{t('about')}</Button></Stack></li>
          <li onClick={Resources}><Stack><Button sx={{ color: theme.palette.text.primary }}>{t('resources')}</Button></Stack></li>
          {user && (
            <>
              <li onClick={() => { Favorites(); }}><Stack><Button sx={{ color: theme.palette.text.primary }}>{t('favorites')}</Button></Stack></li>
              <li onClick={Appointments}><Stack><Button sx={{ color: theme.palette.text.primary }}>{t('appointments')}</Button></Stack></li>
              <li><MenuList/></li>
            </>
          )}
        </ul>

        <ul className="flex justify-between items-center gap-5">
          <li>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </li>

          <li className="hidden lg:block">
            <Box sx={{ minWidth: 150, minHeight: 40 }}>
              <FormControl fullWidth>
                <Select id="language-select" value={i18n.language || 'uz'} onChange={handleChange} sx={{ color: theme.palette.text.primary }}>
                  <MenuItem value="uz">{t('uzbekLanguage')}</MenuItem>
                  <MenuItem value="ru">{t('russianLanguage')}</MenuItem>
                  <MenuItem value="eng">{t('englishLanguage')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </li>

          {user ? (
            <div className="flex items-center gap-2">
                <Button id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClick} sx={{ color: theme.palette.text.primary, padding: '6px 8px', minWidth: 'auto' }}>
                <Avatar src={user.image || '/default-profile.png'} alt={`${user.firstName} ${user.lastName}`} sx={{ width: 40, height:40, mr: 1 }}/>
                  <span className="md:block text-[#461773] font-semibold">
                    {user.firstName} {user.lastName} 
                  </span>
               </Button>
               <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
              PaperProps={{
                sx: {
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                  color: theme.palette.text.primary,
                },
              }}>
                <MenuItem onClick={handleClose}>
                <div className="flex items-center gap-3">
                    <Avatar 
                        src={user.image || '/default-profile.png'} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        sx={{ width: 40, height: 40, border: '1px solid #461773' }}
                    />
                    <ul>
                        <li className={`text-xl font-bold font-serif ${theme.palette.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.firstName} {user.lastName}
                        </li>
                        <li className="text-[12px] text-gray-500">{user.email}</li>
                    </ul>
                </div>
                    </MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate('/profile'); }} sx={{ color: theme.palette.text.primary }}>{t('editProfile')}</MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: theme.palette.text.primary }}>{t('logout')}</MenuItem>
                </Menu>
              </div>
          ) : (
            <>
              <li className="hidden lg:block ">
                <Button onClick={Login} variant="outlined" sx={{ color: '#461773', borderColor: '#461773', borderRadius: '9999px', '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(70, 23, 115, 0.1)' : 'rgba(70, 23, 115, 0.04)'} }}>
                  {t('login')}
                </Button>
              </li>
              <li className="hidden lg:block">
                <Button onClick={Register} variant="outlined" sx={{ color: '#461773', borderColor: '#461773', borderRadius: '9999px', '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(70, 23, 115, 0.1)' : 'rgba(70, 23, 115, 0.04)'} }}>
                  {t('register')}
                </Button>
              </li>
            </>
          )}

          <li className="lg:hidden">
            <button onClick={() => setSidebarOpen(true)}> 
              <FontAwesomeIcon icon={faBars} size="2x" className="text-[#461773]" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;