import "./Payment.css";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

function Payment() {

    const navigate = useNavigate();
    const { orderId } = useParams();

    const [cardHolderName, setCardHolderName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    const [loading, setLoading] = useState(false);


    // =========================
    // KART NUMARASI
    // =========================
    const handleCardNumber = (e) => {

        let value = e.target.value
            .replace(/\D/g, "")
            .slice(0, 16);

        value = value
            .replace(/(.{4})/g, "$1 ")
            .trim();

        setCardNumber(value);
    };


    // =========================
    // SON KULLANMA TARİHİ
    // =========================
    const handleExpiryDate = (e) => {

        let value = e.target.value
            .replace(/\D/g, "")
            .slice(0, 4);

        if (value.length >= 3) {

            value =
                value.substring(0, 2) +
                "/" +
                value.substring(2);

        }

        setExpiryDate(value);
    };


    // =========================
    // ÖDEME
    // =========================
    const handlePayment = async (e) => {

        e.preventDefault();


        // Kart sahibi kontrolü
        if (!cardHolderName.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Kart Sahibi Gerekli",
                text: "Lütfen kart üzerindeki ismi giriniz.",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }


        // Kart numarası kontrolü
        if (
            cardNumber.replace(/\s/g, "").length !== 16
        ) {

            Swal.fire({
                icon: "warning",
                title: "Kart Numarası Hatalı",
                text: "Kart numarası 16 haneli olmalıdır.",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }


        // Son kullanma tarihi kontrolü
        if (expiryDate.length !== 5) {

            Swal.fire({
                icon: "warning",
                title: "Tarih Hatalı",
                text: "Son kullanma tarihini AA/YY formatında giriniz.",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }


        // CVV kontrolü
        if (cvv.length !== 3) {

            Swal.fire({
                icon: "warning",
                title: "CVV Hatalı",
                text: "CVV 3 haneli olmalıdır.",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }


        try {

            setLoading(true);


            const response = await api.post(
                "/Payment",
                {
                    orderId: Number(orderId),
                    cardHolderName: cardHolderName,
                    cardNumber: cardNumber,
                    expiryDate: expiryDate,
                    cvv: cvv
                }
            );


            const payment = response.data;


            await Swal.fire({

                icon: "success",

                title: "Ödeme Başarılı! 🎉",

                html: `
                    <p>
                        Ödemeniz başarıyla gerçekleştirildi.
                    </p>

                    <p>
                        İşlem No:
                        <strong>
                            ${payment.transactionId}
                        </strong>
                    </p>
                `,

                confirmButtonText: "Sipariş Detayına Git",

                confirmButtonColor: "#4f46e5"

            });


            navigate(
                `/orders/${orderId}`
            );


        } catch (error) {

            console.error(
                "Ödeme hatası:",
                error
            );


            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem("token");


                await Swal.fire({

                    icon: "warning",

                    title: "Oturum Gerekli",

                    text:
                        "Ödeme yapabilmek için giriş yapmanız gerekiyor.",

                    confirmButtonText: "Giriş Yap",

                    confirmButtonColor: "#4f46e5"

                });


                navigate("/");

                return;
            }


            const errorMessage =
                error.response?.data?.message ||
                "Ödeme gerçekleştirilemedi.";


            Swal.fire({

                icon: "error",

                title: "Ödeme Başarısız",

                text: errorMessage,

                confirmButtonText: "Tekrar Dene",

                confirmButtonColor: "#4f46e5"

            });


        } finally {

            setLoading(false);

        }
    };


    // =========================
    // SAYFA
    // =========================
    return (

        <div className="payment-page">


            {/* HEADER */}

            <header className="payment-header">

                <div
                    className="payment-logo"
                    onClick={() => navigate("/home")}
                >

                    <span>
                        🛒
                    </span>

                    <strong>
                        E-Commerce
                    </strong>

                </div>

            </header>


            {/* CONTENT */}

            <main className="payment-container">


                {/* TITLE */}

                <div className="payment-title">

                    <span>
                        GÜVENLİ ÖDEME
                    </span>

                    <h1>
                        Ödeme Bilgileri
                    </h1>

                    <p>
                        Siparişinizi tamamlamak için kart
                        bilgilerinizi giriniz.
                    </p>

                </div>


                <div className="payment-content">


                    {/* SOL TARAF */}

                    <section className="payment-card-section">


                        {/* KART GÖRÜNÜMÜ */}

                        <div className="credit-card">


                            <div className="card-top">

                                <span>
                                    E-COMMERCE
                                </span>

                                <span>
                                    💳
                                </span>

                            </div>


                            <div className="card-chip">
                                ▰
                            </div>


                            <div className="card-number">

                                {cardNumber ||
                                    "•••• •••• •••• ••••"}

                            </div>


                            <div className="card-bottom">


                                <div>

                                    <small>
                                        KART SAHİBİ
                                    </small>

                                    <strong>
                                        {cardHolderName ||
                                            "AD SOYAD"}
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        SON KULLANMA
                                    </small>

                                    <strong>
                                        {expiryDate ||
                                            "MM/YY"}
                                    </strong>

                                </div>


                            </div>


                        </div>


                        {/* FORM */}

                        <form
                            className="payment-form"
                            onSubmit={handlePayment}
                        >


                            <div className="form-group">

                                <label>
                                    Kart Üzerindeki İsim
                                </label>

                                <input
                                    type="text"
                                    placeholder="Ad Soyad"
                                    value={cardHolderName}
                                    onChange={(e) =>
                                        setCardHolderName(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Kart Numarası
                                </label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="5555 5555 5555 4444"
                                    value={cardNumber}
                                    onChange={handleCardNumber}
                                />

                            </div>


                            <div className="payment-form-row">


                                <div className="form-group">

                                    <label>
                                        Son Kullanma Tarihi
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="12/30"
                                        value={expiryDate}
                                        onChange={handleExpiryDate}
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        CVV
                                    </label>

                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength="3"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) =>
                                            setCvv(
                                                e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 3)
                                            )
                                        }
                                    />

                                </div>


                            </div>


                            {/* MOCK BİLGİ */}

                            <div className="test-card-info">

                                <strong>
                                    🧪 Mock Ödeme
                                </strong>

                                <span>
                                    Test Kartı:
                                    5555 5555 5555 4444
                                </span>

                                <span>
                                    Son Kullanma:
                                    12/30
                                </span>

                                <span>
                                    CVV:
                                    123
                                </span>

                            </div>


                            {/* ÖDEME BUTONU */}

                            <button
                                type="submit"
                                className="payment-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Ödeme İşleniyor..."
                                    : "🔒 Ödemeyi Tamamla"}

                            </button>


                            {/* GERİ */}

                            <button
                                type="button"
                                className="back-button"
                                onClick={() =>
                                    navigate("/cart")
                                }
                            >
                                ← Sepete Dön
                            </button>


                        </form>


                    </section>


                    {/* SAĞ TARAF */}

                    <aside className="payment-summary">


                        <h2>
                            Sipariş Bilgileri
                        </h2>


                        <div className="payment-summary-row">

                            <span>
                                Sipariş No
                            </span>

                            <strong>
                                #{orderId}
                            </strong>

                        </div>


                        <div className="payment-summary-divider"></div>


                        <div className="secure-payment">

                            <span>
                                🔒
                            </span>

                            <div>

                                <strong>
                                    Güvenli Ödeme
                                </strong>

                                <p>
                                    Kart bilgileriniz güvenli
                                    şekilde işlenmektedir.
                                </p>

                            </div>

                        </div>


                    </aside>


                </div>


            </main>


        </div>

    );
}

export default Payment;