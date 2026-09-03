import "./AdminOrders.css";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../services/api";

function AdminOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [activeFilter, setActiveFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // =========================================================
    // SİPARİŞLERİ GETİR
    // =========================================================

    const getOrders = async (isRefresh = false) => {
        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/Order/admin");

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(error);

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Süresi Doldu",
                    text: "Lütfen tekrar giriş yapın.",
                    confirmButtonText: "Tamam"
                });

                window.location.href = "/";
                return;
            }

            if (error.response?.status === 403) {

                setError(
                    "Bu sayfaya erişmek için admin yetkisi gereklidir."
                );

                await Swal.fire({
                    icon: "error",
                    title: "Yetkisiz Erişim",
                    text: "Bu sayfaya erişmek için admin yetkisi gereklidir.",
                    confirmButtonText: "Tamam"
                });

                return;
            }

            const message =
                error.response?.data?.message ||
                "Siparişler yüklenemedi.";

            setError(message);

            Swal.fire({
                icon: "error",
                title: "Hata",
                text: message,
                confirmButtonText: "Tamam"
            });

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };

    // =========================================================
    // İLK YÜKLEME
    // =========================================================

    useEffect(() => {
        getOrders();
    }, []);

    // =========================================================
    // DURUM YAZILARI
    // =========================================================

    const getStatusText = (status) => {

        switch (status) {

            case "Pending":
                return "Bekliyor";

            case "Confirmed":
                return "Onaylandı";

            case "Shipped":
                return "Kargoda";

            case "Delivered":
                return "Teslim Edildi";

            case "Cancelled":
                return "İptal Edildi";

            default:
                return status || "Bilinmiyor";
        }
    };

    // =========================================================
    // DURUM CSS
    // =========================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "pending";

            case "Confirmed":
                return "confirmed";

            case "Shipped":
                return "shipped";

            case "Delivered":
                return "delivered";

            case "Cancelled":
                return "cancelled";

            default:
                return "unknown";
        }
    };

    // =========================================================
    // PARA FORMAT
    // =========================================================

    const formatCurrency = (value) => {

        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY"
        }).format(Number(value) || 0);

    };

    // =========================================================
    // TARİH FORMAT
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("tr-TR");

    };

    // =========================================================
    // GRUPLANMIŞ SİPARİŞLER
    // =========================================================

    const groupedOrders = useMemo(() => {

        const groups = {
            Pending: [],
            Confirmed: [],
            Shipped: [],
            Delivered: [],
            Cancelled: []
        };

        orders.forEach((order) => {

            if (groups[order.status]) {
                groups[order.status].push(order);
            }

        });

        Object.keys(groups).forEach((status) => {

            groups[status].sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );

        });

        return groups;

    }, [orders]);

    // =========================================================
    // İSTATİSTİKLER
    // =========================================================

    const statistics = useMemo(() => {

        const total = orders.length;

        const totalRevenue = orders.reduce(
            (sum, order) => {

                if (order.status === "Cancelled") {
                    return sum;
                }

                return sum + (Number(order.totalPrice) || 0);

            },
            0
        );

        return {

            total,

            pending:
            groupedOrders.Pending.length,

            confirmed:
            groupedOrders.Confirmed.length,

            shipped:
            groupedOrders.Shipped.length,

            delivered:
            groupedOrders.Delivered.length,

            cancelled:
            groupedOrders.Cancelled.length,

            totalRevenue

        };

    }, [orders, groupedOrders]);

    // =========================================================
    // FİLTRELER
    // =========================================================

    const statusFilters = [
        {
            key: "All",
            label: "Tümü",
            icon: "🛍️",
            count: statistics.total
        },
        {
            key: "Pending",
            label: "Gelen Siparişler",
            icon: "📥",
            count: statistics.pending
        },
        {
            key: "Confirmed",
            label: "Onaylanan",
            icon: "✓",
            count: statistics.confirmed
        },
        {
            key: "Shipped",
            label: "Kargoda",
            icon: "🚚",
            count: statistics.shipped
        },
        {
            key: "Delivered",
            label: "Teslim Edildi",
            icon: "✓",
            count: statistics.delivered
        },
        {
            key: "Cancelled",
            label: "İptal Edilen",
            icon: "×",
            count: statistics.cancelled
        }
    ];

    // =========================================================
    // FİLTRELENMİŞ SİPARİŞLER
    // =========================================================

    const filteredOrders = useMemo(() => {

        let result =
            activeFilter === "All"
                ? [...orders]
                : orders.filter(
                    order =>
                        order.status === activeFilter
                );

        result.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

        const term = searchTerm
            .trim()
            .toLowerCase();

        if (term) {

            result = result.filter((order) => {

                const orderId =
                    String(order.id || "").toLowerCase();

                const userId =
                    String(order.userId || "").toLowerCase();

                const productNames =
                    order.items
                        ?.map(item =>
                            String(
                                item.productName || ""
                            ).toLowerCase()
                        )
                        .join(" ") || "";

                return (
                    orderId.includes(term) ||
                    userId.includes(term) ||
                    productNames.includes(term)
                );

            });

        }

        return result;

    }, [
        orders,
        activeFilter,
        searchTerm
    ]);

    // =========================================================
    // SİPARİŞ DURUMU GÜNCELLE
    // =========================================================

    const updateStatus = async (
        orderId,
        status
    ) => {

        const currentOrder =
            orders.find(
                order => order.id === orderId
            );

        if (!currentOrder) {
            return;
        }

        const oldStatus =
            currentOrder.status;

        if (oldStatus === status) {
            return;
        }

        const result = await Swal.fire({

            icon: "question",

            title:
                "Sipariş durumu değiştirilsin mi?",

            html: `
                <div style="font-size:15px; line-height:1.7">
                    <p>Sipariş <strong>#${orderId}</strong></p>

                    <p>
                        <span style="color:#64748b">
                            ${getStatusText(oldStatus)}
                        </span>

                        →
                        
                        <strong>
                            ${getStatusText(status)}
                        </strong>
                    </p>
                </div>
            `,

            showCancelButton: true,

            confirmButtonText:
                "Evet, Güncelle",

            cancelButtonText:
                "Vazgeç",

            confirmButtonColor:
                "#4f46e5",

            cancelButtonColor:
                "#64748b"

        });

        if (!result.isConfirmed) {
            return;
        }

        try {

            setError("");

            await api.put(
                `/Order/admin/${orderId}/status`,
                {
                    status
                }
            );

            await getOrders(true);

            setSelectedOrder((current) => {

                if (!current) {
                    return null;
                }

                return {
                    ...current,
                    status
                };

            });

            await Swal.fire({

                icon: "success",

                title:
                    "Sipariş Güncellendi",

                text:
                    `Sipariş #${orderId} artık "${getStatusText(status)}" durumunda.`,

                timer: 1600,

                showConfirmButton: false

            });

        } catch (error) {

            console.error(error);

            const message =
                error.response?.data?.message ||
                "Sipariş durumu güncellenemedi.";

            setError(message);

            Swal.fire({

                icon: "error",

                title:
                    "Güncelleme Başarısız",

                text: message,

                confirmButtonText:
                    "Tamam"

            });

        }

    };

    // =========================================================
    // YÜKLENİYOR
    // =========================================================

    if (loading) {

        return (
            <div className="admin-orders-page">

                <div className="orders-loading">

                    <div className="orders-spinner"></div>

                    <p>
                        Siparişler yükleniyor...
                    </p>

                </div>

            </div>
        );

    }

    // =========================================================
    // SAYFA
    // =========================================================

    return (

        <div className="admin-orders-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-orders-header">

                <div>

                    <div className="orders-page-label">
                        SİPARİŞ YÖNETİMİ
                    </div>

                    <h1>
                        Siparişler
                    </h1>

                    <p>
                        Mağazanızdaki tüm siparişleri
                        buradan takip ve yönetebilirsiniz.
                    </p>

                </div>

                <button
                    className="orders-refresh-button"
                    onClick={() => getOrders(true)}
                    disabled={refreshing}
                >

                    <span
                        className={
                            refreshing
                                ? "refresh-icon spinning"
                                : "refresh-icon"
                        }
                    >
                        ↻
                    </span>

                    {refreshing
                        ? "Yenileniyor..."
                        : "Yenile"}

                </button>

            </div>


            {/* =================================================
                HATA
            ================================================= */}

            {error && (

                <div className="orders-error">

                    <span className="error-icon">
                        !
                    </span>

                    <div>
                        <strong>
                            Bir hata oluştu
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                </div>

            )}


            {/* =================================================
                İSTATİSTİKLER
            ================================================= */}

            <div className="orders-statistics">

                <div className="order-stat-card">

                    <div className="order-stat-icon total">
                        🛍️
                    </div>

                    <div className="order-stat-content">

                        <span>
                            Toplam Sipariş
                        </span>

                        <strong>
                            {statistics.total}
                        </strong>

                    </div>

                </div>


                <div className="order-stat-card">

                    <div className="order-stat-icon pending">
                        📥
                    </div>

                    <div className="order-stat-content">

                        <span>
                            Gelen
                        </span>

                        <strong>
                            {statistics.pending}
                        </strong>

                    </div>

                </div>


                <div className="order-stat-card">

                    <div className="order-stat-icon confirmed">
                        ✓
                    </div>

                    <div className="order-stat-content">

                        <span>
                            Onaylanan
                        </span>

                        <strong>
                            {statistics.confirmed}
                        </strong>

                    </div>

                </div>


                <div className="order-stat-card">

                    <div className="order-stat-icon shipped">
                        🚚
                    </div>

                    <div className="order-stat-content">

                        <span>
                            Kargoda
                        </span>

                        <strong>
                            {statistics.shipped}
                        </strong>

                    </div>

                </div>


                <div className="order-stat-card">

                    <div className="order-stat-icon delivered">
                        ✓
                    </div>

                    <div className="order-stat-content">

                        <span>
                            Teslim Edilen
                        </span>

                        <strong>
                            {statistics.delivered}
                        </strong>

                    </div>

                </div>


                <div className="order-stat-card revenue-card">

                    <div className="order-stat-icon revenue">
                        ₺
                    </div>

                    <div className="order-stat-content">

                        <span>
                            Toplam Ciro
                        </span>

                        <strong>
                            {formatCurrency(
                                statistics.totalRevenue
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                SİPARİŞLER
            ================================================= */}

            <div className="orders-content-card">

                {/* ÜST BAŞLIK */}

                <div className="orders-content-header">

                    <div>

                        <h2>
                            Sipariş Listesi
                        </h2>

                        <p>
                            Siparişleri durumlarına göre
                            filtreleyebilir ve yönetebilirsiniz.
                        </p>

                    </div>

                    <div className="orders-result-count">

                        <strong>
                            {filteredOrders.length}
                        </strong>

                        <span>
                            sipariş gösteriliyor
                        </span>

                    </div>

                </div>


                {/* =================================================
                    FİLTRELER
                ================================================= */}

                <div className="orders-toolbar">

                    <div className="orders-filters">

                        {statusFilters.map((filter) => (

                            <button
                                key={filter.key}
                                className={
                                    activeFilter === filter.key
                                        ? `order-filter active ${getStatusClass(filter.key)}`
                                        : "order-filter"
                                }
                                onClick={() =>
                                    setActiveFilter(
                                        filter.key
                                    )
                                }
                            >

                                <span className="filter-icon">
                                    {filter.icon}
                                </span>

                                <span className="filter-label">
                                    {filter.label}
                                </span>

                                <span className="filter-count">
                                    {filter.count}
                                </span>

                            </button>

                        ))}

                    </div>


                    {/* ARAMA */}

                    <div className="orders-search">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Sipariş no, kullanıcı veya ürün ara..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                        />

                        {searchTerm && (

                            <button
                                className="clear-search"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                ×
                            </button>

                        )}

                    </div>

                </div>


                {/* =================================================
                    TABLO
                ================================================= */}

                <div className="orders-table-wrapper">

                    {filteredOrders.length === 0 ? (

                        <div className="orders-empty">

                            <div className="empty-icon">
                                {searchTerm
                                    ? "🔍"
                                    : "📦"}
                            </div>

                            <h3>

                                {searchTerm
                                    ? "Arama sonucu bulunamadı"
                                    : activeFilter === "All"
                                        ? "Henüz sipariş yok"
                                        : "Bu durumda sipariş yok"}

                            </h3>

                            <p>

                                {searchTerm
                                    ? "Farklı bir sipariş numarası, kullanıcı veya ürün adı deneyin."
                                    : "Seçtiğiniz filtreye ait herhangi bir sipariş bulunmuyor."}

                            </p>

                        </div>

                    ) : (

                        <table className="orders-table">

                            <thead>

                            <tr>

                                <th>
                                    SİPARİŞ
                                </th>

                                <th>
                                    KULLANICI
                                </th>

                                <th>
                                    TARİH
                                </th>

                                <th>
                                    ÜRÜNLER
                                </th>

                                <th>
                                    TOPLAM
                                </th>

                                <th>
                                    DURUM
                                </th>

                                <th>
                                    İŞLEM
                                </th>

                            </tr>

                            </thead>

                            <tbody>

                            {filteredOrders.map(
                                (order) => (

                                    <tr
                                        key={order.id}
                                        className="order-table-row"
                                    >

                                        {/* SİPARİŞ */}

                                        <td>

                                            <div className="order-number">

                                                    <span className="order-hash">
                                                        #
                                                    </span>

                                                <strong>
                                                    {order.id}
                                                </strong>

                                            </div>

                                        </td>


                                        {/* KULLANICI */}

                                        <td>

                                            <div className="order-user">

                                                <div className="user-avatar">
                                                    {String(
                                                        order.userId
                                                    ).charAt(0)}
                                                </div>

                                                <div>

                                                    <strong>
                                                        Kullanıcı
                                                    </strong>

                                                    <span>
                                                            ID: {order.userId}
                                                        </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* TARİH */}

                                        <td>

                                            <div className="order-date">

                                                <strong>
                                                    {order.createdAt
                                                        ? new Date(
                                                            order.createdAt
                                                        ).toLocaleDateString(
                                                            "tr-TR"
                                                        )
                                                        : "-"}
                                                </strong>

                                                <span>
                                                        {order.createdAt
                                                            ? new Date(
                                                                order.createdAt
                                                            ).toLocaleTimeString(
                                                                "tr-TR",
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                }
                                                            )
                                                            : ""}
                                                    </span>

                                            </div>

                                        </td>


                                        {/* ÜRÜNLER */}

                                        <td>

                                            <div className="order-products">

                                                <strong>
                                                    {order.items?.length || 0}
                                                </strong>

                                                <span>
                                                        ürün
                                                    </span>

                                            </div>

                                        </td>


                                        {/* TOPLAM */}

                                        <td>

                                            <strong className="order-total">

                                                {formatCurrency(
                                                    order.totalPrice
                                                )}

                                            </strong>

                                        </td>


                                        {/* DURUM */}

                                        <td>

                                                <span
                                                    className={`order-status-badge ${getStatusClass(
                                                        order.status
                                                    )}`}
                                                >

                                                    <span className="status-dot"></span>

                                                    {getStatusText(
                                                        order.status
                                                    )}

                                                </span>

                                        </td>


                                        {/* İŞLEM */}

                                        <td>

                                            <button
                                                className="order-detail-button"
                                                onClick={() =>
                                                    setSelectedOrder(
                                                        order
                                                    )
                                                }
                                            >

                                                    <span>
                                                        👁
                                                    </span>

                                                Detay

                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>


            {/* =================================================
                SİPARİŞ DETAY MODALI
            ================================================= */}

            {selectedOrder && (

                <div
                    className="order-modal-overlay"
                    onClick={() =>
                        setSelectedOrder(null)
                    }
                >

                    <div
                        className="order-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="order-modal-header">

                            <div>

                                <span className="modal-label">
                                    SİPARİŞ DETAYI
                                </span>

                                <h2>
                                    Sipariş #{selectedOrder.id}
                                </h2>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedOrder(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* DURUM */}

                        <div
                            className={`modal-status-banner ${getStatusClass(
                                selectedOrder.status
                            )}`}
                        >

                            <div>

                                <span className="modal-status-title">
                                    Mevcut Durum
                                </span>

                                <strong>
                                    {getStatusText(
                                        selectedOrder.status
                                    )}
                                </strong>

                            </div>

                            <span className="modal-status-dot"></span>

                        </div>


                        {/* BİLGİLER */}

                        <div className="order-info-grid">

                            <div className="order-info-box">

                                <span>
                                    KULLANICI
                                </span>

                                <strong>
                                    Kullanıcı #{selectedOrder.userId}
                                </strong>

                            </div>


                            <div className="order-info-box">

                                <span>
                                    SİPARİŞ TARİHİ
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedOrder.createdAt
                                    )}
                                </strong>

                            </div>


                            <div className="order-info-box">

                                <span>
                                    TOPLAM TUTAR
                                </span>

                                <strong className="modal-total">
                                    {formatCurrency(
                                        selectedOrder.totalPrice
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* ÜRÜNLER */}

                        <div className="modal-products-section">

                            <div className="modal-section-title">

                                <h3>
                                    Sipariş Ürünleri
                                </h3>

                                <span>
                                    {selectedOrder.items?.length || 0} kalem
                                </span>

                            </div>


                            <div className="modal-products-list">

                                {selectedOrder.items?.map(
                                    (item) => (

                                        <div
                                            className="modal-product"
                                            key={item.id}
                                        >

                                            <div className="modal-product-number">
                                                #
                                            </div>

                                            <div className="modal-product-info">

                                                <strong>
                                                    {item.productName}
                                                </strong>

                                                <span>
                                                    {item.quantity} adet ×{" "}
                                                    {formatCurrency(
                                                        item.unitPrice
                                                    )}
                                                </span>

                                            </div>

                                            <strong className="modal-product-total">

                                                {formatCurrency(
                                                    item.totalPrice
                                                )}

                                            </strong>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>


                        {/* DURUM DEĞİŞTİR */}

                        <div className="modal-status-section">

                            <label>
                                Sipariş Durumunu Güncelle
                            </label>

                            <select
                                value={
                                    selectedOrder.status
                                }
                                onChange={(e) =>
                                    updateStatus(
                                        selectedOrder.id,
                                        e.target.value
                                    )
                                }
                            >

                                <option value="Pending">
                                    Bekliyor
                                </option>

                                <option value="Confirmed">
                                    Onaylandı
                                </option>

                                <option value="Shipped">
                                    Kargoda
                                </option>

                                <option value="Delivered">
                                    Teslim Edildi
                                </option>

                                <option value="Cancelled">
                                    İptal Edildi
                                </option>

                            </select>

                        </div>


                        {/* FOOTER */}

                        <div className="order-modal-footer">

                            <button
                                onClick={() =>
                                    setSelectedOrder(null)
                                }
                            >
                                Kapat
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default AdminOrders;