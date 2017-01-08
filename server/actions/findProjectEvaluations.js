import {Response, Project} from 'src/server/services/dataService'
import {groupById} from 'src/server/util'
import {findValueForReponseQuestionStat} from 'src/server/util/stats'
import {STAT_DESCRIPTORS} from 'src/common/models/stat'

const {PROJECT_COMPLETENESS, PROJECT_QUALITY} = STAT_DESCRIPTORS

export default async function findProjectEvaluations(projectIdentifier) {
  const project = await (typeof projectIdentifier === 'string' ?
    Project.get(projectIdentifier) :
    projectIdentifier
  )

  if (!project || !project.id) {
    throw new Error(`Project not found for identifier: ${projectIdentifier}`)
  }

  const {projectReviewSurveyId} = project
  if (!projectReviewSurveyId) {
    return []
  }

  const reviewSurveyResponses = groupById(
    await Response.filter({
      surveyId: projectReviewSurveyId,
      subjectId: project.id,
    })
    .getJoin({question: {stat: true}})
  , 'respondentId')

  const projectEvaluations = []
  reviewSurveyResponses.forEach((responses, respondentId) => {
    // choose create time of earliest response as create time for the evaluation
    const createdAt = responses.sort((r1, r2) => {
      const diff = r1.createdAt.getTime() - r2.createdAt.getTime()
      return diff === 0 ? r1.id.localeCompare(r2.id) : diff
    })[0].createdAt

    projectEvaluations.push({
      createdAt,
      submittedById: respondentId,
      [STAT_DESCRIPTORS.PROJECT_COMPLETENESS]: findValueForReponseQuestionStat(responses, PROJECT_COMPLETENESS),
      [STAT_DESCRIPTORS.PROJECT_QUALITY]: findValueForReponseQuestionStat(responses, PROJECT_QUALITY),
    })
  })

  return projectEvaluations
}