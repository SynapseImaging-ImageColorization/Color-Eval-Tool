import * as React from "react";
import PropTypes from "prop-types";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function LinearProgressWithLabel(props) {
  return (
    <Box>
      <Typography sx={{ marginBottom: 1 }}>
        Building Model on GeForce RTX 2080 Ti
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress
            variant="determinate"
            {...props}
            sx={{
              height: 10,
              borderRadius: 5,
              [`&.${linearProgressClasses.colorPrimary}`]: {
                backgroundColor: "#000000",
                opacity: 0.3,
              },
              [`& .${linearProgressClasses.bar}`]: {
                borderRadius: 5,
              },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value
          )}%`}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

export default LinearProgressWithLabel;
