const fs = require('fs');

const timelinePath = '../lib/data/timeline.js';
let timeline = fs.readFileSync(timelinePath, 'utf8');

const outputPath = 'output.js';
let output = fs.readFileSync(outputPath, 'utf8');

// The output string ends with "];\n". We want to ensure we replace the exact section.
const regex = /export const STATE_GEOMETRY = \[\s*\{[\s\S]*?\];/m;

if (regex.test(timeline)) {
  timeline = timeline.replace(regex, output.trim());
  fs.writeFileSync(timelinePath, timeline);
  console.log('Successfully updated timeline.js');
} else {
  console.error('Regex did not match STATE_GEOMETRY in timeline.js');
}
