interface AuthErrorProps {
  message: string | null;
}

/**
 * Auth Error Component
 * Displays authentication error messages
 */
export function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;

  return (
    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
      {message}
    </div>
  );
}
