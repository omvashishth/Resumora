import { Resume } from '../types/resume';
import { formatDateRange } from '../utils/dates';
import { getSectionTitle } from '../utils/formatting';
import { normalizeAvatarForExport } from '../utils/imageExportHelper';

export const exportResumeToDocx = async (resume: Resume): Promise<Blob> => {
  const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, BorderStyle, ExternalHyperlink } = await import('docx');

  const { personal, summary, experience, education, projects, skills, certifications, awards, languages, volunteer, customSections, settings } = resume;

  const accentColorHex = (settings.accentColor || '#2563eb').replace('#', '');
  const textColorHex = (settings.textColor || '#1e293b').replace('#', '');

  const docChildren = [];

  // Profile Photo Paragraph if present
  const normalizedAvatar = await normalizeAvatarForExport(personal.avatarUrl);
  if (normalizedAvatar && normalizedAvatar.includes(',')) {
    try {
      const base64Data = normalizedAvatar.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: bytes,
              transformation: { width: 72, height: 72 },
              type: 'png',
            }),
          ],
          spacing: { after: 120 },
        })
      );
    } catch (e) {
      console.error('Failed to parse avatar for DOCX export:', e);
    }
  }

  // Header Paragraph
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personal.fullName || 'Your Name',
          bold: true,
          size: 32, // 16pt
          color: accentColorHex,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  if (personal.title) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: personal.title,
            bold: true,
            size: 24, // 12pt
            color: '64748B',
          }),
        ],
        spacing: { after: 150 },
      })
    );
  }

  // Contact Info Line
  const contactParts: string[] = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: contactParts.join('  •  '),
            size: 18, // 9pt
            color: '475569',
          }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // Helper for Section Headings
  const addSectionHeading = (title: string) => {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            color: accentColorHex,
          }),
        ],
        border: {
          bottom: {
            color: accentColorHex,
            space: 4,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
        spacing: { before: 240, after: 120 },
      })
    );
  };

  // Process sections in order
  for (const sectionKey of settings.sectionOrder) {
    if (sectionKey === 'personal') continue;

    if (sectionKey === 'summary' && summary?.trim()) {
      addSectionHeading(getSectionTitle(sectionKey));
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: summary,
              size: 20,
              color: textColorHex,
            }),
          ],
          spacing: { after: 180 },
        })
      );
    }

    if (sectionKey === 'experience' && experience.length > 0) {
      addSectionHeading(getSectionTitle(sectionKey));
      for (const exp of experience) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 20,
                color: textColorHex,
              }),
              new TextRun({
                text: `   ${formatDateRange(exp.startDate, exp.endDate, exp.current)}`,
                size: 18,
                color: '64748B',
              }),
            ],
            spacing: { before: 100, after: 40 },
          })
        );
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${exp.company}${exp.location ? ` (${exp.location})` : ''}`,
                italics: true,
                size: 19,
                color: '334155',
              }),
            ],
            spacing: { after: 80 },
          })
        );
        if (exp.bullets) {
          for (const bullet of exp.bullets) {
            if (!bullet.trim()) continue;
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                children: [
                  new TextRun({
                    text: bullet,
                    size: 19,
                    color: textColorHex,
                  }),
                ],
                spacing: { after: 40 },
              })
            );
          }
        }
      }
    }

    if (sectionKey === 'education' && education.length > 0) {
      addSectionHeading(getSectionTitle(sectionKey));
      for (const edu of education) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
                size: 20,
                color: textColorHex,
              }),
              new TextRun({
                text: `   ${formatDateRange(edu.startDate, edu.endDate, edu.current)}`,
                size: 18,
                color: '64748B',
              }),
            ],
            spacing: { before: 100, after: 40 },
          })
        );
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.institution}${edu.location ? `, ${edu.location}` : ''}${edu.gpa ? ` — GPA: ${edu.gpa}` : ''}`,
                italics: true,
                size: 19,
                color: '334155',
              }),
            ],
            spacing: { after: 80 },
          })
        );
        if (edu.description) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.description,
                  size: 19,
                  color: textColorHex,
                }),
              ],
              spacing: { after: 80 },
            })
          );
        }
      }
    }

    if (sectionKey === 'projects' && projects.length > 0) {
      addSectionHeading(getSectionTitle(sectionKey));
      for (const proj of projects) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: proj.name,
                bold: true,
                size: 20,
                color: textColorHex,
              }),
              new TextRun({
                text: `   ${formatDateRange(proj.startDate, proj.endDate)}`,
                size: 18,
                color: '64748B',
              }),
            ],
            spacing: { before: 100, after: 40 },
          })
        );
        if (proj.technologies && proj.technologies.length > 0) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Technologies: ${proj.technologies.join(', ')}`,
                  size: 18,
                  color: '475569',
                }),
              ],
              spacing: { after: 60 },
            })
          );
        }
        if (proj.bullets) {
          for (const bullet of proj.bullets) {
            if (!bullet.trim()) continue;
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                children: [
                  new TextRun({
                    text: bullet,
                    size: 19,
                    color: textColorHex,
                  }),
                ],
                spacing: { after: 40 },
              })
            );
          }
        }
      }
    }

    if (sectionKey === 'skills' && skills.length > 0) {
      addSectionHeading(getSectionTitle(sectionKey));
      const skillText = skills
        .map((s) => (s.level ? `${s.name} (${s.level})` : s.name))
        .join('  •  ');
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: skillText,
              size: 19,
              color: textColorHex,
            }),
          ],
          spacing: { after: 180 },
        })
      );
    }

    if (sectionKey === 'certifications' && certifications.length > 0) {
      addSectionHeading(getSectionTitle(sectionKey));
      for (const cert of certifications) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${cert.name} — ${cert.issuer}`,
                bold: true,
                size: 19,
                color: textColorHex,
              }),
              new TextRun({
                text: cert.date ? ` (${cert.date})` : '',
                size: 18,
                color: '64748B',
              }),
            ],
            spacing: { after: 60 },
          })
        );
      }
    }

    if (sectionKey === 'awards' && awards.length > 0) {
      addSectionHeading(getSectionTitle(sectionKey));
      for (const award of awards) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${award.title} — ${award.issuer}`,
                bold: true,
                size: 19,
                color: textColorHex,
              }),
              new TextRun({
                text: award.date ? ` (${award.date})` : '',
                size: 18,
                color: '64748B',
              }),
            ],
            spacing: { after: 60 },
          })
        );
      }
    }

    if (sectionKey === 'languages' && languages.length > 0) {
      addSectionHeading(getSectionTitle(sectionKey));
      const langText = languages.map((l) => l.proficiency ? `${l.language}: ${l.proficiency}` : l.language).join('  •  ');
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: langText,
              size: 19,
              color: textColorHex,
            }),
          ],
          spacing: { after: 180 },
        })
      );
    }

    if (sectionKey === 'volunteer' && volunteer.length > 0) {
      addSectionHeading(getSectionTitle(sectionKey));
      for (const vol of volunteer) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${vol.position} – ${vol.organization}`,
                bold: true,
                size: 19,
                color: textColorHex,
              }),
              new TextRun({
                text: `   ${formatDateRange(vol.startDate, vol.endDate, vol.current)}`,
                size: 18,
                color: '64748B',
              }),
            ],
            spacing: { after: 60 },
          })
        );
      }
    }

    if (sectionKey === 'customSections' && customSections.length > 0) {
      for (const cs of customSections) {
        addSectionHeading(cs.title || 'Custom Section');
        for (const item of cs.items) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: item.title,
                  bold: true,
                  size: 19,
                  color: textColorHex,
                }),
                new TextRun({
                  text: item.date ? ` (${item.date})` : '',
                  size: 18,
                  color: '64748B',
                }),
              ],
              spacing: { after: 40 },
            })
          );
          if (item.description) {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.description,
                    size: 19,
                    color: textColorHex,
                  }),
                ],
                spacing: { after: 80 },
              })
            );
          }
        }
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips (~25mm)
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
};
