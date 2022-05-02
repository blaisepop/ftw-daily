import { types as sdkTypes } from './util/sdkLoader';

const { LatLng, LatLngBounds } = sdkTypes;

// An array of locations to show in the LocationAutocompleteInput when
// the input is in focus but the user hasn't typed in any search yet.
//
// Each item in the array should be an object with a unique `id` (String) and a
// `predictionPlace` (util.types.place) properties.
const defaultLocations = [
  {
<<<<<<< HEAD
    id: 'default-geneva',
    predictionPlace: {
      address: 'Geneva, Suisse',
      bounds: new LatLngBounds(
        new LatLng(46.27667033, 6.22228052),
        new LatLng(46.09040127, 6.06676663)
        ),
    },
  },
  {
    id: 'default-lausanne',
    predictionPlace: {
      address: 'Lausanne, Switzerland',
      bounds: new LatLngBounds(new LatLng(46.60519965, 6.77690937), new LatLng(46.40145027, 6.54728915)),
    },
  },
  {
    id: 'default-neuchatel',
    predictionPlace: {
      address: 'Neuchâtel, Switzerland',
      bounds: new LatLngBounds(new LatLng(47.05803712, 6.9984204), new LatLng(46.87743887, 6.84544465)),
    },
  },
  {
    id: 'default-bern',
    predictionPlace: {
      address: 'Bern, Switzerland',
      bounds: new LatLngBounds(new LatLng(47.01098855, 7.51012784), new LatLng(46.8722205, 7.3926418)),
    },
  },
  {
    id: 'default-zurich',
    predictionPlace: {
      address: 'Zurich, Switzerland',
      bounds: new LatLngBounds(new LatLng(47.43059012, 8.58478231), new LatLng(47.30962388, 8.48153875)),
=======
    id: 'default-new-york',
    predictionPlace: {
      address: 'New York City, New York, USA',
      bounds: new LatLngBounds(
        new LatLng(40.917576401307, -73.7008392055224),
        new LatLng(40.477399, -74.2590879797556)
      ),
    },
  },
  {
    id: 'default-los-angeles',
    predictionPlace: {
      address: 'Los Angeles, California, USA',
      bounds: new LatLngBounds(
        new LatLng(34.161440999758, -118.121305008073),
        new LatLng(33.9018913203336, -118.521456965901)
      ),
    },
  },
  {
    id: 'default-san-francisco',
    predictionPlace: {
      address: 'San Francisco, California, USA',
      bounds: new LatLngBounds(
        new LatLng(37.8324430069081, -122.354995082683),
        new LatLng(37.6044780500533, -122.517910874663)
      ),
    },
  },
  {
    id: 'default-seattle',
    predictionPlace: {
      address: 'Seattle, Washington, USA',
      bounds: new LatLngBounds(
        new LatLng(47.7779392908564, -122.216605992108),
        new LatLng(47.3403950185547, -122.441233019046)
      ),
    },
  },
  {
    id: 'default-portland',
    predictionPlace: {
      address: 'Portland, Oregon, USA',
      bounds: new LatLngBounds(
        new LatLng(45.858099013046, -122.441059986416),
        new LatLng(45.3794799927623, -122.929215816001)
      ),
>>>>>>> upstream/master
    },
  },
];
export default defaultLocations;
