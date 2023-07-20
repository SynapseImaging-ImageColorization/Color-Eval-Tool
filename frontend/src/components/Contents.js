import React, { useState, useEffect } from "react";
import ModelSelector from "./ModelSelector";
import Visualization from "./Visualization";
import DatasetSelector from "./DatasetSelector";
import Test from "./Test";
import axios from "axios";
import {Container, Card, Typography, Divider, Stack } from "@mui/material";


const Contents = () => {
  const [model, setModel] = useState("BigColor");
  const [dataset, setDataset] = useState("Circuit");
  const [goNext, setGoNext] = useState(0);
  const [dataNames, setDataNames] = useState([]);
  const [index, setIndex] = useState(0);
  const [numOfData, setNumOfData] = useState(0);
  const [dataInfos, setDataInfos] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputIndex, setInputIndex] = useState(null);
  const [dataInfo, setDataInfo] = useState([]);
  const [dataName, setDataName] = useState(null);

  useEffect(() => {
    if(!isLoaded) {
      setGoNext(false);
    console.log("getAllData")
    axios({
      method: "get",
      url: "http://127.0.0.1:51122/getAllData",
      params: {dataset: dataset},
      headers: {"Content-Type": "multipart/form-data"},
    }).then((response) => {
      console.log("getAllData-response", response.data.list);
      setDataNames(response.data.list);
      setNumOfData(response.data.list.length);
      setIsLoaded(true);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
        }
      });
    }
  }, [dataset]);

  useEffect(() => {
    if(isLoaded && (goNext !== 0 || inputIndex != null)) {
      let name;
      if(inputIndex != null) {
        name = inputIndex;
        console.log("inputIndex");
      } else {
        name = dataNames[index];
      }
      setDataName(name);
      console.log("predict", index, inputIndex, name);
      axios({
        method: "get",
        url: "http://127.0.0.1:51122/predict",
        params: {
          model: model,
          dataset: dataset,
          img_name: name,
        },
        //data: formData,
        headers: {"Content-Type": "multipart/form-data"},
      })
        .then((response) => {
          console.log("predict-response", response)
          response.data.gt = "data:;base64," + response.data.gt;
          response.data.input = "data:;base64," + response.data.input;
          response.data.output = "data:;base64," + response.data.output;

          if(inputIndex) {
            setDataInfo(response.data)
            setInputIndex(null)
          }
          else {
            setDataInfo(response.data)
            dataInfos.push(response.data);
            
            if(goNext === 1 && index<numOfData) {
              setIndex(index+1);
            }
            else if(goNext === -1 && index>=1) {
              setIndex(index-1);
            }
            else {
              console.log("index error", goNext, index);
            }
          }
          setGoNext(0);
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response);
          }
        });

    }
  }, [index, goNext, inputIndex]);


  return (
    <Container>
      <Stack direction="row" spacing={2}>
        <Card raised sx={{width: "28rem", height:"26rem", display: "flex", flexDirection: "column", textAlign: "center"}} >
          <Typography sx={{padding: "1rem", fontWeight: "bold"}} variant="h5">
            Model Setting
          </Typography>
          <Divider />
          <ModelSelector model={model} setModel={setModel} />
          <DatasetSelector
            dataset={dataset}
            setDataset={setDataset}
          />
          <Test
            setGoNext={setGoNext}
            index={index}
            numOfData={numOfData}
            isLoaded={isLoaded}
            setInputIndex={setInputIndex}
          />
        </Card>
        <Visualization
          dataInfo={dataInfo}
          name={dataName}
          model={model}
        />
      </Stack>
    </Container>
  );
};

export default Contents;
