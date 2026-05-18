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
const getRatingInfo = (rating: string, score?: number) => {
    switch (rating) {
        case 'Excellent': return { icon: '🌟', color: '#10b981', className: styles.excellent };
        case 'Good': return { icon: '✅', color: '#6366f1', className: styles.good };
        case 'Fair': return { icon: '👍', color: '#f59e0b', className: styles.fair };
        case 'Needs Improvement': return { icon: '📈', color: '#f97316', className: styles.poor };
        case 'Failed': return { icon: '❌', color: '#ef4444', className: styles.poor };
        default:
            // Fallback dựa theo score nếu rating không match
            if (score !== undefined) {
                if (score >= 8.5) return { icon: '🌟', color: '#10b981', className: styles.excellent };
                if (score >= 7) return { icon: '✅', color: '#6366f1', className: styles.good };
                if (score >= 5) return { icon: '👍', color: '#f59e0b', className: styles.fair };
                if (score >= 3) return { icon: '📈', color: '#f97316', className: styles.poor };
            }
            return { icon: '❌', color: '#ef4444', className: styles.poor };
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
        case 'technical': return 'Technical';
        case 'behavioral': return 'Behavioral';
        case 'situational': return 'Situational';
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

            // res.data là IBackendRes object { statusCode, data: [...] }
            // Câu hỏi nằm ở res.data
            let questions: any = res?.data;
            console.log('DEBUG FE questions:', questions, 'raw res.data:', res?.data);

            // Fallback: nếu BE trả về string thay vì array
            if (typeof questions === 'string') {
                try { questions = JSON.parse(questions); } catch (e) { console.error('parse error', e); }
            }

            if (questions && Array.isArray(questions) && questions.length > 0) {
                setQuestions(questions);
                setCurrentIdx(0);
                setResults([]);
                setCurrentEval(null);
                setAnswer('');
                setPhase('interview');
            } else {
                console.error('FE: invalid questions data:', questions);
                alert('Could not load questions. Please try again.');
                setPhase('intro');
            }
        } catch (e) {
            console.error('FE: API call error:', e);
            alert('AI connection error. Please try again.');
            setPhase('intro');
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || phase === 'evaluating') return;
        setPhase('evaluating');

        const currentQ = questions[currentIdx];
        const jobContext = `Position: ${job?.name} | Level: ${job?.level} | Skills: ${job?.skills?.map(s => s.name).join(', ')}`;

        try {
            const res = await callEvaluateInterviewAnswer(
                currentQ.question,
                answer,
                jobContext
            );
            // res.data là IBackendRes wrapper, đánh giá nằm ở res.data
            const evalData = res?.data as IInterviewEvaluation | null;
            console.log('DEBUG FE evalData:', evalData, 'raw:', res?.data);
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
                        <div className={styles.loadingText}>Job information not found</div>
                        <button className={styles.retryBtn} onClick={() => navigate('/job')}>
                            ← Back to Job List
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
                            🤖 AI is analyzing JD and generating matching questions...
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
                            <p>Practice interviewing with your smart AI assistant</p>
                        </div>
                    </div>

                    {/* Intro Card */}
                    <div className={styles.introCard}>
                        <span className={styles.introIcon}>🎤</span>
                        <h2 className={styles.introTitle}>
                            Ready to <span>practice interviewing</span>?
                        </h2>
                        <p className={styles.introSubtitle}>
                            AI will ask 5 interview questions tailored for this position.<br />
                            Answer honestly — AI will provide feedback and scores for each answer instantly.
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
                                <div className={styles.infoLabel}>Questions</div>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoNum}>AI</span>
                                <div className={styles.infoLabel}>Instant Scoring</div>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoNum}>10</span>
                                <div className={styles.infoLabel}>Max Score</div>
                            </div>
                        </div>

                        <button
                            className={styles.startBtn}
                            onClick={handleStart}
                            disabled={!job}
                        >
                            🚀 Start Interview
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
                                Interview Results
                            </h1>
                            <p>{job?.name} • {job?.company?.name}</p>
                        </div>
                    </div>

                    <div className={styles.resultCard}>
                        {/* Result Header */}
                        <div className={styles.resultHeader}>
                            <span className={styles.resultEmoji}>{getResultEmoji(avgScore)}</span>
                            <h2 className={styles.resultTitle}>
                                {avgScore >= 8.5 ? 'Excellent! You are ready!' :
                                    avgScore >= 7 ? 'Good result! Keep practicing!' :
                                        avgScore >= 5 ? 'Not bad! Needs more improvement.' :
                                            'Keep studying and practice more!'}
                            </h2>
                            <p className={styles.resultSubtitle}>
                                Here is your detailed mock interview report
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
                                    Good Answers (≥5 pts)
                                    <span className={styles.statVal}>{passed}/{questions.length}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={`${styles.statDot} ${styles.dotBlue}`} />
                                    Answered
                                    <span className={styles.statVal}>{results.length - skipped}/{questions.length}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={`${styles.statDot} ${styles.dotYellow}`} />
                                    Skipped
                                    <span className={styles.statVal}>{skipped}</span>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className={styles.breakdownTitle}>Question Breakdown</div>
                        <div className={styles.breakdownList}>
                            {results.map((r, idx) => (
                                <div key={idx} className={styles.breakdownItem}>
                                    <div className={styles.bdNum}>{idx + 1}</div>
                                    <div className={styles.bdContent}>
                                        <div className={styles.bdQuestion}>{r.question.question}</div>
                                        {r.skipped ? (
                                            <div className={styles.bdFeedback} style={{ color: '#64748b' }}>
                                                — Skipped
                                            </div>
                                        ) : r.evaluation ? (
                                            <div className={styles.bdFeedback}>{r.evaluation.feedback}</div>
                                        ) : (
                                            <div className={styles.bdFeedback} style={{ color: '#64748b' }}>
                                                Could not evaluate
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
                                🔄 Retry
                            </button>
                            <button className={styles.backJobBtn} onClick={() => navigate(`/job/${encodeURIComponent(job?.name || '')}?id=${jobId}`)}>
                                ← Back to Job
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
                        if (window.confirm('Are you sure you want to quit? Progress will be lost.')) {
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
                            Question {currentIdx + 1} / {questions.length}
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
                                <span className={styles.hintText}>Hint: {currentQuestion.hint}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Answer Area (only show if no eval yet) */}
                {!hasEval && (
                    <div className={styles.answerCard}>
                        <div className={styles.answerLabel}>Your Answer</div>
                        <textarea
                            id={`answer-${currentIdx}`}
                            className={styles.answerTextarea}
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="Please provide a detailed and specific answer. For example: mention specific technologies, real metrics, situations you've encountered..."
                            disabled={isEvaluating}
                        />
                        <div className={styles.answerActions}>
                            <button className={styles.skipBtn} onClick={handleSkip} disabled={isEvaluating}>
                                Skip
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
                                        AI is scoring...
                                    </>
                                ) : (
                                    <>Submit Answer →</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Evaluation Result */}
                {hasEval && currentEval && (
                    <>
                        <div className={`${styles.evalCard} ${getRatingInfo(currentEval.rating, currentEval.score).className}`}>
                            <div className={styles.evalHeader}>
                                <div className={styles.evalRating}>
                                    <span className={styles.ratingIcon}>{getRatingInfo(currentEval.rating, currentEval.score).icon}</span>
                                    <span
                                        className={styles.ratingLabel}
                                        style={{ color: getRatingInfo(currentEval.rating, currentEval.score).color }}
                                    >
                                        {currentEval.rating}
                                    </span>
                                </div>
                                <div className={styles.evalScore}>
                                    <span
                                        className={styles.scoreNum}
                                        style={{ color: getRatingInfo(currentEval.rating, currentEval.score).color }}
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
                            {currentIdx + 1 >= questions.length ? '📊 See Summary Results →' : 'Next Question →'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default MockInterviewPage;
