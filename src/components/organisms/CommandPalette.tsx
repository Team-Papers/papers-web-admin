import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Search,
  LayoutDashboard,
  Users,
  PenTool,
  BookOpen,
  Receipt,
  Settings,
  Moon,
  Sun,
  LogOut,
  Command,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      description: 'Acceder au tableau de bord',
      icon: <LayoutDashboard size={18} />,
      action: () => navigate('/'),
      keywords: ['home', 'accueil', 'dashboard'],
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      description: 'Gerer les utilisateurs',
      icon: <Users size={18} />,
      action: () => navigate('/users'),
      keywords: ['user', 'membres', 'clients'],
    },
    {
      id: 'authors',
      label: 'Auteurs',
      description: 'Gerer les auteurs',
      icon: <PenTool size={18} />,
      action: () => navigate('/authors'),
      keywords: ['author', 'ecrivain', 'createur'],
    },
    {
      id: 'books',
      label: 'Livres',
      description: 'Gerer les livres',
      icon: <BookOpen size={18} />,
      action: () => navigate('/books'),
      keywords: ['book', 'catalogue', 'publications'],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      description: 'Voir les transactions',
      icon: <Receipt size={18} />,
      action: () => navigate('/transactions'),
      keywords: ['paiement', 'vente', 'argent', 'money'],
    },
    {
      id: 'theme',
      label: theme === 'dark' ? 'Mode clair' : 'Mode sombre',
      description: 'Changer le theme',
      icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />,
      action: () => {
        toggleTheme();
        setIsOpen(false);
      },
      keywords: ['dark', 'light', 'theme', 'apparence'],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((k) => k.includes(searchLower))
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearch('');
        setSelectedIndex(0);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
          }
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 animate-scale-in">
        <div className="overflow-hidden rounded-2xl bg-surface border border-outline-variant shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant">
            <Search size={20} className="text-on-surface-variant flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une commande..."
              className="flex-1 bg-transparent text-on-surface placeholder-on-surface-variant outline-none text-sm"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-on-surface-variant bg-surface-container rounded-lg">
              <span>esc</span>
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search size={32} className="text-on-surface-variant/50 mb-2" />
                <p className="text-sm text-on-surface-variant">Aucun resultat</p>
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary text-white'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      index === selectedIndex
                        ? 'bg-white/20'
                        : 'bg-surface-container'
                    }`}
                  >
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cmd.label}</p>
                    {cmd.description && (
                      <p
                        className={`text-xs truncate ${
                          index === selectedIndex
                            ? 'text-white/70'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {cmd.description}
                      </p>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <kbd className="px-2 py-0.5 text-xs bg-white/20 rounded">
                      ↵
                    </kbd>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-outline-variant bg-surface-container/50 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span>Navigation:</span>
              <kbd className="px-1.5 py-0.5 bg-surface-container rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-surface-container rounded">↓</kbd>
            </div>
            <div className="flex items-center gap-1">
              <Command size={12} />
              <span>K pour ouvrir</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
