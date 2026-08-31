import "./AdminOrders.css";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../services/api";

function AdminOrders() {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);


    const getOrders = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/Order/admin"
            );

            setOrders(response.data);

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

            setError(
                error.response?.data?.message ||
                "Siparişler yüklenemedi."
            );

            Swal.fire({
                icon: "error",
                title: "Hata",
                text:
                    error.response?.data?.message ||
                    "Siparişler yüklenemedi.",
                confirmButtonText: "Tamam"
            });

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        getOrders();
    }, []);


    // SİPARİŞ DURUMU GÜNCELLEME
    const updateStatus = async (orderId, status) => {

        const currentOrder = orders.find(
            (order) => order.id === orderId
        );

        const oldStatus = currentOrder?.status;

        // Aynı durum seçildiyse API'ye istek gönderme
        if (oldStatus === status) {
            return;
        }

        const result = await Swal.fire({

            icon: "question",

            title: "Sipariş durumu değiştirilsin mi?",

            html: `
<div style="font-size: 15px;">
    <p>
    Sipariş <strong>#${orderId}</strong>
</p>

<p>
    Yeni durum:
    <strong>${getStatusText(status)}</strong>
</p>
</div>
`,

            showCancelButton: true,

            confirmButtonText: "Evet, Güncelle",

            cancelButtonText: "Vazgeç",

            confirmButtonColor: "#4f46e5",

            cancelButtonColor: "#64748b"

        });


        if (!result.isConfirmed) {

            // Kullanıcı iptal ederse eski durumu tekrar göster
            setSelectedOrder((currentOrder) => {

                if (!currentOrder) {
                    return null;
                }

                return {
                    ...currentOrder,
                    status: oldStatus
                };

            });

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


// Listeyi yenile
await getOrders();


// Modal içerisindeki siparişin durumunu güncelle
setSelectedOrder((currentOrder) => {

    if (!currentOrder) {
        return null;
    }

    return {
        ...currentOrder,
        status
    };

});


// Başarı mesajı
await Swal.fire({

    icon: "success",

    title: "Başarılı",

    text: `Sipariş #${orderId} durumu "${getStatusText(status)}" olarak güncellendi.`,

    timer: 1800,

    showConfirmButton: false

});


} catch (error) {

    console.error(error);

    setError(
        error.response?.data?.message ||
        "Sipariş durumu güncellenemedi."
    );


    // Hata mesajı
    Swal.fire({

        icon: "error",

        title: "Güncelleme Başarısız",

        text:
            error.response?.data?.message ||
            "Sipariş durumu güncellenemedi.",

        confirmButtonText: "Tamam"

    });

}
};


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
            return status;

    }
};


const getStatusClass = (status) => {

    switch (status) {

        case "Pending":
            return "order-status pending";

        case "Confirmed":
            return "order-status confirmed";

        case "Shipped":
            return "order-status shipped";

        case "Delivered":
            return "order-status delivered";

        case "Cancelled":
            return "order-status cancelled";

        default:
            return "order-status";

    }
};


return (

    <div className="admin-page">


        <div className="admin-page-header">

            <div>

                    <span>
                        SİPARİŞ YÖNETİMİ
                    </span>

                <h2>
                    Siparişler
                </h2>

                <p>
                    Tüm siparişleri buradan
                    yönetebilirsiniz.
                </p>

            </div>

        </div>


        {error && (

            <div className="admin-error">
                {error}
            </div>

        )}


        <div className="admin-card">


            <div className="admin-card-header">

                <h3>
                    Sipariş Listesi
                </h3>

                <span>
                        {orders.length} sipariş
                    </span>

            </div>


            {loading ? (

                <div className="admin-empty">

                        <span>
                            ⏳
                        </span>

                    <strong>
                        Siparişler yükleniyor...
                    </strong>

                </div>

            ) : orders.length === 0 ? (

                <div className="admin-empty">

                        <span>
                            🛍️
                        </span>

                    <strong>
                        Henüz sipariş bulunmuyor.
                    </strong>

                </div>

            ) : (

                <div className="admin-table-wrapper">

                    <table className="admin-table">

                        <thead>

                        <tr>

                            <th>Sipariş</th>
                            <th>Kullanıcı</th>
                            <th>Tarih</th>
                            <th>Toplam</th>
                            <th>Durum</th>
                            <th>İşlem</th>

                        </tr>

                        </thead>


                        <tbody>

                        {orders.map((order) => (

                            <tr key={order.id}>

                                <td>

                                    <strong>
                                        #{order.id}
                                    </strong>

                                </td>


                                <td>
                                    #{order.userId}
                                </td>


                                <td>

                                    {order.createdAt
                                        ? new Date(
                                            order.createdAt
                                        ).toLocaleString(
                                            "tr-TR"
                                        )
                                        : "-"
                                    }

                                </td>


                                <td>

                                    {Number(
                                        order.totalPrice || 0
                                    ).toFixed(2)}

                                    {" "}₺

                                </td>


                                <td>

                                            <span
                                                className={
                                                    getStatusClass(
                                                        order.status
                                                    )
                                                }
                                            >
                                                {getStatusText(
                                                    order.status
                                                )}
                                            </span>

                                </td>


                                <td>

                                    <button
                                        className="admin-edit-button"
                                        onClick={() =>
                                            setSelectedOrder(
                                                order
                                            )
                                        }
                                    >
                                        Detay
                                    </button>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>


        {/* ORDER DETAIL */}

        {selectedOrder && (

            <div className="admin-modal-overlay">

                <div className="admin-modal">


                    <div className="admin-modal-header">

                        <div>

                                <span>
                                    SİPARİŞ DETAYI
                                </span>

                            <h3>
                                Sipariş #{selectedOrder.id}
                            </h3>

                        </div>


                        <button
                            className="admin-modal-close"
                            onClick={() =>
                                setSelectedOrder(null)
                            }
                        >
                            ×
                        </button>

                    </div>


                    <div className="admin-order-info">


                        <div>

                                <span>
                                    Kullanıcı
                                </span>

                            <strong>
                                #{selectedOrder.userId}
                            </strong>

                        </div>


                        <div>

                                <span>
                                    Tarih
                                </span>

                            <strong>
                                {selectedOrder.createdAt
                                    ? new Date(
                                        selectedOrder.createdAt
                                    ).toLocaleString(
                                        "tr-TR"
                                    )
                                    : "-"
                                }
                            </strong>

                        </div>


                        <div>

                                <span>
                                    Toplam
                                </span>

                            <strong>

                                {Number(
                                    selectedOrder.totalPrice || 0
                                ).toFixed(2)}

                                {" "}₺

                            </strong>

                        </div>


                    </div>


                    <div className="admin-order-items">

                        <h4>
                            Sipariş Ürünleri
                        </h4>


                        {selectedOrder.items?.map(
                            (item) => (

                                <div
                                    className="admin-order-item"
                                    key={item.id}
                                >

                                    <div>

                                        <strong>
                                            {item.productName}
                                        </strong>

                                        <span>
                                                {item.quantity} adet
                                            </span>

                                    </div>


                                    <strong>

                                        {Number(
                                            item.totalPrice || 0
                                        ).toFixed(2)}

                                        {" "}₺

                                    </strong>

                                </div>

                            )
                        )}

                    </div>


                    <div className="admin-order-status">

                        <h4>
                            Sipariş Durumu
                        </h4>


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


                </div>

            </div>

        )}

    </div>
);
}

export default AdminOrders;