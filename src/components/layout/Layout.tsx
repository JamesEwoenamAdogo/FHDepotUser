import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useEffect } from "react";

export const Layout = () => {
  const location = useLocation();
  const isShop = location.pathname === "/shop";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://beta.leadconnectorhq.com/loader.js";
    script.setAttribute(
      "data-resources-url",
      "https://beta.leadconnectorhq.com/chat-widget/loader.js",
    );
    script.setAttribute("data-widget-id", "6a182446d37f04944aa9ce24");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      const widgetContainer = document.querySelector("chat-widget");
      if (widgetContainer) {
        widgetContainer.remove();
      }
    };
  }, []);

  useEffect(() => {
    const styleId = "hide-chat-widget-style";
    let styleEl = document.getElementById(styleId);

    if (isShop) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = `chat-widget { display: none !important; }`;
        document.head.appendChild(styleEl);
      }
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }
  }, [isShop]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
