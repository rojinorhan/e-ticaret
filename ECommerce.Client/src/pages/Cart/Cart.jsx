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


    // =========================
    // SEPETİ GETİR
    // =========================
    const getCart = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/Cart");

            setCart(response.data);

        } catch (error) {

            console.error("Sepet hatası:", error);

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Sepetinizi görmek için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            const errorMessage =
                error.response?.data?.message ||
                "Sepet yüklenirken bir hata oluştu.";

            setError(errorMessage);

            Swal.fire({
                icon: "error",
                title: "Sepet Yüklenemedi",
                text: errorMessage,
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        getCart();
    }, []);


    // =========================
    // TOPLAM FİYAT
    // =========================
    const getTotal = () => {

        if (!cart?.items || cart.items.length === 0) {
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

        if (!cart?.items || cart.items.length === 0) {
            return 0;
        }

        return cart.items.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );
    };


    // =========================
    // MİKTAR GÜNCELLE
    // =========================
    const updateQuantity = async (item, quantity) => {

        if (quantity < 1) {
            return;
        }

        if (
            item.stock !== undefined &&
            quantity > item.stock
        ) {

            Swal.fire({
                icon: "warning",
                title: "Stok Yetersiz",
                text: `Bu ürün için en fazla ${item.stock} adet satın alabilirsiniz.`,
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        try {

            setError("");

            const response = await api.put(
                `/Cart/items/${item.id}`,
                {
                    quantity: quantity
                }
            );

            setCart(response.data);

        } catch (error) {

            console.error(
                "Miktar güncelleme hatası:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Bu işlemi yapmak için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Ürün miktarı güncellenemedi.";

            setError(errorMessage);

            Swal.fire({
                icon: "error",
                title: "Güncelleme Başarısız",
                text: errorMessage,
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });
        }
    };


    // =========================
    // ÜRÜN SİL
    // =========================
    const removeItem = async (itemId) => {

        const item = cart?.items?.find(
            (item) => item.id === itemId
        );

        const result = await Swal.fire({

            icon: "warning",

            title: "Ürün kaldırılsın mı?",

            html: `
                <p>
                    <strong>
                        ${item?.productName || "Bu ürün"}
                    </strong>
                    sepetten kaldırılacak.
                </p>
            `,

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

            setError("");

            await api.delete(
                `/Cart/items/${itemId}`
            );

            await getCart();

            Swal.fire({

                icon: "success",

                title: "Ürün Kaldırıldı",

                text: "Ürün sepetten başarıyla kaldırıldı.",

                timer: 1500,

                showConfirmButton: false

            });

        } catch (error) {

            console.error(
                "Ürün silme hatası:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Bu işlemi yapmak için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            const errorMessage =
                error.response?.data?.message ||
                "Ürün sepetten silinemedi.";

            setError(errorMessage);

            Swal.fire({
                icon: "error",
                title: "Ürün Kaldırılamadı",
                text: errorMessage,
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

        }
    };


    // =========================
    // SEPETİ TEMİZLE
    // =========================
    const clearCart = async () => {

        const result = await Swal.fire({

            icon: "warning",

            title: "Sepeti temizlemek istiyor musunuz?",

            text: "Sepetteki tüm ürünler kaldırılacak. Bu işlem geri alınamaz.",

            showCancelButton: true,

            confirmButtonText: "Evet, Sepeti Temizle",

            cancelButtonText: "Vazgeç",

            confirmButtonColor: "#dc2626",

            cancelButtonColor: "#64748b"

        });


        if (!result.isConfirmed) {
            return;
        }


        try {

            setError("");

            await api.delete("/Cart");

            await getCart();

            Swal.fire({

                icon: "success",

                title: "Sepet Temizlendi",

                text: "Sepetiniz başarıyla temizlendi.",

                timer: 1500,

                showConfirmButton: false

            });

        } catch (error) {

            console.error(
                "Sepet temizleme hatası:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Bu işlemi yapmak için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            const errorMessage =
                error.response?.data?.message ||
                "Sepet temizlenemedi.";

            setError(errorMessage);

            Swal.fire({
                icon: "error",
                title: "Sepet Temizlenemedi",
                text: errorMessage,
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

        }
    };


    // =========================
    // SİPARİŞ OLUŞTUR
    // =========================
    const createOrder = async () => {

        // Sepet boş mu?
        if (!cart?.items || cart.items.length === 0) {

            await Swal.fire({
                icon: "warning",
                title: "Sepetiniz Boş",
                text: "Sipariş oluşturabilmek için sepetinize ürün eklemelisiniz.",
                confirmButtonText: "Ürünleri Keşfet",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }


        // Sipariş onayı
        const result = await Swal.fire({

            icon: "question",

            title: "Sipariş oluşturulsun mu?",

            html: `
                <div style="font-size: 15px;">

                    <p>
                        ${getTotalQuantity()} ürün
                        sipariş verilecek.
                    </p>

                    <p>
                        Toplam:
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

                </div>
            `,

            showCancelButton: true,

            confirmButtonText: "Evet, Sipariş Ver",

            cancelButtonText: "Vazgeç",

            confirmButtonColor: "#4f46e5",

            cancelButtonColor: "#64748b"

        });


        if (!result.isConfirmed) {
            return;
        }


        try {

            setError("");


            // Sipariş oluşturuluyor
            Swal.fire({

                title: "Siparişiniz oluşturuluyor...",

                text: "Lütfen bekleyin.",

                allowOutsideClick: false,

                allowEscapeKey: false,

                showConfirmButton: false,

                didOpen: () => {
                    Swal.showLoading();
                }

            });


            // =========================
            // BACKEND'DEN SİPARİŞ OLUŞTUR
            // =========================
            const response = await api.post("/Order");


            const order = response.data;


            console.log("Oluşturulan sipariş:", order);


            Swal.close();
            // =========================
            // ÖDEME SAYFASINA GİT
            // =========================
            console.log(
                "Payment sayfasına gidiliyor:",
                `/payment/${order.id}`
            );
            navigate(`/payment/${order.id}`);
            // =========================
            // SİPARİŞ OLUŞTURULDU
            // =========================
            

        
            

        } catch (error) {

            console.error(
                "Sipariş oluşturma hatası:",
                error
            );


            Swal.close();


            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({

                    icon: "warning",

                    title: "Oturum Gerekli",

                    text: "Sipariş oluşturmak için giriş yapmanız gerekiyor.",

                    confirmButtonText: "Giriş Yap",

                    confirmButtonColor: "#4f46e5"

                });

                navigate("/");

                return;
            }


            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Sipariş oluşturulurken bir hata oluştu.";


            setError(errorMessage);


            await Swal.fire({

                icon: "error",

                title: "Sipariş Oluşturulamadı",

                text: errorMessage,

                confirmButtonText: "Tamam",

                confirmButtonColor: "#4f46e5"

            });

        }
    };


    // =========================
    // LOADING
    // =========================
    if (loading) {

        return (

            <div className="cart-page">

                <div className="cart-loading">

                    <div className="cart-spinner"></div>

                    <p>
                        Sepetiniz yükleniyor...
                    </p>

                </div>

            </div>

        );

    }


    // =========================
    // SAYFA
    // =========================
    return (

        <div className="cart-page">

            {/* HEADER */}

            <header className="cart-header">

                <div
                    className="cart-logo"
                    onClick={() => navigate("/home")}
                >

                    <span>
                        🛒
                    </span>

                    <strong>
                        E-Commerce 
                    </strong>

                </div>


                <nav className="cart-nav">

                    <button
                        onClick={() => navigate("/home")}
                    >
                        Ana Sayfa
                    </button>


                    <button
                        onClick={() => navigate("/products")}
                    >
                        Ürünler
                    </button>


                    <button
                        onClick={() => navigate("/orders")}
                    >
                        Siparişlerim
                    </button>


                    <button
                        className="active"
                    >
                        🛒 Sepet
                    </button>

                </nav>

            </header>


            {/* CONTENT */}

            <main className="cart-container">

                {/* TITLE */}

                <div className="cart-title">

                    <div>

                        <span className="cart-title-label">
                            ALIŞVERİŞ SEPETİ
                        </span>

                        <h1>
                            Sepetim
                        </h1>

                        {cart?.items?.length > 0 && (

                            <p>
                                Sepetinizde{" "}
                                {getTotalQuantity()} ürün
                                bulunuyor.
                            </p>

                        )}

                    </div>


                    {cart?.items?.length > 0 && (

                        <button
                            className="clear-cart"
                            onClick={clearCart}
                        >
                            🗑️ Sepeti Temizle
                        </button>

                    )}

                </div>


                {/* ERROR */}

                {error && (

                    <div className="cart-error">

                        <span>
                            ⚠️
                        </span>

                        {error}

                    </div>

                )}


                {/* EMPTY CART */}

                {!cart?.items ||
                cart.items.length === 0 ? (

                    <div className="empty-cart">

                        <div className="empty-cart-icon">
                            🛒
                        </div>

                        <h2>
                            Sepetiniz boş
                        </h2>

                        <p>
                            Henüz sepetinize ürün eklemediniz.
                            Ürünleri keşfederek alışverişe başlayabilirsiniz.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/products")
                            }
                        >
                            🛍️ Ürünleri Keşfet
                        </button>

                    </div>

                ) : (

                    <div className="cart-content">

                        {/* PRODUCTS */}

                        <section className="cart-items">

                            {cart.items.map((item) => (

                                <article
                                    className="cart-item"
                                    key={item.id}
                                >

                                    <div className="product-icon">
                                        🛍️
                                    </div>


                                    <div className="product-info">

                                        <h3>
                                            {item.productName}
                                        </h3>

                                        <span>
                                            Birim fiyat:{" "}

                                            {Number(
                                                item.unitPrice || 0
                                            ).toLocaleString(
                                                "tr-TR",
                                                {
                                                    style: "currency",
                                                    currency: "TRY"
                                                }
                                            )}

                                        </span>

                                    </div>


                                    <div className="quantity-control">

                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item,
                                                    item.quantity - 1
                                                )
                                            }
                                            disabled={
                                                item.quantity <= 1
                                            }
                                        >
                                            −
                                        </button>


                                        <strong>
                                            {item.quantity}
                                        </strong>


                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item,
                                                    item.quantity + 1
                                                )
                                            }
                                            disabled={
                                                item.quantity >= item.stock
                                            }
                                        >
                                            +
                                        </button>

                                    </div>


                                    <div className="item-total">

                                        {Number(
                                            item.totalPrice || 0
                                        ).toLocaleString(
                                            "tr-TR",
                                            {
                                                style: "currency",
                                                currency: "TRY"
                                            }
                                        )}

                                    </div>


                                    <button
                                        className="remove-item"
                                        onClick={() =>
                                            removeItem(item.id)
                                        }
                                        title="Ürünü kaldır"
                                    >
                                        🗑️
                                    </button>

                                </article>

                            ))}

                        </section>


                        {/* SUMMARY */}

                        <aside className="cart-summary">

                            <h2>
                                Sipariş Özeti
                            </h2>


                            <div className="summary-row">

                                <span>
                                    Ürün Sayısı
                                </span>

                                <strong>
                                    {getTotalQuantity()}
                                </strong>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Ara Toplam
                                </span>

                                <strong>

                                    {getTotal().toLocaleString(
                                        "tr-TR",
                                        {
                                            style: "currency",
                                            currency: "TRY"
                                        }
                                    )}

                                </strong>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Kargo
                                </span>

                                <strong>
                                    Ücretsiz
                                </strong>

                            </div>


                            <div className="summary-divider"></div>


                            <div className="summary-total">

                                <span>
                                    Genel Toplam
                                </span>

                                <strong>

                                    {getTotal().toLocaleString(
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
                                Sipariş Ver

                                <span>
                                    →
                                </span>

                            </button>


                            <button
                                className="continue-shopping"
                                onClick={() =>
                                    navigate("/products")
                                }
                            >
                                ← Alışverişe Devam Et
                            </button>

                        </aside>

                    </div>

                )}

            </main>

        </div>

    );
}

export default Cart;




//vscode test 12345