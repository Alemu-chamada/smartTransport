import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export function Toast({
  isOpen,
  onClose,
  message,
  type = "info",
  duration = 3000,
}: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const backgrounds = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className={`
            fixed top-4 left-1/2 z-50
            flex items-center gap-3 px-4 py-3 rounded-xl
            border shadow-lg backdrop-blur-sm
            ${backgrounds[type]}
          `}
        >
          {icons[type]}
          <p className="text-sm font-medium text-foreground">{message}</p>
          <button
            onClick={onClose}
            className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
