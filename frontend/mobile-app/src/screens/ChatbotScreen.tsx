import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import { Input } from '../components/Input';
import { GradientButton } from '../components/GradientButton';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export const ChatbotScreen = () => {
    const route = useRoute<any>();
    const { locationName } = route.params;
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        // Initial greeting
        const initialMsg: Message = {
            id: '1',
            text: `Hi! I'm your guide for ${locationName}. Ask me anything about its history!`,
            sender: 'bot',
        };
        setMessages([initialMsg]);
    }, []);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        // Mock response
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: `That's an interesting question about ${locationName}! Did you know it was renovated recently? (Mock Response)`,
                sender: 'bot',
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.botBubble
            ]}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={theme.typography.h2}>Chatting about {locationName}</Text>
            </View>
            <FlatList
                ref={listRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={styles.inputContainer}>
                <Input
                    placeholder="Type a message..."
                    value={inputText}
                    onChangeText={setInputText}
                    style={styles.input}
                    onSubmitEditing={handleSend}
                />
                <GradientButton title="Send" onPress={handleSend} style={styles.sendButton} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
    },
    listContent: {
        padding: theme.spacing.m,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.primary,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surface,
    },
    messageText: {
        ...theme.typography.body,
        color: theme.colors.text,
    },
    inputContainer: {
        padding: theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        marginBottom: 0,
        marginRight: theme.spacing.s,
    },
    sendButton: {
        width: 80,
    },
});
