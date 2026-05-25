const { prisma } = require('../config/database');

/**
 * Calculate grade from percentage using system settings
 * @param {number} percentage
 * @returns {Promise<string>} grade letter
 */
async function calculateGrade(percentage) {
  const settings = await prisma.systemSettings.findMany({
    where: { key: { in: ['gradeAPlus', 'gradeA', 'gradeB', 'gradeC', 'gradeD'] } },
  });

  const map = {};
  settings.forEach((s) => { map[s.key] = parseFloat(s.value); });

  const aPlus = map.gradeAPlus ?? 90;
  const a     = map.gradeA     ?? 80;
  const b     = map.gradeB     ?? 70;
  const c     = map.gradeC     ?? 60;
  const d     = map.gradeD     ?? 50;

  if (percentage >= aPlus) return 'A+';
  if (percentage >= a)     return 'A';
  if (percentage >= b)     return 'B';
  if (percentage >= c)     return 'C';
  if (percentage >= d)     return 'D';
  return 'F';
}

/**
 * Synchronous grade calculation with explicit thresholds
 */
function calculateGradeSync(percentage, thresholds = {}) {
  const { aPlus = 90, a = 80, b = 70, c = 60, d = 50 } = thresholds;
  if (percentage >= aPlus) return 'A+';
  if (percentage >= a)     return 'A';
  if (percentage >= b)     return 'B';
  if (percentage >= c)     return 'C';
  if (percentage >= d)     return 'D';
  return 'F';
}

module.exports = { calculateGrade, calculateGradeSync };
