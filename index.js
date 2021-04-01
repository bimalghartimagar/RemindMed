/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

AppRegistry.registerComponent(appName, () => App);
