const https = require('https');
const fs = require('fs');
const d3Geo = require('d3-geo');

const GEOJSON_URL = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';

const targetStates = [
  'Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'
];

https.get(GEOJSON_URL, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const geojson = JSON.parse(data);
    
    // Filter features
    const neFeatures = geojson.features.filter(f => {
      // Find the property that holds the state name
      const name = f.properties.NAME_1 || f.properties.st_nm || f.properties.name || f.properties.STATE;
      return targetStates.some(s => name.includes(s));
    });

    if (neFeatures.length === 0) {
      console.error('No states found! Available names:');
      console.log(geojson.features.slice(0, 5).map(f => f.properties));
      return;
    }

    const neFeatureCollection = {
      type: 'FeatureCollection',
      features: neFeatures
    };

    // We want to project to our viewBox: 1000 x 720
    // d3.geoMercator() can fit the feature collection to the viewBox.
    const projection = d3Geo.geoMercator()
      .fitSize([1000, 720], neFeatureCollection);

    const pathGenerator = d3Geo.geoPath().projection(projection);

    const out = [];

    neFeatures.forEach(f => {
      const nameProp = f.properties.NAME_1 || f.properties.st_nm || f.properties.name || f.properties.STATE;
      const stateName = targetStates.find(s => nameProp.includes(s));
      
      const svgPath = pathGenerator(f);
      const centroid = pathGenerator.centroid(f);
      
      out.push({
        name: stateName,
        label: {
          x: Math.round(centroid[0]),
          y: Math.round(centroid[1])
        },
        path: svgPath
      });
    });

    // We need to print them as JS format
    let jsOutput = 'export const STATE_GEOMETRY = [\n';
    out.forEach(s => {
      // Limit path decimal places for smaller file size
      const cleanPath = s.path.replace(/(\.\d{1})\d+/g, '$1');
      jsOutput += `  { name: '${s.name}',\n    label: { x: ${s.label.x}, y: ${s.label.y} },\n    path: '${cleanPath}' },\n`;
    });
    jsOutput += '];\n';

    fs.writeFileSync('output.js', jsOutput);
    console.log('Successfully generated output.js');
  });
}).on('error', (err) => {
  console.error('Error fetching geojson:', err.message);
});
