import { useState } from 'react';
import MenuBar from './menuBar'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { SelectChangeEvent } from '@mui/material';
import { Box, FormControl, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';



function Navbar() {
   const [language, setLanguage] = useState('eng'); 
    const navigate = useNavigate();
    
    const Register = () => {
    navigate('/register'); 
  };
  const Login = () => {
    navigate('/login'); 
  };

  const handleChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  return (
   <div className='flex justify-between items-center pl-5 pr-5 p-3 shadow-2xl'>
        <ul>
            <li>
               <p className='text-2xl font-serif font-bold text-[#1976D5]'>EDUCATION</p>
            </li>
        </ul>
        <ul className='flex justify-between items-center gap-3'>
            <li>
                <Stack>
                    <Button>Home</Button>
                </Stack>
            </li>
            <li>
                <Stack>
                    <Button>About</Button>
                </Stack>
            </li>
            <li>
                <Stack>
                    <Button>Resources</Button>
                </Stack>
            </li>
            <li>
                <Stack>
                    <Button>Favorites</Button>
                </Stack>
            </li>
            <li>
                <Stack>
                    <Button>Appointments</Button>
                </Stack>
            </li>
            <li>
             <MenuBar/>
            </li>
        </ul>
        <ul className='flex justify-between items-center gap-5'>
            <li>
                <Box sx={{ minWidth: 150, minHeight: 40 }}>
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
            <li>

                <button onClick={Login} className='bg-[#0c447d] text-white hover:bg-white hover:text-[#1976D5] border px-12 py-4 rounded-full '>Login</button>
            </li>
            <li>
                <button onClick={Register} className='bg-[#0c447d] text-white hover:bg-white hover:text-[#1976D5] border px-15 py-4 rounded-full '>Register</button>
            </li>
        </ul>
  

    
   </div>
  )
}

export default Navbar;
