import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CreateOrderPage } from "./features/orders/CreateOrderPage";
import { OrderDetailPage } from "./features/orders/OrderDetailPage";
import { OrdersPage } from "./features/orders/OrdersPage";
import { ProductsPage } from "./features/products/ProductsPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<CreateOrderPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  );
}
