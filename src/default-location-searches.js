import { types as sdkTypes } from './util/sdkLoader';

const { LatLng, LatLngBounds } = sdkTypes;

// An array of locations to show in the LocationAutocompleteInput when
// the input is in focus but the user hasn't typed in any search yet.
//
// Each item in the array should be an object with a unique `id` (String) and a
// `predictionPlace` (util.types.place) properties.
const defaultLocations = [
  {
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
    },
  },
];
export default defaultLocations;
