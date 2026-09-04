import "./Payment.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

function Payment() {
    const navigate = useNavigate();

    const [cardHolderName, setCardHolderName] =
        useState("");

    const [cardNumber, setCardNumber] =
        useState("");

    const [expiryDate, setExpiryDate] =
        useState("");

    const [cvv, setCvv] =
        useState("");

    const [couponCode, setCouponCode] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    // =========================
    // KUPON KODUNU AL
    // =========================
    useEffect(() => {
        const savedCoupon =
            sessionStorage.getItem(
                "paymentCouponCode"
            );

        if (savedCoupon) {
            setCouponCode(savedCoupon);
        }
    }, []);

    // =========================
    // KART NUMARASI FORMATLAMA
    // =========================
    const handleCardNumberChange = (e) => {
        let value = e.target.value;

        /*
         * Sadece rakamları al
         */
        value = value.replace(/\D/g, "");

        /*
         * Maksimum 16 hane
         */
        value = value.slice(0, 16);

        /*
         * 4'erli gruplara ayır
         */
        value = value.replace(
            /(.{4})/g,
            "$1 "
        );

        /*
         * Sondaki boşluğu temizle
         */
        value = value.trim();

        setCardNumber(value);
    };

    // =========================
    // SON KULLANMA TARİHİ
    // =========================
    const handleExpiryDateChange = (e) => {
        let value = e.target.value;

        /*
         * Sadece rakamları al
         */
        value = value.replace(/\D/g, "");

        /*
         * Maksimum 4 rakam
         */
        value = value.slice(0, 4);

        /*
         * 2 haneden sonra /
         */
        if (value.length >= 3) {
            value =
                value.slice(0, 2) +
                "/" +
                value.slice(2);
        }

        setExpiryDate(value);
    };

    // =========================
    // CVV
    // =========================
    const handleCvvChange = (e) => {
        let value = e.target.value;

        value = value.replace(/\D/g, "");

        value = value.slice(0, 3);

        setCvv(value);
    };

    // =========================
    // ÖDEME
    // =========================
    const handlePayment = async (e) => {
        e.preventDefault();

        /*
         * Kart sahibi kontrolü
         */
        if (!cardHolderName.trim()) {
            await Swal.fire({
                icon: "warning",
                title: "Kart Sahibi Gerekli",
                text:
                    "Lütfen kart üzerindeki isim ve soyisim bilgisini giriniz.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        /*
         * Kart numarası kontrolü
         */
        const cleanCardNumber =
            cardNumber.replace(/\s/g, "");

        if (cleanCardNumber.length !== 16) {
            await Swal.fire({
                icon: "warning",
                title: "Geçersiz Kart Numarası",
                text:
                    "Kart numarası 16 haneli olmalıdır.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        /*
         * Son kullanma tarihi kontrolü
         */
        if (
            expiryDate.length !== 5 ||
            !expiryDate.includes("/")
        ) {
            await Swal.fire({
                icon: "warning",
                title: "Geçersiz Tarih",
                text:
                    "Son kullanma tarihi AA/YY formatında olmalıdır.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        /*
         * CVV kontrolü
         */
        if (cvv.length !== 3) {
            await Swal.fire({
                icon: "warning",
                title: "Geçersiz CVV",
                text:
                    "CVV 3 haneli olmalıdır.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        try {
            setLoading(true);

            /*
             * ÖNEMLİ:
             *
             * Artık burada orderId göndermiyoruz.
             *
             * Çünkü henüz sipariş oluşturulmadı.
             *
             * Backend:
             *
             * 1. Kartı kontrol edecek
             * 2. Kullanıcının sepetini bulacak
             * 3. Kuponu kontrol edecek
             * 4. Tutarı hesaplayacak
             * 5. Siparişi oluşturacak
             * 6. Ödeme kaydını oluşturacak
             * 7. Stok düşecek
             * 8. Sepeti temizleyecek
             */
            const response = await api.post(
                "/Payment",
                {
                    cardHolderName:
                        cardHolderName.trim(),

                    cardNumber:
                        cleanCardNumber,

                    expiryDate:
                        expiryDate,

                    cvv:
                        cvv,

                    couponCode:
                        couponCode || null
                }
            );

            const payment =
                response.data;

            /*
             * Başarısız ödeme
             */
            if (!payment.success) {
                await Swal.fire({
                    icon: "error",
                    title: "Ödeme Başarısız",
                    text:
                        payment.message ||
                        "Ödeme işlemi gerçekleştirilemedi.",
                    confirmButtonText: "Tamam",
                    confirmButtonColor: "#dc2626"
                });

                return;
            }

            /*
             * Ödeme başarılı.
             *
             * Artık backend siparişi oluşturmuş durumda.
             */
            await Swal.fire({
                icon: "success",
                title: "Ödeme Başarılı 🎉",
                html: `
<div style="line-height:1.8;">
    <p>
    Ödemeniz başarıyla tamamlandı.
</p>

<p>
    <strong>Sipariş No:</strong>
    #${payment.orderId}
</p>

<p>
    <strong>Ödeme Tutarı:</strong>
    ${Number(
    payment.amount || 0
).toLocaleString(
    "tr-TR",
    {
        style: "currency",
        currency: "TRY"
    }
)}
</p>

${
    payment.transactionId
        ? `
                                    <p style="font-size:13px; color:#64748b;">
                                        İşlem No:
                                        ${payment.transactionId}
                                    </p>
                                `
        : ""
}
</div>
`,
                confirmButtonText:
                    "Siparişimi Gör",
                confirmButtonColor: "#16a34a"
            });

            /*
             * Kupon bilgisini temizle
             */
            sessionStorage.removeItem(
                "paymentCouponCode"
            );

            /*
             * Oluşturulan siparişe git
             */
            navigate(
                `/orders/${payment.orderId}`
            );
        } catch (err) {
            console.error(
                "Ödeme hatası:",
                err
            );

            const message =
                err.response?.data?.message ||
                err.response?.data?.Message ||
                "Ödeme işlemi sırasında bir hata oluştu.";

            await Swal.fire({
                icon: "error",
                title: "Ödeme Başarısız",
                text: message,
                confirmButtonText: "Tamam",
                confirmButtonColor: "#dc2626"
            });
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // GERİ DÖN
    // =========================
    const handleBack = async () => {
        const result = await Swal.fire({
            icon: "question",
            title: "Ödeme Sayfasından Çık?",
            text:
                "Ödeme işlemini tamamlamadan sepete döneceksiniz. Siparişiniz henüz oluşturulmadı.",
            showCancelButton: true,
            confirmButtonText:
                "Sepete Dön",
            cancelButtonText:
                "Ödemede Kal",
            confirmButtonColor:
                "#4f46e5",
            cancelButtonColor:
                "#64748b"
        });

        if (!result.isConfirmed) {
            return;
        }

        /*
         * Sipariş oluşturulmadığı için
         * sepet olduğu gibi kalır.
         */
        navigate("/cart");
    };

    return (
        <div className="payment-page">

            {/* HEADER */}
            <div className="payment-header">

                <button
                    className="payment-back-button"
                    onClick={handleBack}
                    disabled={loading}
                >
                    ← Sepete Dön
                </button>

                <h1>
                    Güvenli Ödeme
                </h1>

                <div></div>

            </div>

            {/* CONTENT */}
            <div className="payment-container">

                {/* SOL TARAF - KART */}
                <div className="payment-card-section">

                    <div className="payment-section-header">

                        <h2>
                            Kart Bilgileri
                        </h2>

                        <span>
                            🔒 Güvenli Ödeme
                        </span>

                    </div>

                    <form
                        onSubmit={
                            handlePayment
                        }
                    >

                        {/* KART SAHİBİ */}
                        <div className="form-group">

                            <label>
                                Kart Üzerindeki İsim
                            </label>

                            <input
                                type="text"
                                value={
                                    cardHolderName
                                }
                                onChange={(e) =>
                                    setCardHolderName(
                                        e.target.value
                                    )
                                }
                                placeholder="Ad Soyad"
                                autoComplete="cc-name"
                                disabled={
                                    loading
                                }
                            />

                        </div>

                        {/* KART NUMARASI */}
                        <div className="form-group">

                            <label>
                                Kart Numarası
                            </label>

                            <input
                                type="text"
                                value={
                                    cardNumber
                                }
                                onChange={
                                    handleCardNumberChange
                                }
                                placeholder="5555 5555 5555 4444"
                                inputMode="numeric"
                                autoComplete="cc-number"
                                disabled={
                                    loading
                                }
                            />

                        </div>

                        {/* TARİH + CVV */}
                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Son Kullanma Tarihi
                                </label>

                                <input
                                    type="text"
                                    value={
                                        expiryDate
                                    }
                                    onChange={
                                        handleExpiryDateChange
                                    }
                                    placeholder="12/30"
                                    inputMode="numeric"
                                    autoComplete="cc-exp"
                                    disabled={
                                        loading
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    CVV
                                </label>

                                <input
                                    type="password"
                                    value={
                                        cvv
                                    }
                                    onChange={
                                        handleCvvChange
                                    }
                                    placeholder="123"
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    disabled={
                                        loading
                                    }
                                />

                            </div>

                        </div>

                        {/* ÖDEME BUTONU */}
                        <button
                            type="submit"
                            className="payment-submit-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="payment-spinner"></span>
                                    Ödeme İşleniyor...
                                </>
                            ) : (
                                <>
                                    🔒 Ödemeyi Tamamla
                                </>
                            )}
                        </button>

                    </form>

                    {/* TEST KARTI */}
                    <div className="test-card-info">

                        <h3>
                            🧪 Test Ödeme Bilgileri
                        </h3>

                        <div className="test-card-row">
                            <span>
                                Kart:
                            </span>

                            <strong>
                                5555 5555 5555 4444
                            </strong>
                        </div>

                        <div className="test-card-row">
                            <span>
                                Son Kullanma:
                            </span>

                            <strong>
                                12/30
                            </strong>
                        </div>

                        <div className="test-card-row">
                            <span>
                                CVV:
                            </span>

                            <strong>
                                123
                            </strong>
                        </div>

                        <p>
                            Bu bilgiler yalnızca
                            geliştirme/test amacıyla
                            kullanılmaktadır.
                        </p>

                    </div>

                </div>

                {/* SAĞ TARAF - BİLGİ */}
                <div className="payment-info-section">

                    <div className="payment-info-box">

                        <div className="payment-info-icon">
                            🛡️
                        </div>

                        <h3>
                            Güvenli Ödeme
                        </h3>

                        <p>
                            Kart bilgileriniz güvenli
                            bir şekilde işlenmektedir.
                        </p>

                    </div>

                    <div className="payment-info-box">

                        <div className="payment-info-icon">
                            📦
                        </div>

                        <h3>
                            Sipariş Ne Zaman Oluşturulur?
                        </h3>

                        <p>
                            Siparişiniz yalnızca ödeme
                            başarıyla tamamlandıktan sonra
                            oluşturulur.
                        </p>

                    </div>

                    <div className="payment-info-box">

                        <div className="payment-info-icon">
                            🛒
                        </div>

                        <h3>
                            Vazgeçerseniz
                        </h3>

                        <p>
                            Ödeme yapmadan geri dönerseniz
                            sipariş oluşturulmaz ve
                            sepetiniz korunur.
                        </p>

                    </div>

                    <div className="payment-security">

                        <span>
                            🔒
                        </span>

                        <div>
                            <strong>
                                Güvenli İşlem
                            </strong>

                            <p>
                                Ödeme bilgileriniz
                                sistemimizde saklanmaz.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Payment;
