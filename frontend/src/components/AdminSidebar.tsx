import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Settings, Users } from 'lucide-react';

export default function AdminSidebar() {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Feedback', icon: MessageSquare, href: '/admin/feedback' },
        { name: 'Residents', icon: Users, href: '/admin/residents' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
            <div className="p-4 mb-8">
                <h1 className="text-xl font-bold tracking-tight text-blue-400">Family Bridge</h1>
                <p className="text-xs text-slate-400">Staff Portal</p>
            </div>

            <nav className="flex-1">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
                            >
                                <item.icon size={20} className="group-hover:text-blue-400 transition-colors" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mt-auto p-4 bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
                        AS
                    </div>
                    <div>
                        <p className="text-xs font-bold">Admin Staff</p>
                        <p className="text-[10px] text-slate-400 italic">Connected to Supabase</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
