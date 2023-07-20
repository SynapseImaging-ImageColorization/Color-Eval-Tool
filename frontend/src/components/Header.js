import React from "react";
import {Container, Typography, Divider} from '@mui/material';

const Header = () => {
  return (
    <Container>
      <Typography align='center' variant='h4' sx={{padding: "1rem", fontWeight: "bold"}}>
        Circuit Colorization Evaluation Tool
      </Typography>
      <Divider />
    </Container>
  );
};

export default Header;
