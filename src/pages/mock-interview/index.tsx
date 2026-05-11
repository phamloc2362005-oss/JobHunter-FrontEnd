import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callFetchPublicJobById, callGenerateInterviewQuestions, callEvaluateInterviewAnswer } from '@/config/api';
import { IJob, IInterviewQuestion, IInterviewEvaluation } from '@/types/backend';
import styles from './index.module.scss';

// ========================
// TYPES
// ========================
interface IAnswerResult {
    question: IInterviewQuestion;
    answer: string;
    evaluation: IInterviewEvaluation | null;
    skipped: boolean;
}

type Phase = 'intro' | 'loading-questions' | 'interview' | 'evaluating' | 'result';

// ========================
// HELPERS
// ========================
const getRatingInfo = (rating: string) => {
    switch (rating) {
        case 'Xuất sắc': return { icon: '🌟', color: '#10b981', className: styles.excellent };
        case 'Tốt': return { icon: '✅', color: '#6366f1', className: styles.good };
        case 'Khá': return { icon: '👍', color: '#f59e0b', className: styles.fair };
        case 'Cần cải thiện': return { icon: '📈', color: '#f97316', className: styles.poor };
        default: return { icon: '❌', color: '#ef4444', className: styles.poor };
    }
};

const getScoreColor = (score: number) => {
    if (score >= 8) return styles.high;
    if (score >= 5) return styles.mid;
    return styles.low;
};

const getResultEmoji = (avg: number) => {
    if (avg >= 8.5) return '🏆';
    if (avg >= 7) return '🎯';
    if (avg >= 5) return '💪';
    return '📚';
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'technical': return 'Kỹ thuật';
        case 'behavioral': return 'Hành vi';
        case 'situational': return 'Tình huống';
        default: return type;
    }
};

