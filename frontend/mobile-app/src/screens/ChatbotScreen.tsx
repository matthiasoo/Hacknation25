import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { theme } from '../theme';
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
            text: `Cześć! Jestem Twoim przewodnikiem po ${locationName}. Zapytaj mnie o historię tego miejsca!`,
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
                text: `To ciekawe pytanie o ${locationName}! Czy wiesz, że to miejsce było niedawno odnawiane? (Przykładowa odpowiedź)`,
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
                <Text style={theme.typography.h2}>Rozmowa o {locationName}</Text>
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
                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="Wpisz wiadomość..."
                        value={inputText}
                        onChangeText={setInputText}
                        style={styles.input}
                        placeholderTextColor={theme.colors.textSecondary}
                        onSubmitEditing={handleSend}
                    />
                </View>
                <GradientButton
                    title="Wyślij"
                    onPress={handleSend}
                    style={styles.sendButton}
                    textStyle={{ fontSize: 14 }}
                />
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        elevation: 2,
    },
    listContent: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.s,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 2,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 2,
    },
    messageText: {
        ...theme.typography.body,
        color: theme.colors.text,
    },
    inputContainer: {
        padding: theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        backgroundColor: theme.colors.background,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        paddingHorizontal: theme.spacing.m,
        height: 48,
        justifyContent: 'center',
        marginRight: theme.spacing.s,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    input: {
        ...theme.typography.body,
        color: theme.colors.text,
        padding: 0,
    },
    sendButton: {
        height: 48,
        paddingHorizontal: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        justifyContent: 'center',
    },
});
