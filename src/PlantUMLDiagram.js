import React from 'react';
import PlantUML from 'react-plantuml';

const PlantUMLDiagram = ({ plantUMLText }) => {
  return (
    <div>
      <PlantUML text={plantUMLText} />
    </div>
  );
};

export default PlantUMLDiagram;
