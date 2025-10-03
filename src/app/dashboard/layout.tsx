
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Box,
  LayoutGrid,
  Palette,
  Sparkles,
  Smartphone,
  Rocket,
  User,
  BookUser,
  Home,
  FlaskConical,
  BookOpenCheck,
  Lightbulb,
  PlusCircle,
  LogOut,
  LogIn,
  BrainCircuit,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/firebase';
import { signOutAction } from '@/app/login/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { deployAction } from './actions';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/my-bar', label: 'My Bar', icon: Home },
  { href: '/dashboard/recipe-book', label: 'My Recipe Book', icon: BookUser },
  { href: '/dashboard/bar-guests', label: 'Bar Guests', icon: Users },
  { href: '/dashboard/customize', label: 'Customize', icon: Palette },
  { href: '/dashboard/preview', label: 'Preview', icon: Smartphone },
];

function UserMenu() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
       <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <User />
        </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
           <Avatar>
              <AvatarImage src={user?.photoURL ?? undefined} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {user && !user.isAnonymous ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOutAction} className="w-full">
                <button type="submit" className="w-full">
                    <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </button>
            </form>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/login">
                <PlusCircle className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </DropdownMenuItem>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mainContentTitle = [...navItems, {href: '/dashboard/content', label: 'Master Recipes'}, {href: '/dashboard/mixology-lab', label: 'Mixology Lab'}, {href: '/dashboard/content/add', label: 'Add Cocktail'}, {href: '/dashboard/ai-cocktail-generator', label: 'AI Cocktail Generator'}, {href: '/dashboard/profile', label: 'My Profile'}].find(item => pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true))?.label || 'Dashboard'

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold font-headline">The Cocktail Companion</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true)}
                  className="justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <SidebarGroup>
                <SidebarGroupLabel className="flex items-center">
                  <BookOpenCheck />
                  <span>Master Recipes</span>
                </SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/content'}>
                      <Link href="/dashboard/content">
                        <BookOpenCheck />
                        <span>All Recipes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/content/add'}>
                      <Link href="/dashboard/content/add">
                        <PlusCircle />
                        <span>Add Cocktail</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
             <SidebarGroup>
                <SidebarGroupLabel className="flex items-center">
                  <FlaskConical />
                  <span>Mixology Lab</span>
                </SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/mixology-lab'}>
                      <Link href="/dashboard/mixology-lab">
                        <Lightbulb />
                        <span>Quizzes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/ai-cocktail-generator'}>
                      <Link href="/dashboard/ai-cocktail-generator">
                        <BrainCircuit />
                        <span>AI Generator</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <form action={deployAction} className="w-full">
            <Button className='w-full' type="submit">
              <Rocket className="mr-2 h-4 w-4" /> Deploy
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 border-b bg-background/80 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-4">
             <SidebarTrigger />
             <h1 className="text-lg font-semibold font-headline">
               {mainContentTitle}
             </h1>
          </div>
          <UserMenu />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    