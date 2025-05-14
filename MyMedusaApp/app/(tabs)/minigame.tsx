import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Button, Vibration } from 'react-native';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const TARGET_SIZE = 60;
const WIN_SCORE = 5;

export default function MiniGameScreen() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [discount, setDiscount] = useState(false);
  const animX = useRef(new Animated.Value(Math.random() * (width - TARGET_SIZE))).current;
  const animY = useRef(new Animated.Value(Math.random() * (height * 0.5 - TARGET_SIZE) + 100)).current;

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/success.wav'),
        { shouldPlay: true }
      );
      // Unload after playing
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch {}
  };

  const moveTarget = () => {
    Animated.parallel([
      Animated.timing(animX, {
        toValue: Math.random() * (width - TARGET_SIZE),
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(animY, {
        toValue: Math.random() * (height * 0.5 - TARGET_SIZE) + 100,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleTap = async () => {
    if (gameOver) return;
    setScore(s => s + 1);
    Vibration.vibrate(50);
    await playSound();
    if (score + 1 >= WIN_SCORE) {
      setGameOver(true);
      setDiscount(true);
    } else {
      moveTarget();
    }
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setDiscount(false);
    moveTarget();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Mini Game: Tap the Target!</Text>
      <Text style={styles.instructions}>Tap the moving target {WIN_SCORE} times to win a 10% discount!</Text>
      <Text style={styles.score}>Score: {score}</Text>
      {!gameOver && (
        <Animated.View style={[styles.target, { left: animX, top: animY }]}> 
          <TouchableOpacity style={styles.targetButton} onPress={handleTap} activeOpacity={0.7}>
            <Text style={styles.targetText}>🎯</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {discount && (
        <View style={styles.discountBox}>
          <Text style={styles.discountText}>Congratulations! 🎉</Text>
          <Text style={styles.discountText}>You won a 10% discount!</Text>
          <Text selectable style={styles.code}>DISCOUNT10</Text>
        </View>
      )}
      <Button title={gameOver ? 'Play Again' : 'Restart'} onPress={resetGame} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  target: {
    position: 'absolute',
    zIndex: 2,
  },
  targetButton: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  targetText: {
    fontSize: 32,
    color: '#fff',
  },
  discountBox: {
    marginTop: 40,
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe066',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  discountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  code: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 8,
  },
}); 