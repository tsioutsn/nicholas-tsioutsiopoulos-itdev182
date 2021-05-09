import React from 'react';
import uuidv4 from 'uuid/v4';


import {
  ImageBackground,
  ActivityIndicator,
  StyleSheet,
  View,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  StatusBar,

} from 'react-native';

import { fetchLocationId, fetchWeather } from './utils/api';
import getImageForWeather from './utils/getImageForWeather';
import SearchInput from './components/SearchInput';

import { newTimer } from './utils/TimerUtils';
import EditableTimer from './components/EditableTimer';
import ToggleableTimerForm from './components/ToggleableTimerForm';



export default class App extends React.Component {
  state = {
    timers: [
     {
        title: 'Apologize to Significant Other',
        project: 'Relationship Chores',
        id: uuidv4(),
        elapsed: 27655460494,
        isRunning: true,
      },
      {
        title: 'Mow the lawn',
        project: 'House Chores',
        id: uuidv4(),
        elapsed: 5460494,
        isRunning: false,
      },
      {
        title: 'Clear paper jam',
        project: 'Office Chores',
        id: uuidv4(),
        elapsed: 1277537,
        isRunning: false,
      },
      {
        title: 'Ponder origins of universe',
        project: 'Life Chores',
        id: uuidv4(),
        elapsed: 120000,
        isRunning: true,
      },
    ],
    loading: false,
    error: false,
    location: '',
    temperature: 0,
    weather: '',
  };

  componentDidMount() {
    this.handleUpdateLocation('San Francisco');
    const TIME_INTERVAL = 1000;

    this.intervalId = setInterval(() => {
      const { timers } = this.state;

      this.setState({
        timers: timers.map(timer => {
          const { elapsed, isRunning } = timer;

          return {
            ...timer,
            elapsed: isRunning ? elapsed + TIME_INTERVAL : elapsed,
          };
        }),
      });
    }, TIME_INTERVAL);
  }

  
  handleUpdateLocation = async city => {
    if (!city) return;

    this.setState({ loading: true }, async () => {
      try {
        const locationId = await fetchLocationId(city);
        const { location, weather, temperature } = await fetchWeather(
          locationId,
        );

        this.setState({
          loading: false,
          error: false,
          location,
          weather,
          temperature,
        });
      } catch (e) {
        this.setState({
          loading: false,
          error: true,
        });
      }
    });
  };


  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  handleCreateFormSubmit = timer => {
    const { timers } = this.state;

    this.setState({
      timers: [newTimer(timer), ...timers],
    });
  };

  handleFormSubmit = attrs => {
    const { timers } = this.state;

    this.setState({
      timers: timers.map(timer => {
        if (timer.id === attrs.id) {
          const { title, project } = attrs;

          return {
            ...timer,
            title,
            project,
          };
        }

        return timer;
      }),
    });
  };

  handleRemovePress = timerId => {
    this.setState({
      timers: this.state.timers.filter(t => t.id !== timerId),
    });
  };

  toggleTimer = timerId => {
    this.setState(prevState => {
      const { timers } = prevState;

      return {
        timers: timers.map(timer => {
          const { id, isRunning } = timer;

          if (id === timerId) {
            return {
              ...timer,
              isRunning: !isRunning,
            };
          }

          return timer;
        }),
      };
    });
  };

  render() {
    const { loading, error, location, weather, temperature, timers } = this.state;

    return (
      <View style={styles.appContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}> WeatherWatch!</Text>
            <SearchInput
                placeholder="Search any city"
                onSubmit={this.handleUpdateLocation}
            />
        </View>
        <ScrollView contentContainerStyle={styles.timerList}>
        <View style={styles.container} behavior="padding">

          <StatusBar barStyle="light-content" />
          <ImageBackground
            source={getImageForWeather(weather)}
            style={styles.imageContainer}
            imageStyle={styles.image}
          >
            <View style={styles.detailsContainer}>
              <ActivityIndicator animating={loading} color="white" size="large" />
  
              {!loading && (
                <View>
                  {error && (
                    <Text style={[styles.smallText, styles.textStyle]}>
                      Could not load weather, please try a different city.
                    </Text>
                  )}


                  {!error && (
                    <View>
                      <Text style={[styles.largeText, styles.textStyle]}>
                        {location}

                                                                                                              {"\n"}
                      </Text>
                      <Text style={[styles.smallText, styles.textStyle]}>
                        {weather}
                      </Text>
                      <Text style={[styles.largeText, styles.textStyle]}>
                        {`${Math.round(temperature)}°`}
                        <Text>

                        </Text>
                      </Text>

                    </View>
                  )}
  

                </View>
              )}
            </View>
          </ImageBackground>
          </View>

            <Text style={[styles.banner, styles.textStyle]}>
                {"Get your life together by trying our Task Manager Watch!"}
            </Text>

           <KeyboardAvoidingView
                    behavior="padding"
                    style={styles.timerListContainer}
                  >

          <ToggleableTimerForm onFormSubmit={this.handleCreateFormSubmit} />
            {timers.map(({ title, project, id, elapsed, isRunning }) => (
              <EditableTimer
                key={id}
                id={id}
                title={title}
                project={project}
                elapsed={elapsed}
                isRunning={isRunning}
                onFormSubmit={this.handleFormSubmit}
                onRemovePress={this.handleRemovePress}
                onStartPress={this.toggleTimer}
                onStopPress={this.toggleTimer}

              />
            ))}

        </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
//    height: 640,
    backgroundColor: '#34495E',
  },

  imageContainer: {
    flex: 1,
    height: 625,

  },
  image: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'stretch',

  },
  detailsContainer: {
    flex: 1,
//   justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingTop: 35,


  },
  textStyle: {
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Roboto',
    color: 'white',


  },
  largeText: {
    fontSize: 45,
    fontWeight: 'bold',
    paddingBottom: 120,
  },
  smallText: {
    fontSize: 22,
    fontWeight: 'bold',
  },


  appContainer: {
    flex: 1,
    backgroundColor: 'rgba(184, 73, 0, 1.0)',
  },
  titleContainer: {
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 1.0)',
    backgroundColor: 'rgba(184, 73, 0, 1.0)',


  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',

  },
  timerListContainer: {
    flex: 1,
    backgroundColor: 'rgba(60, 60, 60, 1.0)',
  },
  timerList: {

    paddingBottom: 15,
  },
  banner: {
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'rgba(60, 60, 60, 1.0)',
    paddingTop: 30,
  },
});
