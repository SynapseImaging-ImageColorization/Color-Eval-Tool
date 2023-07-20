import React from "react";
import {
  Box,
  FormLabel,
  FormControlLabel,
  Radio,
  FormControl,
  RadioGroup,
} from "@mui/material";

const ModelSelector = ({ model, setModel }) => {
  const onHandleChange = (e) => {
    setModel(e.target.value);
  };

  return (
    <Box sx={{ padding: 1, margin: 1 }}>
      <FormControl>
        <FormLabel id="demo-controlled-radio-buttons-group">Model</FormLabel> 
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={model}
          onChange={onHandleChange}
        >
          <FormControlLabel value="BigColor" control={<Radio />} label="BigColor" />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default ModelSelector;
