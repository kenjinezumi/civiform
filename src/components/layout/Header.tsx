import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Track the current language in local state
  const [lang, setLang] = useState(i18n.language);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  // Basic nav items using translations
  const navItems = [
    { label: t('home') || 'Home', icon: <HomeIcon />, path: '/' },
    { label: t('about') || 'About', icon: <InfoIcon />, path: '/about' },
    { label: t('createNewForm') || 'Create New Form', icon: <AddBoxIcon />, path: '/admin/forms/builder' },
  ];

  const handleLogout = () => {
    alert(t('logout'));
    navigate('/login');
  };

  // Handle changing language
  const handleLangChange = (event: any) => {
    const newLang = event.target.value;
    setLang(newLang);
    i18n.changeLanguage(newLang);  // triggers UI translation update
  };

  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navItems.map((item) => (
          <ListItemButton key={item.label} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary={t('logout')} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* HAMBURGER ICON */}
          <IconButton 
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* APP TITLE */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('appName')}
          </Typography>

          {/* LANGUAGE SWITCHER */}
          <FormControl size="small" variant="outlined">
            <InputLabel id="language-selector-label">{t('language')}</InputLabel>
            <Select
              labelId="language-selector-label"
              label={t('language')}
              value={lang}
              onChange={handleLangChange}
              sx={{ color: 'inherit' }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="ar">العربية</MenuItem>
              <MenuItem value="pt">Português</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerList}
      </Drawer>
    </>
  );
}

export default Header;
