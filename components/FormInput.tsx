import { ReactNode } from 'react';

interface FormInputProps {
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    min?: string;
    max?: string;
    step?: string;
    disabled?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function FormInput({ label, type = 'text', value, onChange, placeholder, required, min, max, step, disabled, onKeyDown }: FormInputProps) {
    return (
        <div>
            {label && <label className="block text-xs font-mono text-slate-400 mb-1 uppercase tracking-wider">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                required={required}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
}

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: ReactNode;
}

export function FormSelect({ label, value, onChange, children }: FormSelectProps) {
    return (
        <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 uppercase tracking-wider">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-purple transition-colors appearance-none"
            >
                {children}
            </select>
        </div>
    );
}

interface FormTextareaProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
}

export function FormTextarea({ label, value, onChange, placeholder, rows = 4 }: FormTextareaProps) {
    return (
        <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 uppercase tracking-wider">{label}</label>
            <textarea
                rows={rows}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary-purple transition-colors resize-none"
            ></textarea>
        </div>
    );
}
