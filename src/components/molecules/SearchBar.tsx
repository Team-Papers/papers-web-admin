import { Search, X } from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const { t } = useTranslation();
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || t('actions.search')}
      leftIcon={<Search size={16} />}
      rightIcon={
        value ? (
          <button onClick={() => onChange('')} className="cursor-pointer">
            <X size={16} />
          </button>
        ) : undefined
      }
    />
  );
}
