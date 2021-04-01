import SQLite, {
  DatabaseParams,
  SQLiteDatabase,
  Transaction,
  ResultSet,
} from 'react-native-sqlite-storage';

const openDB = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    let conn: SQLite.SQLiteDatabase = await SQLite.openDatabase({
      name: 'eyedropper',
      location: 'default',
    } as DatabaseParams);
    return conn;
  } catch (err) {
    return {} as SQLiteDatabase;
  }
};

const setupDB = async (
  db: SQLite.SQLiteDatabase,
): Promise<SQLite.Transaction> => {
  console.log('setting up database');
  return db.transaction((txn: SQLite.Transaction) => {
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS 
          reminder(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name text,
            frequency INTEGER,
            routine text,
            dosage INTEGER
          )`,
      [],
    );
    txn.executeSql('DROP TABLE IF EXISTS usage;', []);
    txn.executeSql('DROP TABLE IF EXISTS usage_details;', []);
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS 
          usage(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rid INTEGER,
            usage_day text
          )`,
      [],
    );
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS 
          usage_details(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid INTEGER,
            usage_time TEXT,
            is_notified INTEGER default 0,
            snooze_in_min INTEGER default null,
            is_accepted INTEGER default 0,
            dosage INTEGER default 0
          )`,
      [],
    );
    console.log('setting up database complete');
    txn.executeSql(
      `SELECT name FROM sqlite_master 
    WHERE type IN ('table','view') 
    AND name NOT LIKE 'sqlite_%'
    ORDER BY 1;`,
      [],
      (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        console.log('TABLE_NAME', temp);
        console.log('table results', results.rows.length);
      },
    );
  });
};

export {openDB, setupDB};
