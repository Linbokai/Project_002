import { COMPLIANCE_RULES } from '@/constants/compliance-rules'
import type { ComplianceRule } from '@/constants/compliance-rules'

export interface ComplianceIssue {
  ruleId: string
  category: ComplianceRule['category']
  platform: ComplianceRule['platform']
  description: string
  matchedText: string
  position: number
}

export function checkCompliance(
  scriptContent: string,
  targetPlatform?: ComplianceRule['platform'],
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const applicableRules = COMPLIANCE_RULES.filter(
    (rule) => rule.platform === 'all' || !targetPlatform || rule.platform === targetPlatform,
  )

  for (const rule of applicableRules) {
    for (const pattern of rule.patterns) {
      let searchFrom = 0
      while (true) {
        const pos = scriptContent.indexOf(pattern, searchFrom)
        if (pos === -1) break
        issues.push({
          ruleId: rule.id,
          category: rule.category,
          platform: rule.platform,
          description: rule.description,
          matchedText: pattern,
          position: pos,
        })
        searchFrom = pos + pattern.length
      }
    }
  }

  issues.sort((a, b) => {
    const categoryOrder = { forbidden: 0, restricted: 1, caution: 2 }
    return categoryOrder[a.category] - categoryOrder[b.category]
  })

  return issues
}

export function getComplianceSummary(issues: ComplianceIssue[]): {
  forbidden: number
  restricted: number
  caution: number
  passed: boolean
} {
  const forbidden = issues.filter((i) => i.category === 'forbidden').length
  const restricted = issues.filter((i) => i.category === 'restricted').length
  const caution = issues.filter((i) => i.category === 'caution').length
  return { forbidden, restricted, caution, passed: forbidden === 0 }
}
