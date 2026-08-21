import React from 'react';
import { TemplateProps } from './types';
import { getSectionTitle } from '../utils/formatting';
import { formatDateRange } from '../utils/dates';

export const ModernTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { settings, personal, summary, experience, education, projects, skills, certifications, awards, languages, volunteer, customSections } = resume;

  const accent = settings.accentColor || '#2563eb';

  const fontStyle = {
    fontFamily: settings.fontFamily ? `'${settings.fontFamily}', sans-serif` : 'Inter, sans-serif',
    fontSize: `${settings.fontSize}pt`,
    lineHeight: settings.lineSpacing,
    color: settings.textColor || '#1e293b',
    padding: `${settings.margins}mm`,
  };

  const headingStyle = {
    color: accent,
    fontSize: `${(settings.fontSize * (settings.headingSize || 1.35)).toFixed(1)}pt`,
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
    <div style={fontStyle} className="w-full h-full box-border min-h-full bg-white">
      {/* Document Header */}
      <header className="mb-5 pb-4 border-b border-slate-200">
        <h1
          className="font-extrabold tracking-tight break-words leading-tight"
          style={{ color: accent, fontSize: `${settings.fontSize * 2.1}pt` }}
        >
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p
            className="text-slate-700 font-semibold tracking-wide uppercase mt-1 break-words"
            style={{ fontSize: `${settings.fontSize * 1.1}pt` }}
          >
            {personal.title}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-xs text-slate-600 font-medium leading-relaxed">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400 select-none">•</span>}
                <span className="break-all">{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.sectionSpacing}px` }}>
        {settings.sectionOrder.map((sectionKey) => {
          if (sectionKey === 'personal') return null;

          if (sectionKey === 'summary' && summary?.trim()) {
            return (
              <section key={sectionKey}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-xs shrink-0" style={{ backgroundColor: accent }} />
                  <h2 className="font-bold tracking-tight uppercase" style={headingStyle}>
                    {getSectionTitle(sectionKey)}
                  </h2>
                </div>
                <p className="text-slate-800 leading-relaxed text-justify break-words">{summary}</p>
              </section>
            );
          }

          if (sectionKey === 'experience' && experience.length > 0) {
            return (
              <section key={sectionKey}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-xs shrink-0" style={{ backgroundColor: accent }} />
                  <h2 className="font-bold tracking-tight uppercase" style={headingStyle}>
                    {getSectionTitle(sectionKey)}
                  </h2>
                </div>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline gap-2 mb-0.5">
                        <h3 className="font-bold text-slate-900 break-words">{exp.position}</h3>
                        <span className="text-xs font-semibold text-slate-500 shrink-0 font-mono">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs text-slate-600 mb-1.5">
                        <span className="font-semibold text-slate-700">{exp.company}</span>
                        {exp.location && <span className="italic text-slate-500 font-normal">{exp.location}</span>}
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc list-inside text-slate-700 space-y-1 pl-1">
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
              <section key={sectionKey}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-xs shrink-0" style={{ backgroundColor: accent }} />
                  <h2 className="font-bold tracking-tight uppercase" style={headingStyle}>
                    {getSectionTitle(sectionKey)}
                  </h2>
                </div>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-bold text-slate-900 break-words">{edu.degree}</h3>
                        <span className="text-xs font-semibold text-slate-500 shrink-0 font-mono">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">{edu.institution}</span>
                        {edu.location && <span> — {edu.location}</span>}
                        {edu.gpa && <span className="font-mono text-slate-500 ml-2">• GPA: {edu.gpa}</span>}
                      </div>
                      {edu.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'projects' && projects.length > 0) {
            return (
              <section key={sectionKey}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-xs shrink-0" style={{ backgroundColor: accent }} />
                  <h2 className="font-bold tracking-tight uppercase" style={headingStyle}>
                    {getSectionTitle(sectionKey)}
                  </h2>
                </div>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-bold text-slate-900 break-words">{proj.name}</h3>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline shrink-0">
                            View Project
                          </a>
                        )}
                      </div>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <p className="text-xs font-mono text-slate-500 mb-1">
                          Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                        </p>
                      )}
                      {proj.description && <p className="text-slate-700 leading-relaxed">{proj.description}</p>}
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
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-xs shrink-0" style={{ backgroundColor: accent }} />
                  <h2 className="font-bold tracking-tight uppercase" style={headingStyle}>
                    {getSectionTitle(sectionKey)}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-800">
                  <div className="space-y-1">
                    {leftSkills.map((sk) => (
                      <div key={sk.id} className="flex items-start gap-2">
                        <span className="shrink-0 select-none text-slate-500">•</span>
                        <span className="break-words min-w-0 flex-1">{sk.name}</span>
                      </div>
                    ))}
                  </div>
                  {rightSkills.length > 0 && (
                    <div className="space-y-1">
                      {rightSkills.map((sk) => (
                        <div key={sk.id} className="flex items-start gap-2">
                          <span className="shrink-0 select-none text-slate-500">•</span>
                          <span className="break-words min-w-0 flex-1">{sk.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          }

          if (sectionKey === 'certifications' && certifications.length > 0) {
            return (
              <section key={sectionKey}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-xs shrink-0" style={{ backgroundColor: accent }} />
                  <h2 className="font-bold tracking-tight uppercase" style={headingStyle}>
                    {getSectionTitle(sectionKey)}
                  </h2>
                </div>
                <div className="space-y-2">
                  {certifications.map((c) => (
                    <div key={c.id} className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{c.name}</span>
                        {c.issuer && <span className="text-slate-600"> — {c.issuer}</span>}
                      </div>
                      {c.date && <span className="text-slate-500 font-mono shrink-0">{c.date}</span>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'languages' && languages.length > 0) {
            return (
              <section key={sectionKey}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-xs shrink-0" style={{ backgroundColor: accent }} />
                  <h2 className="font-bold tracking-tight uppercase" style={headingStyle}>
                    {getSectionTitle(sectionKey)}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {languages.map((l) => (
                    <span key={l.id} className="text-slate-800">
                      <strong className="font-semibold">{l.language}</strong>{l.proficiency ? ` (${l.proficiency})` : ''}
                    </span>
                  ))}
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
