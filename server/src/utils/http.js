const extractTokenFromRequest = (req) => {
  const authHeader = req.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }
  if (req.query?.token) return String(req.query.token)
  if (req.body?.token) return String(req.body.token)
  return null
}

module.exports = {
  extractTokenFromRequest,
}

