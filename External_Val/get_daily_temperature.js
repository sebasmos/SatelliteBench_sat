// Use this code in GEE console
// Ref: https://developers.google.com/earth-engine/tutorials/community/ph-ug-temp

// Import country or region boundaries feature collection.
var map = ee.Geometry.Rectangle([-43.295, -23.015, -43.145, -22.846])

// Print "Border" object and explorer features and properties.
print(map);

// Add Uganda outline to the Map as a layer.
Map.centerObject(map, 10);
Map.addLayer(map);


// Import LST image collection.
var modis = ee.ImageCollection('MODIS/006/MOD11A1');

// Define a date range of interest; here, a start date is defined and the end
// date is determined by advancing 1 year from the start date.
var start = ee.Date('2015-01-01');
var dateRange = ee.DateRange(start, start.advance(9, 'year'));

// Filter the LST collection to include only images intersecting the desired
// date range.
var mod11a2 = modis.filterDate(dateRange);

// Select only the 1km day LST data band.
var modLSTday = mod11a2.select('LST_Day_1km');


// Scale to Kelvin and convert to Celsius, set image acquisition time.
var modLSTc = modLSTday.map(function(img) {
  return img
    .multiply(0.02)
    .subtract(273.15)
    .copyProperties(img, ['system:time_start']);
});


// Chart time series of LST for Popayn in 2007 - 2019.
var ts1 = ui.Chart.image.series({
  imageCollection: modLSTc,
  region: map,
  reducer: ee.Reducer.mean(),
  scale: 1000,
  xProperty: 'system:time_start'})
  .setOptions({
     title: 'LST 2015 - 2023 Time Series',
     vAxis: {title: 'LST Celsius'}});
print(ts1);


// Calculate 8-day mean temperature for the region in 2015.
var clippedLSTc = modLSTc.mean().clip(map);

// Add clipped image layer to the map.
Map.addLayer(clippedLSTc, {
  min: 20, max: 40,
  palette: ['blue', 'limegreen', 'yellow', 'darkorange', 'red']},
  'Mean temperature, 2015');
  
  
// Export the image to your Google Drive account.
Export.image.toDrive({
  image: clippedLSTc,
  description: 'LST_Celsius_po',
  folder: 'GEE',
  region: map,
  scale: 1000,
  crs: 'EPSG:4326',
  maxPixels: 1e10});
