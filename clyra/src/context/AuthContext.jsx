// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";


const AuthContext = createContext();


export function useAuth() {
return useContext(AuthContext);
}


export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);


useEffect(() => {
let mounted = true;


async function loadSession() {
const {
data: { session },
} = await supabase.auth.getSession();


if (!mounted) return;
setUser(session?.user ?? null);
setLoading(false);
}


loadSession();


const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
setUser(session?.user ?? null);
setLoading(false);
});


return () => {
mounted = false;
listener.subscription.unsubscribe();
};
}, []);


const signup = async ({ email, password, name }) => {
const { data, error } = await supabase.auth.signUp({
email,
password,
options: { data: { full_name: name } },
});
return { data, error };
};


const login = async ({ email, password }) => {
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
return { data, error };
};


const logout = async () => {
await supabase.auth.signOut();
setUser(null);
};


const value = {
user,
loading,
signup,
login,
logout,
};


return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}