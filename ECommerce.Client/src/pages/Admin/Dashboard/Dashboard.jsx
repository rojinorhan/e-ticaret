import "./Dashboard.css";
import { useEffect, useState } from "react";
import api from "../../../services/api";

function Dashboard() {

    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        users: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const getDashboard = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    productsResponse,
                    categoriesResponse,
                    ordersResponse,
                    usersResponse
                ] = await Promise.all([
                    api.get("/Product"),
                    api.get("/Category"),
                    api.get("/Order/admin"),
                    api.get("/Admin/users")
                ]);

                setStats({
                    products: productsResponse.data?.length || 0,
                    categories: categoriesResponse.data?.length || 0,
                    orders: ordersResponse.data?.length || 0,
                    users: usersResponse.data?.length || 0
                });

            } catch (error) {

                console.error("Dashboard hatası:", error);

                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                    return;
                }

                if (error.response?.status === 403) {
                    setError(
                        "Bu sayfaya erişim yetkiniz bulunmamaktadır."
                    );
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Dashboard verileri yüklenemedi."
                );

            } finally {

                setLoading(false);

            }
        };

        getDashboard();

    }, []);

    const cards = [
        {
            title: "Toplam Ürün",
            value: stats.products,
            icon: "📦"
        },
        {
            title: "Toplam Kategori",
            value: stats.categories,
            icon: "🏷️"
        },
        {
            title: "Toplam Sipariş",
            value: stats.orders,
            icon: "🛍️"
        },
        {
            title: "Toplam Kullanıcı",
            value: stats.users,
            icon: "👥"
        }
    ];

    return (
        <div className="dashboard-page">

            <div className="dashboard-heading">

                <div>

                    <span>
                        GENEL BAKIŞ
                    </span>

                    <h2>
                        Dashboard
                    </h2>

                    <p>
                        Mağazanızın genel durumunu buradan
                        takip edebilirsiniz.
                    </p>

                </div>

            </div>


            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}


            <div className="dashboard-cards">

                {cards.map((card) => (

                    <div
                        className="dashboard-card"
                        key={card.title}
                    >

                        <div className="dashboard-card-icon">
                            {card.icon}
                        </div>

                        <div>

                            <span>
                                {card.title}
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : card.value}
                            </strong>

                        </div>

                    </div>

                ))}

            </div>


            <div className="dashboard-welcome">

                <div>

                    <span>
                        E-COMMERCE YÖNETİM
                    </span>

                    <h3>
                        Mağazanızı kolayca yönetin.
                    </h3>

                    <p>
                        Ürün, kategori, sipariş ve kullanıcı
                        işlemlerini sol menüden yönetebilirsiniz.
                    </p>

                </div>

                <div className="dashboard-welcome-icon">
                    🛒
                </div>

            </div>

        </div>
    );
}

export default Dashboard;