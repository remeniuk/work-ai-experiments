import React, { useEffect } from 'react';
import * as go from 'gojs';
import './Flowchart.css';

const Flowchart = ({ flowchartData }) => {
  const diagramRef = React.useRef(null);
  const diagramContainerRef = React.useRef(null);

  useEffect(() => {
    if (diagramRef.current === null) {
      diagramRef.current = go.GraphObject.make
      initDiagram(diagramContainerRef.current);
    }
    return () => {
      diagramRef.current = null;
    };
  }, [flowchartData]);

  const initDiagram = (div) => {
    
    const $ = diagramRef.current;

    let diagram = go.Diagram.fromDiv(div);

    if(!diagram) {
        diagram = $(go.Diagram, div, {
            'undoManager.isEnabled': true,
            layout: $(go.TreeLayout, {
            angle: 90,
            layerSpacing: 40
            }),
            initialContentAlignment: go.Spot.Center,
        });
    
        // get the div container element for the diagram
        const diagramDiv = diagram.div;
        // set the background color of the div element to gray
        diagramDiv.style.backgroundColor = "#f2f2f2";      

        // Define the node templates based on the node category
        const nodeTemplateMap = new go.Map();
        nodeTemplateMap.add('Start',
        $(go.Node, 'Spot',
            $(go.Shape, 'Circle', { width: 20, height: 20, fill: 'rgb(220, 255, 220)', stroke: 'darkgreen' }),
        ));
        nodeTemplateMap.add('Process',
        $(go.Node, 'Spot',
            $(go.Shape, 'RoundedRectangle', { width: 155, height: 70, fill: 'white', stroke: 'lightgray' }),
            $(go.TextBlock, { margin: 5, font: '12px Avenir', stroke: 'black', textAlign: 'center', overflow: go.TextBlock.OverflowEllipsis, width: 145  }, new go.Binding('text', 'text'))
        ));
        nodeTemplateMap.add('Decision',
        $(go.Node, 'Vertical',
             $(go.TextBlock, { margin: 2, font: '11px Avenir', stroke: 'black', textAlign: 'center', overflow: go.TextBlock.OverflowEllipsis, width: 180  }, new go.Binding('text', 'text')),
             $(go.Shape, 'Diamond', { width: 30, height: 30, fill: 'white', stroke: 'lightgray' }),
        )
        );
        nodeTemplateMap.add('End',
        $(go.Node, 'Vertical',
            $(go.Shape, 'Circle', { width: 20, height: 20, fill: 'rgb(255, 192, 192)', stroke: 'red' }),
            $(go.TextBlock, { margin: 2, font: '11px Avenir', stroke: 'black', textAlign: 'center', overflow: go.TextBlock.OverflowEllipsis, width: 180  }, new go.Binding('text', 'text'))
        ));

        diagram.nodeTemplateMap = nodeTemplateMap;

        // Define the link templates based on the link category
        const linkTemplateMap = new go.Map();
        linkTemplateMap.add('Sequence', $(go.Link,
        { routing: go.Link.AvoidsNodes },
        $(go.Shape, { stroke: 'gray' }),
        $(go.TextBlock, {  font: '11px Avenir' }, new go.Binding('text', 'label')),
        $(go.Shape, { toArrow: 'OpenTriangle', stroke: 'gray' })
        ));
        // Define a custom link template for edges coming from decision nodes
        linkTemplateMap.add('DecisionSequence',
        $(go.Link,
            { routing: go.Link.AvoidsNodes },
            $(go.Shape, { stroke: 'gray' }),
            $(go.TextBlock, { font: '9px Avenir' }, new go.Binding('text', 'label')),
            $(go.Shape, { toArrow: 'OpenTriangle', stroke: 'gray' })
        ));

        // Define a custom link template for edges coming from nodes with category 'Condition'
        linkTemplateMap.add('ConditionSequence',
        $(go.Link,
            { routing: go.Link.AvoidsNodes },
            $(go.Shape, { stroke: 'gray' }),
            $(go.TextBlock, {  font: '9px Avenir' }, new go.Binding('text', 'label')),
            $(go.Shape, { toArrow: 'OpenTriangle', stroke: 'gray' })
        ));
        diagram.linkTemplateMap = linkTemplateMap;

    }    

    const model = new go.GraphLinksModel();
    model.nodeDataArray = flowchartData.nodeDataArray.map(nodeData => {
      // Map the node category to the corresponding template key
      switch (nodeData.category) {
        case 'Start':
        case 'Process':
        case 'Decision':
        case 'End':
          nodeData.category = nodeData.category;
          break;
        case 'Condition':
          nodeData.category = 'Condition';
          break;
        default:
          nodeData.category = 'Process';
          break;
      }
      return nodeData;
    });

    model.linkDataArray = flowchartData.linkDataArray.map(linkData => {
      // Map the link category to the corresponding template key
      if (linkData.fromCategory === 'Decision') {
        linkData.category = 'DecisionSequence';
      } else if (linkData.fromCategory === 'Condition') {
        linkData.category = 'ConditionSequence';
      } else {
        linkData.category = 'Sequence';
      }
      return linkData;
    });

    diagram.model = model;
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="flowchart" ref={diagramContainerRef} style={{ width: '100%', height: '100%' }}>
      </div>
    </div>
  );
};

export default Flowchart;
