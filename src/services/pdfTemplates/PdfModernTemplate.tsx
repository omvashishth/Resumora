import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '../../types/resume';
import { getDesignTokens } from '../../utils/designTokens';
import { getSectionTitle } from '../../utils/formatting';
import { formatDateRange } from '../../utils/dates';

interface PdfTemplateProps {
  resume: Resume;
}

export const PdfModernTemplate: React.FC<PdfTemplateProps> = ({ resume }) => {
  const { personal, summary, experience, education, projects, skills, certifications, languages, settings } = resume;
  const tokens = getDesignTokens(settings, resume.templateId);

  const styles = StyleSheet.create({
    page: {
      paddingTop: tokens.marginPt,
      paddingBottom: tokens.marginPt,
      paddingLeft: tokens.marginPt,
      paddingRight: tokens.marginPt,
      fontFamily: tokens.pdfFontFamily,
      fontSize: tokens.fontSizePt,
      lineHeight: tokens.lineHeight,
      color: tokens.textColor,
      backgroundColor: '#ffffff',
    },
    header: {
      marginBottom: 16,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
      borderBottomStyle: 'solid',
    },
    name: {
      fontSize: tokens.nameFontSizePt,
      fontWeight: 'bold',
      color: tokens.accentColor,
      lineHeight: 1.15,
      marginBottom: 4,
    },
    title: {
      fontSize: tokens.titleFontSizePt,
      fontWeight: 'medium',
      color: '#475569',
      textTransform: 'uppercase',
      lineHeight: 1.2,
      marginBottom: 6,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      fontSize: tokens.contactFontSizePt,
      lineHeight: 1.2,
      color: '#475569',
    },
    contactItem: {
      marginRight: 6,
    },
    section: {
      marginBottom: tokens.sectionSpacingPt * 0.75,
    },
    sectionHeadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    accentBar: {
      width: 4,
      height: 14,
      backgroundColor: tokens.accentColor,
      marginRight: 6,
      borderRadius: 1,
    },
    sectionHeading: {
      fontSize: tokens.headingFontSizePt,
      fontWeight: 'bold',
      color: tokens.accentColor,
      textTransform: 'uppercase',
      lineHeight: 1.2,
    },
    itemTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    itemTitle: {
      fontWeight: 'bold',
      color: '#0f172a',
      fontSize: tokens.fontSizePt,
      lineHeight: 1.2,
    },
    itemDate: {
      fontSize: tokens.smallFontSizePt,
      color: '#64748b',
    },
    itemSubRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    itemSubtitle: {
      fontSize: tokens.fontSizePt * 0.95,
      fontWeight: 'medium',
      color: '#334155',
    },
    bulletList: {
      marginTop: 2,
      marginLeft: 10,
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    bulletPoint: {
      width: 10,
      fontSize: tokens.fontSizePt * 0.9,
      color: tokens.textColor,
    },
    bulletText: {
      flex: 1,
      fontSize: tokens.fontSizePt * 0.9,
      color: tokens.textColor,
    },
    badgeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    badge: {
      backgroundColor: '#f1f5f9',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 4,
      fontSize: tokens.contactFontSizePt,
      color: '#1e293b',
      marginRight: 6,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
  });

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{personal.fullName || 'Your Name'}</Text>
        {personal.title && <Text style={styles.title}>{personal.title}</Text>}
        {contactItems.length > 0 && (
          <View style={styles.contactRow}>
            {contactItems.map((item, idx) => (
              <Text key={idx} style={styles.contactItem}>
                {idx > 0 ? `•   ${item}` : item}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Dynamic Sections */}
      {settings.sectionOrder.map((sectionKey) => {
        if (sectionKey === 'personal') return null;

        if (sectionKey === 'summary' && summary?.trim()) {
          return (
            <View key={sectionKey} style={styles.section} wrap={false}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              </View>
              <Text>{summary}</Text>
            </View>
          );
        }

        if (sectionKey === 'experience' && experience.length > 0) {
          return (
            <View key={sectionKey} style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              </View>
              {experience.map((exp) => (
                <View key={exp.id} style={{ marginBottom: 8 }} wrap={false}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </Text>
                  </View>
                  <View style={styles.itemSubRow}>
                    <Text style={styles.itemSubtitle}>{exp.company}</Text>
                    {exp.location && <Text style={styles.itemDate}>{exp.location}</Text>}
                  </View>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {exp.bullets.map((b, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.bulletText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        }

        if (sectionKey === 'education' && education.length > 0) {
          return (
            <View key={sectionKey} style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              </View>
              {education.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 6 }} wrap={false}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </Text>
                  </View>
                  <View style={styles.itemSubRow}>
                    <Text style={styles.itemSubtitle}>{edu.institution}</Text>
                    {edu.gpa ? <Text style={styles.itemDate}>GPA: {edu.gpa}</Text> : null}
                  </View>
                  {edu.description && <Text style={styles.bulletText}>{edu.description}</Text>}
                </View>
              ))}
            </View>
          );
        }

        if (sectionKey === 'projects' && projects.length > 0) {
          return (
            <View key={sectionKey} style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              </View>
              {projects.map((proj) => (
                <View key={proj.id} style={{ marginBottom: 6 }} wrap={false}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{proj.name}</Text>
                    {proj.url && <Text style={styles.itemDate}>{proj.url}</Text>}
                  </View>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <Text style={styles.itemDate}>
                      Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                    </Text>
                  )}
                  {proj.description && <Text style={{ marginTop: 2 }}>{proj.description}</Text>}
                </View>
              ))}
            </View>
          );
        }

        if (sectionKey === 'skills' && skills.length > 0) {
          const mid = Math.ceil(skills.length / 2);
          const leftSkills = skills.slice(0, mid);
          const rightSkills = skills.slice(mid);

          return (
            <View key={sectionKey} style={styles.section} wrap={false}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              </View>
              <View style={{ flexDirection: 'row', width: '100%', marginTop: 2 }}>
                <View style={{ width: '50%', paddingRight: 8 }}>
                  {leftSkills.map((sk) => (
                    <View key={sk.id} style={{ flexDirection: 'row', marginBottom: 2.5, alignItems: 'flex-start' }}>
                      <Text style={{ width: 10, fontSize: tokens.fontSizePt, color: '#64748b' }}>•</Text>
                      <Text style={{ flex: 1, fontSize: tokens.fontSizePt, color: tokens.textColor, lineHeight: 1.2 }}>{sk.name}</Text>
                    </View>
                  ))}
                </View>
                {rightSkills.length > 0 && (
                  <View style={{ width: '50%', paddingLeft: 8 }}>
                    {rightSkills.map((sk) => (
                      <View key={sk.id} style={{ flexDirection: 'row', marginBottom: 2.5, alignItems: 'flex-start' }}>
                        <Text style={{ width: 10, fontSize: tokens.fontSizePt, color: '#64748b' }}>•</Text>
                        <Text style={{ flex: 1, fontSize: tokens.fontSizePt, color: tokens.textColor, lineHeight: 1.2 }}>{sk.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        }

        if (sectionKey === 'certifications' && certifications.length > 0) {
          return (
            <View key={sectionKey} style={styles.section} wrap={false}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              </View>
              {certifications.map((c) => (
                <View key={c.id} style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>
                    {c.name} {c.issuer ? `— ${c.issuer}` : ''}
                  </Text>
                  {c.date && <Text style={styles.itemDate}>{c.date}</Text>}
                </View>
              ))}
            </View>
          );
        }

        if (sectionKey === 'languages' && languages.length > 0) {
          return (
            <View key={sectionKey} style={styles.section} wrap={false}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              </View>
              <Text>
                {languages.map((l) => l.proficiency ? `${l.language} (${l.proficiency})` : l.language).join(', ')}
              </Text>
            </View>
          );
        }

        return null;
      })}
    </Page>
  );
};
