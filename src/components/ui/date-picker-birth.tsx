import * as React from "react";
import { format, setMonth, setYear } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerBirthProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  disabled?: (date: Date) => boolean;
  className?: string;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function DatePickerBirth({
  selected,
  onSelect,
  fromYear = 1940,
  toYear = new Date().getFullYear() - 18,
  disabled,
  className,
}: DatePickerBirthProps) {
  const [month, setMonthState] = React.useState<Date>(
    selected || new Date(2000, 0, 1),
  );

  const years = React.useMemo(() => {
    const result = [];
    for (let year = toYear; year >= fromYear; year--) {
      result.push(year);
    }
    return result;
  }, [fromYear, toYear]);

  const handleMonthChange = (value: string) => {
    const newMonth = setMonth(month, parseInt(value));
    setMonthState(newMonth);
  };

  const handleYearChange = (value: string) => {
    const newMonth = setYear(month, parseInt(value));
    setMonthState(newMonth);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() - 1);
    setMonthState(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() + 1);
    setMonthState(newDate);
  };

  return (
    <div className={cn("p-3 pointer-events-auto", className)}>
      {/* Custom Header with Selects */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handlePrevMonth}
          type="button">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          <Select
            value={month.getMonth().toString()}
            onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[120px] h-9 text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[200px] z-[9999]">
              {MONTHS.map((monthName, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={month.getFullYear().toString()}
            onValueChange={handleYearChange}>
            <SelectTrigger className="w-[90px] h-9 text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[200px] z-[9999]">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleNextMonth}
          type="button">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonthState}
        disabled={disabled}
        showOutsideDays={true}
        className="!p-0"
        classNames={{
          months: "flex flex-col",
          month: "space-y-2",
          caption: "hidden",
          nav: "hidden",
          table: "w-full border-collapse",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-medium text-xs",
          row: "flex w-full mt-1",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-primary/20",
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
          day_today: "bg-accent text-accent-foreground rounded-full",
          day_outside: "text-muted-foreground opacity-40",
          day_disabled: "text-muted-foreground opacity-30",
          day_hidden: "invisible",
        }}
      />

      {/* Selected Date Display */}
      {selected && (
        <div className="mt-3 pt-3 border-t border-border text-center">
          <span className="text-sm text-muted-foreground">
            Fecha seleccionada:{" "}
          </span>
          <span className="text-sm font-medium text-foreground">
            {format(selected, "d 'de' MMMM, yyyy", { locale: es })}
          </span>
        </div>
      )}
    </div>
  );
}
