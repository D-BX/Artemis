"use client";
import React, { useEffect, useState } from "react";


interface MappedCustomer {
  customer_id: string;
  nessie_customer_id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
}

export default function CustomerGreeting() {
  const [firstName, setFirstName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

    async function fetchName() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${backend}/api/customers-mapped`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to fetch customers-mapped: ${res.status}`);
        }
        const data: MappedCustomer[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Prefer first_name if present, else split name
          if (data[0].first_name) {
            setFirstName(data[0].first_name);
          } else if (data[0].name) {
            setFirstName(data[0].name.split(" ")[0]);
          } else {
            setFirstName("");
          }
        } else {
          setFirstName("");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    }

    fetchName();
  }, []);

  if (loading) return null;
  if (error || !firstName) return null;

  return (
    <div className="w-full flex items-center justify-center py-4">
      <p className="text-lg md:text-xl text-[#FFE8B3] font-mono">
        Welcome back, {firstName}
      </p>
    </div>
  );
}
