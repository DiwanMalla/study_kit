// Simplified use-toast hook

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  function toast(props: ToastProps) {
    // In a real app, this would trigger a toast notification
    // For now, we'll just log it or alert if it's an error
    console.log("Toast:", props);
    if (props.variant === "destructive") {
        console.error(props.title, props.description);
    }
  }

  return { toast };
}
