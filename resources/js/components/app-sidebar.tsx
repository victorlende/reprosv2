import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { BookOpen, Folder, LayoutGrid, Receipt, Settings, Database, FileText, Code, ArrowRightLeft, ReceiptText, User as UserIcon, MonitorCheck, FileClock, CreditCard, Building2 } from 'lucide-react';
import AppLogo from './app-logo';


export function AppSidebar() {
    const { url, auth } = usePage<{ auth: any }>().props;

    const accessibleMenus = auth.user.accessible_menus || [];
    const isSuperUser = auth.user.role === 'super_user';

    const mainNavItems = useMemo<NavItem[]>(() => [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            key: 'dashboard',
        },
        {
            title: 'Rekon FTR - PSW',
            href: '/rekonsiliasi',
            icon: ArrowRightLeft,
            key: 'rekonsiliasi',
        },
        {
            title: 'Monitor PSW to T24',
            href: '/rekonsiliasi/monitor-psw-t24',
            icon: MonitorCheck,
            key: 'rekonsiliasi.monitor',
        },
        {
            title: 'Mutasi Rekening',
            href: '/rekonsiliasi/mutasi-rekening',
            icon: FileClock,
            key: 'rekonsiliasi.mutasi',
        },
        {
            title: 'Admin',
            icon: Settings,
            key: 'admin',
            items: [
                {
                    title: 'Users',
                    href: '/admin/users',
                    icon: UserIcon,
                    key: 'admin.users',
                },
                {
                    title: 'Kabupaten',
                    href: '/admin/districts',
                    icon: Building2,
                    key: 'admin.districts',
                },
                {
                    title: 'Vendor',
                    href: '/admin/vendors',
                    icon: Database,
                    key: 'admin.vendors',
                },
                {
                    title: 'Template FTR',
                    href: '/admin/templates',
                    icon: FileText,
                    key: 'admin.templates',
                },
                {
                    title: 'Proccode',
                    href: '/admin/proccodes',
                    icon: Code,
                    key: 'admin.proccodes',
                },
                {
                    title: 'Template Struk',
                    href: '/admin/receipt-templates',
                    icon: ReceiptText,
                    key: 'admin.receipt-templates',
                },
                {
                    title: 'Nomor Rekening',
                    href: '/admin/account-numbers',
                    icon: CreditCard,
                    key: 'admin.account-numbers',
                },
                {
                    title: 'System Logs',
                    href: '/admin/logs',
                    icon: FileText,
                    key: 'admin.logs',
                },
                {
                    title: 'General Setting',
                    href: '/settings/system',
                    icon: Settings,
                    key: 'settings.system',
                },
            ],
        },
    ], []);

    const footerNavItems: NavItem[] = [
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    const filteredNavItems = mainNavItems.map(item => {
        // Check if item itself is accessible
        const hasAccess = isSuperUser ||
            !item.key ||
            accessibleMenus.includes(item.key) ||
            // Default access for basic roles who have empty accessible_menus
            (item.key === 'dashboard') ||
            (item.key === 'rekonsiliasi' && ['admin', 'user_rekon', 'viewer', 'kantor_cabang'].includes(auth.user.role)) ||
            (item.key === 'rekonsiliasi.monitor' && ['admin', 'user_rekon'].includes(auth.user.role));

        if (!hasAccess) return null;

        // If it has children, filter them too
        if (item.items) {
            const filteredChildren = item.items.filter(child =>
                isSuperUser || !child.key || accessibleMenus.includes(child.key)
            );
            // If no children left, and it was a grouping, maybe hide it? 
            // Or keep it if the parent itself was explicitly granted?
            // Strategy: If parent is granted, show it. But if children are filtered out, show empty group?
            // Better strategy for 'Admin' group: If 'admin' key is checked, effectively means "show admin group".
            // But we want to filter sub-items.

            // If user has 'admin' in accessibleMenus, they see the admin group.
            // But inside, they only see what is also checked?
            // Wait, usually the group key access implies visibility of the group container.
            // Let's rely on individual child keys. If parent has key 'admin', checking it enables the group visibility.

            return { ...item, items: filteredChildren };
        }

        return item;
    }).filter(Boolean) as NavItem[];


    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
