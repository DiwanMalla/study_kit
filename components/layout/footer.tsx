export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto py-8 px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Super Student Kit. All rights reserved.</p>
      </div>
    </footer>
  )
}
