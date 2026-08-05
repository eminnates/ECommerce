import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/products", label: "Ürünler" },
  { to: "/orders/new", label: "Sipariş Oluştur" },
  { to: "/orders", label: "Siparişler" },
];

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-5 py-4 lg:px-8">
          <Link to="/products" className="shrink-0">
            <span className="text-xl font-black uppercase tracking-[0.28em] text-ink-900">
              Mağaza
            </span>
          </Link>

          <nav className="flex flex-1 items-center gap-7">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                // "/orders" linki "/orders/new" sayfasındayken aktif görünmesin.
                end={item.to === "/orders"}
                className={({ isActive }) =>
                  `label-caps relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-ink-900 after:transition-transform ${
                    isActive
                      ? "text-ink-900 after:scale-x-100"
                      : "text-ink-500 after:scale-x-0 hover:text-ink-900 hover:after:scale-x-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/orders/new"
            className="label-caps hidden items-center gap-2 border border-ink-900 px-4 py-2.5 text-ink-900 transition-colors hover:bg-ink-900 hover:text-white sm:inline-flex"
          >
            <CartIcon />
            Sepet
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-10 lg:px-8">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-ink-200">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-10 lg:px-8">
          <span className="text-lg font-black uppercase tracking-[0.28em] text-ink-900">Mağaza</span>
          <p className="label-caps text-ink-400">Ürün kataloğu ve sipariş yönetimi</p>
        </div>
      </footer>
    </div>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
      <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}
