import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import '../i18n'; 

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  
    },
    secondary: {
      main: '#ff9800',  
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: ['"Roboto"', 'sans-serif'].join(','),
  },
});

export default theme;
