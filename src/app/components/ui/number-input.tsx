import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "./utils"

export interface NumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number | undefined) => void
  step?: number
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, onValueChange, step = 1, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const combinedRef = (ref as React.MutableRefObject<HTMLInputElement>) || inputRef

    const handleIncrement = () => {
      const input = combinedRef.current
      if (input) {
        input.stepUp(step)
        const newValue = parseFloat(input.value)
        onValueChange?.(isNaN(newValue) ? undefined : newValue)
        // Trigger change event for React Hook Form or other listeners
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    const handleDecrement = () => {
      const input = combinedRef.current
      if (input) {
        input.stepDown(step)
        const newValue = parseFloat(input.value)
        onValueChange?.(isNaN(newValue) ? undefined : newValue)
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value)
      onValueChange?.(isNaN(val) ? undefined : val)
    }

    return (
      <div className="relative group">
        <input
          type="number"
          className={cn(
            "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          ref={combinedRef}
          onChange={handleChange}
          {...props}
        />
        <div className="absolute right-0 top-0 h-full flex flex-col border-l border-input overflow-hidden rounded-r-xl">
          <button
            type="button"
            onClick={handleIncrement}
            className="flex-1 px-2 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-input flex items-center justify-center"
            tabIndex={-1}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="flex-1 px-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
            tabIndex={-1}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
