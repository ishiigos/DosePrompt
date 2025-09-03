import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Mood = 'happy' | 'neutral' | 'sad';
type Energy = 1 | 2 | 3 | 4 | 5;

type DayEntry = {
  dateISO: string;
  mood: Mood | null;
  energy: Energy | null;
};

type SavedMap = Record<string, { mood: Mood; energy: Energy }>;

const moodOptions: { id: Mood; label: string; emoji: string; image: any }[] = [
  { id: 'sad', label: 'Sad', emoji: '😔', image: require('../../assets/moods/mood-sad.png') },,
  { id: 'neutral', label: 'Neutral', emoji: '😐', image: require('../../assets/moods/mood-neutral.png') },
  { id: 'happy', label: 'Happy', emoji: '😊', image: require('../../assets/moods/mood-happy.png') },
];

const energyOptions: { id: Energy; label: string; image: any }[] = [
  { id: 1, label: '1 - Low', image: require('../../assets/energy/energy-1.png') },
  { id: 2, label: '2', image: require('../../assets/energy/energy-2.png') },
  { id: 3, label: '3', image: require('../../assets/energy/energy-3.png') },
  { id: 4, label: '4', image: require('../../assets/energy/energy-4.png') },
  { id: 5, label: '5 - High', image: require('../../assets/energy/energy-5.png') },
];

// Utility
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fromISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const buildMonthMatrix = (year: number, monthIdx0: number) => {
  // Returns array of weeks, each week: [Date|null,...] starting Sun..Sat
  const first = new Date(year, monthIdx0, 1);
  const last = new Date(year, monthIdx0 + 1, 0);
  const startDay = first.getDay(); // 0..6
  const daysInMonth = last.getDate();

  const cells: (Date | null)[] = [];
  // leading blanks
  for (let i = 0; i < startDay; i++) cells.push(null);
  // days
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIdx0, d));
  // trailing blanks to complete rows
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

