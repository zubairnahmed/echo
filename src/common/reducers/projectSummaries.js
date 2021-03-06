import {
  GET_PROJECT_SUMMARY_REQUEST,
  GET_PROJECT_SUMMARY_SUCCESS,
  GET_PROJECT_SUMMARY_FAILURE,
  LOCK_SURVEY_REQUEST,
  LOCK_SURVEY_SUCCESS,
  UNLOCK_SURVEY_REQUEST,
  UNLOCK_SURVEY_SUCCESS,
} from 'src/common/actions/types'

const initialState = {
  projectSummaries: {},
  isBusy: false,
  isLockingOrUnlocking: false,
}

export default function projectSummaries(state = initialState, action) {
  switch (action.type) {
    case GET_PROJECT_SUMMARY_REQUEST:
      return Object.assign({}, state, {
        isBusy: true,
      })

    case LOCK_SURVEY_REQUEST:
    case UNLOCK_SURVEY_REQUEST:
      return Object.assign({}, state, {isLockingOrUnlocking: true})

    case GET_PROJECT_SUMMARY_SUCCESS:
    case LOCK_SURVEY_SUCCESS:
    case UNLOCK_SURVEY_SUCCESS:
      {
        const projectSummary = action.response || {}
        const {project} = projectSummary || {}
        const projectSummaries = Object.assign({}, state.projectSummaries, {[project.id]: projectSummary})
        return Object.assign({}, state, {
          isLockingOrUnlocking: false,
          isBusy: false,
          projectSummaries,
        })
      }

    case GET_PROJECT_SUMMARY_FAILURE:
      return Object.assign({}, state, {
        isBusy: false,
      })

    default:
      return state
  }
}
