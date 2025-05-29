import { useState, useEffect } from 'react';
import MenuBar from './menuBar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { SelectChangeEvent } from '@mui/material';
import { Box, FormControl, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const Register = () => {
    navigate('/register'); 
  };

  const Login = () => {
    navigate('/login'); 
  };
  const Home = () => {
    navigate('/')
  }
  const Resources = () => {
    navigate('/Resources')
  }

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
        if (!res.ok) {
          throw new Error("User malumotlar chiqmadi");
        }
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
    <div >
      <div className='flex justify-between items-center pl-5 pr-5 p-3 shadow-xl bg-gradient-to-b from-sky-300 to-white'>
        <ul>
          <li onClick={Home}>
            <p className='text-2xl font-serif font-bold text-[#1976D5]'>EDUCATION</p>
          </li>
        </ul>

        <ul className='flex justify-between items-center gap-3'>
  <li onClick={Home}><Stack><Button>Home</Button></Stack></li>
  <li><Stack><Button>About</Button></Stack></li>
  <li onClick={Resources}><Stack><Button>Resources</Button></Stack></li>

  {user && (
    <>
      <li><Stack><Button>Favorites</Button></Stack></li>
      <li><Stack><Button>Appointments</Button></Stack></li>
    </>
  )}
  
  <li><MenuBar/></li>
</ul>


        <ul className='flex justify-between items-center gap-5'>
          <li>
            <Box sx={{ minWidth: 150, minHeight: 40, }}>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={language}
                  onChange={handleChange}
                >
                  <MenuItem value={'uz'}>O'zbek tili</MenuItem>
                  <MenuItem value={'ru'}>Rus tili</MenuItem>
                  <MenuItem value={'eng'}>English</MenuItem>
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
          <li className='text-xl font-bold font-serif'>{user.firstName} {user.lastName}</li>
          <li className='text-[12px] text-gray-500'> {user.email}</li>
        </ul>
        </MenuItem>
        <MenuItem  onClick={() => {
              handleClose();       
              navigate('/profile');
            }}>Edit Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Log out</MenuItem>
                </Menu>
              </div>
            </li>
          ) : (
            <>
              <li>
                <button onClick={Login} className='border-from-sky-400 text-[#1976D5] shadow-xl px-12 py-4 rounded-full hover:bg-white hover:text-[#1976D5]'>
                  Login
                </button>
              </li>
              <li>
                <button onClick={Register} className='border-from-sky-400 text-[#1976D5] shadow-xl hover:bg-white hover:text-[#1976D5] px-15 py-4 rounded-full '>
                  Register
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
