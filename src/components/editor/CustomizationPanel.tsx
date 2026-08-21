import React from 'react';
import { ResumeSettings } from '../../types/resume';
import { DEFAULT_RESUME_SETTINGS } from '../../utils/sampleData';
import { Sliders, RotateCcw, Palette, Type, Space } from 'lucide-react';
import { Card } from '../ui/Card';

interface CustomizationPanelProps {
  settings: ResumeSettings;
  onChange: (update: Partial<ResumeSettings>) => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ settings, onChange }) => {
  const fontFamilies: Array<ResumeSettings['fontFamily']> = [
    'Inter',
    'Roboto',
    'Merriweather',
    'Playfair Display',
    'Outfit',
    'Fira Code',
  ];

  const presetAccentColors = [
    '#2563eb', // Indigo Blue
    '#0f172a', // Deep Slate
    '#059669', // Emerald Green
    '#7c3aed', // Purple Accent
    '#dc2626', // Crimson Red
    '#0284c7', // Ocean Sky
    '#d97706', // Amber Gold
    '#475569', // Steel Slate
  ];

  const presetTextColors = [
    '#1e293b', // Slate 800
    '#0f172a', // Slate 900
    '#334155', // Slate 700
    '#111827', // Gray 900
  ];

  const handleResetDefaults = () => {
    onChange({ ...DEFAULT_RESUME_SETTINGS });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--color-brand)]" /> Design &amp; Typography
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Customize fonts, colors, spacing, and page margins for your document.
          </p>
        </div>
        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] px-3 py-1.5 rounded-[var(--radius-subtle)] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
        </button>
      </div>

      {/* Font Family Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5">
          <Type className="w-4 h-4 text-[var(--color-accent-secondary)]" /> Font Family
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {fontFamilies.map((font) => {
            const isSelected = settings.fontFamily === font;
            return (
              <button
                key={font}
                onClick={() => onChange({ fontFamily: font })}
                className={`p-2.5 rounded-[var(--radius-subtle)] border text-left text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-brand-subtle)] border-[var(--color-brand)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-brand)]'
                    : 'bg-[var(--color-surface-raised)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <span className="block font-bold text-xs" style={{ fontFamily: font }}>{font}</span>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">Sample Text</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Customization */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-[var(--color-brand)]" /> Document Accent Color
        </label>
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          {presetAccentColors.map((color) => (
            <button
              key={color}
              onClick={() => onChange({ accentColor: color })}
              className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full border-2 transition-transform cursor-pointer ${
                settings.accentColor === color ? 'scale-110 border-[var(--color-text-primary)] ring-2 ring-[var(--color-border-focus)]' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
              aria-label={`Accent color ${color}`}
            />
          ))}
          <div className="flex items-center gap-1.5 ml-1">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="w-8 h-8 sm:w-7 sm:h-7 rounded cursor-pointer bg-transparent border-0"
              title="Custom Hex Color"
              aria-label="Custom Hex Accent Color"
            />
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">{settings.accentColor}</span>
          </div>
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Document Body Text Color</label>
        <div className="flex items-center gap-2.5">
          {presetTextColors.map((color) => (
            <button
              key={color}
              onClick={() => onChange({ textColor: color })}
              className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border transition-transform cursor-pointer ${
                settings.textColor === color ? 'border-[var(--color-text-primary)] ring-2 ring-[var(--color-border-focus)]' : 'border-[var(--color-border)]'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Text color ${color}`}
            />
          ))}
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="w-7 h-7 sm:w-6 sm:h-6 rounded cursor-pointer bg-transparent border-0"
            aria-label="Custom Body Text Color"
          />
        </div>
      </div>

      {/* Sliders for Sizing & Spacing */}
      <Card variant="surface" padding="md" className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1">
            <Space className="w-4 h-4 text-[var(--color-accent-secondary)]" /> Base Font Size
          </label>
          <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">{settings.fontSize} pt</span>
        </div>
        <input
          type="range"
          min={8}
          max={14}
          step={0.5}
          value={settings.fontSize}
          onChange={(e) => onChange({ fontSize: parseFloat(e.target.value) })}
          className="w-full h-2 bg-[var(--color-surface-sunken)] rounded-lg appearance-none cursor-pointer accent-[var(--color-brand)] py-1"
        />

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Line Spacing</label>
          <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">{settings.lineSpacing}x</span>
        </div>
        <input
          type="range"
          min={1.1}
          max={1.8}
          step={0.05}
          value={settings.lineSpacing}
          onChange={(e) => onChange({ lineSpacing: parseFloat(e.target.value) })}
          className="w-full h-2 bg-[var(--color-surface-sunken)] rounded-lg appearance-none cursor-pointer accent-[var(--color-brand)] py-1"
        />

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Section Spacing</label>
          <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">{settings.sectionSpacing} px</span>
        </div>
        <input
          type="range"
          min={8}
          max={28}
          step={2}
          value={settings.sectionSpacing}
          onChange={(e) => onChange({ sectionSpacing: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-[var(--color-surface-sunken)] rounded-lg appearance-none cursor-pointer accent-[var(--color-brand)] py-1"
        />

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Page Margins</label>
          <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">{settings.margins} mm</span>
        </div>
        <input
          type="range"
          min={8}
          max={25}
          step={1}
          value={settings.margins}
          onChange={(e) => onChange({ margins: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-[var(--color-surface-sunken)] rounded-lg appearance-none cursor-pointer accent-[var(--color-brand)] py-1"
        />
      </Card>
    </div>
  );
};
