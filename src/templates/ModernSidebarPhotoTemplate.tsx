import React from 'react';
import { TemplateProps } from './types';
import { formatDateRange } from '../utils/dates';
import { getSectionTitle } from '../utils/formatting';
import { Mail, Phone, MapPin, Globe, Share2, Code2 } from 'lucide-react';

export const ModernSidebarPhotoTemplate: React.FC<TemplateProps> = ({ resume }) => {
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
  const accentColor = settings.accentColor || '#2563eb';

  return (
    <div
      className="bg-white text-slate-800 w-full h-full grid grid-cols-12 select-none"
      style={{ ...fontStyle, fontSize: `${settings.fontSize || 10}pt` }}
    >
      {/* Left Sidebar (4 cols) */}
      <div className="col-span-4 bg-slate-900 text-white p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Profile Photo */}
          {personal.avatarUrl ? (
            <div className="w-28 h-28 mx-auto rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
              <img
                src={personal.avatarUrl}
                alt={`${personal.fullName || 'User'} profile photo`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-28 h-28 mx-auto rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xl">
              {(personal.fullName || 'U')[0]}
            </div>
          )}

          {/* Contact Metadata Sidebar */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              Contact
            </h3>
            <div className="space-y-2 text-xs font-mono text-slate-300 break-words">
              {personal.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span className="truncate">{personal.email}</span>
                </div>
              )}
              {personal.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span>{personal.phone}</span>
                </div>
              )}
              {personal.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span>{personal.location}</span>
                </div>
              )}
              {personal.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span className="truncate">{personal.website}</span>
                </div>
              )}
              {personal.linkedin && (
                <div className="flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span className="truncate">{personal.linkedin}</span>
                </div>
              )}
              {personal.github && (
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span className="truncate">{personal.github}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills Sidebar */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 bg-slate-800 text-slate-200 text-[10px] font-medium rounded-xs border border-slate-700"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages Sidebar */}
          {languages.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                Languages
              </h3>
              <div className="space-y-1 text-xs text-slate-300 font-mono">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span>{l.language}</span>
                    <span className="text-slate-500">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area (8 cols) */}
      <div className="col-span-8 p-6 space-y-5">
        {/* Name Header */}
        <div className="border-b pb-4" style={{ borderColor: `${accentColor}40` }}>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" style={{ color: accentColor }}>
            {personal.fullName || 'Your Name'}
          </h1>
          {personal.title && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
              {personal.title}
            </p>
          )}
        </div>

        {/* Dynamic Main Column Sections */}
        {settings.sectionOrder.map((sectionKey) => {
          if (sectionKey === 'personal' || sectionKey === 'skills' || sectionKey === 'languages') return null;

          if (sectionKey === 'summary' && summary?.trim()) {
            return (
              <div key={sectionKey} className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <p className="text-xs leading-relaxed text-slate-700">{summary}</p>
              </div>
            );
          }

          if (sectionKey === 'experience' && experience.length > 0) {
            return (
              <div key={sectionKey} className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
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
                <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
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

          if (sectionKey === 'projects' && projects.length > 0) {
            return (
              <div key={sectionKey} className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor, borderColor: `${accentColor}30` }}>
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
    </div>
  );
};
