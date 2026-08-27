export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--cream)' }}>
      <p style={{ color: 'var(--brown-400)', letterSpacing: '0.2em' }}
        className="text-xs uppercase mb-12">
        EDU PLATFORM
      </p>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
