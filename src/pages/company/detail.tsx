import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany } from "@/types/backend";
import { callFetchCompanyById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Row, Skeleton } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import s from './detail.module.scss';


const ClientCompanyDetailPage = (props: any) => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchCompanyById(id);
                if (res?.data) {
                    setCompanyDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    return (
        <div className={s.page}>
            <section className={s.hero}>
                <div className={`${styles["container"]} ${s.heroInner}`}>
                    {companyDetail?.logo && (
                        <div className={s.logoWrap}>
                            <img
                                alt={companyDetail?.name}
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${companyDetail?.logo}`}
                            />
                        </div>
                    )}
                    <div className={s.heroInfo}>
                        <div className={s.badge}>COMPANY PROFILE</div>
                        <h1>{companyDetail?.name || 'Công ty'}</h1>
                        {companyDetail?.address && (
                            <p>
                                <EnvironmentOutlined /> {companyDetail?.address}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className={s.contentWrap}>
                <div className={`${styles["container"]}`}>
                    <div className={s.contentCard}>
                        {isLoading ? (
                            <Skeleton />
                        ) : (
                            <Row gutter={[20, 20]}>
                                {companyDetail && companyDetail.id && (
                                    <Col span={24}>
                                        <div className={s.contentHeader}>
                                            <h2>Giới thiệu công ty</h2>
                                            {companyDetail?.address && (
                                                <div className={s.location}>
                                                    <EnvironmentOutlined /> {companyDetail?.address}
                                                </div>
                                            )}
                                        </div>
                                        <div className={s.description}>
                                            {parse(companyDetail?.description ?? "")}
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
export default ClientCompanyDetailPage;