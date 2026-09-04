import "./Coupons.css";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../services/api";

function Coupons() {


const [coupons, setCoupons] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const [showModal, setShowModal] = useState(false);
const [editingCoupon, setEditingCoupon] = useState(null);

const [form, setForm] = useState({
    code: "",
    discountType: "Percentage",
    discountValue: "",
    minimumCartAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true
});


// --------------------------------------------------
// KUPONLARI GETİR
// --------------------------------------------------

const getCoupons = async () => {

    try {

        setLoading(true);

        const response = await api.get("/Coupon");

        setCoupons(response.data);

    } catch (error) {

        console.error(error);

        if (error.response?.status === 401) {

            Swal.fire({
                icon: "warning",
                title: "Oturum süresi doldu",
                text: "Lütfen tekrar giriş yapın."
            });

            localStorage.removeItem("token");
            window.location.href = "/";

            return;
        }

        Swal.fire({
            icon: "error",
            title: "Hata",
            text:
                error.response?.data?.message ||
                "Kuponlar yüklenirken bir hata oluştu."
        });

    } finally {

        setLoading(false);
    }
};


useEffect(() => {
    getCoupons();
}, []);


// --------------------------------------------------
// FORM TEMİZLE
// --------------------------------------------------

const resetForm = () => {

    setForm({
        code: "",
        discountType: "Percentage",
        discountValue: "",
        minimumCartAmount: "",
        usageLimit: "",
        startDate: "",
        endDate: "",
        isActive: true
    });

    setEditingCoupon(null);
};


// --------------------------------------------------
// MODAL AÇ
// --------------------------------------------------

const openCreateModal = () => {

    resetForm();

    setShowModal(true);
};


// --------------------------------------------------
// DÜZENLE MODALI
// --------------------------------------------------

const openEditModal = (coupon) => {

    setEditingCoupon(coupon);

    setForm({
        code: coupon.code || "",
        discountType: coupon.discountType || "Percentage",
        discountValue: coupon.discountValue ?? "",
        minimumCartAmount: coupon.minimumCartAmount ?? "",
        usageLimit: coupon.usageLimit ?? "",
        startDate: coupon.startDate
            ? coupon.startDate.substring(0, 10)
            : "",
        endDate: coupon.endDate
            ? coupon.endDate.substring(0, 10)
            : "",
        isActive: coupon.isActive
    });

    setShowModal(true);
};


// --------------------------------------------------
// FORM DEĞİŞİKLİĞİ
// --------------------------------------------------

const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
    }));
};


// --------------------------------------------------
// KUPON KAYDET
// --------------------------------------------------

const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.code.trim()) {

        Swal.fire({
            icon: "warning",
            title: "Eksik bilgi",
            text: "Kupon kodunu girin."
        });

        return;
    }

    if (!form.discountValue || Number(form.discountValue) <= 0) {

        Swal.fire({
            icon: "warning",
            title: "Eksik bilgi",
            text: "Geçerli bir indirim değeri girin."
        });

        return;
    }

    if (!form.startDate || !form.endDate) {

        Swal.fire({
            icon: "warning",
            title: "Eksik bilgi",
            text: "Başlangıç ve bitiş tarihlerini girin."
        });

        return;
    }

    if (
        form.discountType === "Percentage" &&
        Number(form.discountValue) > 100
    ) {

        Swal.fire({
            icon: "warning",
            title: "Geçersiz indirim",
            text: "Yüzde indirimi 100'den fazla olamaz."
        });

        return;
    }


    const data = {

        code: form.code.trim().toUpperCase(),

        discountType: form.discountType,

        discountValue: Number(form.discountValue),

        minimumCartAmount:
            Number(form.minimumCartAmount) || 0,

        usageLimit:
            form.usageLimit
                ? Number(form.usageLimit)
                : null,

        startDate: form.startDate,

        endDate: form.endDate,

        isActive: form.isActive
    };


    try {

        setSaving(true);

        if (editingCoupon) {

            await api.put(
                `/Coupon/${editingCoupon.id}`,
                data
            );

            await Swal.fire({
                icon: "success",
                title: "Kupon güncellendi",
                text: "Kupon başarıyla güncellendi.",
                timer: 1500,
                showConfirmButton: false
            });

        } else {

            await api.post(
                "/Coupon",
                data
            );

            await Swal.fire({
                icon: "success",
                title: "Kupon oluşturuldu",
                text: "Yeni kupon başarıyla oluşturuldu.",
                timer: 1500,
                showConfirmButton: false
            });
        }

        setShowModal(false);

        resetForm();

        await getCoupons();

    } catch (error) {

        console.error(error);

        Swal.fire({
            icon: "error",
            title: "İşlem başarısız",
            text:
                error.response?.data?.message ||
                "Kupon kaydedilirken bir hata oluştu."
        });

    } finally {

        setSaving(false);
    }
};


