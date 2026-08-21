import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '../../types/resume';
import { getDesignTokens } from '../../utils/designTokens';
import { getSectionTitle } from '../../utils/formatting';
import { formatDateRange } from '../../utils/dates';

interface PdfTemplateProps {
  resume: Resume;
}

export const PdfStudentTemplate: React.FC<PdfTemplateProps> = ({ resume }) => {
  const { personal, summary, experience, education, projects, skills, certifications, languages, settings } = resume;
  const tokens = getDesignTokens(settings, resume.templateId);

  const accent = settings.accentColor || '#0284c7';

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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 14,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: '#f1f5f9',
      borderBottomStyle: 'solid',
    },
    headerLeft: {
      flex: 1,
      paddingRight: 10,
    },
    headerRight: {
      textAlign: 'right',
      fontSize: tokens.contactFontSizePt,
      lineHeight: 1.25,
      color: '#475569',
    },
    name: {
      fontSize: tokens.nameFontSizePt,
      fontWeight: 'bold',
      color: accent,
      lineHeight: 1.15,
      marginBottom: 4,
    },
    title: {
      fontSize: tokens.titleFontSizePt,
      fontWeight: 'medium',
      color: '#475569',
      lineHeight: 1.2,
    },
    section: {
      marginBottom: tokens.sectionSpacingPt * 0.75,
    },
    sectionHeading: {
      fontSize: tokens.headingFontSizePt,
      fontWeight: 'bold',
      color: accent,
      textTransform: 'uppercase',
      lineHeight: 1.2,
      borderBottomWidth: 2,
      borderBottomColor: accent,
      borderBottomStyle: 'solid',
      paddingBottom: 2,
      marginBottom: 6,
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
    itemSubtitle: {
      fontSize: tokens.fontSizePt * 0.95,
      fontWeight: 'medium',
      color: '#334155',
      marginBottom: 3,
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
      backgroundColor: '#f0f9ff',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 4,
      fontSize: tokens.contactFontSizePt,
      color: '#0369a1',
      marginRight: 6,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: '#bae6fd',
    },
  });

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
    <Page size="A4" style={styles.page}>
      {/* Student Academic Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{personal.fullName || 'Your Name'}</Text>
          {personal.title && <Text style={styles.title}>{personal.title}</Text>}
        </View>
        {contactItems.length > 0 && (
          <View style={styles.headerRight}>
            {contactItems.map((item, idx) => (
              <Text key={idx}>{item}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Sections */}
      {studentSectionOrder.map((sectionKey) => {
        if (sectionKey === 'personal') return null;

        if (sectionKey === 'summary' && summary?.trim()) {
          return (
            <View key={sectionKey} style={styles.section} wrap={false}>
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              <Text>{summary}</Text>
            </View>
          );
        }

        if (sectionKey === 'education' && education.length > 0) {
          return (
            <View key={sectionKey} style={styles.section}>
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              {education.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 6 }} wrap={false}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={styles.itemSubtitle}>{edu.institution}</Text>
                    {edu.gpa ? <Text style={{ fontSize: tokens.smallFontSizePt, color: '#0284c7', fontWeight: 'bold' }}>GPA: {edu.gpa}</Text> : null}
                  </View>
                  {edu.description && <Text style={styles.bulletText}>{edu.description}</Text>}
                </View>
              ))}
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
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{exp.company}</Text>
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

        if (sectionKey === 'projects' && projects.length > 0) {
          return (
            <View key={sectionKey} style={styles.section}>
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
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
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              <View style={{ flexDirection: 'row', width: '100%', marginTop: 2 }}>
                <View style={{ width: '50%', paddingRight: 8 }}>
                  {leftSkills.map((sk) => (
                    <View key={sk.id} style={{ flexDirection: 'row', marginBottom: 2.5, alignItems: 'flex-start' }}>
                      <Text style={{ width: 10, fontSize: tokens.fontSizePt, color: '#0284c7' }}>•</Text>
                      <Text style={{ flex: 1, fontSize: tokens.fontSizePt, color: tokens.textColor, lineHeight: 1.2 }}>{sk.name}</Text>
                    </View>
                  ))}
                </View>
                {rightSkills.length > 0 && (
                  <View style={{ width: '50%', paddingLeft: 8 }}>
                    {rightSkills.map((sk) => (
                      <View key={sk.id} style={{ flexDirection: 'row', marginBottom: 2.5, alignItems: 'flex-start' }}>
                        <Text style={{ width: 10, fontSize: tokens.fontSizePt, color: '#0284c7' }}>•</Text>
                        <Text style={{ flex: 1, fontSize: tokens.fontSizePt, color: tokens.textColor, lineHeight: 1.2 }}>{sk.name}</Text>
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
