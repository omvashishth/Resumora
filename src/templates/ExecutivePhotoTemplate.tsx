import React from 'react';
import { TemplateProps } from './types';
import { formatDateRange } from '../utils/dates';
import { getSectionTitle } from '../utils/formatting';
import { Mail, Phone, MapPin, Globe, Share2, Code2 } from 'lucide-react';

export const ExecutivePhotoTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const {
    personal,
    summary,
    experience,
    education,
    projects,
    skills,
    certifications,
    awards,
    languages,
    volunteer,
    customSections,
    settings,
  } = resume;

  const fontStyle = { fontFamily: settings.fontFamily || 'Inter' };
  const accentColor = settings.accentColor || '#1e3a8a';
  const textColor = settings.textColor || '#1e293b';

  return (
    <div
      className="bg-white text-[var(--color-text-primary)] w-full h-full p-8 space-y-6 shadow-sm select-none"
      style={{ ...fontStyle, color: textColor, fontSize: `${settings.fontSize || 10}pt` }}
    >
      {/* Header with Executive Avatar */}
      <div className="border-b-2 pb-5 flex items-center justify-between gap-6" style={{ borderColor: accentColor }}>
        <div className="space-y-1 flex-1">
          <h1 className="text-3xl font-serif font-bold tracking-tight" style={{ color: accentColor }}>
            {personal.fullName || 'Your Name'}
          </h1>
          {personal.title && (
            <p className="text-sm font-medium text-slate-600 tracking-wide uppercase">
              {personal.title}
            </p>
          )}

          {/* Contact Info Grid */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-2 font-mono">
            {personal.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" /> {personal.email}
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {personal.phone}
              </span>
            )}
            {personal.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {personal.location}
              </span>
            )}
            {personal.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" /> {personal.website}
              </span>
            )}
            {personal.linkedin && (
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3 text-slate-400" /> {personal.linkedin}
              </span>
            )}
            {personal.github && (
              <span className="flex items-center gap-1">
                <Code2 className="w-3 h-3 text-slate-400" /> {personal.github}
              </span>
            )}
          </div>
        </div>

        {/* Profile Photo Frame */}
        {personal.avatarUrl && (
          <div
            className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 shadow-md"
            style={{ borderColor: accentColor }}
          >
            <img
              src={personal.avatarUrl}
              alt={`${personal.fullName || 'User'} profile photo`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Dynamic Sections */}
      {settings.sectionOrder.map((sectionKey) => {
        if (sectionKey === 'personal') return null;

        if (sectionKey === 'summary' && summary?.trim()) {
          return (
            <div key={sectionKey} className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 font-serif" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
                {getSectionTitle(sectionKey)}
              </h2>
              <p className="text-xs leading-relaxed text-slate-700">{summary}</p>
            </div>
          );
        }

        if (sectionKey === 'experience' && experience.length > 0) {
          return (
            <div key={sectionKey} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 font-serif" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
                {getSectionTitle(sectionKey)}
              </h2>
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-900">{exp.position}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  <div className="text-xs italic text-slate-600 font-medium">
                    {exp.company} {exp.location ? `— ${exp.location}` : ''}
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 pt-0.5">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          );
        }

        if (sectionKey === 'education' && education.length > 0) {
          return (
            <div key={sectionKey} className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 font-serif" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
                {getSectionTitle(sectionKey)}
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{edu.degree}</span>
                    <span className="text-[11px] font-mono text-slate-500 font-normal">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  <div className="italic text-slate-600">
                    {edu.institution} {edu.location ? `— ${edu.location}` : ''} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                  </div>
                  {edu.description && <p className="text-slate-700 text-[11px]">{edu.description}</p>}
                </div>
              ))}
            </div>
          );
        }

        if (sectionKey === 'skills' && skills.length > 0) {
          return (
            <div key={sectionKey} className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 font-serif" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
                {getSectionTitle(sectionKey)}
              </h2>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] font-medium rounded-xs border border-slate-200"
                  >
                    {s.name} {s.level ? `(${s.level})` : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (sectionKey === 'projects' && projects.length > 0) {
          return (
            <div key={sectionKey} className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 font-serif" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
                {getSectionTitle(sectionKey)}
              </h2>
              {projects.map((p) => (
                <div key={p.id} className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{p.name}</span>
                    <span className="text-[11px] font-mono text-slate-500 font-normal">
                      {formatDateRange(p.startDate, p.endDate)}
                    </span>
                  </div>
                  {p.description && <p className="text-slate-700">{p.description}</p>}
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
