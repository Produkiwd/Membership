// Pure orchestration for synthetic tests. No passwords are logged or returned.
export type ProvisionServices = {
  validate: (email: string, input: unknown) => Promise<{ valid: boolean; authUserExists: boolean }>;
  createAuth: (email: string, password: string) => Promise<boolean>;
  saveMember: (email: string, input: unknown) => Promise<unknown>;
};
export async function provisionMember(payload: { email?: unknown; password?: unknown; input?: unknown } | null, services: ProvisionServices) {
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload?.password === 'string' ? payload.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6 || !payload?.input) {
    return { status: 400, body: { error: 'Email, password minimal 6 karakter, dan pilihan akses wajib diisi.' } };
  }
  let authUserCreated = false;
  try {
    const validation = await services.validate(email, payload.input);
    if (!validation.valid) throw new Error('Pilihan akses belum valid.');
    if (!validation.authUserExists) authUserCreated = await services.createAuth(email, password);
    const member = await services.saveMember(email, payload.input);
    return { status: 200, body: { member, authUserCreated } };
  } catch (error) {
    // Auth and Postgres cannot share a transaction. Keep the account if the second step fails.
    // Repeating the same request detects the existing login and retries permissions without changing its password.
    return { status: 400, body: { authUserCreated, error: authUserCreated
      ? 'Akun login sudah dibuat, tetapi akses member belum tersimpan. Ulangi Tambah Member untuk menyelesaikan penyimpanan; sandi akun tetap sama.'
      : error instanceof Error ? error.message : 'Member belum dapat disimpan.' } };
  }
}
