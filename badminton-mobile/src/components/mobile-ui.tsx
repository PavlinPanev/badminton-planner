import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type DimensionValue, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, shadow, spacing } from '@/theme/mobile-theme';

type Tone = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'neutral';

const toneStyles = {
  emerald: { backgroundColor: colors.greenSoft, color: colors.emerald },
  sky: { backgroundColor: colors.skySoft, color: colors.sky },
  violet: { backgroundColor: colors.purpleSoft, color: colors.violet },
  amber: { backgroundColor: colors.amberSoft, color: '#92400e' },
  rose: { backgroundColor: colors.roseSoft, color: colors.rose },
  neutral: { backgroundColor: colors.neutralSoft, color: colors.muted },
};

export function ScreenShell({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.shell}>
      <View style={[styles.shellContent, padded && styles.padded]}>{children}</View>
      <BottomNav />
    </SafeAreaView>
  );
}

export function MobileCard({
  children,
  style,
  pressed,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  pressed?: boolean;
}) {
  return <View style={[styles.card, pressed && styles.cardPressed, style]}>{children}</View>;
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const toneStyle = toneStyles[tone];
  return (
    <Text style={[styles.badge, { backgroundColor: toneStyle.backgroundColor, color: toneStyle.color }]}>
      {label}
    </Text>
  );
}

export function StatTile({
  label,
  value,
  tone = 'sky',
  icon,
}: {
  label: string;
  value: string | number;
  tone?: Tone;
  icon?: string;
}) {
  const toneStyle = toneStyles[tone];
  return (
    <View style={styles.statTile}>
      <View style={[styles.statIcon, { backgroundColor: toneStyle.backgroundColor }]}>
        <Text style={[styles.statIconText, { color: toneStyle.color }]}>{icon ?? '•'}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function SportHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.courtLineOne} />
      <View style={styles.courtLineTwo} />
      <View style={styles.shuttleMark}>
        <Text style={styles.shuttleText}>V</Text>
      </View>
      <View style={styles.heroContent}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        {action}
      </View>
    </View>
  );
}

export function ProgressBar({ value, tone = 'emerald' }: { value: number; tone?: Tone }) {
  const width = `${Math.max(0, Math.min(value, 1)) * 100}%` as DimensionValue;
  const fillColor = toneStyles[tone].color;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width, backgroundColor: fillColor }]} />
    </View>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <MobileCard style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>◇</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action}
    </MobileCard>
  );
}

export function MessagePanel({
  message,
  tone = 'neutral',
  action,
}: {
  message: string;
  tone?: Tone;
  action?: React.ReactNode;
}) {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[styles.messagePanel, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.messageText, { color: toneStyle.color }]}>{message}</Text>
      {action}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = 'sky',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: Tone;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: toneStyles[tone].color },
        (pressed || disabled) && styles.buttonPressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function AttendanceButton({
  label,
  selected,
  onPress,
  disabled,
  tone,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  tone: Tone;
}) {
  const toneStyle = toneStyles[tone];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.attendanceButton,
        { borderColor: toneStyle.color },
        selected && { backgroundColor: toneStyle.color },
        (pressed || disabled) && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.attendanceButtonText, { color: toneStyle.color }, selected && styles.attendanceButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const items = [
    { label: 'Home', icon: '⌂', href: '/' },
    { label: 'Groups', icon: '◌', href: '/groups' },
    { label: 'Sessions', icon: '◷', href: '/sessions' },
    { label: 'Updates', icon: '*', href: '/announcements' },
    { label: 'Events', icon: '◇', href: '/events' },
    { label: 'Account', icon: '◍', href: '/account' },
  ];

  return (
    <View style={styles.navWrap}>
      <View style={styles.nav}>
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Pressable
              accessibilityRole="tab"
              key={item.href}
              onPress={() => router.replace(item.href as never)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <Text style={[styles.navIcon, active && styles.navActiveText]}>{item.icon}</Text>
              <Text style={[styles.navLabel, active && styles.navActiveText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shellContent: {
    flex: 1,
    paddingBottom: 76,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    padding: spacing.lg,
    ...shadow,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'capitalize',
  },
  statTile: {
    flex: 1,
    minWidth: 145,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    padding: spacing.md,
    ...shadow,
  },
  statIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    marginBottom: spacing.sm,
  },
  statIconText: {
    fontSize: 18,
    fontWeight: '900',
  },
  statValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  hero: {
    overflow: 'hidden',
    borderRadius: radii.xl,
    backgroundColor: colors.violet,
    minHeight: 188,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  courtLineOne: {
    position: 'absolute',
    left: -20,
    right: 40,
    top: 32,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ rotate: '-14deg' }],
  },
  courtLineTwo: {
    position: 'absolute',
    left: 40,
    right: -30,
    bottom: 36,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.32)',
    transform: [{ rotate: '-14deg' }],
  },
  shuttleMark: {
    position: 'absolute',
    right: 22,
    top: 22,
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  shuttleText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 26,
    fontWeight: '900',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    backgroundColor: 'rgba(14,165,233,0.18)',
  },
  eyebrow: {
    color: '#d9f99d',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 36,
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.skySoft,
  },
  emptyIconText: {
    color: colors.sky,
    fontSize: 28,
    fontWeight: '900',
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyMessage: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  messagePanel: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 150,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  attendanceButton: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  attendanceButtonText: {
    fontSize: 14,
    fontWeight: '900',
  },
  attendanceButtonTextActive: {
    color: '#fff',
  },
  buttonPressed: {
    opacity: 0.72,
  },
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: 'transparent',
  },
  nav: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.95)',
    padding: spacing.xs,
    ...shadow,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    minHeight: 56,
    gap: 1,
  },
  navItemActive: {
    backgroundColor: colors.skySoft,
  },
  navIcon: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '900',
  },
  navLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  navActiveText: {
    color: colors.sky,
  },
});
