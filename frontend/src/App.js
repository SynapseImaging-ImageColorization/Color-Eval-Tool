import "./App.css";
import React from "react";
import Header from "./components/Header.js";
import Contents from "./components/Contents";
import {Container, Stack} from '@mui/material';



function App() {
  return (
      <Container fixed>
        <Stack spacing={1} >
          <Header />
          <Contents />
        </Stack>
      </Container>
  );
}

export default App;
