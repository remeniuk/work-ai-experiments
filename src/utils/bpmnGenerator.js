const yaml = require('js-yaml');
const xmlbuilder = require('xmlbuilder');

function createElement(process, elementType, id, name) {
  process.ele(`bpmn:${elementType}`, { id: id.replace(/\s+/g, '_'), name: name || undefined });
}

function createSequenceFlow(process, sourceId, targetId, flowId, flowName) {
  process.ele('bpmn:sequenceFlow', {
    id: flowId.replace(/\s+/g, '_'),
    name: flowName || undefined,
    sourceRef: sourceId.replace(/\s+/g, '_'),
    targetRef: targetId.replace(/\s+/g, '_'),
  });
}

function createBpmnShape(bpmnPlane, elementId, x, y, width, height) {
  bpmnPlane.ele('bpmndi:BPMNShape', {
    id: `Shape_${elementId.replace(/\s+/g, '_')}`,
    bpmnElement: elementId.replace(/\s+/g, '_'),
  }).ele('dc:Bounds', {
    x,
    y,
    width,
    height,
  });
}

function createBpmnEdge(bpmnPlane, flowId, waypoints) {
  const bpmnEdge = bpmnPlane.ele('bpmndi:BPMNEdge', {
    id: `Edge_${flowId.replace(/\s+/g, '_')}`,
    bpmnElement: flowId.replace(/\s+/g, '_'),
  });

  waypoints.forEach(({ x, y }) => {
    bpmnEdge.ele('di:waypoint', { x, y });
  });
}

function generateBpmnXml(yamlInput) {
  const parsedYaml = yaml.load(yamlInput);
  const { business_process } = parsedYaml;
  const { name, elements } = business_process;

  const processId = `Process_${name.replace(/\s+/g, '_')}`;

  const bpmn = xmlbuilder.create('bpmn:definitions', {
    version: '1.0',
    encoding: 'UTF-8',
    standalone: true,
  });

  bpmn.att({
    'xmlns:bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
    'xmlns:bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
    'xmlns:di': 'http://www.omg.org/spec/DD/20100524/DI',
    'xmlns:dc': 'http://www.omg.org/spec/DD/20100524/DC',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd',
    id: 'Definitions',
    targetNamespace: 'http://bpmn.io/schema/bpmn',
  });

  const process = bpmn.ele('bpmn:process', { id: processId, isExecutable: 'false' });
  const bpmnDiagram = bpmn.ele('bpmndi:BPMNDiagram', { id: 'Diagram' });
  const bpmnPlane = bpmnDiagram.ele('bpmndi:BPMNPlane', { id: 'Plane', bpmnElement: processId });

  const shapeWidth = 100;
  const shapeHeight = 80;
  const startEndWidth = 36;
  const startEndHeight = 36;
  const shapeSpacing = 30
  let x = shapeSpacing;
  let y = shapeSpacing;

  elements.forEach((element) => {
    const { id, name, type, next, options } = element;

    let elementType;
    let elementWidth = shapeWidth;
    let elementHeight = shapeHeight;

    switch (type) {
      case 'start':
        elementType = 'startEvent';
        elementWidth = startEndWidth;
        elementHeight = startEndHeight;
        break;
      case 'task':
        elementType = 'task';
        break;
      case 'gateway':
        elementType = 'exclusiveGateway';
        break;
      case 'end':
        elementType = 'endEvent';
        elementWidth = startEndWidth;
        elementHeight = startEndHeight;
        break;
      default:
        throw new Error(`Invalid element type: ${type}`);
    }

    createElement(process, elementType, id, name);
    createBpmnShape(bpmnPlane, id, x, y, elementWidth, elementHeight);

    if (next) {
      const flowId = `Flow_${id.replace(/\s+/g, '_')}_to_${next.replace(/\s+/g, '_')}`;
      createSequenceFlow(process, id, next, flowId);

      const waypoints = [
        { x: x + elementWidth, y: y + elementHeight / 2 },
        { x: x + elementWidth + shapeSpacing / 2, y: y + elementHeight / 2 },
        { x: x + elementWidth + shapeSpacing / 2, y: y + shapeSpacing + elementHeight / 2 },
        { x: x + elementWidth + shapeSpacing, y: y + shapeSpacing + elementHeight / 2 },
      ];

      createBpmnEdge(bpmnPlane, flowId, waypoints);
    }

    x += elementWidth + shapeSpacing;

    if (options) {
      options.forEach((option) => {
        const { name, next } = option;
        const flowId = `Flow_${id.replace(/\s+/g, '_')}_${name.replace(/\s+/g, '_')}_to_${next.replace(/\s+/g, '_')}`;
        createSequenceFlow(process, id, next, flowId, name);

        const waypoints = [
          { x: x, y: y + elementHeight / 2 },
          { x: x + shapeSpacing / 2, y: y + elementHeight / 2 },
          { x: x + shapeSpacing / 2, y: y + shapeSpacing + elementHeight / 2 },
          { x: x + shapeSpacing, y: y + shapeSpacing + elementHeight / 2 },
        ];

        createBpmnEdge(bpmnPlane, flowId, waypoints);
      });
    }
  });

  return bpmn.end({ pretty: true });
}

module.exports = generateBpmnXml;
