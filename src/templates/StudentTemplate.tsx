import React from 'react';
import { TemplateProps } from './types';
import { getSectionTitle } from '../utils/formatting';
import { formatDateRange } from '../utils/dates';

export const StudentTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { settings, personal, summary, experience, education, projects, skills, certifications, awards, languages, volunteer, customSections } = resume;

  const accent = settings.accentColor || '#0284c7';

  const fontStyle = {
    fontFamily: settings.fontFamily ? `'${settings.fontFamily}', sans-serif` : 'Outfit, sans-serif',
    fontSize: `${settings.fontSize}pt`,
    lineHeight: settings.lineSpacing,
    color: settings.textColor || '#1e293b',
    padding: `${settings.margins}mm`,
  };

  const headingStyle = {
    color: accent,
    fontSize: `${(settings.fontSize * (settings.headingSize || 1.35)).toFixed(1)}pt`,
    borderBottom: `2px solid ${accent}`,
  };

  // Re-sort sectionOrder to prioritize Education & Projects if in standard order
  const studentSectionOrder = [...settings.sectionOrder];
  const eduIdx = studentSectionOrder.indexOf('education');
  const expIdx = studentSectionOrder.indexOf('experience');
  if (eduIdx > expIdx && expIdx !== -1) {
    studentSectionOrder[expIdx] = 'education';
    studentSectionOrder[eduIdx] = 'experience';
  }

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
    personal.website,
  ].filter(Boolean);

  return (
    <div style={fontStyle} className="w-full h-full box-border bg-white">
      {/* Student Academic Header with Overflow Protection */}
      <header className="mb-5 pb-3 border-b-2 border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight break-words leading-tight" style={{ color: accent, fontSize: `${settings.fontSize * 2.2}pt` }}>
            {personal.fullName || 'Your Name'}
          </h1>
          {personal.title && (
            <p className="text-slate-600 font-semibold mt-0.5 break-words" style={{ fontSize: `${settings.fontSize * 1.1}pt` }}>
              {personal.title}
            </p>
          )}
        </div>
        {contactItems.length > 0 && (
          <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 font-medium shrink-0">
            {contactItems.map((item, idx) => (
              <div key={idx} className="break-all">{item}</div>
            ))}
          </div>
        )}
      </header>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.sectionSpacing}px` }}>
        {studentSectionOrder.map((sectionKey) => {
          if (sectionKey === 'personal') return null;

          if (sectionKey === 'summary' && summary?.trim()) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold tracking-tight uppercase mb-2 pb-0.5" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <p className="text-slate-800 leading-relaxed text-justify break-words">{summary}</p>
              </section>
            );
          }

          if (sectionKey === 'education' && education.length > 0) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold tracking-tight uppercase mb-2 pb-0.5" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-bold text-slate-900 break-words">{edu.degree}</h3>
                        <span className="text-xs font-semibold text-slate-500 shrink-0 font-mono">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700">
                        <span className="font-semibold">{edu.institution}</span>
                        {edu.location && <span> — {edu.location}</span>}
                        {edu.gpa && <span className="font-mono text-sky-700 font-semibold ml-2">• GPA: {edu.gpa}</span>}
                      </div>
                      {edu.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'experience' && experience.length > 0) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold tracking-tight uppercase mb-2 pb-0.5" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-bold text-slate-900 break-words">{exp.position}</h3>
                        <span className="text-xs font-semibold text-slate-500 shrink-0 font-mono">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mb-1">
                        <span className="font-semibold">{exp.company}</span>
                        {exp.location && <span> — {exp.location}</span>}
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                          {exp.bullets.map((b, i) => (
                            <li key={i} className="leading-relaxed break-words">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'projects' && projects.length > 0) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold tracking-tight uppercase mb-2 pb-0.5" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-bold text-slate-900 break-words">{proj.name}</h3>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-sky-600 underline shrink-0">
                            Link
                          </a>
                        )}
                      </div>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <p className="text-xs font-mono text-slate-500">
                          Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                        </p>
                      )}
                      {proj.description && <p className="text-xs text-slate-700 mt-1">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'skills' && skills.length > 0) {
            const mid = Math.ceil(skills.length / 2);
            const leftSkills = skills.slice(0, mid);
            const rightSkills = skills.slice(mid);

            return (
              <section key={sectionKey}>
                <h2 className="font-bold tracking-tight uppercase mb-2 pb-0.5" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-800">
                  <div className="space-y-1">
                    {leftSkills.map((sk) => (
                      <div key={sk.id} className="flex items-start gap-2">
                        <span className="shrink-0 select-none text-sky-600">•</span>
                        <span className="break-words min-w-0 flex-1">{sk.name}</span>
                      </div>
                    ))}
                  </div>
                  {rightSkills.length > 0 && (
                    <div className="space-y-1">
                      {rightSkills.map((sk) => (
                        <div key={sk.id} className="flex items-start gap-2">
                          <span className="shrink-0 select-none text-sky-600">•</span>
                          <span className="break-words min-w-0 flex-1">{sk.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