// --------------------------------------------------
// KUPON SİL
// --------------------------------------------------

const deleteCoupon = async (id) => {

    const result = await Swal.fire({

        icon: "warning",

        title: "Kupon silinsin mi?",

        text: "Bu işlem geri alınamaz.",

        showCancelButton: true,

        confirmButtonText: "Evet, sil",

        cancelButtonText: "Vazgeç",

        confirmButtonColor: "#e00046"
    });


    if (!result.isConfirmed) {
        return;
    }


    try {

        await api.delete(`/Coupon/${id}`);

        await Swal.fire({

            icon: "success",

            title: "Silindi",

            text: "Kupon başarıyla silindi.",

            timer: 1500,

            showConfirmButton: false
        });

        await getCoupons();

    } catch (error) {

        console.error(error);

        Swal.fire({

            icon: "error",

            title: "Hata",

            text:
                error.response?.data?.message ||
                "Kupon silinirken bir hata oluştu."
        });
    }
};


// --------------------------------------------------
// DURUM
// --------------------------------------------------

const getCouponStatus = (coupon) => {

    const now = new Date();

    const start = new Date(coupon.startDate);

    const end = new Date(coupon.endDate);

    if (!coupon.isActive) {
        return "Pasif";
    }

    if (now < start) {
        return "Başlamadı";
    }

    if (now > end) {
        return "Süresi Doldu";
    }

    if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
    ) {
        return "Limit Doldu";
    }

    return "Aktif";
};


const getStatusClass = (status) => {

    switch (status) {

        case "Aktif":
            return "status-active";

        case "Pasif":
            return "status-passive";

        case "Başlamadı":
            return "status-pending";

        case "Süresi Doldu":
            return "status-expired";

        case "Limit Doldu":
            return "status-limit";

        default:
            return "";
    }
};


// --------------------------------------------------
// TARİH FORMATLA
// --------------------------------------------------

const formatDate = (date) => {

    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleDateString("tr-TR");
};


// --------------------------------------------------
// RENDER
// --------------------------------------------------

