"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");
    const phone = localStorage.getItem("phone");
    const token = localStorage.getItem("token");

    // If neither email, phone nor token exist → redirect
    if (!email && !token) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else {
      setAllowed(true);
    }
  }, []);

  // Avoid flicker while checking
  if (!allowed) return null;

  return children;
}
