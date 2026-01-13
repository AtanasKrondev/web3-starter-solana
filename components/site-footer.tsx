import { siteConfig } from '@/config/site';
import { buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{' '}
            <a
              href={siteConfig.links.website}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
            >
              hackbg
            </a>
            . Inspired by{' '}
            <a
              href="https://web3-starter-hackbg.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
            >
              web3 starter
            </a>
            . The source code is available on{' '}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
