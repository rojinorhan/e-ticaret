import "./Cart.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);

    useEffect(() => {
        getCart();
    }, []);

    // =========================
    // SEPETİ GETİR
    // =========================
    const getCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/Cart");

            setCart(response.data);
        } catch (err) {
            console.error("Sepet alınamadı:", err);

            if (err.response?.status === 401) {
                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Sepetinizi görüntülemek için giriş yapmalısınız.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Sepet yüklenirken bir hata oluştu."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // TOPLAM TUTAR
    // =========================
    const getTotal = () => {
        if (!cart?.items) {
            return 0;
        }

        return cart.items.reduce(
            (total, item) =>
                total + Number(item.totalPrice || 0),
            0
        );
    };

    // =========================
    // TOPLAM ÜRÜN ADEDİ
    // =========================
    const getTotalQuantity = () => {
        if (!cart?.items) {
            return 0;
        }

        return cart.items.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );
    };

    // =========================
    // ÖDENECEK SON TUTAR
    // =========================
    const getFinalTotal = () => {
        if (
            appliedCoupon?.success &&
            appliedCoupon?.finalAmount !== undefined
        ) {
            return Number(appliedCoupon.finalAmount);
        }

        return getTotal();
    };

    // =========================
    // KUPON UYGULA
    // =========================
    const applyCoupon = async () => {
        const code = couponCode.trim();

        if (!code) {
            await Swal.fire({
                icon: "warning",
                title: "Kupon Kodu Gerekli",
                text: "Lütfen bir kupon kodu giriniz.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        try {
            setCouponLoading(true);

            const response = await api.post(
                "/Coupon/apply",
                {
                    code: code
                }
            );

            const result = response.data;

            if (!result.success) {
                setAppliedCoupon(null);

                await Swal.fire({
                    icon: "error",
                    title: "Kupon Uygulanamadı",
                    text:
                        result.message ||
                        "Kupon uygulanırken bir hata oluştu.",
                    confirmButtonText: "Tamam",
                    confirmButtonColor: "#4f46e5"
                });

                return;
            }

            setAppliedCoupon(result);

            await Swal.fire({
                icon: "success",
                title: "Kupon Uygulandı",
                text:
                    result.message ||
                    "Kupon başarıyla uygulandı.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#16a34a"
            });
        } catch (err) {
            console.error("Kupon uygulanamadı:", err);

            setAppliedCoupon(null);

            await Swal.fire({
                icon: "error",
                title: "Hata",
                text:
                    err.response?.data?.message ||
                    err.response?.data?.Message ||
                    "Kupon uygulanırken bir hata oluştu.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#dc2626"
            });
        } finally {
            setCouponLoading(false);
        }
    };

    // =========================
    // KUPONU KALDIR
    // =========================
    const removeCoupon = async () => {
        setAppliedCoupon(null);
        setCouponCode("");

        await Swal.fire({
            icon: "info",
            title: "Kupon Kaldırıldı",
            text: "Kupon indirimi sepetinizden kaldırıldı.",
            confirmButtonText: "Tamam",
            confirmButtonColor: "#4f46e5"
        });
    };

    // =========================
    // ADET GÜNCELLE
    // =========================
    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }

        try {
            await api.put(
                `/Cart/items/${itemId}`,
                {
                    quantity: newQuantity
                }
            );

            setAppliedCoupon(null);

            await getCart();
        } catch (err) {
            console.error(
                "Ürün adedi güncellenemedi:",
                err
            );

            await Swal.fire({
                icon: "error",
                title: "İşlem Başarısız",
                text:
                    err.response?.data?.message ||
                    err.response?.data?.Message ||
                    "Ürün adedi güncellenemedi.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#dc2626"
            });
        }
    };

    // =========================
    // ÜRÜNÜ SEPETTEN SİL
    // =========================
    const removeItem = async (itemId) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Ürün Kaldırılsın mı?",
            text: "Bu ürün sepetinizden kaldırılacak.",
            showCancelButton: true,
            confirmButtonText: "Evet, Kaldır",
            cancelButtonText: "Vazgeç",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await api.delete(
                `/Cart/items/${itemId}`
            );

            setAppliedCoupon(null);

            await getCart();

            await Swal.fire({
                icon: "success",
                title: "Ürün Kaldırıldı",
                text: "Ürün sepetinizden kaldırıldı.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#16a34a"
            });
        } catch (err) {
            console.error(
                "Ürün silinemedi:",
                err
            );

            await Swal.fire({
                icon: "error",
                title: "Hata",
                text:
                    err.response?.data?.message ||
                    err.response?.data?.Message ||
                    "Ürün sepetten kaldırılırken hata oluştu.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#dc2626"
            });
        }
    };

    // =========================
    // SEPETİ TEMİZLE
    // =========================
    const clearCart = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Sepet Temizlensin mi?",
            text: "Sepetinizdeki tüm ürünler kaldırılacak.",
            showCancelButton: true,
            confirmButtonText: "Evet, Temizle",
            cancelButtonText: "Vazgeç",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await api.delete("/Cart");

            setAppliedCoupon(null);
            setCouponCode("");

            await getCart();

            await Swal.fire({
                icon: "success",
                title: "Sepet Temizlendi",
                text: "Sepetiniz başarıyla temizlendi.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#16a34a"
            });
        } catch (err) {
            console.error(
                "Sepet temizlenemedi:",
                err
            );

            await Swal.fire({
                icon: "error",
                title: "Hata",
                text:
                    err.response?.data?.message ||
                    err.response?.data?.Message ||
                    "Sepet temizlenirken bir hata oluştu.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#dc2626"
            });
        }
    };

    // =========================
    // ÖDEMEYE GEÇ
    // =========================
    const createOrder = async () => {
        if (!cart?.items || cart.items.length === 0) {
            await Swal.fire({
                icon: "warning",
                title: "Sepetiniz Boş",
                text:
                    "Ödeme işlemine geçebilmek için sepetinizde ürün bulunmalıdır.",
                confirmButtonText: "Ürünleri Keşfet",
                confirmButtonColor: "#4f46e5"
            });

            navigate("/home");
            return;
        }

        const finalTotal = getFinalTotal();

        const result = await Swal.fire({
            icon: "question",
            title: "Ödemeye geçilsin mi?",
            html: `
<div style="font-size:15px; line-height:1.8;">
    <p>
    <strong>${getTotalQuantity()}</strong>
ürün için ödeme sayfasına yönlendirileceksiniz.
</p>

<p>
    Ara Toplam:
    <strong>
        ${getTotal().toLocaleString(
        "tr-TR",
        {
            style: "currency",
            currency: "TRY"
        }
    )}
    </strong>
</p>

${
    appliedCoupon?.success
        ? `
                                <p style="color:#16a34a;">
                                    Kupon İndirimi:
                                    <strong>
                                        -${Number(
            appliedCoupon.discountAmount
        ).toLocaleString(
            "tr-TR",
            {
                style: "currency",
                currency: "TRY"
            }
        )}
                                    </strong>
                                </p>
                            `
        : ""
}

<p>
    Ödenecek Tutar:
    <strong>
        ${finalTotal.toLocaleString(
        "tr-TR",
        {
            style: "currency",
            currency: "TRY"
        }
    )}
    </strong>
</p>

<p style="font-size:13px; color:#64748b;">
    Siparişiniz ödeme başarıyla tamamlandıktan sonra oluşturulacaktır.
</p>
</div>
`,
            showCancelButton: true,
            confirmButtonText: "Ödemeye Geç",
            cancelButtonText: "Vazgeç",
            confirmButtonColor: "#4f46e5",
            cancelButtonColor: "#64748b"
        });

        if (!result.isConfirmed) {
            return;
        }

        /*
         * Kupon kodunu ödeme sayfasına taşımak için
         * sessionStorage kullanıyoruz.
         *
         * ÖNEMLİ:
         * Burada indirim tutarını göndermiyoruz.
         * Sadece kupon kodunu gönderiyoruz.
         *
         * Backend ödeme sırasında kuponu tekrar
         * kontrol edecek.
         */
        if (appliedCoupon?.success) {
            sessionStorage.setItem(
                "paymentCouponCode",
                appliedCoupon.couponCode
            );
        } else {
            sessionStorage.removeItem(
                "paymentCouponCode"
            );
        }

        /*
         * Artık burada:
         *
         * api.post("/Order")
         *
         * YOK!
         *
         * Sipariş ödeme başarılı olduğunda
         * backend tarafından oluşturulacak.
         */
        navigate("/payment");
    };

    // =========================
    // YÜKLENİYOR
    // =========================
    if (loading) {
        return (
            <div className="cart-page">
                <div className="cart-loading">
                    <div className="loading-spinner"></div>
                    <p>Sepetiniz yükleniyor...</p>
                </div>
            </div>
        );
    }

    // =========================
    // HATA
    // =========================
    if (error) {
        return (
            <div className="cart-page">
                <div className="cart-error">
                    <h2>Bir hata oluştu</h2>
                    <p>{error}</p>

                    <button
                        onClick={getCart}
                        className="retry-button"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    // =========================
    // BOŞ SEPET
    // =========================
    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-header">
                    <h1>Sepetim</h1>

                    <button
                        className="continue-shopping-button"
                        onClick={() => navigate("/home")}
                    >
                        Alışverişe Devam Et
                    </button>
                </div>

                <div className="empty-cart">
                    <div className="empty-cart-icon">
                        🛒
                    </div>

                    <h2>Sepetiniz Boş</h2>

                    <p>
                        Henüz sepetinize ürün eklemediniz.
                    </p>

                    <button
                        onClick={() => navigate("/home")}
                        className="start-shopping-button"
                    >
                        Alışverişe Başla
                    </button>
                </div>
            </div>
        );
    }

    // =========================
    // ANA EKRAN
    // =========================
    return (
        <div className="cart-page">

            {/* HEADER */}
            <div className="cart-header">
                <div>
                    <h1>Sepetim</h1>

                    <p>
                        {getTotalQuantity()} ürün
                    </p>
                </div>

                <button
                    className="continue-shopping-button"
                    onClick={() => navigate("/home")}
                >
                    Alışverişe Devam Et
                </button>
            </div>

            {/* ANA İÇERİK */}
            <div className="cart-content">

                {/* ÜRÜNLER */}
                <div className="cart-products">

                    <div className="cart-products-header">
                        <h2>Sepetinizdeki Ürünler</h2>

                        <button
                            className="clear-cart-button"
                            onClick={clearCart}
                        >
                            Sepeti Temizle
                        </button>
                    </div>

                    {cart.items.map((item) => (
                        <div
                            className="cart-item"
                            key={item.id}
                        >

                            {/* ÜRÜN RESMİ */}
                            <div className="cart-item-image">
                                {item.product?.imageUrl ? (
                                    <img
                                        src={item.product.imageUrl}
                                        alt={
                                            item.product.name ||
                                            "Ürün"
                                        }
                                    />
                                ) : (
                                    <div className="no-image">
                                        📦
                                    </div>
                                )}
                            </div>

                            {/* ÜRÜN BİLGİSİ */}
                            <div className="cart-item-info">

                                <h3>
                                    {item.product?.name ||
                                        item.productName ||
                                        "Ürün"}
                                </h3>

                                <p className="cart-item-price">
                                    {Number(
                                        item.product?.price ??
                                        item.unitPrice ??
                                        0
                                    ).toLocaleString(
                                        "tr-TR",
                                        {
                                            style: "currency",
                                            currency: "TRY"
                                        }
                                    )}
                                </p>

                            </div>

                            {/* ADET */}
                            <div className="cart-item-quantity">

                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity - 1
                                        )
                                    }
                                    disabled={
                                        item.quantity <= 1
                                    }
                                >
                                    −
                                </button>

                                <span>
                                    {item.quantity}
                                </span>

                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity + 1
                                        )
                                    }
                                >
                                    +
                                </button>

                            </div>

                            {/* TOPLAM */}
                            <div className="cart-item-total">

                                <strong>
                                    {Number(
                                        item.totalPrice || 0
                                    ).toLocaleString(
                                        "tr-TR",
                                        {
                                            style: "currency",
                                            currency: "TRY"
                                        }
                                    )}
                                </strong>

                            </div>

                            {/* SİL */}
                            <button
                                className="remove-item-button"
                                onClick={() =>
                                    removeItem(item.id)
                                }
                            >
                                🗑️
                            </button>

                        </div>
                    ))}
                </div>

                {/* SAĞ TARAF */}
                <div className="cart-summary">

                    {/* KUPON */}
                    <div className="coupon-section">

                        <h3>
                            Kupon Kodu
                        </h3>

                        {!appliedCoupon?.success ? (
                            <div className="coupon-input-wrapper">

                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) =>
                                        setCouponCode(
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="Kupon kodunuzu girin"
                                    disabled={
                                        couponLoading
                                    }
                                />

                                <button
                                    onClick={applyCoupon}
                                    disabled={
                                        couponLoading
                                    }
                                >
                                    {couponLoading
                                        ? "Uygulanıyor..."
                                        : "Uygula"}
                                </button>

                            </div>
                        ) : (
                            <div className="applied-coupon">

                                <div>
                                    <strong>
                                        🎟️{" "}
                                        {
                                            appliedCoupon.couponCode
                                        }
                                    </strong>

                                    <span>
                                        Kupon uygulandı
                                    </span>
                                </div>

                                <button
                                    onClick={
                                        removeCoupon
                                    }
                                >
                                    Kaldır
                                </button>

                            </div>
                        )}
                    </div>

                    {/* ÖZET */}
                    <div className="summary-section">

                        <h2>
                            Sipariş Özeti
                        </h2>

                        <div className="summary-row">
                            <span>
                                Ürünler
                            </span>

                            <span>
                                {getTotal().toLocaleString(
                                    "tr-TR",
                                    {
                                        style: "currency",
                                        currency: "TRY"
                                    }
                                )}
                            </span>
                        </div>

                        {appliedCoupon?.success && (
                            <div className="summary-row discount-row">
                                <span>
                                    Kupon İndirimi
                                </span>

                                <span>
                                    -
                                    {Number(
                                        appliedCoupon.discountAmount
                                    ).toLocaleString(
                                        "tr-TR",
                                        {
                                            style: "currency",
                                            currency: "TRY"
                                        }
                                    )}
                                </span>
                            </div>
                        )}

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>
                                Ödenecek Tutar
                            </span>

                            <strong>
                                {getFinalTotal().toLocaleString(
                                    "tr-TR",
                                    {
                                        style: "currency",
                                        currency: "TRY"
                                    }
                                )}
                            </strong>
                        </div>

                        <button
                            className="checkout-button"
                            onClick={createOrder}
                        >
                            Ödemeye Geç →
                        </button>

                        <p className="secure-payment-text">
                            🔒 Güvenli ödeme
                        </p>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Cart;
