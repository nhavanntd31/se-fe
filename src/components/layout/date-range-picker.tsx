import { CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  items: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export function DateRangePicker({ items, value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="grid gap-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-8 w-[180px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Chọn kì" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
