import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Material Design Compliant Button
 * 
 * HARD RULES (non-negotiable):
 * - Default: h-12 (48px) - Material Design minimum
 * - Small: h-10 (40px) - absolute minimum for secondary actions
 * - Large: h-14 (56px) - primary CTAs
 * - Icon: 48x48px square - touch-safe
 * - NO arbitrary values allowed outside this file
 * - Text: minimum text-sm (14px), prefer text-base (16px)
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center cursor-pointer whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
                outline: "border-2 border-border bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 px-4 py-2 text-base",      // 48px - Material Design standard
                sm: "h-10 px-3 text-sm",                   // 40px - absolute minimum
                lg: "h-14 px-6 text-lg",                   // 56px - primary actions
                icon: "h-12 w-12",                         // 48x48px - touch-safe square
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
