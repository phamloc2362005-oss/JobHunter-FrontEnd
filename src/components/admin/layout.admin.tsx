import React, { useState, useEffect } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    ApiOutlined,
    UserOutlined,
    BankOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AliwangwangOutlined,
    BugOutlined,
    ScheduleOutlined,
    HomeOutlined,
    TagsOutlined,
    ClusterOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button, ConfigProvider, Breadcrumb, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { callLogout } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';
import adminStyles from '@/styles/admin.module.scss';

const { Content, Sider } = Layout;
const { Text } = Typography;

type BreadcrumbItem = { title: React.ReactNode };

const titleByPathPrefix: { prefix: string; label: string }[] = [
    { prefix: '/admin', label: 'Dashboard' },
    { prefix: '/admin/company', label: 'Company' },
    { prefix: '/admin/user', label: 'User Management' },
    { prefix: '/admin/job', label: 'Job' },
    { prefix: '/admin/resume', label: 'Resume' },
    { prefix: '/admin/permission', label: 'Permission' },
    { prefix: '/admin/role', label: 'Role' },
    { prefix: '/admin/expertise-category', label: 'Expertise Categories' },
    { prefix: '/admin/expertise', label: 'Expertises' },
];

const resolvePageTitle = (pathname: string) => {
    const match = titleByPathPrefix
        .slice()
        .sort((a, b) => b.prefix.length - a.prefix.length)
        .find(x => pathname === x.prefix || pathname.startsWith(`${x.prefix}/`));
    return match?.label ?? 'Admin';
};

const buildBreadcrumb = (pathname: string): BreadcrumbItem[] => {
    const pageTitle = resolvePageTitle(pathname);
    return [
        { title: <HomeOutlined /> },
        { title: <Text strong>Admin</Text> },
        { title: pageTitle },
    ];
};

const adminTheme = {
    token: {
        colorPrimary: '#0d47a1',
        borderRadius: 8,
        colorBgLayout: '#f4f6f9',
        colorText: '#1a1d21',
        fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    components: {
        Layout: {
            bodyBg: '#f4f6f9',
            headerBg: '#ffffff',
            siderBg: '#ffffff',
        },
        Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'rgba(13, 71, 161, 0.09)',
            itemSelectedColor: '#0d47a1',
            itemHoverBg: 'rgba(13, 71, 161, 0.05)',
            itemColor: '#5f6368',
            itemHoverColor: '#0d47a1',
            iconSize: 18,
            fontSize: 14,
        },
        Button: {
            primaryShadow: '0 2px 8px rgba(13, 71, 161, 0.2)',
        },
        Table: {
            headerBg: '#f8f9fb',
            headerColor: '#2d333a',
            borderColor: '#e8eaed',
            rowHoverBg: 'rgba(13, 71, 161, 0.04)',
        },
        Input: {
            colorBorder: '#dadce0',
            activeBorderColor: '#0d47a1',
            hoverBorderColor: '#0d47a1',
        },
        Select: {
            colorBorder: '#dadce0',
        },
    },
};

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);

    const permissions = useAppSelector(state => state.account.user.role.permissions);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
        if (permissions?.length || ACL_ENABLE === 'false') {

            const viewCompany = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.method
            )

            const viewUser = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            const viewJob = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.JOBS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.JOBS.GET_PAGINATE.method
            )

            const viewResume = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.method
            )

            const viewRole = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
            )

            const viewPermission = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.method
            )

            const viewExpertiseCategory = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.EXPERTISE_CATEGORIES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.EXPERTISE_CATEGORIES.GET_PAGINATE.method
            )

            const viewExpertise = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.EXPERTISES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.EXPERTISES.GET_PAGINATE.method
            )

            const full = [
                {
                    label: <Link to='/admin'>Dashboard</Link>,
                    key: '/admin',
                    icon: <AppstoreOutlined />
                },
                ...(viewCompany || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/company'>Company</Link>,
                    key: '/admin/company',
                    icon: <BankOutlined />,
                }] : []),

                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/user'>User</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined />
                }] : []),
                ...(viewJob || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/job'>Job</Link>,
                    key: '/admin/job',
                    icon: <ScheduleOutlined />
                }] : []),

                ...(viewResume || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/resume'>Resume</Link>,
                    key: '/admin/resume',
                    icon: <AliwangwangOutlined />
                }] : []),
                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/permission'>Permission</Link>,
                    key: '/admin/permission',
                    icon: <ApiOutlined />
                }] : []),
                ...(viewRole || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/role'>Role</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                }] : []),
                ...(viewExpertiseCategory || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/expertise-category'>Expertise Categories</Link>,
                    key: '/admin/expertise-category',
                    icon: <ClusterOutlined />
                }] : []),
                ...(viewExpertise || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/expertise'>Expertises</Link>,
                    key: '/admin/expertise',
                    icon: <TagsOutlined />
                }] : []),



            ];

            setMenuItems(full);
        }
    }, [permissions])
    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    // if (isMobile) {
    //     items.push({
    //         label: <label
    //             style={{ cursor: 'pointer' }}
    //             onClick={() => handleLogout()}
    //         >Đăng xuất</label>,
    //         key: 'logout',
    //         icon: <LogoutOutlined />
    //     })
    // }

    const itemsDropdown = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },
    ];

    return (
        <ConfigProvider theme={adminTheme}>
            <Layout
                style={{ minHeight: '100vh' }}
                className={adminStyles.adminLayout}
            >
                {!isMobile ?
                    <Sider
                        theme='dark'
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}>
                        <div className={adminStyles.adminLogo}>
                            <BugOutlined className={adminStyles.adminLogoIcon} />
                            {!collapsed && <span className={adminStyles.adminLogoText}>CareerAdmin</span>}
                        </div>
                        <Menu
                            selectedKeys={[activeMenu]}
                            mode="inline"
                            items={menuItems}
                            onClick={(e) => setActiveMenu(e.key)}
                            theme="dark"
                            className={adminStyles.adminSidebarMenu}
                        />
                    </Sider>
                    :
                    <Menu
                        selectedKeys={[activeMenu]}
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                        mode="horizontal"
                    />
                }

                <Layout>
                    {!isMobile &&
                        <div className={adminStyles.adminHeader}>
                            <div className={adminStyles.adminHeaderLeft}>
                                <Button
                                    type="text"
                                    icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                                    onClick={() => setCollapsed(!collapsed)}
                                    className={adminStyles.adminHeaderCollapseBtn}
                                />
                                <Breadcrumb items={buildBreadcrumb(location.pathname)} />
                            </div>

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space className={adminStyles.adminHeaderUserBox} align="center">
                                    <div className={adminStyles.adminHeaderUserText}>
                                        <div className={adminStyles.adminHeaderUserName}>{user?.name ?? 'Admin'}</div>
                                        <div className={adminStyles.adminHeaderUserStatus}>
                                            <span className={adminStyles.adminHeaderUserDot} />
                                            Online
                                        </div>
                                    </div>
                                    <Avatar className={adminStyles.adminHeaderAvatar}>
                                        {(user?.name ?? 'AD').substring(0, 2).toUpperCase()}
                                    </Avatar>
                                </Space>
                            </Dropdown>
                        </div>
                    }
                    <Content className={adminStyles.adminContent}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default LayoutAdmin;