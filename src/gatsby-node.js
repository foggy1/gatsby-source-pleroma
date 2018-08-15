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
  const pages = configOptions.pages || 1

  // Note: as of 7/28/18, the `count` param doesn't actually do anything: it's ALWAYS 20.
  //const count = configOptions.count || 20

  const apiUrl = `${instance}/api/qvitter/statuses/user_timeline.json?user_id=${userId}`

  const processPost = post => {
    const nodeId = createNodeId(`pleroma-post-${post.id}`)
    const nodeContent = post.text
    const nodeContentDigest = crypto
          .createHash('md5')
          .update(nodeContent)
          .digest('hex')

    // If there are not any attachments in your dataset, declarative calls to the attachment node will fail
    // We add a placeholder here with an empty string and explicit empty boolean to make sure it stays in the schema
    // Note: id is often null on REAL attachments, and is not a reliable field on which to filter empty attachments.
    const attachmentPlaceholder = { id: null, url: '', empty: true, mimetype: '', oembed: null }

    const nodeData = {
      ...post,
      attachments: post.attachments && post.attachments.length ? post.attachments : [attachmentPlaceholder],
      in_reply_to_status_id: post.in_reply_to_status_id || 0,
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

  const nextPage = (data, pages) => {
    const maxId = data[data.length - 1].id
    const nextUrl = apiUrl + `&max_id=${maxId}`
    axios.get(nextUrl)
      .then(({data}) => {
        if (!data || !data.length) { return }
        data.forEach(post => {
          const nodeData = processPost(post)
          createNode(nodeData)
        })
        if (pages > 0) {
          nextPage(data, pages - 1)
        }
      })
      .catch(err => console.log(err))
  }

  return (
    axios.get(apiUrl)
      .then(({data}) => {
        data.forEach(post => {
          const nodeData = processPost(post)
          createNode(nodeData)
        })
        if (pages > 1) {
          nextPage(data, pages)
        }
      })
      .catch(err => {
        console.log('Error fetching from Pleroma Source!', err)
      })
  )

};
