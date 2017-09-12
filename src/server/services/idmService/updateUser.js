import fetch from './fetch'

export default async function updateUser(user) {
  const query = 'mutation ($user: InputUser!) {updateUser(user: $user) {id handle}}'
  const variables = {user}
  const result = await fetch({query, variables})
  return result && result.data ? result.data.updateUser : null
}
