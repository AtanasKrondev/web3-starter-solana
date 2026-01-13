'use client';

import * as React from 'react';
import Link, { LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarOpen } from 'lucide-react';

import { siteConfig } from '@/config/site';
import { demoConfig } from '@/config/demo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 w-9 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <SidebarOpen className="size-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-6 pr-0 w-4/5">
        <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <Icons.logo className="mr-2 size-6" />
          <span className="font-bold">{siteConfig.name}</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-6rem)]">
          <div className="flex flex-col space-y-3">
            <MobileLink href="/" onOpenChange={setOpen}>
              Home
            </MobileLink>
            <MobileLink href="/#features" onOpenChange={setOpen}>
              Features
            </MobileLink>
            <MobileLink href="/demo" onOpenChange={setOpen}>
              Demo
            </MobileLink>
            <DemoSidebarNav
              items={demoConfig.sidebarNav}
              onOpenChange={setOpen}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}

type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
} & (
  | {
      href: string;
      items?: never;
    }
  | {
      href?: string;
      items: NavItem[];
    }
);

interface DemoSidebarNavProps {
  items: SidebarNavItem[];
  onOpenChange?: (open: boolean) => void;
}

function DemoSidebarNav({ items, onOpenChange }: DemoSidebarNavProps) {
  const pathname = usePathname();

  return items.length ? (
    <div className="w-full">
      {items.map((item, index) => (
        <div key={index} className={cn('pb-8')}>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-bold">
            {item.title}
          </h4>
          {item.items ? (
            <DemoSidebarNavItems
              items={item.items}
              pathname={pathname}
              onOpenChange={(open) => onOpenChange?.(open)}
            />
          ) : null}
        </div>
      ))}
    </div>
  ) : null;
}

interface DemoSidebarNavItemsProps {
  items: SidebarNavItem[];
  pathname: string | null;
  onOpenChange?: (open: boolean) => void;
}

function DemoSidebarNavItems({
  items,
  pathname,
  onOpenChange,
}: DemoSidebarNavItemsProps) {
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {items.map((item, index) =>
        !item.disabled && item.href ? (
          <Link
            key={index}
            href={item.href}
            className={cn(
              'flex w-full items-center rounded-md p-2 hover:underline',
              {
                'bg-muted': pathname === item.href,
              }
            )}
            target={item.external ? '_blank' : ''}
            rel={item.external ? 'noreferrer' : ''}
            onClick={() => onOpenChange?.(false)}
          >
            {item.title}
          </Link>
        ) : (
          <span
            key={index}
            className="flex w-full cursor-not-allowed items-center rounded-md p-2 opacity-60"
          >
            {item.title}
          </span>
        )
      )}
    </div>
  ) : null;
}
