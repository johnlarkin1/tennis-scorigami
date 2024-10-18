'use client';

import * as React from 'react';
import { Button } from '@/shadcn/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/shadcn/components/ui/select';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import { Separator } from '@/shadcn/components/ui/separator';
import { Switch } from '@/shadcn/components/ui/switch';
import { MoveHorizontal, MoveVertical, Calendar, Paintbrush, Hash } from 'lucide-react';
import { ViewType } from '@/components/scorigami/tree-control-types';
import TennisBall from '@/components/tennis-ball';
import { Toggle } from '@/shadcn/components/ui/toggle';
import { ToggleButton } from '@/shadcn/components/ui/toggle-button';

export type TreeControlsProps = {
  slams: { value: string; label: string }[];
  years: { value: string; label: string }[];
  selectedSlam: string;
  setSelectedSlam: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  showGradient: boolean;
  setShowGradient: (value: boolean) => void;
  showCount: boolean;
  setShowCount: (value: boolean) => void;
  viewType: ViewType;
  setViewType: (value: ViewType) => void;
};

export const TreeControls = ({
  slams,
  years,
  selectedSlam,
  setSelectedSlam,
  selectedYear,
  setSelectedYear,
  showGradient,
  setShowGradient,
  showCount,
  setShowCount,
  viewType,
  setViewType,
}: TreeControlsProps) => {
  return (
    <Card className='w-full max-w-6xl mx-auto mb-6 bg-gray-800 border-gray-700 rounded-md'>
      <CardContent className='p-6'>
        <h2 className='text-xl font-semibold'>Control Panel</h2>
        <p className='text-gray-400 mb-4 text-sm'>
          Customize the view settings for the tennis scorigami visualization. Select orientation, filters, and
          additional details.
        </p>
        <div className='flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4'>
          {/* View Type Selection */}
          <div className='flex gap-2'>
            <ToggleButton isActive={viewType === 'horizontal'} onClick={() => setViewType('horizontal')}>
              <MoveHorizontal className='mr-2 h-4 w-4' />
              <span>Horizontal</span>
            </ToggleButton>

            <ToggleButton isActive={viewType === 'vertical'} onClick={() => setViewType('vertical')}>
              <MoveVertical className='mr-2 h-4 w-4' />
              Vertical
            </ToggleButton>
          </div>

          {/* Toggle Options */}
          <div className='flex items-center gap-4 bg-background border-border rounded-md px-3 py-2'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='showGradient'
                checked={showGradient}
                onCheckedChange={(checked) => setShowGradient(checked as boolean)}
              />
              <label htmlFor='showGradient' className='text-sm text-gray-300 flex items-center'>
                <Paintbrush className='mr-1 h-4 w-4' />
                Show Gradient
              </label>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='showCount'
                checked={showCount}
                onCheckedChange={(checked) => setShowCount(checked as boolean)}
              />
              <label htmlFor='showCount' className='text-sm text-gray-300 flex items-center'>
                <Hash className='mr-1 h-4 w-4' />
                Show Count
              </label>
            </div>
          </div>

          {/* Slam and Year Selectors */}
          <div className='flex items-center gap-4'>
            <Select onValueChange={setSelectedSlam} value={selectedSlam}>
              <SelectTrigger className='bg-background text-foreground border-border rounded-md px-3 py-2 w-40'>
                <TennisBall className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Select Slam' />
              </SelectTrigger>
              <SelectContent className='min-w-[inherit] bg-background text-foreground border-border rounded-md'>
                {slams.map((slam) => (
                  <SelectItem key={slam.value} value={slam.value} className='hover:bg-gray-600'>
                    {slam.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger className='bg-background text-foreground border-border rounded-md px-3 py-2 w-32'>
                <Calendar className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Year' />
              </SelectTrigger>
              <SelectContent className='min-w-[inherit] bg-background text-foreground border-border rounded-md'>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value} className='hover:bg-gray-600'>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
