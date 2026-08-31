
import "./AdminUsers.css";
import { useEffect, useState } from "react";
import api from "../../../services/api";

function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getUsers = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/Admin/users");

            setUsers(response.data);

        } catch (error) {

            console.error(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
                return;
            }

            if (error.response?.status === 403) {
                setError(
                    "Bu sayfaya erişmek için admin yetkisi gereklidir."
                );
                return;
            }

            setError(
                error.response?.data?.message ||
                "Kullanıcılar yüklenemedi."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const updateRole = async (user) => {

        const newRole =
            user.role === "Admin"
                ? "User"
                : "Admin";

        const confirmed = window.confirm(
            `${user.firstName} ${user.lastName} kullanıcısının rolü "${newRole}" olarak değiştirilsin mi?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await api.put(
                `/Admin/users/${user.id}/role`,
{
    role: newRole
}
);

await getUsers();

} catch (error) {

    console.error(error);

    setError(
        error.response?.data?.message ||
        "Kullanıcı rolü güncellenemedi."
    );

}
};

const deleteUser = async (user) => {

    const confirmed = window.confirm(
        `${user.firstName} ${user.lastName} kullanıcısını silmek istediğinize emin misiniz?`
    );

    if (!confirmed) {
        return;
    }

    try {

        setError("");

        await api.delete(
            `/Admin/users/${user.id}`
        );

        await getUsers();

    } catch (error) {

        console.error(error);

        setError(
            error.response?.data?.message ||
            "Kullanıcı silinemedi."
        );

    }
};

return (
    <div className="admin-page">

        <div className="admin-page-header">

            <div>

                    <span>
                        KULLANICI YÖNETİMİ
                    </span>

                <h2>
                    Kullanıcılar
                </h2>

                <p>
                    Sistemde kayıtlı kullanıcıları
                    buradan yönetebilirsiniz.
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
                    Kullanıcı Listesi
                </h3>

                <span>
                        {users.length} kullanıcı
                    </span>

            </div>


            {loading ? (

                <div className="admin-empty">

                        <span>
                            ⏳
                        </span>

                    <strong>
                        Kullanıcılar yükleniyor...
                    </strong>

                </div>

            ) : users.length === 0 ? (

                <div className="admin-empty">

                        <span>
                            👥
                        </span>

                    <strong>
                        Henüz kullanıcı bulunmuyor.
                    </strong>

                </div>

            ) : (

                <div className="admin-table-wrapper">

                    <table className="admin-table">

                        <thead>

                        <tr>

                            <th>ID</th>
                            <th>Ad Soyad</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Email Doğrulama</th>
                            <th>İşlemler</th>

                        </tr>

                        </thead>

                        <tbody>

                        {users.map((user) => (

                            <tr key={user.id}>

                                <td>
                                    #{user.id}
                                </td>

                                <td>
                                    <strong>
                                        {user.firstName}{" "}
                                        {user.lastName}
                                    </strong>
                                </td>

                                <td>
                                    {user.email}
                                </td>

                                <td>

                                            <span
                                                className={
                                                    user.role === "Admin"
                                                        ? "admin-role admin-role-admin"
                                                        : "admin-role admin-role-user"
                                                }
                                            >
                                                {user.role}
                                            </span>

                                </td>

                                <td>

                                    {user.isEmailVerified ? (
                                        <span className="admin-status-success">
                                                    ✓ Doğrulandı
                                                </span>
                                    ) : (
                                        <span className="admin-status-warning">
                                                    ⚠ Doğrulanmadı
                                                </span>
                                    )}

                                </td>

                                <td>

                                    <div className="admin-actions">

                                        <button
                                            className="admin-edit-button"
                                            onClick={() =>
                                                updateRole(user)
                                            }
                                        >
                                            {user.role === "Admin"
                                                ? "User Yap"
                                                : "Admin Yap"}
                                        </button>

                                        <button
                                            className="admin-delete-button"
                                            onClick={() =>
                                                deleteUser(user)
                                            }
                                        >
                                            Sil
                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    </div>
);
}

export default AdminUsers;
