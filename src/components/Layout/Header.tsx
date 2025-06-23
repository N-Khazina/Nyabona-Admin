
import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ title, setSidebarOpen }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        {/* Right section is now empty, you can remove it entirely if not needed */}
        <div className="flex items-center space-x-4"></div>
      </div>
    </header>
  );
}
