import "./AdminLayout.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function AdminLayout() {

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const isActive = (path) => {
        if (path === "/admin") {
            return location.pathname === "/admin";
        }

        return location.pathname.startsWith(path);
    };

    return (
        <div className="admin-layout">

            {/* SIDEBAR */}

            <aside className="admin-sidebar">

                <div className="admin-brand">

                    <div className="admin-brand-icon">
                        🛒
                    </div>

                    <div>
                        <strong>E-Commerce</strong>
                        <span>Admin Panel</span>
                    </div>

                </div>


                <div className="admin-menu-title">
                    YÖNETİM
                </div>


                <nav className="admin-menu">

                    <button
                        className={
                            isActive("/admin")
                                ? "admin-menu-item active"
                                : "admin-menu-item"
                        }
                        onClick={() => navigate("/admin")}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>


                    <button
                        className={
                            isActive("/admin/products")
                                ? "admin-menu-item active"
                                : "admin-menu-item"
                        }
                        onClick={() =>
                            navigate("/admin/products")
                        }
                    >
                        <span>📦</span>
                        <span>Ürünler</span>
                    </button>


                    <button
                        className={
                            isActive("/admin/categories")
                                ? "admin-menu-item active"
                                : "admin-menu-item"
                        }
                        onClick={() =>
                            navigate("/admin/categories")
                        }
                    >
                        <span>🏷️</span>
                        <span>Kategoriler</span>
                    </button>


                    <button
                        className={
                            isActive("/admin/orders")
                                ? "admin-menu-item active"
                                : "admin-menu-item"
                        }
                        onClick={() =>
                            navigate("/admin/orders")
                        }
                    >
                        <span>🛍️</span>
                        <span>Siparişler</span>
                    </button>


                    <button
                        className={
                            isActive("/admin/users")
                                ? "admin-menu-item active"
                                : "admin-menu-item"
                        }
                        onClick={() =>
                            navigate("/admin/users")
                        }
                    >
                        <span>👥</span>
                        <span>Kullanıcılar</span>
                    </button>
                    <button
                        className={
                            isActive("/admin/coupons")
                                ? "admin-menu-item active"
                                : "admin-menu-item"
                        }
                        onClick={() =>
                            navigate("/admin/coupons")
                        }
                    >
                        <span>🎟️</span>
                        <span>Kuponlar</span>
                    </button>

                </nav>


                <div className="admin-sidebar-bottom">

                    <button
                        className="admin-bottom-item"
                        onClick={() => navigate("/home")}
                    >
                        <span>🏠</span>
                        <span>Mağazaya Git</span>
                    </button>


                    <button
                        className="admin-bottom-item logout"
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        <span>Çıkış Yap</span>
                    </button>

                </div>

            </aside>


            {/* MAIN */}

            <div className="admin-main">

                <header className="admin-header">

                    <div>

                        <span className="admin-header-label">
                            YÖNETİM PANELİ
                        </span>

                        <h1>
                            E-Commerce Yönetim
                        </h1>

                    </div>


                    <div className="admin-header-user">

                        <div className="admin-user-avatar">
                            👤
                        </div>

                        <div className="admin-user-info">

                            <strong>
                                Admin
                            </strong>

                            <span>
                                Yönetici
                            </span>

                        </div>

                    </div>

                </header>


                <main className="admin-content">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}

export default AdminLayout;