const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const Path = require('path')

exports.sourceNodes = async (
  { boundActionCreators, createNodeId },
  configOptions
) => {
  const { createNode } = boundActionCreators;

  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins;

  // URL to the pleroma instance (no trailing slash) and your userId are **required**
  const { instance, userId } = configOptions

  const count = configOptions.count || 20

  const apiUrl = `${instance}/api/qvitter/statuses/user_timeline.json?user_id=${userId}&count=${count}`

  const processPost = post => {
    const nodeId = createNodeId(`pleroma-post-${post.id}`)
    const nodeContent = post.text
    const nodeContentDigest = crypto
          .createHash('md5')
          .update(nodeContent)
          .digest('hex')

    const nodeData = {
      ...post,
      attachments: [...post.attachments],
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: 'PleromaPost',
        content: nodeContent,
        contentDigest: nodeContentDigest
      }
    }

    return nodeData
  }

  return (
    axios.get(apiUrl)
      .then(({data}) => {
        data.forEach(post => {
          const nodeData = processPost(post)
          createNode(nodeData)
        })
      })
      .catch(err => {
        console.log('Error fetching from Pleroma Source!', err)
      })
  )

};
