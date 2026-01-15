/**
 * Escalation Helper Functions
 * Utility functions for calculating escalation levels and related logic
 */

import type { EscalationLevel } from '@/types/escalation';
import type { Severity } from '@/types/inspection';

/**
 * Calculate escalation level based on days overdue
 *
 * Rules:
 * - Level 1: 1-7 days overdue
 * - Level 2: 8-14 days overdue
 * - Level 3: 15+ days overdue
 * - Critical severity: Always Level 3 regardless of days
 *
 * @param daysOverdue - Number of days the inspection is overdue
 * @param severity - Severity of the inspection
 * @returns Escalation level (1, 2, or 3)
 */
export function calculateEscalationLevel(
  daysOverdue: number,
  severity: Severity
): EscalationLevel {
  // Critical severity items are always Level 3
  if (severity === 'critical') {
    return 3;
  }

  // Calculate level based on days overdue
  if (daysOverdue >= 15) {
    return 3;
  } else if (daysOverdue >= 8) {
    return 2;
  } else {
    return 1;
  }
}

/**
 * Get color classes for escalation level
 *
 * @param level - Escalation level (1, 2, or 3)
 * @returns Tailwind CSS classes for background, text, and border
 */
export function getEscalationLevelColor(level: EscalationLevel): string {
  switch (level) {
    case 1:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 2:
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 3:
      return 'bg-red-100 text-red-800 border-red-300';
  }
}

/**
 * Get color classes for severity
 *
 * @param severity - Severity level
 * @returns Tailwind CSS classes for background and text
 */
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
  }
}

/**
 * Get display text for escalation level
 *
 * @param level - Escalation level
 * @returns Human-readable description
 */
export function getEscalationLevelDescription(level: EscalationLevel): string {
  switch (level) {
    case 1:
      return '1-7 days overdue';
    case 2:
      return '8-14 days overdue';
    case 3:
      return '15+ days overdue';
  }
}

/**
 * Calculate days overdue from scheduled date
 *
 * @param scheduledDate - ISO date string of scheduled date
 * @returns Number of days overdue (0 if not yet due)
 */
export function calculateDaysOverdue(scheduledDate: string): number {
  const scheduled = new Date(scheduledDate);
  const today = new Date();
  const diffTime = today.getTime() - scheduled.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Check if escalation can be escalated higher
 *
 * @param currentLevel - Current escalation level
 * @returns true if can be escalated, false if already at max level
 */
export function canEscalateHigher(currentLevel: EscalationLevel): boolean {
  return currentLevel < 3;
}

/**
 * Format date for display in escalations
 *
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatEscalationDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format timestamp for action history
 *
 * @param dateString - ISO date string
 * @returns Formatted timestamp string
 */
export function formatActionTimestamp(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get urgency score for sorting escalations
 * Higher score = more urgent
 *
 * @param level - Escalation level
 * @param severity - Severity
 * @param daysOverdue - Days overdue
 * @returns Urgency score (higher = more urgent)
 */
export function getUrgencyScore(
  level: EscalationLevel,
  severity: Severity,
  daysOverdue: number
): number {
  let score = 0;

  // Level contributes 100 points per level
  score += level * 100;

  // Severity contributes 0-40 points
  const severityPoints = {
    low: 10,
    medium: 20,
    high: 30,
    critical: 40,
  };
  score += severityPoints[severity];

  // Days overdue contributes 1 point per day
  score += daysOverdue;

  return score;
}

/**
 * Get recommended action based on escalation state
 *
 * @param level - Escalation level
 * @param severity - Severity
 * @param daysOverdue - Days overdue
 * @returns Recommended action text
 */
export function getRecommendedAction(
  level: EscalationLevel,
  severity: Severity,
  daysOverdue: number
): string {
  if (severity === 'critical') {
    return 'Immediate action required - Critical finding';
  }

  if (level === 3 && daysOverdue >= 30) {
    return 'Urgent: Schedule inspection immediately and notify management';
  }

  if (level === 3) {
    return 'High priority: Schedule inspection within 24 hours';
  }

  if (level === 2 && daysOverdue >= 12) {
    return 'Send reminder and confirm inspector availability';
  }

  if (level === 2) {
    return 'Schedule inspection within 3 days';
  }

  return 'Send reminder to assigned inspector';
}
