import React, { useEffect, useRef } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

const BPMN_XML = ``;

const BpmnDiagram = ({ bpmnXml }) => {
  const viewerRef = useRef(null);
  const diagramContainerRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current === null) {
      viewerRef.current = new BpmnModeler({ container: diagramContainerRef.current });
    }

    if (bpmnXml) {
      viewerRef.current.importXML(bpmnXml, (err) => {
        if (err) {
          console.error('Failed to import BPMN XML:', err);
        } else {
          var canvas = viewerRef.current.get('canvas');
          var rootElement = canvas.getRootElement();
          var shapes = rootElement.children;
      
          var distributeElements = viewerRef.current.get('distributeElements'),
          alignElements = viewerRef.current.get('alignElements');
      
          distributeElements.trigger(shapes, 'vertical');
          alignElements.trigger(shapes, 'middle');  
        }
      });
    }
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [bpmnXml]);

  return <div ref={diagramContainerRef} style={{ height: '100%', width: '100%' }} />;
};

export default BpmnDiagram;