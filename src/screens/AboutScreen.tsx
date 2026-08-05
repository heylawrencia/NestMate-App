/**
 * AboutScreen — App Information & Version Screen (Spec §10.3)
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export default function AboutScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About NESTMATE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ElevatedCard style={styles.card}>
          <IconCircle size={72} backgroundColor={colors.primaryLight} style={styles.iconCenter}>
            <Ionicons name="home" size={36} color={colors.primary} />
          </IconCircle>

          <Text style={styles.appName}>NESTMATE</Text>
          <Text style={styles.appVersion}>Version 2.0.0 (Build 2026.07)</Text>

          <Text style={styles.description}>
            NESTMATE is Ghana&apos;s premier student housing discovery and lifestyle roommate matching platform. Built specifically for students in Kumasi, Accra, and university campuses across Ghana.
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Developer</Text>
            <Text style={styles.infoValue}>NESTMATE Technologies</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>Expo React Native / Spring Boot Microservices</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Support</Text>
            <Text style={styles.infoValue}>+233 53 242 3802</Text>
          </View>
        </ElevatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    padding: space.xs,
    marginRight: space.sm,
  },
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  scrollContent: {
    padding: space.lg,
  },
  card: {
    padding: space.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  iconCenter: {
    marginBottom: space.md,
  },
  appName: {
    fontFamily: type.display.fontFamily,
    fontSize: 28,
    color: colors.ink,
    fontWeight: '800',
  },
  appVersion: {
    fontFamily: type.micro.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: space.md,
  },
  description: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.line,
    marginVertical: space.lg,
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  infoLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  infoValue: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
});
