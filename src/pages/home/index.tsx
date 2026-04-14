import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import ExpertiseSummary from '@/components/client/expertise-summary';

const HomePage = () => {
    return (
        <div className={styles["home-page"]}>
            <div className={styles["hero-section"]}>
                <div className={`${styles["container"]} ${styles["home-section"]}`}>
                    <div className={styles["search-content"]}>
                        <SearchClient />
                    </div>
                </div>
            </div>
            <div className={`${styles["container"]} ${styles["home-section"]}`}>
                <CompanyCard />
                <JobCard />
            </div>
            <div className={`${styles["container"]} ${styles["home-section"]}`}>
                <ExpertiseSummary />
            </div>
            <div className={styles["footer-section"]}>
                <div className={`${styles["container"]}`}>
                    <div className={styles["footer-content"]}>
                        <div className={styles["footer-column"]}>
                            <h3>About JobHunter</h3>
                            <p>Find your dream job and grow your career with JobHunter, the leading job platform for IT professionals.</p>
                        </div>
                        <div className={styles["footer-column"]}>
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li><a href="/job">Jobs</a></li>
                                <li><a href="/company">Companies</a></li>
                                <li><a href="/skills">Skills</a></li>
                            </ul>
                        </div>
                        <div className={styles["footer-column"]}>
                            <h3>For Employers</h3>
                            <ul>
                                <li><a href="#">Post a Job</a></li>
                                <li><a href="#">Browse Candidates</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Company Dashboard</a></li>
                            </ul>
                        </div>
                        <div className={styles["footer-column"]}>
                            <h3>Contact</h3>
                            <p>Email: support@jobhunter.com</p>
                            <p>Phone: +84 123 456 789</p>
                            <p>Address: Ho Chi Minh City, Vietnam</p>
                        </div>
                    </div>
                    <div className={styles["footer-bottom"]}>
                        <p>&copy; 2024 JobHunter. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;