import React from 'react';
import { TemplateProps } from './types';
import { getSectionTitle } from '../utils/formatting';
import { formatDateRange } from '../utils/dates';

export const MinimalTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { settings, personal, summary, experience, education, projects, skills, certifications, awards, languages, volunteer, customSections } = resume;

  const fontStyle = {
    fontFamily: settings.fontFamily ? `'${settings.fontFamily}', sans-serif` : 'Inter, sans-serif',
    fontSize: `${settings.fontSize}pt`,
    lineHeight: settings.lineSpacing,
    color: settings.textColor || '#0f172a',
    padding: `${settings.margins}mm`,
  };

  const headingStyle = {
    color: settings.accentColor || '#0f172a',
    fontSize: `${(settings.fontSize * (settings.headingSize || 1.25)).toFixed(1)}pt`,
  };

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
  ].filter(Boolean);

  return (
    <div style={fontStyle} className="w-full h-full box-border bg-white">
      {/* Minimal Header */}
      <header className="mb-6">
        <h1 className="font-light tracking-tight text-3xl mb-1 text-slate-900 break-words" style={{ fontSize: `${settings.fontSize * 2.2}pt` }}>
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p className="text-slate-500 tracking-widest uppercase font-mono text-xs mb-3 break-words">
            {personal.title}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-mono">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 select-none">/</span>}
                <span className="break-all">{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Dynamic Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.sectionSpacing}px` }}>
        {settings.sectionOrder.map((sectionKey) => {
          if (sectionKey === 'personal') return null;

          if (sectionKey === 'summary' && summary?.trim()) {
            return (
              <section key={sectionKey} className="border-t border-slate-200 pt-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <p className="text-slate-800 leading-relaxed text-justify break-words">{summary}</p>
              </section>
            );
          }

          if (sectionKey === 'experience' && experience.length > 0) {
            return (
              <section key={sectionKey} className="border-t border-slate-200 pt-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <div>
                          <span className="font-medium text-slate-900 break-words">{exp.position}</span>
                          <span className="text-slate-400 text-xs font-mono ml-2">@ {exp.company}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-400 shrink-0">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </span>
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="text-slate-600 text-xs space-y-1 pl-4 list-disc">
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

          if (sectionKey === 'education' && education.length > 0) {
            return (
              <section key={sectionKey} className="border-t border-slate-200 pt-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-2">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline gap-2 text-xs">
                      <div>
                        <span className="font-medium text-slate-900 break-words">{edu.degree}</span>
                        <span className="text-slate-500 font-mono"> — {edu.institution}</span>
                        {edu.gpa && <span className="text-slate-400 font-mono ml-2">/ GPA: {edu.gpa}</span>}
                      </div>
                      <span className="font-mono text-slate-400 shrink-0">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'projects' && projects.length > 0) {
            return (
              <section key={sectionKey} className="border-t border-slate-200 pt-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-medium text-slate-900 break-words">{proj.name}</span>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-blue-600 underline shrink-0">
                            link
                          </a>
                        )}
                      </div>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <p className="text-xs font-mono text-slate-400">
                          {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
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
              <section key={sectionKey} className="border-t border-slate-200 pt-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-700">
                  <div className="space-y-1">
                    {leftSkills.map((s) => (
                      <div key={s.id} className="flex items-start gap-2">
                        <span className="shrink-0 select-none text-slate-400">•</span>
                        <span className="break-words min-w-0 flex-1">{s.name}</span>
                      </div>
                    ))}
                  </div>
                  {rightSkills.length > 0 && (
                    <div className="space-y-1">
                      {rightSkills.map((s) => (
                        <div key={s.id} className="flex items-start gap-2">
                          <span className="shrink-0 select-none text-slate-400">•</span>
                          <span className="break-words min-w-0 flex-1">{s.name}</span>
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
