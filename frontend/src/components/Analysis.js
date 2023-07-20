import React from "react";
import styled from "styled-components";
import { Card, Typography, Divider } from "@mui/material";

const Td = styled.td`
  padding: 3px 10px;
`;
const Table = styled.table`
  text-align: center;
  padding: 10px;
  width: 95%;
  margin-top: 15px;
  border-collapse: collapse;
`;
const Table2 = styled.table`
  text-align: center;
  padding: 10px;
  margin: 20px 10px;
  border-collapse: collapse;
`;
const Td2 = styled.td`
  padding: 4px 10px;
  border: 1px solid gray;
  width: 150px;
`;
const Histogram = styled.img`
  width: 310px;
  height: 280px;
`;
const Container = styled.div`
  text-align: center;
`;

const Analysis = ({ counter, histogram }) => {


  return (
    <Card
      sx={{ display: "flex", flexDirection: "column", textAlign: "center" }}
    >
      <Typography sx={{ padding: 1 }} variant="h6" component="div">
        Analysis
      </Typography>
      <Divider />
      <Container>
        <Table>
          <tbody>
            {/* 첫번째 행 */}
            <tr> 
              <Td></Td>
              <Td style={{ borderBottom: "1px solid gray" }}>Predicted</Td>
              <Td style={{ borderBottom: "1px solid gray" }}>OK</Td>
              <Td style={{ borderBottom: "1px solid gray" }}>NG</Td>
              <Td style={{ borderBottom: "1px solid gray" }}>Total</Td>
            </tr>
            {/* 두번째 행 */}
            <tr>
              <Td rowSpan={2} style={{ borderRight: "1px solid gray" }}>
                actual
              </Td>
              <Td>OK</Td>
              <Td>{counter.TP}</Td>
              <Td>{counter.FN}</Td>
              <Td>{counter.TP + counter.FN}</Td>
            </tr>
            {/* 세번째 행 */}
            <tr>
              <Td>NG</Td>
              <Td>{counter.FP}</Td>
              <Td>{counter.TN}</Td>
              <Td>{counter.FP + counter.TN}</Td>
            </tr>
          </tbody>
        </Table>

        <Table2>
          <tbody>
            <tr>
              <Td2>Overkill Rate</Td2>
              <Td2>
                {counter.TP + counter.FN
                  ? ((counter.FN / (counter.TP + counter.FN)) * 100).toFixed(1)
                  : "- "} %
              </Td2>
            </tr>
            <tr>
              <Td2>Underkill Rate</Td2>
              <Td2>
                {counter.TN + counter.FP
                  ? ((counter.FP / (counter.TN + counter.FP)) * 100).toFixed(1)
                  : "- "} %
              </Td2>
            </tr>
            <tr>
              <Td2>Accuracy</Td2>
              <Td2>
                {counter.TP + counter.TN + counter.FP + counter.FN
                  ? (
                      ((counter.TP + counter.TN) 
                      / (counter.TP + counter.TN + counter.FP + counter.FN)) * 100
                    ).toFixed(1)
                  : "- "} %
              </Td2>
            </tr>
          </tbody>
        </Table2>
        <Histogram src={histogram} ></Histogram>
      </Container>
    </Card>
  );
};

export default Analysis;
