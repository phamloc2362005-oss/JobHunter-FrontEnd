import { useState } from 'react';
import { Button, Form, Input, message, notification, Steps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { callForgotPassword, callVerifyOtp, callResetPassword } from 'config/api';
import styles from 'styles/auth.module.scss';
import fpStyles from './forgot-password.module.scss';
import {
    MailOutlined,
    SafetyOutlined,
    LockOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';

type Step = 'email' | 'otp' | 'reset' | 'done';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailForm] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [resetForm] = Form.useForm();

    // ── Step 1: gửi OTP ──────────────────────────────────
    const handleSendOtp = async (values: { email: string }) => {
        setIsLoading(true);
        const res = await callForgotPassword(values.email);
        setIsLoading(false);

        if (res?.statusCode === 200) {
            setEmail(values.email);
            setStep('otp');
            message.success('OTP has been sent to your email!');
        } else {
            notification.error({
                message: 'Error',
                description: res?.message || 'Email not found. Please check again.',
            });
        }
    };

    // ── Step 2: xác minh OTP ─────────────────────────────
    const handleVerifyOtp = async (values: { otp: string }) => {
        setIsLoading(true);
        const res = await callVerifyOtp(email, values.otp);
        setIsLoading(false);

        if (res?.statusCode === 200) {
            setStep('reset');
        } else {
            notification.error({
                message: 'Invalid OTP',
                description: res?.message || 'The OTP you entered is incorrect or has expired.',
            });
        }
    };

    // ── Step 3: đặt lại mật khẩu ─────────────────────────
    const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
        setIsLoading(true);
        const res = await callResetPassword(email, values.newPassword);
        setIsLoading(false);

        if (res?.statusCode === 200) {
            setStep('done');
        } else {
            notification.error({
                message: 'Error',
                description: res?.message || 'Could not reset password. Please try again.',
            });
        }
    };

    const currentStepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : step === 'reset' ? 2 : 3;

    return (
        <div className={styles['login-page']}>
            <main className={styles['auth-main']}>
                <div className={styles['auth-center']}>
                    <section className={`${styles.wrapper} ${fpStyles.fpWrapper}`}>

                        {/* Back to login */}
                        {step !== 'done' && (
                            <Link to="/login" className={fpStyles.backLink}>
                                <ArrowLeftOutlined /> Back to Login
                            </Link>
                        )}

                        {/* Step indicator */}
                        {step !== 'done' && (
                            <div className={fpStyles.stepsWrap}>
                                <Steps
                                    size="small"
                                    current={currentStepIndex}
                                    items={[
                                        { title: 'Email', icon: <MailOutlined /> },
                                        { title: 'OTP', icon: <SafetyOutlined /> },
                                        { title: 'New Password', icon: <LockOutlined /> },
                                    ]}
                                />
                            </div>
                        )}

                        {/* ── STEP 1: Email ── */}
                        {step === 'email' && (
                            <>
                                <div className={fpStyles.stepHeader}>
                                    <div className={fpStyles.iconCircle}>
                                        <MailOutlined />
                                    </div>
                                    <h1 className={fpStyles.title}>Forgot Password</h1>
                                    <p className={fpStyles.subtitle}>
                                        Enter your registered email and we'll send you a verification code.
                                    </p>
                                </div>

                                <Form
                                    form={emailForm}
                                    layout="vertical"
                                    onFinish={handleSendOtp}
                                    className={styles['login-form']}
                                >
                                    <Form.Item
                                        label="Email Address"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Please enter your email!' },
                                            { type: 'email', message: 'Invalid email format!' },
                                        ]}
                                    >
                                        <Input
                                            prefix={<MailOutlined style={{ color: '#9aa0a6' }} />}
                                            placeholder="yourname@example.com"
                                            size="large"
                                            autoFocus
                                        />
                                    </Form.Item>

                                    <Form.Item className={styles['submit-wrap']}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={isLoading}
                                            block
                                            size="large"
                                            className={styles['login-submit']}
                                        >
                                            Send Verification Code
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <p className={styles['card-footer-text']}>
                                    Remember your password?{' '}
                                    <Link to="/login" className={styles['card-footer-link']}>Login</Link>
                                </p>
                            </>
                        )}

                        {/* ── STEP 2: OTP ── */}
                        {step === 'otp' && (
                            <>
                                <div className={fpStyles.stepHeader}>
                                    <div className={`${fpStyles.iconCircle} ${fpStyles.iconOtp}`}>
                                        <SafetyOutlined />
                                    </div>
                                    <h1 className={fpStyles.title}>Enter OTP Code</h1>
                                    <p className={fpStyles.subtitle}>
                                        We sent a 6-digit code to <strong>{email}</strong>.<br />
                                        Please check your inbox (and spam folder).
                                    </p>
                                </div>

                                <Form
                                    form={otpForm}
                                    layout="vertical"
                                    onFinish={handleVerifyOtp}
                                    className={styles['login-form']}
                                >
                                    <Form.Item
                                        label="Verification Code"
                                        name="otp"
                                        rules={[
                                            { required: true, message: 'Please enter the OTP!' },
                                            { len: 6, message: 'OTP must be exactly 6 digits!' },
                                        ]}
                                    >
                                        <Input
                                            prefix={<SafetyOutlined style={{ color: '#9aa0a6' }} />}
                                            placeholder="Enter 6-digit code"
                                            size="large"
                                            maxLength={6}
                                            autoFocus
                                            className={fpStyles.otpInput}
                                        />
                                    </Form.Item>

                                    <Form.Item className={styles['submit-wrap']}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={isLoading}
                                            block
                                            size="large"
                                            className={styles['login-submit']}
                                        >
                                            Verify Code
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <p className={fpStyles.resendRow}>
                                    Didn't receive it?{' '}
                                    <button
                                        className={fpStyles.resendBtn}
                                        onClick={() => {
                                            callForgotPassword(email);
                                            message.success('A new code has been sent!');
                                        }}
                                    >
                                        Resend Code
                                    </button>
                                </p>
                            </>
                        )}

                        {/* ── STEP 3: New Password ── */}
                        {step === 'reset' && (
                            <>
                                <div className={fpStyles.stepHeader}>
                                    <div className={`${fpStyles.iconCircle} ${fpStyles.iconReset}`}>
                                        <LockOutlined />
                                    </div>
                                    <h1 className={fpStyles.title}>Set New Password</h1>
                                    <p className={fpStyles.subtitle}>
                                        Create a strong new password for your account.
                                    </p>
                                </div>

                                <Form
                                    form={resetForm}
                                    layout="vertical"
                                    onFinish={handleResetPassword}
                                    className={styles['login-form']}
                                >
                                    <Form.Item
                                        label="New Password"
                                        name="newPassword"
                                        rules={[
                                            { required: true, message: 'Please enter new password!' },
                                            { min: 6, message: 'Password must be at least 6 characters!' },
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined style={{ color: '#9aa0a6' }} />}
                                            placeholder="At least 6 characters"
                                            size="large"
                                            autoFocus
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        dependencies={['newPassword']}
                                        rules={[
                                            { required: true, message: 'Please confirm your password!' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject('Passwords do not match!');
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined style={{ color: '#9aa0a6' }} />}
                                            placeholder="Re-enter new password"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item className={styles['submit-wrap']}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={isLoading}
                                            block
                                            size="large"
                                            className={styles['login-submit']}
                                        >
                                            Reset Password
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </>
                        )}

                        {/* ── STEP 4: Done ── */}
                        {step === 'done' && (
                            <div className={fpStyles.doneWrap}>
                                <div className={fpStyles.doneIcon}>
                                    <CheckCircleOutlined />
                                </div>
                                <h1 className={fpStyles.title}>Password Reset!</h1>
                                <p className={fpStyles.subtitle}>
                                    Your password has been reset successfully.<br />
                                    You can now login with your new password.
                                </p>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    className={`${styles['login-submit']} ${fpStyles.doneBtn}`}
                                    onClick={() => navigate('/login')}
                                >
                                    Go to Login
                                </Button>
                            </div>
                        )}

                    </section>
                </div>
            </main>
        </div>
    );
};

export default ForgotPasswordPage;
