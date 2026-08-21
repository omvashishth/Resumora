import React from 'react';
import { Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Resume } from '../../types/resume';
import { getDesignTokens } from '../../utils/designTokens';
import { getSectionTitle } from '../../utils/formatting';
import { formatDateRange } from '../../utils/dates';

interface PdfTemplateProps {
  resume: Resume;
}

export const PdfModernSidebarPhotoTemplate: React.FC<PdfTemplateProps> = ({ resume }) => {
  const { personal, summary, experience, education, skills, settings } = resume;
  const tokens = getDesignTokens(settings, resume.templateId);

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      fontFamily: tokens.pdfFontFamily,
      fontSize: tokens.fontSizePt,
    },
    sidebar: {
      width: '33%',
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      padding: 16,
    },
    main: {
      width: '67%',
      padding: 20,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 6,
      alignSelf: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#334155',
    },
    sidebarHeading: {
      fontSize: 8.5,
      fontWeight: 'bold',
      color: '#94A3B8',
      textTransform: 'uppercase',
      borderBottomWidth: 0.5,
      borderBottomColor: '#334155',
      paddingBottom: 2,
      marginBottom: 5,
      marginTop: 8,
    },
    sidebarText: {
      fontSize: 8,
      color: '#E2E8F0',
      marginBottom: 3,
    },
    name: {
      fontSize: tokens.nameFontSizePt,
      fontWeight: 'bold',
      color: tokens.accentColor,
      marginBottom: 2,
    },
    title: {
      fontSize: tokens.titleFontSizePt,
      color: '#64748B',
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    section: {
      marginBottom: tokens.sectionSpacingPt * 0.75,
    },
    sectionHeading: {
      fontSize: tokens.headingFontSizePt,
      fontWeight: 'bold',
      color: tokens.accentColor,
      textTransform: 'uppercase',
      borderBottomWidth: 1,
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
      color: '#0F172A',
      fontSize: tokens.fontSizePt,
    },
    itemDate: {
      fontSize: tokens.smallFontSizePt,
      color: '#64748B',
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
      width: 8,
      fontSize: tokens.fontSizePt * 0.9,
      color: '#334155',
    },
    bulletText: {
      flex: 1,
      fontSize: tokens.fontSizePt * 0.9,
      color: '#334155',
    },
  });

  return (
    <Page size="A4" style={styles.page}>
      {/* Left Sidebar */}
      <View style={styles.sidebar}>
        {personal.avatarUrl ? <Image src={personal.avatarUrl} style={styles.avatar} /> : null}

        <Text style={styles.sidebarHeading}>Contact</Text>
        {personal.email && <Text style={styles.sidebarText}>{personal.email}</Text>}
        {personal.phone && <Text style={styles.sidebarText}>{personal.phone}</Text>}
        {personal.location && <Text style={styles.sidebarText}>{personal.location}</Text>}
        {personal.website && <Text style={styles.sidebarText}>{personal.website}</Text>}
        {personal.linkedin && <Text style={styles.sidebarText}>{personal.linkedin}</Text>}

        {skills.length > 0 && (
          <View>
            <Text style={styles.sidebarHeading}>Skills</Text>
            {skills.map((s) => (
              <Text key={s.id} style={styles.sidebarText}>• {s.name}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        <Text style={styles.name}>{personal.fullName || 'Your Name'}</Text>
        {personal.title && <Text style={styles.title}>{personal.title}</Text>}

        {summary?.trim() && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>{getSectionTitle('summary')}</Text>
            <Text style={{ fontSize: tokens.fontSizePt, color: '#334155' }}>{summary}</Text>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>{getSectionTitle('experience')}</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 6 }} wrap={false}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{exp.position}</Text>
                  <Text style={styles.itemDate}>
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </Text>
                </View>
                <Text style={styles.itemSubtitle}>{exp.company} {exp.location ? `— ${exp.location}` : ''}</Text>
                {exp.bullets?.map((b, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>{getSectionTitle('education')}</Text>
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
        )}
      </View>
    </Page>
  );
};
