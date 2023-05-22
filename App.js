import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from './colors';
import { useEffect, useState } from 'react';
import { Fontisto } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@toDos';
const LAST_STATE = '@lastState';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadToDos();
  }, []);

  const travel = async () => {
    await setWorking(false);
    await saveData(!working);
  };

  const work = async () => {
    await setWorking(true);
    await saveData(!working);
  };

  const onChangeText = payload => setText(payload);

  const saveData = async (state = working, toSave = toDos) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    await AsyncStorage.setItem(LAST_STATE, JSON.stringify(state));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    const l = await AsyncStorage.getItem(LAST_STATE);
    setToDos(JSON.parse(s));
    setWorking(JSON.parse(l));
  };

  const addToDo = async () => {
    if (text === '') return;

    // const newToDos = Object.assign({}, toDos, { [Date.now()]: { text, work: working } });
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false, editting: false },
    };
    setToDos(newToDos);
    await saveData(working, newToDos);
    setText('');
  };

  const deleteToDo = key => {
    Alert.alert('Delete To Do', 'R U sure?', [
      { text: 'Cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveData(working, newToDos);
        },
      },
    ]);
  };

  const completeToDo = async key => {
    const newToDos = { ...toDos };
    const isCompleted = newToDos[key].completed;
    newToDos[key] = { ...newToDos[key], completed: !isCompleted };
    setToDos(newToDos);
    await saveData(working, newToDos);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? 'white' : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? 'white' : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        returnKeyType="done"
        placeholder={working ? 'Add a To Do' : 'Where do U want to go?'}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos ? toDos : {}).map((key, index) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text
                style={
                  toDos[key].completed
                    ? {
                        ...styles.toDoText,
                        textDecorationLine: 'line-through',
                        color: `${theme.toDoBg}`,
                      }
                    : styles.toDoText
                }
              >
                {toDos[key].text}
              </Text>
              <View style={styles.btnList}>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Octicons name="pencil" size={18} color={theme.toDoBg} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => completeToDo(key)}>
                  {toDos[key].completed === true ? (
                    <Fontisto name="checkbox-active" size={18} color={'white'} />
                  ) : (
                    <Fontisto name="checkbox-passive" size={18} color={theme.toDoBg} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.toDoBg} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null,
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    color: 'white',
    fontSize: 40,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  toDoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 5,
  },
  btnList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
});
