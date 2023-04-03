import React from 'react';
import { Box } from '@mui/material';

const BlackRectangle = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 20, // Adjust these values as needed to achieve the desired overflow
        left: 10,
        width: 200, // You can set the desired width and height for the rectangle
        height: 80,
        backgroundColor: '#f2f2f2',
        zIndex: 999
      }}
    />
  );
};

export default BlackRectangle;
