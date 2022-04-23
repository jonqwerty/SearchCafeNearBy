import React from 'react';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import * as axios from 'axios';

import {
  StyleSheet,
  Text,
  Image,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useState} from 'react';
import {useEffect} from 'react';

const App = () => {
  let YOUR_API_KEY = 'YOUR_API_KEY';
  const [restaurant, setRestaurant] = useState([]);
  const [info, setInfo] = useState();
  const [placeId, setPlaceId] = useState();

  const [coord, setCoord] = useState({
    latitude: 37,
    longitude: -122,
  });

  const onLocationSelect = event => {
    setCoord(event.nativeEvent.coordinate);
  };

  useEffect(() => {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coord.latitude}%2C${coord.longitude}&radius=2000&type=restaurant&keyword=cruise&key=${YOUR_API_KEY}`,
      )
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        setRestaurant(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [coord]);

  useEffect(() => {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${YOUR_API_KEY}`,
      )
      .then(function (response) {
        setCoord({
          latitude: response.data.result.geometry.location.lat,
          longitude: response.data.result.geometry.location.lng,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [placeId]);

  return (
    <View>
      <View style={styles.container}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            setPlaceId(data.place_id);
          }}
          query={{
            key: YOUR_API_KEY,
            language: 'en',
          }}
        />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          onPress={onLocationSelect}
          region={{
            latitude: coord.latitude,
            longitude: coord.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          {restaurant?.results &&
            restaurant.results.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.geometry.location.lat,
                  longitude: marker.geometry.location.lng,
                }}
                image={require('./assets/caffe.png')}
                onPress={() => setInfo(marker)}
              />
            ))}

          <Marker
            coordinate={{latitude: coord.latitude, longitude: coord.longitude}}
            image={require('./assets/pink.png')}
            // title={'title'}
            // description={'description'}
          />
        </MapView>
        {info && (
          <TouchableOpacity style={styles.info} onPress={() => setInfo()}>
            {info?.photos ? (
              <Image
                style={styles.image}
                source={{
                  uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=400&photoreference=${info?.photos[0]?.photo_reference}&key=${YOUR_API_KEY}`,
                }}
              />
            ) : (
              <Text>No photo</Text>
            )}

            <View style={styles.paddingLeft}>
              <Text>Name: {info?.name}</Text>
              <Text>
                Open now:{' '}
                {info?.opening_hours?.open_now === false ? 'no' : 'yes'}
              </Text>
              <Text>Rating: {info?.rating}</Text>
              <Text>Vicinity: {info?.vicinity}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    height: 200,
  },
  mapContainer: {
    zIndex: 1,
  },
  map: {
    width: '100%',
    height: '80%',
  },
  info: {
    bottom: 110,
    position: 'absolute',
    left: (Dimensions.get('window').width - 300) / 2,
    zIndex: 100,
    width: 300,
    height: 300,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  image: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    width: 300,
    height: 200,
  },
  paddingLeft: {
    paddingLeft: 10,
  },
});

export default App;
