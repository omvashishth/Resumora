import React from 'react';
import { TemplateProps } from './types';
import { getSectionTitle } from '../utils/formatting';
import { formatDateRange } from '../utils/dates';

export const ClassicTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { settings, personal, summary, experience, education, projects, skills, certifications, awards, languages, volunteer, customSections } = resume;

  const fontStyle = {
    fontFamily: settings.fontFamily ? `'${settings.fontFamily}', serif` : 'Inter, sans-serif',
    fontSize: `${settings.fontSize}pt`,
    lineHeight: settings.lineSpacing,
    color: settings.textColor || '#1e293b',
    padding: `${settings.margins}mm`,
  };

  const headingStyle = {
    color: settings.accentColor || '#1e293b',
    fontSize: `${(settings.fontSize * (settings.headingSize || 1.4)).toFixed(1)}pt`,
    borderBottom: `1.5px solid ${settings.accentColor || '#cbd5e1'}`,
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
      {/* Header */}
      <header className="text-center pb-4 mb-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold tracking-tight mb-1 break-words" style={{ color: settings.accentColor, fontSize: `${settings.fontSize * 1.8}pt` }}>
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p className="font-medium text-gray-700 mb-2 break-words" style={{ fontSize: `${settings.fontSize * 1.15}pt` }}>
            {personal.title}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-xs text-gray-600">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-gray-400 select-none">•</span>}
                <span className="break-all">{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Dynamic Render according to sectionOrder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.sectionSpacing}px` }}>
        {settings.sectionOrder.map((sectionKey) => {
          if (sectionKey === 'personal') return null;

          if (sectionKey === 'summary' && summary?.trim()) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold uppercase tracking-wider mb-2 pb-1" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <p className="text-gray-800 text-justify leading-relaxed whitespace-pre-line break-words">{summary}</p>
              </section>
            );
          }

          if (sectionKey === 'experience' && experience.length > 0) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold uppercase tracking-wider mb-2 pb-1" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-gray-900 break-words">{exp.position}</span>
                        <span className="text-xs text-gray-500 shrink-0 font-mono">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs text-gray-700 mb-1">
                        <span className="italic font-medium">{exp.company}</span>
                        {exp.location && <span className="text-gray-500">{exp.location}</span>}
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc list-inside text-gray-800 space-y-0.5 text-xs">
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
                <h2 className="font-bold uppercase tracking-wider mb-2 pb-1" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-2">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-gray-900 break-words">{edu.degree}</span>
                        <span className="text-xs text-gray-500 shrink-0 font-mono">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700">
                        <span>{edu.institution}</span>
                        {edu.location && <span>, {edu.location}</span>}
                        {edu.gpa && <span className="text-gray-600 font-mono ml-2">• GPA: {edu.gpa}</span>}
                      </div>
                      {edu.description && <p className="text-xs text-gray-600 mt-0.5">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'projects' && projects.length > 0) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold uppercase tracking-wider mb-2 pb-1" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-gray-900 break-words">{proj.name}</span>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline shrink-0">
                            Link
                          </a>
                        )}
                      </div>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <p className="text-xs text-gray-500 font-mono">
                          Technologies: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                        </p>
                      )}
                      {proj.description && <p className="text-xs text-gray-700 mt-0.5">{proj.description}</p>}
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
                <h2 className="font-bold uppercase tracking-wider mb-2 pb-1" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-800">
                  <div className="space-y-1">
                    {leftSkills.map((s) => (
                      <div key={s.id} className="flex items-start gap-2">
                        <span className="shrink-0 select-none">•</span>
                        <span className="break-words min-w-0 flex-1">{s.name}</span>
                      </div>
                    ))}
                  </div>
                  {rightSkills.length > 0 && (
                    <div className="space-y-1">
                      {rightSkills.map((s) => (
                        <div key={s.id} className="flex items-start gap-2">
                          <span className="shrink-0 select-none">•</span>
                          <span className="break-words min-w-0 flex-1">{s.name}</span>
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
                <h2 className="font-bold uppercase tracking-wider mb-2 pb-1" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <ul className="list-disc list-inside text-xs space-y-1">
                  {certifications.map((c) => (
                    <li key={c.id}>
                      <strong className="font-semibold text-gray-900">{c.name}</strong>
                      {c.issuer && <span> — {c.issuer}</span>}
                      {c.date && <span className="text-gray-500 font-mono"> ({c.date})</span>}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          if (sectionKey === 'languages' && languages.length > 0) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold uppercase tracking-wider mb-2 pb-1" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <p className="text-xs text-gray-800">
                  {languages.map((l) => l.proficiency ? `${l.language} (${l.proficiency})` : l.language).join(', ')}
                </p>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
