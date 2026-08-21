import React from 'react';
import { TemplateProps } from './types';
import { getSectionTitle } from '../utils/formatting';
import { formatDateRange } from '../utils/dates';

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { settings, personal, summary, experience, education, projects, skills, certifications, awards, languages, volunteer, customSections } = resume;

  const accent = settings.accentColor || '#0f172a';

  const fontStyle = {
    fontFamily: settings.fontFamily ? `'${settings.fontFamily}', sans-serif` : 'Roboto, sans-serif',
    fontSize: `${settings.fontSize}pt`,
    lineHeight: settings.lineSpacing,
    color: settings.textColor || '#1e293b',
    padding: `${settings.margins}mm`,
  };

  const headingStyle = {
    color: '#ffffff',
    backgroundColor: accent,
    fontSize: `${(settings.fontSize * (settings.headingSize || 1.3)).toFixed(1)}pt`,
  };

  const contactItems = [
    personal.email ? `Email: ${personal.email}` : null,
    personal.phone ? `Tel: ${personal.phone}` : null,
    personal.location ? `Location: ${personal.location}` : null,
    personal.website ? `Web: ${personal.website}` : null,
    personal.linkedin ? `LinkedIn: ${personal.linkedin}` : null,
    personal.github ? `GitHub: ${personal.github}` : null,
  ].filter(Boolean);

  return (
    <div style={fontStyle} className="w-full h-full box-border bg-white">
      {/* Executive Header Banner */}
      <header className="p-5 mb-5 text-white rounded-md shadow-xs" style={{ backgroundColor: accent }}>
        <h1 className="text-2xl font-bold tracking-tight uppercase mb-1 break-words" style={{ fontSize: `${settings.fontSize * 2}pt` }}>
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p className="text-xs uppercase font-medium tracking-wider opacity-90 mb-3 break-words">
            {personal.title}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-90">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="opacity-40 select-none">•</span>}
                <span className="break-all">{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.sectionSpacing}px` }}>
        {settings.sectionOrder.map((sectionKey) => {
          if (sectionKey === 'personal') return null;

          if (sectionKey === 'summary' && summary?.trim()) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold uppercase tracking-wider px-2 py-1 mb-2 rounded-xs" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <p className="text-gray-800 leading-relaxed text-justify px-1 break-words">{summary}</p>
              </section>
            );
          }

          if (sectionKey === 'experience' && experience.length > 0) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold uppercase tracking-wider px-2 py-1 mb-2 rounded-xs" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-3 px-1">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-gray-900 break-words">{exp.position}</span>
                        <span className="text-xs font-mono text-gray-500 shrink-0">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs text-gray-700 mb-1">
                        <span className="font-semibold">{exp.company}</span>
                        {exp.location && <span className="text-gray-500 italic">{exp.location}</span>}
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-gray-800 space-y-0.5">
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
                <h2 className="font-bold uppercase tracking-wider px-2 py-1 mb-2 rounded-xs" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-2 px-1">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline gap-2 text-xs">
                        <span className="font-bold text-gray-900 break-words">{edu.degree}</span>
                        <span className="font-mono text-gray-500 shrink-0">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700">
                        <span>{edu.institution}</span>
                        {edu.location && <span>, {edu.location}</span>}
                        {edu.gpa && <span className="font-mono text-gray-600 ml-2">• GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'projects' && projects.length > 0) {
            return (
              <section key={sectionKey}>
                <h2 className="font-bold uppercase tracking-wider px-2 py-1 mb-2 rounded-xs" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="space-y-2 px-1">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline gap-2 text-xs">
                        <span className="font-bold text-gray-900 break-words">{proj.name}</span>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-blue-600 underline shrink-0">
                            Link
                          </a>
                        )}
                      </div>
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
                <h2 className="font-bold uppercase tracking-wider px-2 py-1 mb-2 rounded-xs" style={headingStyle}>
                  {getSectionTitle(sectionKey)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-800 px-1">
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

          return null;
        })}
      </div>
    </div>
  );
};
