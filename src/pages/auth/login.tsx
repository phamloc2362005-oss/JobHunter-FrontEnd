import { GoogleOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Divider, Form, Input, message, notification } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogin } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const callback = params?.get("callback");
    const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
    const googleLoginUrl = `${backendUrl}/oauth2/authorization/google`;

    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = '/';
        }
    }, [])

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setIsSubmit(true);
        const res = await callLogin(username, password);
        setIsSubmit(false);

        console.log("Login Response:", res);

        if (res?.data) {
            localStorage.setItem('access_token', res.data.access_token);
            dispatch(setUserLoginInfo(res.data.user))
            message.success('Đăng nhập tài khoản thành công!');
            window.location.href = callback ? callback : '/';
        } else {
            console.log("Login Error - res:", res);
            notification.error({
                message: "Có lỗi xảy ra",
                description:
                    res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            })
        }
    };

    const googleBtnProps: ButtonProps = {
        type: 'default',
        href: googleLoginUrl,
        className: styles['google-btn'],
        block: true,
        children: (
            <>
                <GoogleOutlined className={styles['google-icon']} />
                Đăng nhập bằng Google
            </>
        ),
    };

    return (
        <div className={styles['login-page']}>
            <main className={styles['auth-main']}>
                <div className={styles['auth-center']}>
                    <section className={styles.wrapper}>
                        <h1 className={styles['login-title']}>Đăng Nhập</h1>

                        <Form
                            name="basic"
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            className={styles['login-form']}
                        >
                            <Form.Item
                                label="Email"
                                name="username"
                                rules={[{ required: true, message: 'Email không được để trống!' }]}
                            >
                                <Input placeholder="username@example.com" size="large" />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <div className={styles['password-label-row']}>
                                        <span>Mật khẩu</span>
                                        <Link to="/forgot-password" className={styles['forgot-link']}>
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                }
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password size="large" />
                            </Form.Item>

                            <Form.Item className={styles['submit-wrap']}>
                                <Button type="primary" htmlType="submit" loading={isSubmit} block size="large" className={styles['login-submit']}>
                                    Đăng nhập
                                </Button>
                            </Form.Item>

                            <Divider plain className={styles['divider-or']}>
                                HOẶC
                            </Divider>

                            <Form.Item className={styles['google-wrap']}>
                                <Button {...googleBtnProps} />
                            </Form.Item>

                            <p className={styles['card-footer-text']}>
                                Chưa có tài khoản?{' '}
                                <Link to="/register" className={styles['card-footer-link']}>
                                    Đăng Ký
                                </Link>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default LoginPage;
