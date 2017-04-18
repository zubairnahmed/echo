import {STAT_DESCRIPTORS} from 'src/common/models/stat'

export default function findProjects(identifiers) {
  return {
    variables: {identifiers},
    query: `
      query ($identifiers: [String]) {
        findProjects(identifiers: $identifiers) {
          id
          name
          state
          playerIds
          createdAt
          coachId
          cycle {
            cycleNumber
          }
          goal {
            title
          }
          stats {
            ${STAT_DESCRIPTORS.PROJECT_COMPLETENESS}
            ${STAT_DESCRIPTORS.PROJECT_HOURS}
          }
        }
      }
    `,
  }
}
