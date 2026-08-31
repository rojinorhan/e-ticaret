
import "./Orders.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await api.get("/Order");
                setOrders(response.data);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 401) {
                    navigate("/");
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Siparişler yüklenirken bir hata oluştu."
                );
            } finally {
                setLoading(false);
            }
        };

        getOrders();
    }, [navigate]);

    const getStatusText = (status) => {
        switch (status) {
            case "Pending":
                return "Beklemede";

            case "Confirmed":
                return "Onaylandı";

            case "Shipped":
                return "Kargoya Verildi";

            case "Delivered":
                return "Teslim Edildi";

            case "Cancelled":
                return "İptal Edildi";

            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "status-pending";

            case "Confirmed":
                return "status-confirmed";

            case "Shipped":
                return "status-shipped";

            case "Delivered":
                return "status-delivered";

            case "Cancelled":
                return "status-cancelled";

            default:
                return "";
        }
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="orders-loading">
                    Siparişler yükleniyor...
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">

            <header className="orders-header">

                <div
                    className="orders-logo"
                    onClick={() => navigate("/home")}
                >
                    <span>🛒</span>
                    <strong>E-Commerce</strong>
                </div>

                <button
                    className="orders-home-button"
                    onClick={() => navigate("/home")}
                >
                    Ana Sayfa
                </button>

            </header>

            <main className="orders-container">

                <div className="orders-title">
                    <div>
                        <h1>Siparişlerim</h1>
                        <p>
                            Geçmiş ve mevcut siparişlerinizi buradan
                            takip edebilirsiniz.
                        </p>
                    </div>

                    <div className="order-count">
                        {orders.length} Sipariş
                    </div>
                </div>

                {error && (
                    <div className="orders-error">
                        {error}
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div className="empty-orders">

                        <div className="empty-orders-icon">
                            🛍️
                        </div>

                        <h2>Henüz siparişiniz yok</h2>

                        <p>
                            İlk siparişinizi vermek için ürünleri
                            keşfetmeye başlayabilirsiniz.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                        >
                            Ürünleri Keşfet
                        </button>

                    </div>
                )}

                <div className="orders-list">

                    {orders.map((order) => (

                        <div
                            className="order-card"
                            key={order.id}
                        >

                            <div className="order-card-top">

                                <div>
                                    <span className="order-label">
                                        Sipariş No
                                    </span>

                                    <strong>
                                        #{order.id}
                                    </strong>
                                </div>

                                <span
                                    className={`order-status ${getStatusClass(
    order.status
)}`}
                                >
                                    {getStatusText(order.status)}
                                </span>

                            </div>

                            <div className="order-info">

                                <div className="order-info-item">
                                    <span>Tarih</span>

                                    <strong>
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString("tr-TR")}
                                    </strong>
                                </div>

                                <div className="order-info-item">
                                    <span>Ürün</span>

                                    <strong>
                                        {order.items?.length || 0} ürün
                                    </strong>
                                </div>

                                <div className="order-info-item">
                                    <span>Toplam</span>

                                    <strong className="order-price">
                                        {order.totalPrice.toLocaleString(
                                            "tr-TR",
                                            {
                                                style: "currency",
                                                currency: "TRY"
                                            }
                                        )}
                                    </strong>
                                </div>

                            </div>

                            <div className="order-card-bottom">

                                <div className="order-products">

                                    {order.items
                                        ?.slice(0, 3)
                                        .map((item) => (
                                            <span
                                                key={item.id}
                                                className="order-product"
                                            >
                                                {item.productName}
                                            </span>
                                        ))}

                                    {order.items?.length > 3 && (
                                        <span className="more-products">
                                            +{order.items.length - 3}
                                        </span>
                                    )}

                                </div>

                                <button
                                    className="order-detail-button"
                                    onClick={() =>
                                        navigate(
                                            `/orders/${order.id}`
                                        )
                                    }
                                >
                                    Detayları Gör →
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </main>

        </div>
    );
}

export default Orders;
