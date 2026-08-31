
import "./OrderDetail.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getOrder = async () => {
            try {
                const response = await api.get(`/Order/${id}`);
                setOrder(response.data);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 401) {
                    navigate("/");
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Sipariş detayı yüklenirken bir hata oluştu."
                );
            } finally {
                setLoading(false);
            }
        };

        getOrder();
    }, [id, navigate]);

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
                return "detail-status-pending";

            case "Confirmed":
                return "detail-status-confirmed";

            case "Shipped":
                return "detail-status-shipped";

            case "Delivered":
                return "detail-status-delivered";

            case "Cancelled":
                return "detail-status-cancelled";

            default:
                return "";
        }
    };

    const formatPrice = (price) => {
        return Number(price).toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY"
        });
    };

    if (loading) {
        return (
            <div className="order-detail-page">
                <div className="order-detail-loading">
                    Sipariş detayı yükleniyor...
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-detail-page">

                <div className="order-detail-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>Sipariş bulunamadı</h2>

                    <p>
                        {error || "Sipariş bilgilerine ulaşılamadı."}
                    </p>

                    <button
                        onClick={() => navigate("/orders")}
                    >
                        Siparişlerime Dön
                    </button>

                </div>

            </div>
        );
    }

    return (
        <div className="order-detail-page">

            <header className="order-detail-header">

                <div
                    className="order-detail-logo"
                    onClick={() => navigate("/home")}
                >
                    <span>🛒</span>
                    <strong>E-Commerce</strong>
                </div>

                <button
                    className="back-orders-button"
                    onClick={() => navigate("/orders")}
                >
                    ← Siparişlerim
                </button>

            </header>

            <main className="order-detail-container">

                <div className="order-detail-heading">

                    <div>
                        <span className="heading-label">
                            Sipariş Detayı
                        </span>

                        <h1>
                            Sipariş #{order.id}
                        </h1>
                    </div>

                    <span
                        className={`detail-status ${getStatusClass(
    order.status
)}`}
                    >
                        {getStatusText(order.status)}
                    </span>

                </div>

                <div className="order-summary">

                    <div className="summary-item">
                        <span>Sipariş Tarihi</span>

                        <strong>
                            {new Date(
                                order.createdAt
                            ).toLocaleDateString("tr-TR")}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>Sipariş No</span>

                        <strong>
                            #{order.id}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>Toplam Ürün</span>

                        <strong>
                            {order.items?.reduce(
                                (total, item) =>
                                    total + item.quantity,
                                0
                            ) || 0}
                        </strong>
                    </div>

                </div>

                <section className="products-section">

                    <div className="section-title">
                        <h2>Sipariş Ürünleri</h2>

                        <span>
                            {order.items?.length || 0} farklı ürün
                        </span>
                    </div>

                    <div className="products-list">

                        {order.items?.map((item) => (

                            <div
                                className="detail-product"
                                key={item.id}
                            >

                                <div className="product-icon">
                                    🛍️
                                </div>

                                <div className="product-info">

                                    <h3>
                                        {item.productName}
                                    </h3>

                                    <p>
                                        Ürün No: #{item.productId}
                                    </p>

                                </div>

                                <div className="product-quantity">
                                    <span>Adet</span>
                                    <strong>
                                        {item.quantity}
                                    </strong>
                                </div>

                                <div className="product-unit-price">
                                    <span>Birim Fiyat</span>

                                    <strong>
                                        {formatPrice(
                                            item.unitPrice
                                        )}
                                    </strong>
                                </div>

                                <div className="product-total">
                                    <span>Toplam</span>

                                    <strong>
                                        {formatPrice(
                                            item.totalPrice
                                        )}
                                    </strong>
                                </div>

                            </div>

                        ))}

                    </div>

                </section>

                <section className="total-section">

                    <div className="total-row">
                        <span>Ürünler Toplamı</span>

                        <strong>
                            {formatPrice(order.totalPrice)}
                        </strong>
                    </div>

                    <div className="total-row grand-total">
                        <span>Genel Toplam</span>

                        <strong>
                            {formatPrice(order.totalPrice)}
                        </strong>
                    </div>

                </section>

                <button
                    className="return-button"
                    onClick={() => navigate("/orders")}
                >
                    ← Siparişlerime Dön
                </button>

            </main>

        </div>
    );
}

export default OrderDetail;
