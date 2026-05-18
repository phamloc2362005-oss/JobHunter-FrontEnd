import { useState, useEffect, useRef } from 'react';
import {
    MessageOutlined,
    CloseOutlined,
    SendOutlined,
    DeleteOutlined,
    RobotOutlined,
} from '@ant-design/icons';
import { callAiChat } from '@/config/api';
import styles from '@/styles/chatbot.module.scss';

interface IMessage {
    role: 'user' | 'model';
    content: string;
    time: string;
}

const SUGGESTIONS = [
    'Tìm việc Java mới nhất 🚀',
    'Các công ty nổi bật? 🏢',
    'Làm thế nào để ứng tuyển?',
    'Lương bao nhiêu là ổn? 💸',
];

const AiChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasNew, setHasNew] = useState(false);

    const messageEndRef = useRef<HTMLDivElement>(null);

    // Load history from LocalStorage
    useEffect(() => {
        const localHistory = localStorage.getItem('jobhunter_ai_chat_history');
        if (localHistory) {
            setMessages(JSON.parse(localHistory));
        } else {
            // First greeting
            const greeting: IMessage = {
                role: 'model',
                content: 'Xin chào! Tôi là Trợ lý AI của JobHunter. Tôi có thể giúp gì cho bạn? Tôi biết tất cả thông tin về các vị trí đang tuyển và các công ty trong hệ thống đấy!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([greeting]);
        }
    }, []);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    const handleSendMessage = async (textToSend: string) => {
        if (!textToSend.trim() || loading) return;

        const newMsg: IMessage = {
            role: 'user',
            content: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setInputValue('');
        setLoading(true);

        try {
            // Prepare history in the format backend expects: [{"role": "user"|"model", "content": "..."}]
            const apiHistory = updatedMessages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await callAiChat(textToSend, apiHistory);
            console.log("DEBUG AI Chatbot raw response:", response);

            let aiText = "";
            
            // 1. Resolve raw AxiosResponse vs Intercepted payload
            let payload = response;
            if (response && typeof response === 'object' && 'status' in response && 'headers' in response && 'data' in response) {
                payload = (response as any).data;
            }

            // 2. Extract content from the payload
            if (payload) {
                if (typeof payload === 'string') {
                    aiText = payload;
                } else if (typeof payload === 'object') {
                    const backendRes = payload as any;
                    // Case 1: Double-wrapped payload (e.g. backendRes.data.data)
                    if (backendRes.data && typeof backendRes.data === 'object' && backendRes.data.data && typeof backendRes.data.data === 'string') {
                        aiText = backendRes.data.data;
                    }
                    // Case 2: Single-wrapped payload (e.g. backendRes.data)
                    else if (backendRes.data && typeof backendRes.data === 'string') {
                        aiText = backendRes.data;
                    } 
                    // Case 3: Direct nested data property if data is object but has response field
                    else if (backendRes.data && typeof backendRes.data === 'object' && backendRes.data.response && typeof backendRes.data.response === 'string') {
                        aiText = backendRes.data.response;
                    }
                    // Case 4: Error or message properties
                    else if (backendRes.error && typeof backendRes.error === 'string') {
                        aiText = backendRes.error;
                    } else if (backendRes.message && typeof backendRes.message === 'string') {
                        aiText = backendRes.message;
                    } else if (backendRes.data) {
                        aiText = JSON.stringify(backendRes.data);
                    } else {
                        aiText = JSON.stringify(backendRes);
                    }
                }
            }

            if (!aiText) {
                aiText = "Không nhận được phản hồi từ trợ lý AI. Vui lòng thử lại sau.";
            }

            const aiMsg: IMessage = {
                role: 'model',
                content: aiText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            const finalMessages = [...updatedMessages, aiMsg];
            setMessages(finalMessages);
            localStorage.setItem('jobhunter_ai_chat_history', JSON.stringify(finalMessages));

            if (!isOpen) {
                setHasNew(true);
            }
        } catch (error) {
            const errorMsg: IMessage = {
                role: 'model',
                content: 'Rất tiếc, đã có lỗi kết nối xảy ra. Bạn vui lòng thử lại sau nhé!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        localStorage.removeItem('jobhunter_ai_chat_history');
        const greeting: IMessage = {
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
            {/* Floating Toggle Button */}
            <div className={styles.chatbotToggleBtn} onClick={toggleOpen}>
                {isOpen ? <CloseOutlined /> : <MessageOutlined />}
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
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`${styles.messageBubble} ${styles[msg.role]}`}>
                            <div className={styles.msgContent}>{msg.content}</div>
                            <span className={styles.time}>{msg.time}</span>
                        </div>
                    ))}
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
