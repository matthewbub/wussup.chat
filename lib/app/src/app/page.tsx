"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Dynamically load Swagger UI scripts and styles
    const loadSwaggerUI = async () => {
      // Add CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css";
      document.head.appendChild(link);

      // Add JS
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js";
      script.crossOrigin = "anonymous";

      script.onload = () => {
        // @ts-ignore
        window.ui = SwaggerUIBundle({
          url: "https://auth.6matbub.workers.dev/docs",
          dom_id: "#swagger-ui",
        });
      };

      document.body.appendChild(script);
    };

    loadSwaggerUI();

    // Cleanup function
    return () => {
      document
        .querySelectorAll('[src*="swagger-ui"], [href*="swagger-ui"]')
        .forEach((el) => el.remove());
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div id="swagger-ui" />
    </div>
  );
}
