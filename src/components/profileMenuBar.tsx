import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  user: Profile;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <div>
      <Button
        id="user-menu-button"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        CEO Dashboard
      </Button>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'user-menu-button',
        }}
      >
        {/* 1-chi item: firstName lastName */}
        <MenuItem onClick={handleClose}>
          <Typography fontWeight="bold">
            {user.firstName} {user.lastName}
          </Typography>
        </MenuItem>

        {/* 2-chi item: firstName lastName va email pastda */}
        <MenuItem onClick={handleClose} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography fontWeight="bold">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user.email}
          </Typography>
        </MenuItem>

        {/* 3-chi item: Log out */}
        <MenuItem onClick={handleLogout} sx={{ color: 'red', fontWeight: 'bold' }}>
          Log Out
        </MenuItem>
      </Menu>
    </div>
  );
}
