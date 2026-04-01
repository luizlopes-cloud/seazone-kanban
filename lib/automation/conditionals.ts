import type { FieldConditional } from '@/types/domain'

/**
 * Evaluates field conditionals and returns the set of field_ids that should be VISIBLE.
 * All fields default to visible unless a 'show' conditional with unmet conditions or a 'hide' conditional with met conditions applies.
 */
export function evaluateConditionals(
  conditionals: FieldConditional[],
  fieldValues: Record<string, unknown>,
  allFieldIds: string[]
): Set<string> {
  const visible = new Set(allFieldIds)

  for (const conditional of conditionals) {
    const conditionMet = evaluateConditionGroup(conditional, fieldValues)

    if (conditional.action === 'hide' && conditionMet) {
      visible.delete(conditional.target_field_id)
    } else if (conditional.action === 'show' && !conditionMet) {
      visible.delete(conditional.target_field_id)
    }
  }

  return visible
}

function evaluateConditionGroup(
  conditional: FieldConditional,
  fieldValues: Record<string, unknown>
): boolean {
  const { conditions, operator } = conditional

  if (!conditions?.length) return true

  if (operator === 'and') {
    return conditions.every((c) => evaluateSingleCondition(c, fieldValues))
  } else {
    return conditions.some((c) => evaluateSingleCondition(c, fieldValues))
  }
}

function evaluateSingleCondition(
  condition: { field_key: string; condition_type: string; value?: string },
  fieldValues: Record<string, unknown>
): boolean {
  const fieldValue = fieldValues[condition.field_key]

  switch (condition.condition_type) {
    case 'equals':
      return String(fieldValue ?? '') === String(condition.value ?? '')

    case 'not_equals':
      return String(fieldValue ?? '') !== String(condition.value ?? '')

    case 'present':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''

    case 'blank':
      return fieldValue === null || fieldValue === undefined || fieldValue === ''

    case 'string_contains':
      return String(fieldValue ?? '').toLowerCase().includes(String(condition.value ?? '').toLowerCase())

    case 'labels_equals':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value)
      }
      return String(fieldValue ?? '') === String(condition.value ?? '')

    default:
      return true
  }
}
