import { useState, useEffect, useRef } from 'react';
import {
    CloseOutlined,
    SendOutlined,
    DeleteOutlined,
    RobotOutlined,
} from '@ant-design/icons';
import { callAiChat, callGetChatHistory, callClearChatHistory } from '@/config/api';
import type { IChatMessage } from '@/config/api';
import styles from '@/styles/chatbot.module.scss';
import { useAppSelector } from '@/redux/hooks';

const SUGGESTIONS = [
    'Tìm việc Java mới nhất 🚀',
    'Các công ty nổi bật? 🏢',
    'Làm thế nào để ứng tuyển?',
    'Lương bao nhiêu là ổn? 💸',
];

const GREETING: IChatMessage = {
    role: 'model',
    content: 'Xin chào! Tôi là Trợ lý AI của JobHunter. Tôi có thể giúp gì cho bạn? Tôi biết tất cả thông tin về các vị trí đang tuyển và các công ty trong hệ thống đấy!',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const AiChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const user = useAppSelector(state => state.account.user);
    const isLoggedIn = !!user?.id;

    const messageEndRef = useRef<HTMLDivElement>(null);

    // Load history from server when user is logged in, otherwise show greeting
    useEffect(() => {
        setHistoryLoaded(false);
        if (isLoggedIn) {
            callGetChatHistory()
                .then((res) => {
                    const data = (res as any)?.data?.data ?? (res as any)?.data ?? null;
                    if (Array.isArray(data) && data.length > 0) {
                        setMessages(data as IChatMessage[]);
                    } else {
                        setMessages([GREETING]);
                    }
                })
                .catch(() => {
                    setMessages([GREETING]);
                })
                .finally(() => setHistoryLoaded(true));
        } else {
            setMessages([GREETING]);
            setHistoryLoaded(true);
        }
    }, [user?.id]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    const handleSendMessage = async (textToSend: string) => {
        if (!textToSend.trim() || loading) return;

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newMsg: IChatMessage = {
            role: 'user',
            content: textToSend,
            time: now,
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setInputValue('');
        setLoading(true);

        try {
            // Build history for context (exclude the greeting if it's the only message)
            const apiHistory = updatedMessages.map(m => ({
                role: m.role,
                content: m.content
            }));

            // Pass current time so BE can store the correct display time
            const response = await callAiChat(textToSend, apiHistory, now);
            console.log("DEBUG AI Chatbot raw response:", response);

            let aiText = "";

            // Resolve raw AxiosResponse vs Intercepted payload
            let payload: any = response;
            if (response && typeof response === 'object' && 'status' in response && 'data' in response) {
                payload = (response as any).data;
            }

            // Extract content
            if (payload) {
                if (typeof payload === 'string') {
                    aiText = payload;
                } else if (typeof payload === 'object') {
                    const r = payload as any;
                    if (r.data && typeof r.data === 'object' && typeof r.data.data === 'string') {
                        aiText = r.data.data;
                    } else if (r.data && typeof r.data === 'string') {
                        aiText = r.data;
                    } else if (r.data && typeof r.data === 'object' && typeof r.data.response === 'string') {
                        aiText = r.data.response;
                    } else if (typeof r.error === 'string') {
                        aiText = r.error;
                    } else if (typeof r.message === 'string') {
                        aiText = r.message;
                    } else if (r.data) {
                        aiText = JSON.stringify(r.data);
                    } else {
                        aiText = JSON.stringify(r);
                    }
                }
            }

            if (!aiText) {
                aiText = "Không nhận được phản hồi từ trợ lý AI. Vui lòng thử lại sau.";
            }

            const aiMsg: IChatMessage = {
                role: 'model',
                content: aiText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            // BE đã lưu cả 2 tin nhắn — FE chỉ cần update UI
            setMessages([...updatedMessages, aiMsg]);

            if (!isOpen) {
                setHasNew(true);
            }
        } catch (error) {
            const errorMsg: IChatMessage = {
                role: 'model',
                content: 'Rất tiếc, đã có lỗi kết nối xảy ra. Bạn vui lòng thử lại sau nhé!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (isLoggedIn) {
            try {
                await callClearChatHistory();
            } catch {
                // Vẫn reset UI dù API lỗi
            }
        }
        const greeting: IChatMessage = {
            role: 'model',
            content: 'Cuộc hội thoại đã được dọn sạch. Bạn cần tôi hỗ trợ gì tiếp theo?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([greeting]);
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        setHasNew(false);
    };

    return (
        <div className={styles.chatbotContainer}>
            {/* Floating Toggle Button — Robot Face */}
            <div className={styles.chatbotToggleBtn} onClick={toggleOpen}>
                {isOpen ? (
                    <CloseOutlined />
                ) : (
                    <svg
                        className={styles.robotFaceIcon}
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-label="AI Chatbot"
                    >
                        <defs>
                            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#7ee8ff" />
                                <stop offset="100%" stopColor="#38bdf8" />
                            </radialGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                        </defs>

                        {/* Antenna stem */}
                        <line x1="32" y1="4" x2="32" y2="13" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
                        {/* Antenna ball */}
                        <circle cx="32" cy="4" r="3" fill="white" filter="url(#glow)"/>

                        {/* Head body */}
                        <rect x="10" y="13" width="44" height="36" rx="10" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.85)" strokeWidth="2"/>

                        {/* Left eye */}
                        <circle cx="23" cy="29" r="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
                        <circle cx="23" cy="29" r="3.5" fill="url(#eyeGlow)" filter="url(#glow)"/>
                        <circle cx="24.2" cy="27.8" r="1" fill="white" opacity="0.8"/>

                        {/* Right eye */}
                        <circle cx="41" cy="29" r="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
                        <circle cx="41" cy="29" r="3.5" fill="url(#eyeGlow)" filter="url(#glow)"/>
                        <circle cx="42.2" cy="27.8" r="1" fill="white" opacity="0.8"/>

                        {/* Smile mouth */}
                        <path d="M22 40 Q32 47 42 40" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

                        {/* Ear left */}
                        <rect x="5" y="24" width="5" height="10" rx="2.5" fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/>
                        {/* Ear right */}
                        <rect x="54" y="24" width="5" height="10" rx="2.5" fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/>
                    </svg>
                )}
                {hasNew && !isOpen && <span className={styles.badge}>New</span>}
            </div>

            {/* Chat Window */}
            <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
                {/* Header */}
                <div className={styles.chatHeader}>
                    <div className={styles.headerInfo}>
                        <div className={styles.avatar}>
                            <RobotOutlined />
                        </div>
                        <div className={styles.titleBox}>
                            <span className={styles.name}>AI Career Assistant</span>
                            <span className={styles.status}>
                                <span className={styles.dot}></span>
                                Online
                            </span>
                        </div>
                    </div>
                    <div className={styles.closeBtn} onClick={toggleOpen}>
                        <CloseOutlined />
                    </div>
                </div>

                {/* Messages Area */}
                <div className={styles.chatMessages}>
                    {!historyLoaded ? (
                        <div className={styles.loadingHistory}>Đang tải lịch sử chat...</div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`${styles.messageBubble} ${styles[msg.role]}`}>
                                <div className={styles.msgContent}>{msg.content}</div>
                                <span className={styles.time}>{msg.time}</span>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className={`${styles.messageBubble} ${styles.model}`}>
                            <div className={styles.msgContent}>
                                <div className={styles.typingIndicator}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messageEndRef} />
                </div>

                {/* Suggestions Row */}
                <div className={styles.suggestionsRow}>
                    {SUGGESTIONS.map((s, idx) => (
                        <span
                            key={idx}
                            className={styles.tag}
                            onClick={() => handleSendMessage(s.replace(/🚀|🏢|💸/g, '').trim())}
                        >
                            {s}
                        </span>
                    ))}
                </div>

                {/* Input Area */}
                <div className={styles.chatInputArea}>
                    <div className={styles.clearBtn} onClick={handleClearChat} title="Xóa lịch sử chat">
                        <DeleteOutlined />
                    </div>
                    <input
                        type="text"
                        placeholder="Hỏi tôi bất cứ điều gì..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendMessage(inputValue);
                        }}
                    />
                    <button
                        className={styles.sendBtn}
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim() || loading}
                    >
                        <SendOutlined />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiChatbot;
