import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shadcn/lib/utils';
import { Button } from '@/shadcn/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/shadcn/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/components/ui/popover';

export function ImprovedSelect({
  options,
  placeholder,
  onValueChange,
  className,
}: {
  options: { label: string; value: string }[];
  placeholder: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {value ? options.find((option) => option.value === value)?.label : placeholder}
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue);
                  onValueChange(currentValue);
                  setOpen(false);
                }}
              >
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
