import React from "react";
import styled from "styled-components";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const Container = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(1, 1fr);
  width: 100%;
  height: 100%;
  margin-top: 3px;
`;
const Image = styled.img`
  width: 100%;
  heigth: 100%;
  border-radius: 3px;
`;
const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: #FFF;
`;

const ImgContainer = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  height: 100%;
`;


const Visualization = ({ dataInfo, name, model }) => {
  console.log("visualization", dataInfo, name );

  function createData(metric, value) {
    return { metric, value };
  }
  
  const rows = [
    createData('PSNR', dataInfo.psnr),
    createData('SSIM', dataInfo.ssim),
    createData('LPIPS', dataInfo.lpips),
    createData('Inference Time (s)', dataInfo.inference_time),
    createData('Evaluation Time (s)', dataInfo.eval_time),
  ];


  if (dataInfo.input) {
    return (
    <>
      <Container>
        <Title>{name}</Title>
        <ImgContainer>
          <Image src={dataInfo.input} />
          <Image src={dataInfo.gt} />
          <Image src={dataInfo.output} />
        </ImgContainer>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 100 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Metrics</TableCell>
                <TableCell align="center">{model}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row" align="center">
                    {row.metric}
                  </TableCell>
                  <TableCell align="center">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
    );
  } else return <Container></Container>
};

export default Visualization;