export default function MoodTrackerScreen() {
  const router = useRouter();

  const today = new Date();
  const [selectedDateISO, setSelectedDateISO] = useState<string>(toISO(today));
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [saved, setSaved] = useState<SavedMap>({});

  // For inline date selector month
  const [monthCursor, setMonthCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  // For monthly summary modal
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [monthlyCursor, setMonthlyCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

  // When date changes, load saved value if exists
  const loadEntryForDate = (iso: string) => {
    const s = saved[iso];
    if (s) {
      setMood(s.mood);
      setEnergy(s.energy);
    } else {
      setMood(null);
      setEnergy(null);
    }
  };

  const onSelectDate = (d: Date) => {
    const iso = toISO(d);
    setSelectedDateISO(iso);
    setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    loadEntryForDate(iso);
  };

  const changeMonth = (delta: number) => {
    setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const save = () => {
    if (!mood || !energy) {
      Alert.alert('Missing selection', 'Please select both mood and energy before saving.');
      return;
    }
    setSaved(prev => ({ ...prev, [selectedDateISO]: { mood, energy } }));
    Alert.alert('Saved', 'Mood and energy saved for the selected date.');
  };

  const cancel = () => {
    router.replace('../home');
  };

  const openMonthly = () => {
    setMonthlyCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1));
    setMonthlyOpen(true);
  };

  const changeMonthlyMonth = (delta: number) => {
    setMonthlyCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const monthTitle = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const renderCalendar = (cursor: Date, onPick: (d: Date) => void, selectedISO?: string) => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const weeks = buildMonthMatrix(year, month);

    return (
      <View>
        <View style={styles.calHeader}>
          <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)}>
            <Text style={styles.navText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.calTitle}>{monthTitle(cursor)}</Text>
          <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)}>
            <Text style={styles.navText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dow => (
            <Text key={dow} style={styles.weekHeaderText}>{dow}</Text>
          ))}
        </View>

        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((cell, ci) => {
              if (!cell) return <View key={ci} style={styles.dayCell} />;
              const iso = toISO(cell);
              const isSelected = selectedISO === iso;
              return (
                <TouchableOpacity key={ci} style={[styles.dayCell, isSelected && styles.daySelected]} onPress={() => onPick(cell)}>
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{cell.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderMonthlySummary = () => {
    const year = monthlyCursor.getFullYear();
    const month = monthlyCursor.getMonth();
    const weeks = buildMonthMatrix(year, month);

    const moodEmojiMap: Record<Mood, string> = { happy: '😊' , neutral: '😐', sad: '😔' };

    return (
      <View style={styles.modalContent}>
        <View style={styles.calHeader}>
          <TouchableOpacity style={styles.navBtn} onPress={() => changeMonthlyMonth(-1)}>
            <Text style={styles.navText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.calTitle}>{monthTitle(monthlyCursor)}</Text>
          <TouchableOpacity style={styles.navBtn} onPress={() => changeMonthlyMonth(1)}>
            <Text style={styles.navText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dow => (
            <Text key={dow} style={styles.weekHeaderText}>{dow}</Text>
          ))}
        </View>

        <ScrollView>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((cell, ci) => {
                if (!cell) return <View key={ci} style={styles.dayCell} />;
                const iso = toISO(cell);
                const s = saved[iso];
                return (
                  <View key={ci} style={styles.dayCell}>
                    <Text style={styles.dayText}>{cell.getDate()}</Text>
                    {s ? (
                      <View style={styles.badgeWrap}>
                        <Text style={styles.moodBadge}>{moodEmojiMap[s.mood]}</Text>
                        <Text style={styles.energyBadge}>{s.energy}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.modalClose} onPress={() => setMonthlyOpen(false)}>
          <Text style={styles.modalCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Colored title tab */}
      <View style={styles.titleTab}>
        <Text style={styles.titleText}>Mood Tracker</Text>
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={i => i.key}
        renderItem={() => (
          <View style={{ paddingBottom: 140 }}>
            {/* Date selector (inline calendar) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              {renderCalendar(monthCursor, onSelectDate, selectedDateISO)}
            </View>

            {/* Mood selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mood</Text>
              <View style={styles.grid}>
                {moodOptions.map(opt => {
                  const selected = mood === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.tile, selected && styles.tileSelected]}
                      onPress={() => setMood(opt.id)}
                    >
                      <Image source={opt.image} style={styles.tileImg} resizeMode="contain" />
                      <Text style={styles.tileCaption}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Energy selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Energy</Text>
              <View style={styles.grid}>
                {energyOptions.map(opt => {
                  const selected = energy === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.tileSmall, selected && styles.tileSelected]}
                      onPress={() => setEnergy(opt.id)}
                    >
                      <Image source={opt.image} style={styles.tileImgSmall} resizeMode="contain" />
                      <Text style={styles.tileCaption}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      />

      {/* Monthly summary button */}
      <View style={styles.monthlyBar}>
        <TouchableOpacity style={styles.monthlyButton} onPress={openMonthly}>
          <Text style={styles.monthlyButtonText}>View Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.bottomButton, styles.cancel]} onPress={cancel}>
          <Text style={styles.bottomButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.add]} onPress={save}>
          <Text style={styles.bottomButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Monthly summary modal */}
      <Modal visible={monthlyOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          {renderMonthlySummary()}
        </View>
      </Modal>
    </View>
  );
}

const BOTTOM_SAFE = Platform.select({ ios: 16, android: 16, default: 16 });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  titleTab: {
    margin: 0,
    backgroundColor: '#000076',
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    borderWidth: 1,
    width: '100%',
    height: 60,
    borderColor: '#000033',
    justifyContent: 'center',
  },
  titleText: { fontSize: 18, fontWeight: '700', alignSelf: 'center', justifyContent: 'center', color: '#ffffff' },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },

  // Calendar
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  calTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  navBtn: { padding: 6, borderRadius: 6, borderWidth: 1, borderColor: '#caced1' },
  navText: { fontSize: 14, color: '#111' },

  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 6 },
  weekHeaderText: { width: `${100 / 7}%`, textAlign: 'center', color: '#6b7280', fontSize: 12 },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  dayText: { color: '#111', fontSize: 14 },
  daySelected: { backgroundColor: '#e0ecff', borderColor: '#93c5fd' },
  dayTextSelected: { color: '#111', fontWeight: '700' },

  // Mood/energy grids
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#caced1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tileSmall: {
    width: '16%',
    borderWidth: 1,
    borderColor: '#caced1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tileSelected: {
    backgroundColor: '#e0ecff',
    borderColor: '#93c5fd',
  },
  tileImg: { width: 88, height: 88, marginBottom: 6 },
  tileImgSmall: { width: 36, height: 36, marginBottom: 6 },
  tileCaption: { fontSize: 12, color: '#111', textAlign: 'center' },

  monthlyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 62 + BOTTOM_SAFE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  monthlyButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0a7aff',
  },
  monthlyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: BOTTOM_SAFE,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee',
  },
  bottomButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 10 },
  cancel: { backgroundColor: '#e5e7eb' },
  add: { backgroundColor: '#0a7aff' },
  bottomButtonText: { color: '#111', fontSize: 16, fontWeight: '600' },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalClose: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#0a7aff',
    borderRadius: 10,
  },
  modalCloseText: { color: '#fff', fontWeight: '600' },

  badgeWrap: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
  moodBadge: { fontSize: 16 },
  energyBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    color: '#111', fontSize: 12,
  },
});
