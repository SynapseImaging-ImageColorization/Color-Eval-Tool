import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Button,
  TextField
} from "@mui/material";

const Test = ({
  setGoNext,
  index,
  numOfData,
  isLoaded,
  setInputIndex
}) => {
  const [btnLabel, setBtnLabel] = useState("Let's Go!");
  const [blank, setBlank] = useState('');


  useEffect(() => {
    if (index > 0 && index !== numOfData) {
      setBtnLabel("Next!");
    }
    else setBtnLabel("Let's Go!");
  }, [index, numOfData]);

  return (
    <Box>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          display: "flex",
          flexDirection: "row",
          textAlign: "center",
          justifyContent: "center",
          marginTop: "40px",
          marginBottom: "20px",
        }}
      >
        <TextField id="outlined-basic" placeholder="001_001_1" size="small" label="Index" value={blank} onChange={(event) => {
          setBlank(event.target.value);
        }} variant="outlined"/>
        <Button
          variant="contained"
          onClick={(event) => {
            setInputIndex(blank);
            setBlank("")
          }}
          disabled={!isLoaded}
          >Find!</Button>
        </Stack>

        <Stack
          spacing={2}
          direction="row"
          sx={{
            display: "flex",
            flexDirection: "row",
            textAlign: "center",
            justifyContent: "center",
            marginTop: "40px",
            marginBottom: "20px",
          }}
        >
          <Button
            variant="contained"
            value="Back!"
            onClick={(e) => {
              setGoNext(-1);
            }
          }
            disabled={!isLoaded || index<=1}
          >
            Back!
          </Button>
          <Button
            variant="contained"
            value={btnLabel} 
            onClick={(e) => {
              setGoNext(1);
            }}
            disabled={!isLoaded}
          >
            {btnLabel}
          </Button>
        </Stack>
    </Box>
  );
};

export default Test;
