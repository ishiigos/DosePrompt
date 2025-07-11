import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {

    const fadeAnimation = useRef(new Animated.Value(0)).current;
    const scaleAnimation = useRef(new Animated.Value(0.5)).current;
    const router = useRouter();

    useEffect(() => {
        Animated.parallel([
            Animated.timing( fadeAnimation, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring( scaleAnimation, {
                toValue:1,
                tension:10,
                friction:2,
                useNativeDriver:true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            router.replace('/auth');
        },2000)

        return() => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.iconContainer,
                {
                    opacity: fadeAnimation,
                    transform: [{ scale: scaleAnimation}]
                }

            ]}>
                <Ionicons name='medkit-outline' size={100} color="white" />
                <Text style={styles.appName}>DosePrompt</Text>
            </Animated.View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00004d',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
    },
    appName: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 20,
    }
});