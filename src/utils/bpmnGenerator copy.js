const jsyaml = require('js-yaml');
const xmlbuilder = require('xmlbuilder');

function generateBpmnXml(yamlString) {
  const yamlData = jsyaml.load(yamlString);

  const xml = xmlbuilder.create('bpmn:definitions', {
    version: '1.0',
    encoding: 'UTF-8',
    standalone: false,
  });

  xml.att({
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xmlns:bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
    'xmlns:bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
    'xmlns:dc': 'http://www.omg.org/spec/DD/20100524/DC',
    'xmlns:di': 'http://www.omg.org/spec/DD/20100524/DI',
    'xsi:schemaLocation': 'http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd',
    'id': 'sample-process',
    'targetNamespace': 'http://www.sample-process.bpmn',
  });

  const process = xml.ele('bpmn:process', {
    id: yamlData.id,
    name: yamlData.name,
    isExecutable: 'true',
  });

  // Add start event
  process.ele('bpmn:startEvent', { id: 'startEvent', name: 'Start' });

  let taskXPosition = 200;

  for (const task of yamlData.tasks) {
    process.ele('bpmn:task', {
      id: task.id,
      name: task.name,
    });

    task.x = taskXPosition;
    task.y = 150;

    taskXPosition += 200;
  }

  // Add gateways
  if (yamlData.gateways) {
    for (const gateway of yamlData.gateways) {
      process.ele('bpmn:' + gateway.type, {
        id: gateway.id,
        name: gateway.name,
      });

      gateway.x = taskXPosition;
      gateway.y = 150;

      taskXPosition += 200;
    }
  }

  // Add end event
  process.ele('bpmn:endEvent', { id: 'endEvent', name: 'End' });

  // Connect tasks with sequence flows
  process.ele('bpmn:sequenceFlow', { id: 'flow_start_to_first_task', sourceRef: 'startEvent', targetRef: yamlData.tasks[0].id });
  for (let i = 0; i < yamlData.tasks.length - 1; i++) {
    process.ele('bpmn:sequenceFlow', { id: `flow_task_${i}_to_task_${i + 1}`, sourceRef: yamlData.tasks[i].id, targetRef: yamlData.tasks[i + 1].id });
  }
  process.ele('bpmn:sequenceFlow', { id: 'flow_last_task_to_end', sourceRef: yamlData.tasks[yamlData.tasks.length - 1].id, targetRef: 'endEvent' });

  const bpmnDiagram = xml.ele('bpmndi:BPMNDiagram', { id: 'BPMNDiagram_1' });
  const bpmnPlane = bpmnDiagram.ele('bpmndi:BPMNPlane', { id: 'BPMNPlane_1', bpmnElement: yamlData.id });

  // Add start event shape
  bpmnPlane.ele('bpmndi:BPMNShape', {
    id: 'BPMNShape_startEvent',
    bpmnElement: 'startEvent',
  }).ele('dc:Bounds', {
    x: 100,
    y: 150,
    width: 36,
    height: 36,
  });

  // Add task shapes
  for (const task of yamlData.tasks) {
    bpmnPlane.ele('bpmndi:BPMNShape', {
      id: `BPMNShape_${task.id}`,
      bpmnElement: task.id,
    }).ele('dc:Bounds', {
      x: task.x,
      y: task.y,
      width: 100,
      height: 80,
    });
  }

  // Add gateway shapes
  if (yamlData.gateways) {
    for (const gateway of yamlData.gateways) {
      bpmnPlane.ele('bpmndi:BPMNShape', {
        id: `BPMNShape_${gateway.id}`,
        bpmnElement: gateway.id,
      }).ele('dc:Bounds', {
        x: gateway.x,
        y: gateway.y,
        width: 50,
        height: 50,
      });
    }
  }

  // Add end event shape
  bpmnPlane.ele('bpmndi:BPMNShape', {
    id: 'BPMNShape_endEvent',
    bpmnElement: 'endEvent',
  }).ele('dc:Bounds', {
    x: taskXPosition,
    y: 150,
    width: 36,
    height: 36,
  });

  // Add sequence flow edges
  bpmnPlane.ele('bpmndi:BPMNEdge', {
    id: 'BPMNEdge_flow_start_to_first_task',
    bpmnElement: 'flow_start_to_first_task',
  }).ele('di:waypoint', {
    x: 136,
    y: 168,
  }).up().ele('di:waypoint', {
    x: 200,
    y: 168,
  });

  for (let i = 0; i < yamlData.tasks.length - 1; i++) {
    const sourceTask = yamlData.tasks[i];
    const targetTask = yamlData.tasks[i + 1];
    bpmnPlane.ele('bpmndi:BPMNEdge', {
      id: `BPMNEdge_flow_task_${i}_to_task_${i + 1}`,
      bpmnElement: `flow_task_${i}_to_task_${i + 1}`,
    }).ele('di:waypoint', {
      x: sourceTask.x + 100,
      y: sourceTask.y + 40,
    }).up().ele('di:waypoint', {
      x: targetTask.x,
      y: targetTask.y + 40,
    });
  }

  bpmnPlane.ele('bpmndi:BPMNEdge', {
    id: 'BPMNEdge_flow_last_task_to_end',
    bpmnElement: 'flow_last_task_to_end',
  }).ele('di:waypoint', {
    x: taskXPosition - 100,
    y: 168,
  }).up().ele('di:waypoint', {
    x: taskXPosition,
    y: 168,
  });

  return xml.end({ pretty: true });
}

module.exports = generateBpmnXml;