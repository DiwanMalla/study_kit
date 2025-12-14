export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-130px)] bg-muted/30">
      {children}
    </div>
  )
}
