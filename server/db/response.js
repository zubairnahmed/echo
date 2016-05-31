import r from '../../db/connect'
import {validateResponse} from '../../common/models/response'
import {getQuestionById} from './question'

export function saveResponse(response, question) {
  const questionPromise = question ? Promise.resolve(question) : getQuestionById(response.questionId)
  return questionPromise
    .then(({type}) => validateResponse(response, type))
    .then(response => saveValidatedResponse(response))
}

function saveValidatedResponse(response) {
  if (Array.isArray(response.value)) {
    return saveMultiResponse(response)
  }
  return saveSingleResponse(response)
}

function saveMultiResponse(response) {
  // TODO: should values be an object instead of an array?
  const values = response.value
  const subjects = response.subject

  return Promise.all(
    subjects.map((subject, i) => {
      const singleResponse = Object.assign({}, response, {subject, value: values[i]})
      return saveSingleResponse(singleResponse)
    })
  )
}

function saveSingleResponse(response) {
  const {questionId, subject, surveyId} = response

  if (surveyId) {
    return lookupResponse({questionId, subject, surveyId})
      .then(existingResponse => {
        if (existingResponse) {
          const newResponse = Object.assign({}, existingResponse, response, {updatedAt: r.now()})
          return r.table('responses').get(newResponse.id).update(newResponse).run()
        }
        return save(response)
      })
  }
  return save(response)
}

function save(response) {
  const responseWithTimestampts = Object.assign({}, response, {
    updatedAt: r.now(),
    createdAt: r.now(),
  })
  return r.table('responses').insert(responseWithTimestampts).run()
}

function lookupResponse({questionId, surveyId, subject}) {
  return r.table('responses').getAll([questionId, subject, surveyId], {index: 'questionSubjectSurvey'}).run()
    .then(results => results[0])
}