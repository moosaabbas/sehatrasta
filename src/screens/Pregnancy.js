import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import pregnancyTips from '../data/pregnancyData';

export default function Pregnancy() {
    const [currentWeek, setCurrentWeek] = useState(1);
    const [tip, setTip] = useState('');
    const [tipImage, setTipImage] = useState('');

    useEffect(() => {
        fetchWeekData(currentWeek);
    }, [currentWeek]);

    const fetchWeekData = (week) => {
        const weekData = pregnancyTips[`week${week}`];
        if (weekData) {
            setTip(weekData.tip);
            setTipImage(weekData.image);
        }
    };

    const renderWeekSelector = () => {
        return (
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={styles.weekSelector}
            >
                {Object.keys(pregnancyTips).map((key, index) => {
                    const weekNum = key.replace('week', '');
                    return (
                        <TouchableOpacity key={key} style={styles.weekItem} onPress={() => setCurrentWeek(weekNum)}>
                            <Text style={styles.weekText}>{`Week ${weekNum}`}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Pregnancy Tracker</Text>
            {renderWeekSelector()}
            <Text style={styles.tipTitle}>Weekly Insight</Text>
            <Text style={styles.tip}>{tip}</Text>
            {tipImage && <Image source={{ uri: tipImage }} style={styles.image} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f6f6f6',
    },
    weekSelector: {
        flexDirection: 'row',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    weekItem: {
        marginHorizontal: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#e1e4e8',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekText: {
        fontSize: 16,
        color: '#333',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3F6ECA',
        marginBottom: 10,
    },
    tipTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        alignSelf: 'flex-start',
    },
    tip: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    image: {
        width: 300,
        height: 300,
        marginTop: 10,
        borderRadius: 10,
    },
});
