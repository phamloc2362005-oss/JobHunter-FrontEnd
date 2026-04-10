import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';

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
        </div>
    )
}

export default HomePage;