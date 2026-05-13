import { CodeOutlined } from '@ant-design/icons';
import styles from './footer.client.module.scss';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div className={styles.footerBrand}>
                    <div className={styles.footerLogo}>
                        <CodeOutlined />
                    </div>
                    <strong>JobHunter</strong>
                    <p>Leading IT recruitment platform in Vietnam. Built for developers, by developers.</p>
                </div>

                <div className={styles.footerLinks}>
                    <div className={styles.footerCol}>
                        <h4>Platform</h4>
                        <a href="/">Home</a>
                        <a href="/job">Jobs</a>
                        <a href="/company">Companies</a>
                        <a href="/skills">Skills</a>
                    </div>
                    <div className={styles.footerCol}>
                        <h4>For Employers</h4>
                        <a href="#">Post a Job</a>
                        <a href="#">Find Candidates</a>
                        <a href="#">Employer Dashboard</a>
                        <a href="#">Pricing</a>
                    </div>
                    <div className={styles.footerCol}>
                        <h4>Contact</h4>
                        <a href="mailto:support@jobhunter.com">support@jobhunter.com</a>
                        <a href="tel:+84123456789">+84 123 456 789</a>
                        <span>Ho Chi Minh City, Vietnam</span>
                    </div>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <div>
                    <span>© 2024 JobHunter. All rights reserved.</span>
                    <div className={styles.footerBottomLinks}>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;