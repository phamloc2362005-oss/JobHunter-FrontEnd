
import styles from '@/styles/client.module.scss';

const Footer = () => {
    return (
        <footer className={styles["main-footer"]}>
            <div className={styles["footer-top"]}>
                <div>ReactJobs</div>
                <div className={styles["footer-links"]}>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Contact Support</span>
                    <span>Cookie Settings</span>
                </div>
            </div>
            <div className={styles["footer-bottom"]}>
                @ 2024 ReactJobs Precision Architect. All rights reserved.
            </div>
        </footer>
    )
}

export default Footer;