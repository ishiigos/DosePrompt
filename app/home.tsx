import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from "react";
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const {width} = Dimensions.get("window");
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps{
    progress: number;
    totalDoses: number;
    completedDoses: number;
}

function CircularProgress({
    progress,
    totalDoses,
    completedDoses,
}: CircularProgressProps){
    const animationValue = useRef(new Animated.Value(0)).current;
    const size = width * 0.55;
    const strokeWidth = 15;
    const radius = ( size - strokeWidth ) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect (() => {
        Animated.timing(animationValue, {
            toValue: progress/100,
            duration: 1000,
            useNativeDriver: true, 
        }).start();
    }, [progress]);

    const strokeDashOffset = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
    <View style={{ alignItems: "center", justifyContent: "center", marginTop: 20 }}>
      <View style={{ position: "relative", width: size, height: size }}>
        {/* The rings */}
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="white"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        {/* Text absolutely in center */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Daily Progress
          </Text>
          <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
            {Math.round(progress)}%
          </Text>
          <Text style={{ color: "white", fontSize: 14 }}>
            {completedDoses} of {totalDoses} Doses
          </Text>
        </View>
      </View>
    </View>
  );
}

// Custom Buttons
function CustomButton({
  title,
  onPress,
  backgroundColor = "#000076", // default if no color is passed
}: {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]} // <-- apply custom color
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen(){
    const router = useRouter();
    return(
        <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#e7e7e7', flex: 1 }}>
            <LinearGradient
            colors={['#000033', '#000056']}
            style={{ minHeight: '40%', flex: 1, backgroundColor: '#000076', borderRadius: 25, overflow: 'hidden' }}>
                <View>
                    <View>
                        <View>
                            <Text> Daily Progress</Text>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="notifications-outline" size={24} color='white' />
                        </TouchableOpacity>
                    </View>
                    <CircularProgress
                        progress={0}
                        totalDoses={10}
                        completedDoses={0}>
                    </CircularProgress>
                </View>
                <TouchableOpacity
                onPress={() => {// TODO: handle add dose action
                }}
                activeOpacity={0.1}
                style={{
                    position: 'absolute',
                    bottom: 5,    
                    left: 5,      
                    backgroundColor: '#f3f3f300',
                    width: 40,
                    height: 40,
                    borderRadius: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 5, // Android shadow
                    shadowColor: '#000', // iOS shadow
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 6,
                }}
                >
                    <Ionicons name="add-circle-outline" size={28} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>
           <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
                <View style={styles.row}>
                    <CustomButton title="🤍 Log A Dose" backgroundColor="#AF7E04" onPress={() => router.push('/log_dose/log_dose')} />
                    <CustomButton title="➕ Add Medication (New)" backgroundColor="#7C5D00" onPress={() => router.push('/new_medication/new_medication')} />
                </View>
                <View style={styles.row}>
                    <CustomButton title="🗓️ Set Reminders" backgroundColor="#003E6D" onPress={() => router.push('/set_reminders/set_reminders')} />
                    <CustomButton title="📊 History & Stats" backgroundColor="#002D4F" onPress={() => router.push('/history_stats/history_stats')} />
                </View>
                <View style={styles.row}>
                    <CustomButton title="💊 Refill Tracker" backgroundColor="#310073" onPress={() => router.push('/refill_tracker/refill_tracker')} />
                    <CustomButton title="🛒 Shopping list" backgroundColor="#240054" onPress={() => router.push('/shopping_list/shopping_list')} />
                </View>
                <CustomButton title="😊 Mood Tracker" backgroundColor="#AF7E04" onPress={() => router.push('/mood_tracker/mood_tracker')} />
            </View>
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="medical-outline" size={22} color="grey" />
                    <Text style={styles.navText}>Medication</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="calendar-outline" size={22} color="grey" />
                    <Text style={styles.navText}>Reminders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="stats-chart-outline" size={22} color="grey" />
                    <Text style={styles.navText}>Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="settings-outline" size={22} color="grey" />
                    <Text style={styles.navText}>Settings</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: "#000076",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    elevation: 3,
    height: 80,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  navBar: {
  flexDirection: "row",
  backgroundColor: "rgba(255,255,255,0.2)", // semi-transparent for nice look
  marginHorizontal: 16,
  marginTop:2,
  borderRadius: 15,
  paddingVertical: 10,
  justifyContent: "space-around",
  },
  navItem: {
  alignItems: "center",
  },
  navText: {
  color: "black",
  fontSize: 12,
  marginTop: 4,
  },

});