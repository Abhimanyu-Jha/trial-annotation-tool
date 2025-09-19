'use client'

import React, { type FC, useState, useEffect, useCallback } from 'react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar } from './calendar'
import { cn } from '@/lib/utils'

export interface DateRangePickerProps {
  /** Click handler for applying the updates from DateRangePicker. */
  onUpdate?: (values: { range: DateRange }) => void
  /** Initial value for start date */
  initialDateFrom?: Date | string
  /** Initial value for end date */
  initialDateTo?: Date | string
  /** Alignment of popover */
  align?: 'start' | 'center' | 'end'
  /** Option for locale */
  locale?: string
}

const formatDate = (date: Date, locale: string = 'en-us'): string => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === 'string') {
    // Split the date string to get year, month, and day parts
    const parts = dateInput.split('-').map((part) => parseInt(part, 10))
    // Create a new Date object using the local timezone
    // Note: Month is 0-indexed, so subtract 1 from the month part
    const date = new Date(parts[0], parts[1] - 1, parts[2])
    return date
  } else {
    // If dateInput is already a Date object, return it directly
    return dateInput
  }
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface PresetRange {
  from: Date
  to: Date
}

interface Preset {
  name: string
  label: string
}

// Define presets
const PRESETS: Preset[] = [
  { name: 'today', label: 'Today' },
  { name: 'yesterday', label: 'Yesterday' },
  { name: 'last7', label: 'Last 7 days' },
  { name: 'last14', label: 'Last 14 days' },
  { name: 'last30', label: 'Last 30 days' },
  { name: 'thisWeek', label: 'This Week' },
  { name: 'lastWeek', label: 'Last Week' },
  { name: 'thisMonth', label: 'This Month' },
  { name: 'lastMonth', label: 'Last Month' }
]

/** The DateRangePicker component allows a user to select a range of dates */
export const DateRangePicker: FC<DateRangePickerProps> = ({
  initialDateFrom,
  initialDateTo,
  onUpdate,
  align = 'end',
  locale = 'en-US'
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const [range, setRange] = useState<DateRange>({
    from: initialDateFrom ? getDateAdjustedForTimezone(initialDateFrom) : undefined,
    to: initialDateTo ? getDateAdjustedForTimezone(initialDateTo) : undefined
  })

  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined)

  const getPresetRange = (presetName: string): PresetRange => {
    const preset = PRESETS.find(({ name }) => name === presetName)
    if (!preset) throw new Error(`Unknown date range preset: ${presetName}`)
    const from = new Date()
    const to = new Date()
    const first = from.getDate() - from.getDay()

    switch (preset.name) {
      case 'today':
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'yesterday':
        from.setDate(from.getDate() - 1)
        from.setHours(0, 0, 0, 0)
        to.setDate(to.getDate() - 1)
        to.setHours(23, 59, 59, 999)
        break
      case 'last7':
        from.setDate(from.getDate() - 6)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last14':
        from.setDate(from.getDate() - 13)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last30':
        from.setDate(from.getDate() - 29)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisWeek':
        from.setDate(first)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastWeek':
        from.setDate(from.getDate() - 7 - from.getDay())
        to.setDate(to.getDate() - to.getDay() - 1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastMonth':
        from.setMonth(from.getMonth() - 1)
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setDate(0)
        to.setHours(23, 59, 59, 999)
        break
    }

    return { from, to }
  }

  const setPreset = (preset: string): void => {
    const presetRange = getPresetRange(preset)
    const newRange: DateRange = {
      from: presetRange.from,
      to: presetRange.to
    }
    setRange(newRange)
    onUpdate?.({ range: newRange })
  }

  const checkPreset = useCallback((): void => {
    if (!range.from) {
      setSelectedPreset(undefined)
      return
    }

    for (const preset of PRESETS) {
      const presetRange = getPresetRange(preset.name)

      const normalizedRangeFrom = new Date(range.from);
      normalizedRangeFrom.setHours(0, 0, 0, 0);
      const normalizedPresetFrom = new Date(presetRange.from);
      normalizedPresetFrom.setHours(0, 0, 0, 0);

      const normalizedRangeTo = new Date(range.to ?? range.from);
      normalizedRangeTo.setHours(0, 0, 0, 0);
      const normalizedPresetTo = new Date(presetRange.to ?? presetRange.from);
      normalizedPresetTo.setHours(0, 0, 0, 0);

      if (
        normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
        normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
      ) {
        setSelectedPreset(preset.name)
        return
      }
    }

    setSelectedPreset(undefined)
  }, [range])

  useEffect(() => {
    checkPreset()
  }, [range, checkPreset])

  // Sync with external prop changes (like reset)
  useEffect(() => {
    const newFrom = initialDateFrom ? getDateAdjustedForTimezone(initialDateFrom) : undefined
    const newTo = initialDateTo ? getDateAdjustedForTimezone(initialDateTo) : undefined

    // Only update if the external props have actually changed
    if (newFrom !== range.from || newTo !== range.to) {
      setRange({ from: newFrom, to: newTo })
    }
  }, [initialDateFrom, initialDateTo])

  const PresetButton = ({
    preset,
    label,
    isSelected
  }: {
    preset: string
    label: string
    isSelected: boolean
  }) => (
    <Button
      className={cn(
        "w-full justify-start font-normal h-8 px-2 mb-1 text-sm",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
      variant="ghost"
      onClick={() => {
        setPreset(preset);
        // Auto-close after preset selection
        setTimeout(() => setIsOpen(false), 100);
      }}
    >
      {label}
    </Button>
  )

  return (
    <Popover
      modal={true}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 px-3 py-2 justify-start text-left font-normal",
            !range.from && "text-muted-foreground"
          )}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          {range.from ? (
            range.to ? (
              `${formatDate(range.from, locale)} - ${formatDate(range.to, locale)}`
            ) : (
              formatDate(range.from, locale)
            )
          ) : (
            "Select a date"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-[520px] p-0" sideOffset={4}>
        <div className="flex">
          <div className="flex flex-col border-r min-w-[160px]">
            <div className="p-2">
              {PRESETS.map((preset) => (
                <PresetButton
                  key={preset.name}
                  preset={preset.name}
                  label={preset.label}
                  isSelected={selectedPreset === preset.name}
                />
              ))}
            </div>
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              onSelect={(value: { from?: Date, to?: Date } | undefined) => {
                const newRange = {
                  from: value?.from || undefined,
                  to: value?.to || undefined
                };
                setRange(newRange);

                // Only trigger update when a complete range is selected, but don't auto-close
                if (newRange.from && newRange.to) {
                  onUpdate?.({ range: newRange });
                }
              }}
              selected={range}
              numberOfMonths={1}
              defaultMonth={new Date()}
            />
            {range.from && range.to && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="text-sm text-muted-foreground">
                  {formatDate(range.from, locale)} - {formatDate(range.to, locale)}
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

DateRangePicker.displayName = 'DateRangePicker'