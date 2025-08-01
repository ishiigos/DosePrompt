import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from "expo-router";
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AuthScreen() {

    const [hasBiometrics, setHasBiometrics] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkBiometrics
    }, []);

    const checkBiometrics = async () => {
       const hasHardware = await LocalAuthentication.hasHardwareAsync();
       const isEnrolled = await LocalAuthentication.isEnrolledAsync();
       setHasBiometrics(hasBiometrics && isEnrolled);
}

    const authenticate = async () => {
        try {
            setIsAuthenticating(true);
            setError(null);

            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();

            // Check any other way to authenticate or error
            if (supported.length === 0) {
                throw new Error("No Biometric authentication supported");
            }

            const auth = await LocalAuthentication.authenticateAsync({
                promptMessage: hasHardware && isEnrolled ? "Use Touch ID / Face ID" : "Enter your PIN",
                fallbackLabel: 'Use PIN',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if(auth.success){
                router.replace('/home')
            } else {
                setError('Authentication failed. Please try again.')
            }
        } catch (error) {
            
        }
    }

    return (
        <LinearGradient colors={["#000033", "#000076"]} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name='medkit-outline' size={80} color={'white'} />
                </View> 
                <Text style={styles.title}>
                    DosePrompt
                </Text>
                <Text style={styles.subtitle}>
                    Your medicine dose reminder
                </Text>
                <View style={styles.card}>
                    <Text style={styles.welcomeText}>
                        Welcome Back!
                    </Text>
                    <Text style={styles.instructionText}>
                        {hasBiometrics ? "Unlock with Biometrics to access medications" : "Unlock with PIN to access medications"}
                    </Text>
                    <TouchableOpacity 
                        style={[styles.button, isAuthenticating && styles.buttonDisabled]} 
                        onPress={authenticate} 
                        disabled={isAuthenticating}
                    >
                        <Ionicons 
                            name={hasBiometrics ?
                                'finger-print-outline':'keypad-outline' }
                            size={24}
                            color='white'
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>
                            {isAuthenticating ? 'Verifying...' : hasBiometrics ? "Authenticate" : "Enter PIN"}
                        </Text>
                    </TouchableOpacity>

                    {error && <View style={styles.errorContainer}>
                            <Ionicons name='alert-circle' size={20} color={'#f44336'} />
                            <Text>{error}</Text>
                        </View>}
                </View>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba( 0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba( 255, 255, 255, 0.9)',
        marginBottom: 40,
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: width - 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 30,
    },
    button: {
        backgroundColor: "#000033",
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 30,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonIcon: {
        marginRight: 10,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
        backgroundColor: "#ffebee",
        borderRadius: 8,
    },
    errorText: {
        color: "#f44336",
        fontSize: 14,
        marginLeft: 8,
    }
});