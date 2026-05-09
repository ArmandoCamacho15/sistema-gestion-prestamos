import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-600">
          El formulario de autenticación se implementará en el Día 3.
        </p>
        <div className="mt-6 space-y-3 text-sm">
          <p>Esta ruta ya queda preparada para conectar Supabase Auth.</p>
          <Link className="text-blue-600 underline" href="/register">
            Ir a registro
          </Link>
        </div>
      </section>
    </main>
  );
}