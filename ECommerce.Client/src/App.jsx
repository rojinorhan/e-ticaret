import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Verify from "./pages/Verify/Verify";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

// User
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Orders from "./pages/Orders/Orders";
import OrderDetail from "./pages/OrderDetail/OrderDetail";
import Profile from "./pages/Profile/Profile";
import Favorites from "./pages/Favorites/Favorites";
// Admin
import ProtectedRoute from "./pages/Admin/ProtectedRoute";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import AdminProducts from "./pages/Admin/Products/AdminProducts";
import AdminCategories from "./pages/Admin/Categories/AdminCategories";
import AdminOrders from "./pages/Admin/Orders/AdminOrders";
import AdminUsers from "./pages/Admin/Users/AdminUsers";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ==================== */}
                {/* AUTH */}
                {/* ==================== */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/verify"
                    element={<Verify />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />


                {/* ==================== */}
                {/* USER */}
                {/* ==================== */}

                <Route
                    path="/home"
                    element={<Home />}
                />
                <Route path="/profile" element={<Profile />} />
                <Route
                    path="/favorites"
                    element={<Favorites />}
                />
                <Route
                    path="/products"
                    element={<Products />}
                />

                <Route
                    path="/products/:id"
                    element={<ProductDetail />}
                />

                <Route
                    path="/cart"
                    element={<Cart />}
                />

                <Route
                    path="/orders"
                    element={<Orders />}
                />

                <Route
                    path="/orders/:id"
                    element={<OrderDetail />}
                />


                {/* ==================== */}
                {/* ADMIN */}
                {/* ==================== */}

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/admin"
                        element={<AdminLayout />}
                    >

                        <Route
                            index
                            element={<Dashboard />}
                        />

                        <Route
                            path="products"
                            element={<AdminProducts />}
                        />

                        <Route
                            path="categories"
                            element={<AdminCategories />}
                        />

                        <Route
                            path="orders"
                            element={<AdminOrders />}
                        />

                        <Route
                            path="users"
                            element={<AdminUsers />}
                        />

                    </Route>

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;