// ========================
// MAIN COMPONENT
// ========================
const MockInterviewPage = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    // State
    const [job, setJob] = useState<IJob | null>(null);
    const [phase, setPhase] = useState<Phase>('intro');
    const [questions, setQuestions] = useState<IInterviewQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState<IAnswerResult[]>([]);
    const [currentEval, setCurrentEval] = useState<IInterviewEvaluation | null>(null);
    const [loadJobError, setLoadJobError] = useState(false);

    // Load job info
    useEffect(() => {
        if (!jobId) return;
        callFetchPublicJobById(jobId)
            .then(res => {
                if (res?.data) setJob(res.data);
                else setLoadJobError(true);
            })
            .catch(() => setLoadJobError(true));
    }, [jobId]);

    // ========================
    // ACTIONS
    // ========================
    const handleStart = async () => {
        if (!job) return;
        setPhase('loading-questions');

        try {
            const skillsStr = job.skills?.map(s => s.name).join(', ') || '';
            const descPlain = (job.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const res = await callGenerateInterviewQuestions(
                job.name,
                descPlain,
                job.level || '',
                skillsStr
            );

            if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                setQuestions(res.data.data);
                setCurrentIdx(0);
                setResults([]);
                setCurrentEval(null);
                setAnswer('');
                setPhase('interview');
            } else {
                alert('Không thể tải câu hỏi. Vui lòng thử lại.');
                setPhase('intro');
            }
        } catch (e) {
            alert('Lỗi kết nối AI. Vui lòng thử lại.');
            setPhase('intro');
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || phase === 'evaluating') return;
        setPhase('evaluating');

        const currentQ = questions[currentIdx];
        const jobContext = `Vị trí: ${job?.name} | Cấp bậc: ${job?.level} | Kỹ năng: ${job?.skills?.map(s => s.name).join(', ')}`;

        try {
            const res = await callEvaluateInterviewAnswer(
                currentQ.question,
                answer,
                jobContext
            );
            const evalData = res?.data?.data as IInterviewEvaluation | null;
            setCurrentEval(evalData);

            setResults(prev => [...prev, {
                question: currentQ,
                answer,
                evaluation: evalData,
                skipped: false
            }]);
        } catch (e) {
            // Lỗi thì vẫn lưu answer, không có evaluation
            setResults(prev => [...prev, {
                question: currentQ,
                answer,
                evaluation: null,
                skipped: false
            }]);
            setCurrentEval(null);
        }
        setPhase('interview');
    };

    const handleSkip = () => {
        const currentQ = questions[currentIdx];
        setResults(prev => [...prev, {
            question: currentQ,
            answer: '',
            evaluation: null,
            skipped: true
        }]);
        goNext();
    };

    const goNext = () => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= questions.length) {
            setPhase('result');
        } else {
            setCurrentIdx(nextIdx);
            setAnswer('');
            setCurrentEval(null);
        }
    };

    const handleRetry = () => {
        setPhase('intro');
        setQuestions([]);
        setResults([]);
        setCurrentIdx(0);
        setAnswer('');
        setCurrentEval(null);
    };

    // ========================
    // COMPUTED
    // ========================
    const progress = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0;
    const currentQuestion = questions[currentIdx];

    const answeredResults = results.filter(r => !r.skipped && r.evaluation);
    const avgScore = answeredResults.length > 0
        ? answeredResults.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0) / answeredResults.length
        : 0;

    const hasEval = currentEval !== null;
    const isEvaluating = phase === 'evaluating';

    // ========================
    // RENDER: ERROR
    // ========================
    if (loadJobError) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    <div className={styles.loadingScreen}>
                        <div style={{ fontSize: 48 }}>😕</div>
                        <div className={styles.loadingText}>Không tìm thấy thông tin job</div>
                        <button className={styles.retryBtn} onClick={() => navigate('/job')}>
                            ← Quay lại danh sách việc làm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================
    // RENDER: LOADING QUESTIONS
    // ========================
    if (phase === 'loading-questions') {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    <div className={styles.loadingScreen}>
                        <div className={styles.loadingSpinner} />
                        <div className={styles.loadingText}>
                            🤖 AI đang phân tích JD và tạo câu hỏi phù hợp...
                        </div>
                        <div className={styles.loadingDots}>
                            <span /><span /><span />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ========================
    // RENDER: INTRO
    // ========================
    if (phase === 'intro') {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
                        <div className={styles.headerTitle}>
                            <h1>
                                <span className={styles.aiChip}>AI</span>
                                Mock Interview
                            </h1>
                            <p>Luyện tập phỏng vấn với trợ lý AI thông minh</p>
                        </div>
                    </div>

                    {/* Intro Card */}
                    <div className={styles.introCard}>
                        <span className={styles.introIcon}>🎤</span>
                        <h2 className={styles.introTitle}>
                            Sẵn sàng để <span>luyện phỏng vấn</span>?
                        </h2>
                        <p className={styles.introSubtitle}>
                            AI sẽ đặt 5 câu hỏi phỏng vấn được tùy chỉnh riêng cho vị trí này.<br />
                            Trả lời thật thành thật — AI sẽ nhận xét và cho điểm từng câu ngay lập tức.
                        </p>

                        {/* Job Info */}
                        {job && (
                            <div className={styles.jobInfoBox}>
                                <span className={styles.jobInfoIcon}>💼</span>
                                <div className={styles.jobInfoContent}>
                                    <h3>{job.name}</h3>
                                    <p>{job.company?.name} • {job.location}</p>
                                    <div className={styles.jobTags}>
                                        <span className={styles.levelTag}>{job.level}</span>
                                        {job.skills?.slice(0, 4).map(s => (
                                            <span key={s.id} className={styles.jobTag}>{s.name}</span>
                                        ))}
                                        {(job.skills?.length || 0) > 4 && (
                                            <span className={styles.jobTag}>+{(job.skills?.length || 0) - 4}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoNum}>5</span>
                                <div className={styles.infoLabel}>Câu hỏi</div>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoNum}>AI</span>
                                <div className={styles.infoLabel}>Chấm điểm tức thì</div>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoNum}>10</span>
                                <div className={styles.infoLabel}>Điểm tối đa</div>
                            </div>
                        </div>

                        <button
                            className={styles.startBtn}
                            onClick={handleStart}
                            disabled={!job}
                        >
                            🚀 Bắt đầu phỏng vấn
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================
    // RENDER: RESULT
    // ========================
    if (phase === 'result') {
        const passed = results.filter(r => !r.skipped && (r.evaluation?.score || 0) >= 5).length;
        const skipped = results.filter(r => r.skipped).length;

        return (
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
                        <div className={styles.headerTitle}>
                            <h1>
                                <span className={styles.aiChip}>AI</span>
                                Kết quả phỏng vấn
                            </h1>
                            <p>{job?.name} • {job?.company?.name}</p>
                        </div>
                    </div>

                    <div className={styles.resultCard}>
                        {/* Result Header */}
                        <div className={styles.resultHeader}>
                            <span className={styles.resultEmoji}>{getResultEmoji(avgScore)}</span>
                            <h2 className={styles.resultTitle}>
                                {avgScore >= 8.5 ? 'Xuất sắc! Bạn đã sẵn sàng!' :
                                    avgScore >= 7 ? 'Kết quả tốt! Tiếp tục luyện tập!' :
                                        avgScore >= 5 ? 'Khá ổn! Cần cải thiện thêm.' :
                                            'Hãy ôn luyện thêm nhé!'}
                            </h2>
                            <p className={styles.resultSubtitle}>
                                Đây là báo cáo chi tiết buổi luyện phỏng vấn của bạn
                            </p>
                        </div>

                        {/* Score Board */}
                        <div className={styles.scoreBoard}>
                            <div className={styles.scoreCircle}>
                                <span className={styles.scoreAvg}>{avgScore.toFixed(1)}</span>
                                <span className={styles.scoreLabel}>/ 10</span>
                            </div>
                            <div className={styles.scoreStats}>
                                <div className={styles.statItem}>
                                    <span className={`${styles.statDot} ${styles.dotGreen}`} />
                                    Câu trả lời tốt (≥5đ)
                                    <span className={styles.statVal}>{passed}/{questions.length}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={`${styles.statDot} ${styles.dotBlue}`} />
                                    Đã trả lời
                                    <span className={styles.statVal}>{results.length - skipped}/{questions.length}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={`${styles.statDot} ${styles.dotYellow}`} />
                                    Bỏ qua
                                    <span className={styles.statVal}>{skipped}</span>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className={styles.breakdownTitle}>Chi tiết từng câu</div>
                        <div className={styles.breakdownList}>
                            {results.map((r, idx) => (
                                <div key={idx} className={styles.breakdownItem}>
                                    <div className={styles.bdNum}>{idx + 1}</div>
                                    <div className={styles.bdContent}>
                                        <div className={styles.bdQuestion}>{r.question.question}</div>
                                        {r.skipped ? (
                                            <div className={styles.bdFeedback} style={{ color: '#64748b' }}>
                                                — Đã bỏ qua
                                            </div>
                                        ) : r.evaluation ? (
                                            <div className={styles.bdFeedback}>{r.evaluation.feedback}</div>
                                        ) : (
                                            <div className={styles.bdFeedback} style={{ color: '#64748b' }}>
                                                Không thể đánh giá
                                            </div>
                                        )}
                                    </div>
                                    {!r.skipped && r.evaluation && (
                                        <div className={`${styles.bdScore} ${getScoreColor(r.evaluation.score)}`}>
                                            {r.evaluation.score.toFixed(1)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className={styles.resultActions}>
                            <button className={styles.retryBtn} onClick={handleRetry}>
                                🔄 Thử lại
                            </button>
                            <button className={styles.backJobBtn} onClick={() => navigate(`/job/${encodeURIComponent(job?.name || '')}?id=${jobId}`)}>
                                ← Về trang job
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ========================
    // RENDER: INTERVIEW
    // ========================
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => {
                        if (window.confirm('Bạn có chắc muốn thoát? Tiến trình sẽ mất.')) {
                            setPhase('intro');
                            setResults([]);
                            setCurrentIdx(0);
                            setAnswer('');
                            setCurrentEval(null);
                        }
                    }}>←</button>
                    <div className={styles.headerTitle}>
                        <h1>
                            <span className={styles.aiChip}>AI</span>
                            Mock Interview
                        </h1>
                        <p>{job?.name} • {job?.company?.name}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className={styles.progressWrapper}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>
                            Câu {currentIdx + 1} / {questions.length}
                        </span>
                        <span className={styles.progressPercent}>
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                {currentQuestion && (
                    <div className={styles.questionCard} key={currentIdx}>
                        <div className={styles.questionMeta}>
                            <div className={styles.questionNum}>{currentIdx + 1}</div>
                            <span className={`${styles.questionType} ${styles[currentQuestion.type] || ''}`}>
                                {getTypeLabel(currentQuestion.type)}
                            </span>
                        </div>
                        <div className={styles.questionText}>{currentQuestion.question}</div>
                        {currentQuestion.hint && (
                            <div className={styles.hintBox}>
                                <span className={styles.hintIcon}>💡</span>
                                <span className={styles.hintText}>Gợi ý: {currentQuestion.hint}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Answer Area (only show if no eval yet) */}
                {!hasEval && (
                    <div className={styles.answerCard}>
                        <div className={styles.answerLabel}>Câu trả lời của bạn</div>
                        <textarea
                            id={`answer-${currentIdx}`}
                            className={styles.answerTextarea}
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="Hãy trả lời thật chi tiết và cụ thể. Ví dụ: nêu tên công nghệ, số liệu thực tế, tình huống đã gặp..."
                            disabled={isEvaluating}
                        />
                        <div className={styles.answerActions}>
                            <button className={styles.skipBtn} onClick={handleSkip} disabled={isEvaluating}>
                                Bỏ qua
                            </button>
                            <button
                                id={`submit-answer-${currentIdx}`}
                                className={styles.submitBtn}
                                onClick={handleSubmitAnswer}
                                disabled={!answer.trim() || isEvaluating}
                            >
                                {isEvaluating ? (
                                    <>
                                        <div className={styles.spinner} />
                                        AI đang chấm...
                                    </>
                                ) : (
                                    <>Gửi câu trả lời →</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Evaluation Result */}
                {hasEval && currentEval && (
                    <>
                        <div className={`${styles.evalCard} ${getRatingInfo(currentEval.rating).className}`}>
                            <div className={styles.evalHeader}>
                                <div className={styles.evalRating}>
                                    <span className={styles.ratingIcon}>{getRatingInfo(currentEval.rating).icon}</span>
                                    <span
                                        className={styles.ratingLabel}
                                        style={{ color: getRatingInfo(currentEval.rating).color }}
                                    >
                                        {currentEval.rating}
                                    </span>
                                </div>
                                <div className={styles.evalScore}>
                                    <span
                                        className={styles.scoreNum}
                                        style={{ color: getRatingInfo(currentEval.rating).color }}
                                    >
                                        {currentEval.score.toFixed(1)}
                                    </span>
                                    <span className={styles.scoreMax}>/10</span>
                                </div>
                            </div>

                            <div className={styles.evalFeedback}>{currentEval.feedback}</div>

                            {currentEval.suggestion && (
                                <div className={styles.evalSuggestion}>
                                    <span className={styles.suggestionIcon}>💡</span>
                                    <span>{currentEval.suggestion}</span>
                                </div>
                            )}
                        </div>

                        <button
                            id={`next-question-btn`}
                            className={styles.nextBtn}
                            onClick={goNext}
                        >
                            {currentIdx + 1 >= questions.length ? '📊 Xem kết quả tổng kết →' : 'Câu tiếp theo →'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default MockInterviewPage;
