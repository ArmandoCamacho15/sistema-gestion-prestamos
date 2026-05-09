import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Crear cuenta</h1>
        <p className="mt-2 text-sm text-slate-600">
          El formulario de registro se implementará en el Día 3.
        </p>
        <div className="mt-6 space-y-3 text-sm">
          <p>Esta ruta ya queda preparada para insertar los settings por defecto.</p>
          <Link className="text-blue-600 underline" href="/login">
            Volver a inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  );
}