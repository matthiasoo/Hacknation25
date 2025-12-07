import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator } from 'react-native';
import axios from 'axios';
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
    const [isLoading, setIsLoading] = useState(false);
    const listRef = useRef<FlatList>(null);
    const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

    useEffect(() => {
        // Initial greeting
        const initialMsg: Message = {
            id: '1',
            text: `Cześć! Jestem Twoim przewodnikiem po ${locationName}. Zapytaj mnie o historię tego miejsca!`,
            sender: 'bot',
        };
        setMessages([initialMsg]);
    }, []);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const chatHistory = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama3-8b-8192',
                    messages: [
                        {
                            role: 'system',
                            content: `Jesteś przewodnikiem turystycznym po Bydgoszczy. Twoim zadaniem jest opowiadanie ciekawostek i historii o miejscu: ${locationName}. Bądź pomocny, uprzejmy i odpowiadaj krótko i zwięźle. Odpowiadaj w języku polskim.`
                        },
                        ...chatHistory,
                        { role: 'user', content: userMsg.text }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${groqApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const botResponse = response.data.choices[0]?.message?.content || 'Przepraszam, nie potrafię teraz odpowiedzieć.';

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: 'bot',
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Groq API Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Przepraszam, wystąpił błąd podczas łączenia z przewodnikiem.',
                sender: 'bot',
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
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
                        editable={!isLoading}
                    />
                </View>
                {isLoading ? (
                    <View style={[styles.sendButton, { backgroundColor: 'transparent' }]}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                ) : (
                    <GradientButton
                        title="Wyślij"
                        onPress={handleSend}
                        style={styles.sendButton}
                        textStyle={{ fontSize: 14 }}
                    />
                )}
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
