// TODO: for when it's actually supported
// import { useTheme } from 'next-themes';
// import { Moon, Sun } from 'lucide-react';
// import { useState, useEffect } from 'react';

// export function ThemeToggle() {
//   const [mounted, setMounted] = useState(false);
//   const { setTheme, resolvedTheme } = useTheme();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return null;
//   }

//   return (
//     <button
//       onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
//       className='fixed bottom-4 left-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
//     >
//       {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
//     </button>
//   );
// }

import { useTheme } from 'next-themes';
import { Moon, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setTheme('dark');
  }, []);

  if (!mounted) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='fixed bottom-4 left-4 p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        >
          <Moon />
        </Button>

        {/* Lock Icon Overlay on Hover */}
        {/* <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
            <Lock className='text-gray-500 dark:text-gray-300' />
          </div> */}

        {/* Tooltip on Hover */}
        {/* <div className='absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-xs p-1 rounded'>
            Dark mode is only supported at the moment
          </div> */}
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Dark Mode Only</DialogTitle>
          <DialogDescription>Currently, only dark mode is supported. I'm working on it though!</DialogDescription>
        </DialogHeader>
        <DialogFooter className='sm:justify-start'>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
