import React from 'react';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

function Footer() {
  return (
    <footer style={{ textAlign: 'center', marginTop: '50px', padding: '10px', backgroundColor: '#1976D2' }}>
        <Box mt={5} component="footer" textAlign="center" color="#f1f1f1">
        <Typography variant="body2" color="#f1f1f1">
          Created by Caio Maia © {new Date().getFullYear()}
        </Typography>
      
      <p>
        <Link href="https://github.com/Caio-Maia" target="_blank" rel="noopener" color="inherit"
          sx={{ mx: 1 }}>
          <GitHubIcon fontSize="large" />
        </Link>
        <Link href="https://www.linkedin.com/in/caiojordan/" target="_blank" rel="noopener" color="inherit"
          sx={{ mx: 1 }}>
          <LinkedInIcon fontSize="large" />
        </Link>
      </p>
      </Box>
    </footer>
  );
}

export default Footer;