return (
    <div className="coupons-page">

        <div className="coupons-header">

            <div>
                <span className="coupons-header-label">
                    KAMPANYALAR
                </span>

                <h2>
                    Kupon Yönetimi
                </h2>

                <p>
                    Mağazanızdaki indirim kuponlarını yönetin.
                </p>
            </div>

            <button
                className="coupon-add-button"
                onClick={openCreateModal}
            >
                <span>+</span>
                Yeni Kupon
            </button>

        </div>


        {/* KUPON LİSTESİ */}

        <div className="coupons-card">

            <div className="coupons-card-header">

                <div>
                    <strong>Kuponlar</strong>

                    <span>
                        {coupons.length} kupon
                    </span>
                </div>

            </div>


            {loading ? (

                <div className="coupons-loading">
                    Kuponlar yükleniyor...
                </div>

            ) : coupons.length === 0 ? (

                <div className="coupons-empty">

                    <div className="coupons-empty-icon">
                        🎟️
                    </div>

                    <h3>
                        Henüz kupon bulunmuyor
                    </h3>

                    <p>
                        İlk kuponunuzu oluşturarak müşterilerinize
                        indirim sunabilirsiniz.
                    </p>

                    <button
                        onClick={openCreateModal}
                    >
                        + İlk Kuponu Oluştur
                    </button>

                </div>

            ) : (

                <div className="coupon-table-wrapper">

                    <table className="coupon-table">

                        <thead>

                            <tr>

                                <th>Kupon</th>

                                <th>İndirim</th>

                                <th>Min. Tutar</th>

                                <th>Kullanım</th>

                                <th>Geçerlilik</th>

                                <th>Durum</th>

                                <th>İşlemler</th>

                            </tr>

                        </thead>

                        <tbody>

                            {coupons.map((coupon) => {

                                const status =
                                    getCouponStatus(coupon);

                                return (

                                    <tr key={coupon.id}>

                                        <td>

                                            <div className="coupon-code">

                                                <span>
                                                    🎟️
                                                </span>

                                                <strong>
                                                    {coupon.code}
                                                </strong>

                                            </div>

                                        </td>


                                        <td>

                                            <strong className="discount-value">

                                                {coupon.discountType ===
                                                "Percentage"

                                                    ? `%${coupon.discountValue}`

                                                    : `${coupon.discountValue.toLocaleString(
        "tr-TR",
        {
            minimumFractionDigits: 2
        }
    )} TL`
                                                }

                                            </strong>

                                            <small>

                                                {coupon.discountType ===
                                                "Percentage"
                                                    ? "Yüzde indirim"
                                                    : "Sabit indirim"}

                                            </small>

                                        </td>


                                        <td>

                                            {coupon.minimumCartAmount > 0

                                                ? `${coupon.minimumCartAmount.toLocaleString(
        "tr-TR",
        {
            minimumFractionDigits: 2
        }
    )} TL`

                                                : "Yok"
                                            }

                                        </td>


                                        <td>

                                            <strong>
                                                {coupon.usedCount}
                                            </strong>

                                            {" / "}

                                            {coupon.usageLimit === null

                                                ? "∞"

                                                : coupon.usageLimit
                                            }

                                        </td>


                                        <td>

                                            <div className="date-info">

                                                <span>
                                                    {formatDate(
                                                        coupon.startDate
                                                    )}
                                                </span>

                                                <span>
                                                    →
                                                </span>

                                                <span>
                                                    {formatDate(
                                                        coupon.endDate
                                                    )}
                                                </span>

                                            </div>

                                        </td>


                                        <td>

                                            <span
                                                className={`coupon-status ${getStatusClass(
        status
    )}`}
                                            >
                                                {status}
                                            </span>

                                        </td>


                                        <td>

                                            <div className="coupon-actions">

                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            coupon
                                                        )
                                                    }
                                                    title="Düzenle"
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        deleteCoupon(
                                                            coupon.id
                                                        )
                                                    }
                                                    title="Sil"
                                                >
                                                    🗑️
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                );
                            })}

                        </tbody>

                    </table>

                </div>
            )}

        </div>


        {/* MODAL */}

        {showModal && (

            <div
                className="coupon-modal-overlay"
                onMouseDown={(e) => {

                    if (
                        e.target ===
                        e.currentTarget
                    ) {
                        setShowModal(false);
                        resetForm();
                    }

                }}
            >

                <div className="coupon-modal">

                    <div className="coupon-modal-header">

                        <div>

                            <span>
                                🎟️
                            </span>

                            <div>

                                <h3>
                                    {editingCoupon
                                        ? "Kuponu Düzenle"
                                        : "Yeni Kupon"
                                    }
                                </h3>

                                <p>
                                    Kupon bilgilerini girin.
                                </p>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={() => {

                                setShowModal(false);
                                resetForm();

                            }}
                        >
                            ✕
                        </button>

                    </div>


                    <form
                        className="coupon-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label>
                                Kupon Kodu
                            </label>

                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        code: e.target.value.toUpperCase()
                                    }))
                                }
                                placeholder="Örn: YAZ2026"
                                maxLength={50}
                            />

                        </div>


                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    İndirim Türü
                                </label>

                                <select
                                    name="discountType"
                                    value={form.discountType}
                                    onChange={handleChange}
                                >

                                    <option value="Percentage">
                                        Yüzde (%)
                                    </option>

                                    <option value="FixedAmount">
                                        Sabit Tutar (TL)
                                    </option>

                                </select>

                            </div>


                            <div className="form-group">

                                <label>
                                    İndirim Değeri
                                </label>

                                <input
                                    type="number"
                                    name="discountValue"
                                    value={form.discountValue}
                                    onChange={handleChange}
                                    placeholder={
                                        form.discountType ===
                                        "Percentage"
                                            ? "20"
                                            : "100"
                                    }
                                    min="0"
                                    step="0.01"
                                />

                            </div>

                        </div>


                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Minimum Sepet Tutarı
                                </label>

                                <div className="input-with-suffix">

                                    <input
                                        type="number"
                                        name="minimumCartAmount"
                                        value={
                                            form.minimumCartAmount
                                        }
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />

                                    <span>
                                        TL
                                    </span>

                                </div>

                            </div>


                            <div className="form-group">

                                <label>
                                    Kullanım Limiti
                                </label>

                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={form.usageLimit}
                                    onChange={handleChange}
                                    placeholder="Boş = sınırsız"
                                    min="1"
                                />

                            </div>

                        </div>


                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Başlangıç Tarihi
                                </label>

                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Bitiş Tarihi
                                </label>

                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        <label className="active-toggle">

                            <input
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleChange}
                            />

                            <span className="toggle-box">
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Kupon aktif
                                </strong>

                                <small>
                                    Müşteriler bu kuponu
                                    kullanabilir.
                                </small>

                            </div>

                        </label>


                        <div className="coupon-form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {

                                    setShowModal(false);
                                    resetForm();

                                }}
                                disabled={saving}
                            >
                                İptal
                            </button>


                            <button
                                type="submit"
                                className="save-button"
                                disabled={saving}
                            >

                                {saving
                                    ? "Kaydediliyor..."
                                    : editingCoupon
                                        ? "Değişiklikleri Kaydet"
                                        : "Kupon Oluştur"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            </div>
        )}

    </div>
);


}

export default Coupons;
