import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";

const DatasetSelector = ({ dataset, setDataset }) => {
  const onHandleChange = (e) => {
    setDataset(e.target.value);
  };
  
  return (
    <Box sx={{ padding: 2, margin: 1 }}>
      <FormControl>
        <FormLabel id="demo-controlled-radio-buttons-group">Dataset</FormLabel>
        <RadioGroup
          row
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={dataset}
          onChange={onHandleChange}
        >
          <FormControlLabel value="Circuit" control={<Radio />} label="Circuit" />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default DatasetSelector;
