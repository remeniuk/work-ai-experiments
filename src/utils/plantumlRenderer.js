const fs = require('fs');
const path = require('path');
const pumlEncoder = require('plantuml-encoder');
const puml = require('node-plantuml');

function generateSequenceDiagram(plantumlCode, outputDir, outputFile) {
  // Encode the PlantUML code
  const encoded = pumlEncoder.encode(plantumlCode);

  // Generate the URL for the PlantUML server
  const umlUrl = `http://www.plantuml.com/plantuml/svg/${encoded}`;

  // Set up the output stream for the generated image
  const outputImagePath = path.join(outputDir, outputFile);
  const outputStream = fs.createWriteStream(outputImagePath);

  // Render the sequence diagram using node-plantuml
  puml.render(umlUrl, outputStream);

  return outputImagePath;
}

module.exports = generateSequenceDiagram;
