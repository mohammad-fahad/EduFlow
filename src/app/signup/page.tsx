"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

console.log(data, error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created. Now login.");
    router.push("/login");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-96 p-6 border rounded space-y-3">
        <h1 className="text-xl font-bold">Sign Up</h1>

        <input
          className="w-full border p-2"
          placeholder="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signup}
          className="w-full bg-black text-white p-2"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}