import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '../../types/resume';
import { getDesignTokens } from '../../utils/designTokens';
import { getSectionTitle } from '../../utils/formatting';
import { formatDateRange } from '../../utils/dates';

interface PdfTemplateProps {
  resume: Resume;
}

export const PdfMinimalTemplate: React.FC<PdfTemplateProps> = ({ resume }) => {
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
      color: '#0f172a',
      backgroundColor: '#ffffff',
    },
    header: {
      marginBottom: 16,
    },
    name: {
      fontSize: tokens.nameFontSizePt * 1.05,
      fontWeight: 300,
      color: '#0f172a',
      lineHeight: 1.15,
      marginBottom: 4,
    },
    title: {
      fontSize: tokens.contactFontSizePt,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 1,
      lineHeight: 1.2,
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      fontSize: tokens.contactFontSizePt,
      lineHeight: 1.2,
      color: '#64748b',
    },
    contactItem: {
      marginRight: 6,
    },
    section: {
      marginBottom: tokens.sectionSpacingPt * 0.75,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      borderTopStyle: 'solid',
      paddingTop: 8,
    },
    sectionHeading: {
      fontSize: tokens.contactFontSizePt,
      color: tokens.accentColor || '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 1,
      lineHeight: 1.2,
      marginBottom: 6,
    },
    itemTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    itemTitle: {
      fontWeight: 'medium',
      color: '#0f172a',
      fontSize: tokens.fontSizePt,
      lineHeight: 1.2,
    },
    itemDate: {
      fontSize: tokens.smallFontSizePt,
      color: '#94a3b8',
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
      {/* Minimal Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{personal.fullName || 'Your Name'}</Text>
        {personal.title && <Text style={styles.title}>{personal.title}</Text>}
        {contactItems.length > 0 && (
          <View style={styles.contactRow}>
            {contactItems.map((item, idx) => (
              <Text key={idx} style={styles.contactItem}>
                {idx > 0 ? `/   ${item}` : item}
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
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              <Text>{summary}</Text>
            </View>
          );
        }

        if (sectionKey === 'experience' && experience.length > 0) {
          return (
            <View key={sectionKey} style={styles.section}>
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              {experience.map((exp) => (
                <View key={exp.id} style={{ marginBottom: 6 }} wrap={false}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>
                      {exp.position} <Text style={{ color: '#94a3b8' }}>@ {exp.company}</Text>
                    </Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </Text>
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
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              {education.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 4 }} wrap={false}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>
                      {edu.degree} <Text style={{ color: '#64748b' }}>— {edu.institution}</Text>
                      {edu.gpa ? <Text style={{ color: '#94a3b8' }}> / GPA: {edu.gpa}</Text> : null}
                    </Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          );
        }

        if (sectionKey === 'projects' && projects.length > 0) {
          return (
            <View key={sectionKey} style={styles.section}>
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              {projects.map((proj) => (
                <View key={proj.id} style={{ marginBottom: 4 }} wrap={false}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{proj.name}</Text>
                    {proj.url && <Text style={styles.itemDate}>{proj.url}</Text>}
                  </View>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <Text style={styles.itemDate}>
                      {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
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
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              <View style={{ flexDirection: 'row', width: '100%', marginTop: 2 }}>
                <View style={{ width: '50%', paddingRight: 8 }}>
                  {leftSkills.map((s) => (
                    <View key={s.id} style={{ flexDirection: 'row', marginBottom: 2.5, alignItems: 'flex-start' }}>
                      <Text style={{ width: 10, fontSize: tokens.fontSizePt, color: '#94a3b8' }}>•</Text>
                      <Text style={{ flex: 1, fontSize: tokens.fontSizePt, color: tokens.textColor, lineHeight: 1.2 }}>{s.name}</Text>
                    </View>
                  ))}
                </View>
                {rightSkills.length > 0 && (
                  <View style={{ width: '50%', paddingLeft: 8 }}>
                    {rightSkills.map((s) => (
                      <View key={s.id} style={{ flexDirection: 'row', marginBottom: 2.5, alignItems: 'flex-start' }}>
                        <Text style={{ width: 10, fontSize: tokens.fontSizePt, color: '#94a3b8' }}>•</Text>
                        <Text style={{ flex: 1, fontSize: tokens.fontSizePt, color: tokens.textColor, lineHeight: 1.2 }}>{s.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        }

        return null;
      })}
    </Page>
  );
};
