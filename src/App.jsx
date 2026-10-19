import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Splash from './components/Splash.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Info from './pages/Info.jsx';
import NotFound from './pages/NotFound.jsx';

// Account and admin are only needed by a few visitors, so they load on demand.
const Customize = lazy(() => import('./pages/Customize.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Fallback = <section className="page-section"><div className="container"><div className="sk-block" style={{ minHeight: 260 }} /></div></section>;

export default function App() {
  return (
    <>
    <Splash />
    <Suspense fallback={Fallback}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="product/:slug" element={<Product />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="customize/:slug?" element={<Customize />} />
          <Route path="login" element={<Login />} />
          <Route path="account/:tab?" element={<Account />} />
          <Route path="admin/:tab?" element={<Admin />} />
          <Route path="info/:page" element={<Info />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
    </>
  );
}
