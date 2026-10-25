import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";

type AuthApi = {
  getSession: ReturnType<typeof vi.fn>;
  onAuthStateChange: ReturnType<typeof vi.fn>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
};

function makeSupabase(opts: { configured: boolean; signInError?: boolean; isAdmin?: boolean | "error" }) {
  const auth: AuthApi = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signInWithPassword: vi.fn().mockResolvedValue(
      opts.signInError ? { error: { message: "Invalid login credentials" } } : { error: null }
    ),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  const rpc = vi.fn().mockResolvedValue(
    opts.isAdmin === "error" ? { data: null, error: { message: "function public.is_admin() does not exist" } } : { data: opts.isAdmin ?? false, error: null }
  );
  vi.doMock("@/lib/supabase", () => ({
    isSupabaseConfigured: () => opts.configured,
    supabase: { auth, rpc },
  }));
  return { auth, rpc };
}

async function load(dev: boolean) {
  vi.resetModules();
  vi.stubEnv("DEV", dev);
  const mod = await import("@/contexts/AuthContext");
  const wrapper = ({ children }: { children: React.ReactNode }) => <mod.AuthProvider>{children}</mod.AuthProvider>;
  const hook = renderHook(() => mod.useAuth(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
});

describe("autenticazione admin (fail-closed)", () => {
  it("PRODUZIONE senza chiavi Supabase: qualunque email/password NON apre l'area admin", async () => {
    makeSupabase({ configured: false });
    const { result } = await load(false);
    let res!: { error: Error | null };
    await act(async () => {
      res = await result.current.signIn("chiunque@example.com", "qualsiasi");
    });
    expect(res.error?.message).toMatch(/non configurata/i);
    expect(result.current.user).toBeNull();
    expect(result.current.isMockAuth).toBe(false);
    expect(localStorage.getItem("srs_mock_auth_user")).toBeNull();
  });

  it("un residuo di login finto nel localStorage non dà accesso in produzione", async () => {
    makeSupabase({ configured: false });
    localStorage.setItem("srs_mock_auth_user", JSON.stringify({ id: "mock-admin-user", email: "x@y.it" }));
    const { result } = await load(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("srs_mock_auth_user")).toBeNull();
  });

  it("sviluppo locale (npm run dev) senza chiavi: login finto consentito", async () => {
    makeSupabase({ configured: false });
    const { result } = await load(true);
    await act(async () => {
      await result.current.signIn("dev@example.com", "x");
    });
    expect(result.current.user?.email).toBe("dev@example.com");
  });

  it("utente autenticato ma NON nell'elenco admin: rifiutato e disconnesso", async () => {
    const { auth, rpc } = makeSupabase({ configured: true, isAdmin: false });
    const { result } = await load(false);
    let res!: { error: Error | null };
    await act(async () => {
      res = await result.current.signIn("intruso@example.com", "password-giusta");
    });
    expect(rpc).toHaveBeenCalledWith("is_admin");
    expect(res.error?.message).toMatch(/non è autorizzato/i);
    expect(auth.signOut).toHaveBeenCalled();
  });

  it("se la verifica admin fallisce (es. migrazione non eseguita) l'accesso è negato", async () => {
    const { auth } = makeSupabase({ configured: true, isAdmin: "error" });
    const { result } = await load(false);
    let res!: { error: Error | null };
    await act(async () => {
      res = await result.current.signIn("admin@example.com", "pw");
    });
    expect(res.error).not.toBeNull();
    expect(auth.signOut).toHaveBeenCalled();
  });

  it("admin nell'elenco: accesso consentito", async () => {
    makeSupabase({ configured: true, isAdmin: true });
    const { result } = await load(false);
    let res!: { error: Error | null };
    await act(async () => {
      res = await result.current.signIn("admin@example.com", "pw");
    });
    expect(res.error).toBeNull();
  });

  it("dopo 5 tentativi errati il login si blocca per un minuto", async () => {
    const { auth } = makeSupabase({ configured: true, signInError: true });
    const { result } = await load(false);
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await result.current.signIn("admin@example.com", "sbagliata");
      });
    }
    expect(auth.signInWithPassword).toHaveBeenCalledTimes(5);
    let res!: { error: Error | null };
    await act(async () => {
      res = await result.current.signIn("admin@example.com", "sbagliata");
    });
    expect(res.error?.message).toMatch(/Troppi tentativi/);
    expect(auth.signInWithPassword).toHaveBeenCalledTimes(5); // il sesto non arriva al server
  });

  it("l'errore di login non rivela se l'email esiste", async () => {
    makeSupabase({ configured: true, signInError: true });
    const { result } = await load(false);
    let res!: { error: Error | null };
    await act(async () => {
      res = await result.current.signIn("a@b.it", "x");
    });
    expect(res.error?.message).toBe("Email o password non corretti.");
  });
});
