"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function InstitutionPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [user, setUser] = useState<any>(null);
  const [institution, setInstitution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Load session + existing institution
 useEffect(() => {
  const load = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const userId = sessionData.session.user.id;

      const res = await fetch(`/api/institution/get?ownerId=${userId}`);

      if (!res.ok) {
        throw new Error(`GET failed: ${res.status}`);
      }

      const data = await res.json();

      console.log("DATA:", data);

      setUser(sessionData.session.user);

      // ensure array always
      setInstitution(Array.isArray(data) ? data : []);

      setLoading(false);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setInstitution([]);
      setLoading(false);
    }
  };

  load();
}, [router]);

  // 🏫 Create institution
  const createInstitution = async () => {
    if (!name) return alert("Enter institution name");

    const res = await fetch("/api/institution/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        ownerId: user?.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setInstitution((prev) => [...prev, data.institution]);
    alert("Institution created successfully!");
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
 <div className="p-6 space-y-4">
  <h1 className="text-xl font-bold">Institution Page</h1>

  <div className="flex gap-2">
    <input
      className="border p-2"
      placeholder="Institution Name"
      onChange={(e) => setName(e.target.value)}
    />

    <button
      onClick={createInstitution}
      className="bg-black text-white p-2"
    >
      Create
    </button>
  </div>

  {institution.length > 0 && (
    <div className="p-4 border rounded space-y-2">
      {institution.map((inst: any) => (
        <div key={inst.id}>
          <b>Name:</b> {inst.name}
        </div>
      ))}
    </div>
  )}
</div>
  );
}