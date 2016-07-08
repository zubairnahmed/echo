import {getSurveyById} from '../../server/db/survey'
import {getRelativeContributionQuestionForSurvey} from '../../server/db/question'
import {getSurveyResponses} from '../../server/db/response'
import {updatePlayerECCStats} from '../../server/db/player'
import {
  getProjectHistoryForCycle,
} from '../../server/db/project'

export async function updateTeamECCStats(project, cycleId) {
  const projectCycle = getProjectHistoryForCycle(project, cycleId)
  const teamSize = projectCycle.playerIds.length
  const surveyId = projectCycle.retrospectiveSurveyId
  const survey = await getSurveyById(surveyId)
  const {id: questionId} = await getRelativeContributionQuestionForSurvey(survey)
  const responsesBySubject = await getResponsesBySubject(surveyId, questionId)

  const promises = []
  responsesBySubject.forEach((responses, subjectPlayerId) => {
    const relativeContributionScores = responses.map(({value}) => value)
    const projectECC = calculateProjectECCStatsForPlayer({teamSize, relativeContributionScores})
    promises.push(updatePlayerECCStats(subjectPlayerId, projectECC, cycleId, project.id))
  })

  await Promise.all(promises)
}

export function calculateProjectECCStatsForPlayer({teamSize, relativeContributionScores, projectLength}) {
  // Calculate ABC
  const aggregateBuildCycles = (projectLength || 1) * teamSize

  // Calculate RC
  const sum = relativeContributionScores.reduce((sum, next) => sum + next, 0)
  const relativeContribution = Math.round(sum / relativeContributionScores.length)

  // Calculate ECC
  const effectiveContributionCycles = relativeContribution * aggregateBuildCycles

  return {
    ecc: effectiveContributionCycles,
    abc: aggregateBuildCycles,
    rc: relativeContribution,
  }
}

async function getResponsesBySubject(surveyId, questionId) {
  const responses = await getSurveyResponses(surveyId, questionId)

  const responsesBySubject = responses.reduce((result, response) => {
    const current = result.get(response.subject) || []
    result.set(response.subject, current.concat(response))
    return result
  }, new Map())

  return responsesBySubject
}