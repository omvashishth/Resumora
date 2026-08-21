import React from 'react';
import { Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Resume } from '../../types/resume';
import { getDesignTokens } from '../../utils/designTokens';
import { getSectionTitle } from '../../utils/formatting';
import { formatDateRange } from '../../utils/dates';

interface PdfTemplateProps {
  resume: Resume;
}

export const PdfExecutivePhotoTemplate: React.FC<PdfTemplateProps> = ({ resume }) => {
  const { personal, summary, experience, education, skills, settings } = resume;
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
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: tokens.accentColor,
      paddingBottom: 10,
      marginBottom: 12,
    },
    headerLeft: {
      flex: 1,
      paddingRight: 10,
    },
    name: {
      fontSize: tokens.nameFontSizePt,
      fontWeight: 'bold',
      color: tokens.accentColor,
      lineHeight: 1.15,
      marginBottom: 3,
    },
    title: {
      fontSize: tokens.titleFontSizePt,
      fontWeight: 'bold',
      color: '#475569',
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      fontSize: tokens.contactFontSizePt,
      color: '#64748b',
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: tokens.accentColor,
    },
    section: {
      marginBottom: tokens.sectionSpacingPt * 0.75,
    },
    sectionHeading: {
      fontSize: tokens.headingFontSizePt,
      fontWeight: 'bold',
      color: tokens.accentColor,
      textTransform: 'uppercase',
      borderBottomWidth: 1.5,
      borderBottomColor: tokens.accentColor,
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
    },
    itemDate: {
      fontSize: tokens.smallFontSizePt,
      color: '#64748b',
    },
    itemSubtitle: {
      fontSize: tokens.fontSizePt * 0.95,
      fontStyle: 'italic',
      color: '#334155',
      marginBottom: 3,
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
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header with Photo */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{personal.fullName || 'Your Name'}</Text>
          {personal.title && <Text style={styles.title}>{personal.title}</Text>}
          {contactItems.length > 0 && (
            <View style={styles.contactRow}>
              {contactItems.map((item, idx) => (
                <Text key={idx}>
                  {idx > 0 ? `  •  ${item}` : item}
                </Text>
              ))}
            </View>
          )}
        </View>
        {personal.avatarUrl ? (
          <Image src={personal.avatarUrl} style={styles.avatar} />
        ) : null}
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
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{exp.company} {exp.location ? `— ${exp.location}` : ''}</Text>
                  {exp.bullets?.map((b, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
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
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}</Text>
                </View>
              ))}
            </View>
          );
        }

        if (sectionKey === 'skills' && skills.length > 0) {
          return (
            <View key={sectionKey} style={styles.section} wrap={false}>
              <Text style={styles.sectionHeading}>{getSectionTitle(sectionKey)}</Text>
              <Text>{skills.map((s) => s.name).join('   •   ')}</Text>
            </View>
          );
        }

        return null;
      })}
    </Page>
  );
};
