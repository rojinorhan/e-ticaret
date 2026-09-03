import "./Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import api from "../../../services/api";

function Dashboard() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    /*
    =========================================
    VERİLERİ GETİR
    =========================================
    */

    const loadDashboard = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

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

            setProducts(
                Array.isArray(productsResponse.data)
                    ? productsResponse.data
                    : []
            );

            setCategories(
                Array.isArray(categoriesResponse.data)
                    ? categoriesResponse.data
                    : []
            );

            setOrders(
                Array.isArray(ordersResponse.data)
                    ? ordersResponse.data
                    : []
            );

            setUsers(
                Array.isArray(usersResponse.data)
                    ? usersResponse.data
                    : []
            );

        } catch (err) {

            console.error("Dashboard verileri alınamadı:", err);

            if (err.response?.status === 401) {
                setError(
                    "Oturumunuz sona ermiş olabilir. Lütfen tekrar giriş yapın."
                );
            }
            else if (err.response?.status === 403) {
                setError(
                    "Bu sayfayı görüntüleme yetkiniz bulunmuyor."
                );
            }
            else {
                setError(
                    "Dashboard verileri alınırken bir hata oluştu."
                );
            }

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    /*
    =========================================
    İLK YÜKLEME + OTOMATİK YENİLEME
    =========================================
    */

    useEffect(() => {

        loadDashboard();

        const interval = setInterval(() => {
            loadDashboard(true);
        }, 30000);

        return () => clearInterval(interval);

    }, []);


    /*
    =========================================
    PARA FORMAT
    =========================================
    */

    const formatCurrency = (value) => {

        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY"
        }).format(Number(value) || 0);

    };


    /*
    =========================================
    TARİH KEY
    =========================================
    */

    const getDateKey = (date) => {

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    /*
    =========================================
    DURUM TEXT
    =========================================
    */

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


    /*
    =========================================
    DURUM CLASS
    =========================================
    */

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


    /*
    =========================================
    TOPLAM CİRO
    =========================================
    */

    const totalRevenue = useMemo(() => {

        return orders.reduce((total, order) => {

            if (order.status === "Cancelled") {
                return total;
            }

            return total + (
                Number(order.totalPrice) || 0
            );

        }, 0);

    }, [orders]);


    /*
    =========================================
    BUGÜN
    =========================================
    */

    const todayKey = getDateKey(new Date());


    /*
    =========================================
    BUGÜNÜN SATIŞI
    =========================================
    */

    const todayRevenue = useMemo(() => {

        return orders.reduce((total, order) => {

            if (
                order.status === "Cancelled" ||
                !order.createdAt
            ) {
                return total;
            }

            const orderDate = new Date(order.createdAt);

            if (getDateKey(orderDate) === todayKey) {
                return total + (
                    Number(order.totalPrice) || 0
                );
            }

            return total;

        }, 0);

    }, [orders, todayKey]);


    /*
    =========================================
    DÜNÜN SATIŞI
    =========================================
    */

    const yesterdayRevenue = useMemo(() => {

        const yesterday = new Date();

        yesterday.setDate(
            yesterday.getDate() - 1
        );

        const yesterdayKey = getDateKey(yesterday);

        return orders.reduce((total, order) => {

            if (
                order.status === "Cancelled" ||
                !order.createdAt
            ) {
                return total;
            }

            const orderDate = new Date(order.createdAt);

            if (getDateKey(orderDate) === yesterdayKey) {
                return total + (
                    Number(order.totalPrice) || 0
                );
            }

            return total;

        }, 0);

    }, [orders]);


    /*
    =========================================
    BUGÜN / DÜN DEĞİŞİM
    =========================================
    */

    const revenueChange = useMemo(() => {

        if (yesterdayRevenue === 0) {

            if (todayRevenue > 0) {
                return 100;
            }

            return 0;
        }

        return (
            (
                (todayRevenue - yesterdayRevenue) /
                yesterdayRevenue
            ) * 100
        );

    }, [
        todayRevenue,
        yesterdayRevenue
    ]);


    /*
    =========================================
    SON 7 GÜN SATIŞ GRAFİĞİ
    =========================================
    */

    const salesData = useMemo(() => {

        const data = [];

        for (let i = 6; i >= 0; i--) {

            const date = new Date();

            date.setHours(0, 0, 0, 0);

            date.setDate(
                date.getDate() - i
            );

            const key = getDateKey(date);

            const dailyRevenue = orders.reduce(
                (total, order) => {

                    if (
                        order.status === "Cancelled" ||
                        !order.createdAt
                    ) {
                        return total;
                    }

                    const orderDate =
                        new Date(order.createdAt);

                    if (
                        getDateKey(orderDate) === key
                    ) {
                        return total + (
                            Number(order.totalPrice) || 0
                        );
                    }

                    return total;

                },
                0
            );

            data.push({

                date: key,

                label: date.toLocaleDateString(
                    "tr-TR",
                    {
                        day: "2-digit",
                        month: "2-digit"
                    }
                ),

                weekday: date.toLocaleDateString(
                    "tr-TR",
                    {
                        weekday: "short"
                    }
                ),

                revenue: dailyRevenue

            });

        }

        return data;

    }, [orders]);


    /*
    =========================================
    SON 7 GÜN TOPLAMI
    =========================================
    */

    const weeklyRevenue = useMemo(() => {

        return salesData.reduce(
            (sum, item) =>
                sum + item.revenue,
            0
        );

    }, [salesData]);


    /*
    =========================================
    TOPLAM SİPARİŞ
    =========================================
    */

    const totalOrders = orders.length;


    /*
    =========================================
    BUGÜNKÜ SİPARİŞ SAYISI
    =========================================
    */

    const todayOrders = useMemo(() => {

        return orders.filter(order => {

            if (!order.createdAt) {
                return false;
            }

            return (
                getDateKey(
                    new Date(order.createdAt)
                ) === todayKey
            );

        }).length;

    }, [orders, todayKey]);


    /*
    =========================================
    SİPARİŞ DURUMLARI
    =========================================
    */

    const statusCounts = useMemo(() => {

        const result = {
            Pending: 0,
            Confirmed: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        orders.forEach(order => {

            if (
                result[order.status] !== undefined
            ) {
                result[order.status]++;
            }

        });

        return result;

    }, [orders]);


    /*
    =========================================
    SİPARİŞ DURUM YÜZDELERİ
    =========================================
    */

    const statusPercentages = useMemo(() => {

        const total = orders.length;

        if (total === 0) {

            return {
                Pending: 0,
                Confirmed: 0,
                Shipped: 0,
                Delivered: 0,
                Cancelled: 0
            };

        }

        return {
            Pending:
                (statusCounts.Pending / total) * 100,

            Confirmed:
                (statusCounts.Confirmed / total) * 100,

            Shipped:
                (statusCounts.Shipped / total) * 100,

            Delivered:
                (statusCounts.Delivered / total) * 100,

            Cancelled:
                (statusCounts.Cancelled / total) * 100
        };

    }, [orders.length, statusCounts]);


    /*
    =========================================
    KRİTİK STOK
    =========================================
    */

    const lowStockProducts = useMemo(() => {

        return [...products]
            .filter(
                product =>
                    Number(product.stock) <= 5
            )
            .sort(
                (a, b) =>
                    Number(a.stock) -
                    Number(b.stock)
            )
            .slice(0, 5);

    }, [products]);


    const criticalStockCount = useMemo(() => {

        return products.filter(
            product =>
                Number(product.stock) <= 5
        ).length;

    }, [products]);


    const outOfStockCount = useMemo(() => {

        return products.filter(
            product =>
                Number(product.stock) === 0
        ).length;

    }, [products]);


    /*
    =========================================
    SON SİPARİŞLER
    =========================================
    */

    const recentOrders = useMemo(() => {

        return [...orders]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);

    }, [orders]);


    /*
    =========================================
    EN ÇOK SATAN ÜRÜNLER
    =========================================
    */

    const topProducts = useMemo(() => {

        const productMap = {};

        orders.forEach(order => {

            if (
                order.status === "Cancelled" ||
                !Array.isArray(order.items)
            ) {
                return;
            }

            order.items.forEach(item => {

                const productId = item.productId;

                if (!productMap[productId]) {

                    productMap[productId] = {
                        id: productId,
                        name:
                            item.productName ||
                            `Ürün #${productId}`,
                        quantity: 0,
                        revenue: 0
                    };

                }

                productMap[productId].quantity +=
                    Number(item.quantity) || 0;

                productMap[productId].revenue +=
                    Number(item.totalPrice) ||
                    (
                        (Number(item.unitPrice) || 0) *
                        (Number(item.quantity) || 0)
                    );

            });

        });

        return Object.values(productMap)
            .sort(
                (a, b) =>
                    b.quantity - a.quantity
            )
            .slice(0, 5);

    }, [orders]);


    /*
    =========================================
    TOPLAM SATILAN ÜRÜN ADEDİ
    =========================================
    */

    const totalSoldItems = useMemo(() => {

        return topProducts.reduce(
            (sum, product) =>
                sum + product.quantity,
            0
        );

    }, [topProducts]);


    /*
    =========================================
    TARİH FORMAT
    =========================================
    */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "tr-TR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    };


    /*
    =========================================
    SAAT FORMAT
    =========================================
    */

    const formatTime = (date) => {

        if (!date) {
            return "";
        }

        return new Date(date).toLocaleTimeString(
            "tr-TR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    /*
    =========================================
    YÜZDE FORMAT
    =========================================
    */

    const formatPercentage = (value) => {

        return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

    };


    /*
    =========================================
    LOADING
    =========================================
    */

    if (loading) {

        return (
            <div className="dashboard-loading">

                <div className="dashboard-spinner"></div>

                <p>
                    Dashboard yükleniyor...
                </p>

            </div>
        );

    }


    /*
    =========================================
    ERROR
    =========================================
    */

    if (error) {

        return (
            <div className="dashboard-error">

                <div className="dashboard-error-icon">
                    !
                </div>

                <h3>
                    Bir hata oluştu
                </h3>

                <p>
                    {error}
                </p>

                <button
                    className="dashboard-retry-button"
                    onClick={() => loadDashboard()}
                >
                    Tekrar Dene
                </button>

            </div>
        );

    }


    return (

        <div className="dashboard-page">

            {/* HEADER */}

            <div className="dashboard-heading">

                <div>

                    <div className="dashboard-title-row">

                        <div className="dashboard-title-icon">
                            ✦
                        </div>

                        <div>

                            <h1>
                                Dashboard
                            </h1>

                            <p>
                                Mağazanızın genel performansını ve satış durumunu takip edin.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="dashboard-heading-actions">

                    <div className="live-indicator">
                        <span></span>
                        Canlı veri
                    </div>

                    <button
                        className="dashboard-refresh-button"
                        onClick={() => loadDashboard(true)}
                        disabled={refreshing}
                    >
                        {refreshing
                            ? "⟳ Güncelleniyor..."
                            : "↻ Yenile"
                        }
                    </button>

                </div>

            </div>


            {/* ANA İSTATİSTİKLER */}

            <div className="dashboard-stats">

                <div className="dashboard-stat-card product-stat">

                    <div className="dashboard-stat-icon product-icon">
                        📦
                    </div>

                    <div className="dashboard-stat-content">

                        <span>
                            Toplam Ürün
                        </span>

                        <strong>
                            {products.length}
                        </strong>

                        <small>
                            Mağazadaki ürünler
                        </small>

                    </div>

                </div>


                <div className="dashboard-stat-card category-stat">

                    <div className="dashboard-stat-icon category-icon">
                        🗂
                    </div>

                    <div className="dashboard-stat-content">

                        <span>
                            Kategoriler
                        </span>

                        <strong>
                            {categories.length}
                        </strong>

                        <small>
                            Aktif kategori
                        </small>

                    </div>

                </div>


                <div className="dashboard-stat-card order-stat">

                    <div className="dashboard-stat-icon order-icon">
                        🛒
                    </div>

                    <div className="dashboard-stat-content">

                        <span>
                            Toplam Sipariş
                        </span>

                        <strong>
                            {totalOrders}
                        </strong>

                        <small>
                            Bugün {todayOrders} sipariş
                        </small>

                    </div>

                </div>


                <div className="dashboard-stat-card user-stat">

                    <div className="dashboard-stat-icon user-icon">
                        👥
                    </div>

                    <div className="dashboard-stat-content">

                        <span>
                            Kullanıcılar
                        </span>

                        <strong>
                            {users.length}
                        </strong>

                        <small>
                            Kayıtlı kullanıcı
                        </small>

                    </div>

                </div>


                <div className="dashboard-stat-card revenue-card">

                    <div className="dashboard-stat-icon revenue-icon">
                        ₺
                    </div>

                    <div className="dashboard-stat-content">

                        <span>
                            Toplam Ciro
                        </span>

                        <strong>
                            {formatCurrency(totalRevenue)}
                        </strong>

                        <small>
                            İptal edilenler hariç
                        </small>

                    </div>

                </div>

            </div>


            {/* SATIŞ ÖZET */}

            <div className="dashboard-sales-summary">

                <div className="sales-summary-card">

                    <div className="sales-summary-top">

                        <div>
                            <span>
                                Son 7 Gün
                            </span>

                            <small>
                                Satış toplamı
                            </small>
                        </div>

                        <div className="sales-summary-icon">
                            📈
                        </div>

                    </div>

                    <strong>
                        {formatCurrency(weeklyRevenue)}
                    </strong>

                    <div className="summary-bottom">
                        <span>
                            7 günlük performans
                        </span>
                    </div>

                </div>


                <div className="sales-summary-card today-card">

                    <div className="sales-summary-top">

                        <div>
                            <span>
                                Bugünkü Satış
                            </span>

                            <small>
                                Güncel satış
                            </small>
                        </div>

                        <div className="sales-summary-icon">
                            💰
                        </div>

                    </div>

                    <strong>
                        {formatCurrency(todayRevenue)}
                    </strong>

                    <div className="summary-bottom">
                        <span>
                            {todayOrders} sipariş
                        </span>
                    </div>

                </div>


                <div className="sales-summary-card">

                    <div className="sales-summary-top">

                        <div>
                            <span>
                                Günlük Değişim
                            </span>

                            <small>
                                Düne göre
                            </small>
                        </div>

                        <div
                            className={
                                `change-icon ${
                                    revenueChange >= 0
                                        ? "positive"
                                        : "negative"
                                }`
                            }
                        >
                            {revenueChange >= 0 ? "↑" : "↓"}
                        </div>

                    </div>

                    <strong
                        className={
                            revenueChange >= 0
                                ? "change-positive"
                                : "change-negative"
                        }
                    >
                        {formatPercentage(revenueChange)}
                    </strong>

                    <div className="summary-bottom">

                        <span>
                            Dün: {formatCurrency(yesterdayRevenue)}
                        </span>

                    </div>

                </div>

            </div>


            {/* GRAFİK + DURUM */}

            <div className="dashboard-main-grid">

                {/* SATIŞ GRAFİĞİ */}

                <div className="dashboard-panel sales-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>
                                Satış Performansı
                            </h2>

                            <span>
                                Son 7 günlük satış hareketleri
                            </span>

                        </div>

                        <div className="sales-total-wrapper">

                            <span>
                                7 Günlük
                            </span>

                            <strong>
                                {formatCurrency(weeklyRevenue)}
                            </strong>

                        </div>

                    </div>


                    <div className="dashboard-chart">

                        {weeklyRevenue === 0 ? (

                            <div className="dashboard-empty">
                                <div className="empty-chart-icon">
                                    📈
                                </div>

                                <strong>
                                    Henüz satış verisi yok
                                </strong>

                                <span>
                                    Satışlar oluştuğunda grafik burada görünecek.
                                </span>
                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <AreaChart
                                    data={salesData}
                                    margin={{
                                        top: 15,
                                        right: 10,
                                        left: 5,
                                        bottom: 5
                                    }}
                                >

                                    <defs>

                                        <linearGradient
                                            id="salesGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >

                                            <stop
                                                offset="0%"
                                                stopOpacity={0.30}
                                            />

                                            <stop
                                                offset="100%"
                                                stopOpacity={0.02}
                                            />

                                        </linearGradient>

                                    </defs>


                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#eef0f4"
                                    />


                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fontSize: 11
                                        }}
                                    />


                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fontSize: 10
                                        }}
                                        tickFormatter={
                                            value =>
                                                `${value.toLocaleString("tr-TR")} ₺`
                                        }
                                    />


                                    <Tooltip
                                        cursor={{
                                            stroke: "#dbeafe",
                                            strokeWidth: 2
                                        }}
                                        formatter={
                                            value => [
                                                formatCurrency(value),
                                                "Satış"
                                            ]
                                        }
                                        labelFormatter={
                                            label =>
                                                `Tarih: ${label}`
                                        }
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow:
                                                "0 10px 30px rgba(0,0,0,0.08)"
                                        }}
                                    />


                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        fill="url(#salesGradient)"
                                        dot={{
                                            r: 4,
                                            strokeWidth: 2,
                                            fill: "#ffffff"
                                        }}
                                        activeDot={{
                                            r: 7,
                                            strokeWidth: 3
                                        }}
                                    />

                                </AreaChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>


                {/* SİPARİŞ DURUMLARI */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>
                                Sipariş Durumları
                            </h2>

                            <span>
                                {totalOrders} siparişin dağılımı
                            </span>

                        </div>

                    </div>


                    <div className="status-list">

                        {[
                            "Pending",
                            "Confirmed",
                            "Shipped",
                            "Delivered",
                            "Cancelled"
                        ].map(status => (

                            <div
                                className="status-row"
                                key={status}
                            >

                                <div className="status-name">

                                    <span
                                        className={
                                            `status-dot ${getStatusClass(status)}`
                                        }
                                    />

                                    <span>
                                        {getStatusText(status)}
                                    </span>

                                </div>


                                <div className="status-progress-area">

                                    <div className="status-progress">

                                        <div
                                            className={
                                                `status-progress-bar ${getStatusClass(status)}`
                                            }
                                            style={{
                                                width:
                                                    `${statusPercentages[status]}%`
                                            }}
                                        />

                                    </div>

                                </div>


                                <strong>
                                    {statusCounts[status]}
                                </strong>


                                <span className="status-percentage">
                                    {statusPercentages[status].toFixed(0)}%
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

            </div>


            {/* ALT GRID */}

            <div className="dashboard-bottom-grid">

                {/* SON SİPARİŞLER */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>
                                Son Siparişler
                            </h2>

                            <span>
                                Mağazanızdaki son işlemler
                            </span>

                        </div>

                        <div className="panel-count">
                            {totalOrders}
                        </div>

                    </div>


                    <div className="recent-orders">

                        {recentOrders.length === 0 ? (

                            <div className="dashboard-empty">
                                Henüz sipariş bulunmuyor.
                            </div>

                        ) : (

                            recentOrders.map(order => (

                                <div
                                    className="recent-order"
                                    key={order.id}
                                >

                                    <div className="recent-order-icon">
                                        🛒
                                    </div>


                                    <div className="recent-order-info">

                                        <strong>
                                            Sipariş #{order.id}
                                        </strong>

                                        <span>
                                            Kullanıcı #{order.userId}
                                        </span>

                                    </div>


                                    <div className="recent-order-date">

                                        <strong>
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </strong>

                                        <span>
                                            {formatTime(
                                                order.createdAt
                                            )}
                                        </span>

                                    </div>


                                    <div className="recent-order-price">

                                        {formatCurrency(
                                            order.totalPrice
                                        )}

                                    </div>


                                    <span
                                        className={
                                            `dashboard-status-badge ${
                                                getStatusClass(
                                                    order.status
                                                )
                                            }`
                                        }
                                    >
                                        {getStatusText(
                                            order.status
                                        )}
                                    </span>

                                </div>

                            ))

                        )}

                    </div>

                </div>


                {/* EN ÇOK SATAN ÜRÜNLER */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>
                                En Çok Satanlar
                            </h2>

                            <span>
                                Siparişlerde en çok tercih edilenler
                            </span>

                        </div>

                    </div>


                    <div className="top-products-list">

                        {topProducts.length === 0 ? (

                            <div className="dashboard-empty">
                                Henüz satış bulunmuyor.
                            </div>

                        ) : (

                            topProducts.map(
                                (product, index) => (

                                    <div
                                        className="top-product-item"
                                        key={product.id}
                                    >

                                        <div className="top-product-rank">
                                            #{index + 1}
                                        </div>


                                        <div className="top-product-info">

                                            <strong>
                                                {product.name}
                                            </strong>

                                            <span>
                                                {product.quantity} adet satıldı
                                            </span>

                                        </div>


                                        <div className="top-product-revenue">

                                            {formatCurrency(
                                                product.revenue
                                            )}

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>


                    {topProducts.length > 0 && (

                        <div className="top-products-footer">

                            <span>
                                Toplam satılan
                            </span>

                            <strong>
                                {totalSoldItems} adet
                            </strong>

                        </div>

                    )}

                </div>

            </div>


            {/* KRİTİK STOK + ÖZET */}

            <div className="dashboard-extra-grid">

                {/* KRİTİK STOK */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>
                                Kritik Stok
                            </h2>

                            <span>
                                Stok seviyesi 5 ve altında olan ürünler
                            </span>

                        </div>

                        {criticalStockCount > 0 && (

                            <div className="critical-stock-badge">
                                ⚠ {criticalStockCount} ürün
                            </div>

                        )}

                    </div>


                    <div className="low-stock-list">

                        {lowStockProducts.length === 0 ? (

                            <div className="dashboard-empty">

                                <div className="stock-success-icon">
                                    ✓
                                </div>

                                <strong>
                                    Stok durumu iyi
                                </strong>

                                <span>
                                    Kritik seviyede ürün bulunmuyor.
                                </span>

                            </div>

                        ) : (

                            lowStockProducts.map(
                                product => (

                                    <div
                                        className="low-stock-item"
                                        key={product.id}
                                    >

                                        <div className="low-stock-info">

                                            <strong>
                                                {product.name}
                                            </strong>

                                            <span>
                                                Ürün ID: #{product.id}
                                            </span>

                                        </div>


                                        <div
                                            className={
                                                Number(product.stock) === 0
                                                    ? "stock-count out-of-stock"
                                                    : "stock-count"
                                            }
                                        >

                                            {product.stock}

                                            <small>
                                                {Number(product.stock) === 0
                                                    ? "Tükendi"
                                                    : "Adet"
                                                }
                                            </small>

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>


                {/* MAĞAZA ÖZETİ */}

                <div className="dashboard-panel store-summary-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>
                                Mağaza Özeti
                            </h2>

                            <span>
                                Güncel mağaza istatistikleri
                            </span>

                        </div>

                    </div>


                    <div className="store-summary">

                        <div className="store-summary-row">

                            <div>
                                <span className="summary-icon blue">
                                    📦
                                </span>

                                <span>
                                    Kritik stok
                                </span>
                            </div>

                            <strong>
                                {criticalStockCount}
                            </strong>

                        </div>


                        <div className="store-summary-row">

                            <div>
                                <span className="summary-icon red">
                                    🚨
                                </span>

                                <span>
                                    Stokta olmayan
                                </span>
                            </div>

                            <strong>
                                {outOfStockCount}
                            </strong>

                        </div>


                        <div className="store-summary-row">

                            <div>
                                <span className="summary-icon green">
                                    ✓
                                </span>

                                <span>
                                    Teslim edilen
                                </span>
                            </div>

                            <strong>
                                {statusCounts.Delivered}
                            </strong>

                        </div>


                        <div className="store-summary-row">

                            <div>
                                <span className="summary-icon purple">
                                    👥
                                </span>

                                <span>
                                    Kullanıcı
                                </span>
                            </div>

                            <strong>
                                {users.length}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Dashboard;