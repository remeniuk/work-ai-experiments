import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import ChatComponent from './ChatComponent';
import Flowchart from './Flowchart';
import './App.css';
import BlackRectangle from './BlackRectangle';

function App() {
  // Set the default GoJS diagram data for a simple flowchart
  const defaultFlowchartData = {
    "nodeDataArray": [
      /*{ "key": 1, "category": "Start", "text": "Start" },
      { "key": 2, "category": "Decision", "text": "KYC Document Received?" },
      { "key": 3, "category": "Action", "text": "Verify KYC Documents" },
      { "key": 4, "category": "Decision", "text": "KYC Documents Verified?" },
      { "key": 5, "category": "Action", "text": "Process KYC Request" },
      { "key": 6, "category": "End", "text": "End" },
      { "key": 7, "category": "End", "text": "Reject KYC Request" }*/
    ],
    "linkDataArray": [
      /*{ "from": 1, "to": 2, "label": "" },
      { "from": 2, "to": 3, "label": "" },
      { "from": 3, "to": 4, "label": "" },
      { "from": 4, "to": 5, "label": "Yes" },
      { "from": 4, "to": 7, "label": "No" },
      { "from": 5, "to": 6, "label": "" }*/
    ]
  }  ;

  const [flowchartData, setFlowchartData] = useState(defaultFlowchartData);

  const handleFlowchartDataReceived = (data) => {
    setFlowchartData(data);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
          sx={{
            width: '65px',
            height: '100%',
            backgroundColor: 'rgb(60, 60, 60)',
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '5px',
          }}
        >
      <img src="/img/logo.png" alt="Logo" width="24px" height="14px" style={{paddingTop: '19px'}} />
      </Box>
      <Grid
        container
        sx={{
          flexGrow: 1,
          minHeight: 0,
          maxHeight: '100%',
          p: 2,
        }}
      >
        <Grid item sx={{ height: '100%', display: 'flex' }}>
        <Box
              sx={{
                position: 'absolute',
                top: '0',
                left: '65px',
                right: '0',
                height: '50px',
                backgroundColor: 'white',
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                zIndex: '1000',
                display: 'flex',
                alignItems: 'left',
                justifyContent: 'left',
                padding: '20 20px',
              }}
            >
              <h3
                style={{
                  margin: '0',
                  padding: '15px 30px',
                  textAlign: 'left',
                  fontFamily: 'Avenir',
                  color: 'cornflowerblue',
                }}
              >
                <span>Kendrik, Customer Identity Program Analyst</span>
                <span style={{ fontSize: '0.5em', color: 'gray', position: 'relative', top: '-1px', padding: '10px 10px'}}>&#x1433;</span>
                <span style={{ color: 'gray' }}>Workflow</span>
              </h3>
            </Box>
          <Box
            sx={{
              width: 500, // Set the fixed width of the ChatComponent to 400px
              height: '100%',
              display: 'flex',
              ml: '65px',
              flexDirection: 'column',
            }}
          >
            <ChatComponent onFlowchartDataReceived={handleFlowchartDataReceived} />
          </Box>
        </Grid>
        <Grid item xs sx={{ height: '100%', display: 'flex' }}>
          <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Flowchart flowchartData={flowchartData} />
              <BlackRectangle />
              <img
                src="/img/components.png"
                alt="Components"
                style={{
                  position: 'absolute',
                  top: '65px',
                  left: '15px',
                  height: '500px',
                  backgroundColor: 'lightgray',
                  borderRadius: '10px',
                  padding: '1px',
                  boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.2)',
                  zIndex: '1000',
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
