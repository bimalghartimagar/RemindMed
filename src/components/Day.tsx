import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import moment from 'moment';

export interface Props {
  selectedDay: moment.Moment;
  results: Array<Object>;
  isLoading: Boolean;
}

export interface ItemProps {
  item: Object;
}

const ListItemView: React.FC<ItemProps> = itemProps => {
  const [nextNotification, setNextNotification] = useState('');
  const [id, setId] = useState(0);

  useEffect(() => {
    let mounted: boolean = true;
    function drawTimer() {
      let diff = moment(itemProps.item.usage_time).diff(moment());
      let formattedMoment = '';

      if (diff < 0) {
        formattedMoment = '';
      } else {
        let milliSecMoment = moment.duration(diff);
        formattedMoment = `${milliSecMoment.get('hour')}hr${milliSecMoment.get(
          'minute',
        )}m${milliSecMoment.get('second')}s
          `;
      }
      if (mounted) {
        setNextNotification(formattedMoment);
        setId(requestAnimationFrame(() => drawTimer()));
      }
    }

    requestAnimationFrame(() => drawTimer());

    return () => {
      // console.log(`cancelling for ${itemProps.item.usage_time}: ${id}`);
      cancelAnimationFrame(id);
      mounted = false;
    };
  }, [itemProps, id]);

  return (
    <View key={itemProps.item.id} style={styles.item}>
      <View>
        <Text style={styles.itemText}>{itemProps.item.usage_time}</Text>
      </View>
      <View>
        <Text>Next Notification in:</Text>
        <Text style={{textAlign: 'center', fontSize: 20}}>
          {nextNotification}
        </Text>
      </View>
    </View>
  );
};

const Day: React.FC<Props> = props => {
  return (
    <View>
      <FlatList
        data={props.results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <ListItemView item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    padding: 25,
    margin: 5,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignContent: 'space-between',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 30,
  },
});

export default Day;
