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
      bounds: new LatLngBounds(new LatLng(46.58181451283725, 6.567349290768799), new LatLng(46.493016461552195, 6.714978068486247)),
    },
  },
  {
    id: 'default-neuchatel',
    predictionPlace: {
      address: 'Neuchâtel, Switzerland',
      bounds: new LatLngBounds(new LatLng(47.06348587447352, 6.727485659248486), new LatLng(46.979378760121996, 7.039994442589336)),
    },
  },
  {
    id: 'default-bern',
    predictionPlace: {
      address: 'bern, Switzerland',
      bounds: new LatLngBounds(new LatLng(46.976203921045695, 7.391091893083048), new LatLng(46.914326208695115, 7.490655487357604)),
    },
  },
  {
    id: 'default-zurich',
    predictionPlace: {
      address: 'zurich, Switzerland',
      bounds: new LatLngBounds(new LatLng(47.42971717116399, 8.44916610797947), new LatLng(47.3376635013167, 8.605034631429984)),
    },
  },
];
export default defaultLocations;
