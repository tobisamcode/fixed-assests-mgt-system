"use client";

import { checkPasswordStrength } from "@/lib/form-utils";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  showFeedback?: boolean;
  className?: string;
}

export function PasswordStrength({
  password,
  showFeedback = true,
  className,
}: PasswordStrengthProps) {
  const { score, feedback, isStrong } = checkPasswordStrength(password);

  if (!password) return null;

  const getStrengthColor = () => {
    if (score >= 5) return "bg-green-500";
    if (score >= 4) return "bg-yellow-500";
    if (score >= 2) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthText = () => {
    if (score >= 5) return "Very Strong";
    if (score >= 4) return "Strong";
    if (score >= 2) return "Medium";
    return "Weak";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded transition-colors duration-300",
              score >= level ? getStrengthColor() : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Strength Text */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength:</span>
        <span
          className={cn(
            "font-medium",
            isStrong ? "text-green-600" : "text-orange-600"
          )}
        >
          {getStrengthText()}
        </span>
      </div>

      {/* Feedback */}
      {showFeedback && feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Suggestions:</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {feedback.map((suggestion, index) => (
              <li key={index} className="flex items-center space-x-1">
                <span className="w-1 h-1 bg-orange-400 rounded-full flex-shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
