/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import SQLite, {ResultSet} from 'react-native-sqlite-storage';

import {openDB, setupDB} from './src/db/DataAccess';

import NotificationService from './src/services/NotificationService';

import Day from './src/components/Day';

const App: React.FC = () => {
  const dateNow: moment.Moment = moment();
  const [currentDate, setCurrentDate] = useState<string>(
    moment().format('YYYY-MM-DD HH:mm:ss'),
  );
  const [dayResults, setDayResults] = useState<Array<Object>>([]);
  const [isToday, setIsToday] = useState<Boolean>(true);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const calendar = useRef();
  useEffect(() => {
    const setDBConn = async () => {
      let db: SQLite.SQLiteDatabase = await openDB();
      try {
        await setupDB(db);
        updateDay(dateNow);
      } catch (e) {
        console.error(e);
      } finally {
        // db.close();
      }
    };
    setDBConn();
  }, []);

  let onRegister = (token: any) => {
    console.log({token});
  };

  let onNotif = (notif: any) => {
    console.log({notif});
  };

  let handlePerm = (perms: any) => {
    Alert.alert('Permissions', JSON.stringify(perms));
  };

  let notif = new NotificationService(
    onRegister.bind(this),
    onNotif.bind(this),
  );

  // Function for Local Notification
  const setScheduledReminders = async () => {
    // console.log('calling local push notification');
    // notif.localNotif();
    // console.log('called local push notification');

    let getArrayOfDates = (
      usageId: number,
      date: string,
      length: Number,
    ): any[] => {
      let temp: any[] = [];

      for (let i = 1; i <= length; i++) {
        let tempDate = moment(date)
          .set({
            hour: moment().get('hour'),
            minute: moment().get('minute'),
            second: moment().get('second'),
          })
          .add(2 * i, 'hours');
        notif.scheduleNotif(null, tempDate.toDate());
        temp.push(usageId);
        temp.push(`${tempDate.format('YYYY-MM-DD HH:mm:ss')}`);
      }

      return temp;
    };

    let db: SQLite.SQLiteDatabase = await openDB();
    try {
      await db.executeSql('insert into usage values (null, null, ?);', [
        currentDate,
      ]);

      let rs: ResultSet = (
        await db.executeSql('select * from usage where usage_day = ?;', [
          currentDate,
        ])
      )[0];

      let usageId: number = rs.rows.item(0).id;
      await db.executeSql(
        'insert into usage_details (id, uid, usage_time) values (null, ?, ?),(null, ?, ?),(null, ?, ?),(null, ?, ?),(null, ?, ?),(null, ?, ?);',
        getArrayOfDates(usageId, currentDate, 6),
      );
      updateDay(moment(currentDate));
    } catch (e) {
      console.error(e);
    } finally {
      // db.close();
    }
  };

  const updateDay = async (date: moment.Moment) => {
    setIsLoading(true);
    if (moment().dayOfYear() === date.dayOfYear()) {
      setIsToday(true);
    } else {
      setIsToday(false);
    }
    let db: SQLite.SQLiteDatabase = await openDB();
    try {
      let result: ResultSet = (
        await db.executeSql(
          'select ud.* from usage u, usage_details ud where u.id=ud.uid and date(u.usage_day) = ?',
          [date.format('YYYY-MM-DD')],
        )
      )[0];

      var temp = [];
      for (let i = 0; i < result.rows.length; ++i) {
        temp.push(result.rows.item(i));
      }
      setCurrentDate(date.format('YYYY-MM-DD HH:mm:ss'));
      setDayResults([...temp]);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    } finally {
      // db.close();
    }
  };
  const startBlackList = moment().add(1, 'day');
  const endBlackList = moment().add(1, 'year');

  return (
    <View style={styles.container}>
      <CalendarStrip
        scrollable
        style={styles.calendarStripStyle}
        calendarColor={'#2243CA'}
        calendarHeaderStyle={styles.whiteColor}
        dateNumberStyle={styles.whiteColor}
        dateNameStyle={styles.whiteColor}
        highlightDateNumberStyle={styles.orangeColor}
        highlightDateNameStyle={styles.orangeColor}
        iconContainer={{flex: 0.1}}
        selectedDate={moment(currentDate)}
        daySelectionAnimation={{
          type: 'border',
          duration: 0,
          borderWidth: 1,
          borderHighlightColor: 'white',
        }}
        onDateSelected={updateDay}
        datesBlacklist={[{start: startBlackList, end: endBlackList}]}
        disabledDateNumberStyle={{color: 'red'}}
      />
      <SafeAreaView style={[styles.container, styles.innerContainer]}>
        {!isLoading && isToday && dayResults.length === 0 && (
          <TouchableOpacity onPress={setScheduledReminders}>
            <Text style={styles.title}>I am up!</Text>
          </TouchableOpacity>
        )}
        <Day
          isLoading={isLoading}
          selectedDay={moment(currentDate)}
          results={dayResults}
        />
        {/* <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.localNotif();
          }}>
          <Text>Local Notification (now)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.localNotif('sample.mp3');
          }}>
          <Text>Local Notification with sound (now)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.scheduleNotif();
          }}>
          <Text>Schedule Notification in 30s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.scheduleNotif('sample.mp3');
          }}>
          <Text>Schedule Notification with sound in 30s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.cancelNotif();
          }}>
          <Text>Cancel last notification (if any)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.cancelAll();
          }}>
          <Text>Cancel all notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.checkPermission(handlePerm.bind(this));
          }}>
          <Text>Check Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.requestPermissions();
          }}>
          <Text>Request Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.abandonPermissions();
          }}>
          <Text>Abandon Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.getScheduledLocalNotifications(notifs => console.log(notifs));
          }}>
          <Text>Console.Log Scheduled Local Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.getDeliveredNotifications(notifs => console.log(notifs));
          }}>
          <Text>Console.Log Delivered Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.createOrUpdateChannel();
          }}>
          <Text>Create or update a channel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            notif.popInitialNotification();
          }}>
          <Text>popInitialNotification</Text>
        </TouchableOpacity>
        <Text style={styles.bottomText}>
          Scheduled Notification is scheduled for 10 sec after the opening of
          App.
        </Text> */}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeaea',
  },
  innerContainer: {
    padding: 12,
  },
  title: {
    marginTop: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderColor: '#20232a',
    borderRadius: 6,
    backgroundColor: '#61dafb',
    color: '#20232a',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
  },
  text: {
    textAlign: 'center',
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 30,
  },
  button: {
    borderWidth: 1,
    borderColor: '#000000',
    margin: 5,
    padding: 5,
    width: '70%',
    backgroundColor: '#DDDDDD',
    borderRadius: 5,
  },
  calendarStripStyle: {
    height: 120,
    paddingTop: 20,
    paddingBottom: 10,
  },
  whiteColor: {
    color: 'white',
  },
  orangeColor: {
    color: 'orange',
  },
});

export default App;
