# gatsby-source-pleroma

Source plugin for pulling data into [Gatsby](https://www.gatsbyjs.org/) from a single user's [Pleroma](https://pleroma.social/) feed.

## Installation guide
* Install Gatsby
* Install plugin with `npm` or `yarn`
    * `npm install gatsby-source-pleroma --save`
    * `yarn add gatsby-source-pleroma`
* Update your `gatsby-config.js` file with the following:
```
module.exports = {
 siteMetadata: { ... },
 plugins: [
   ...,
   {
     resolve: 'gatsby-source-pleroma',
     options: {
       instance: 'https://pleroma.example.site', // required
       userId: 1, // required
     }
   }
 ]
}
```

## Options
When requiring the plugin, there are several options that must be passed down and a few that can be optionally passed down, in order to determine whose data you are including and exactly how much.
* `instance` (required): The url (no trailing slash!) of the instance to which the user belongs. e.g. if you're signed up for pleroma at the main `https://pleroma.site`, you would use that exact string.
* `userId` (required): The integer id of the user for whom the feed is being fetched. When visiting a user profile on Pleroma, you can find this id in the url e.g. a userId of 1 is indicated by `https://pleroma.site/users/1`.

## Usage
Pleroma data from the given user's feed will be included as `allPleromaPost` in Gatsby's graphQL infrastructure.

As an example, a very large query that utilized a majority of the keys from a single post object from Pleroma's twitter API would look like:

```
query GetPleromaPosts {
  allPleromaPost(sort: {fields: [statusnet_conversation_id], order:DESC}) {
    edges {
      node {
        statusnet_conversation_id
        activity_type
        created_at
        external_url
        fave_num
        id
        in_reply_to_status_id
        is_local
        is_post_verb
        repeat_num
        repeated
        statusnet_conversation_id
        summary
        uri
        visibility
        text
        statusnet_html
        user {
          profile_image_url_https
          screen_name
          statusnet_profile_url
        }
        attachments {
          url
          empty
        }
      }
    }
  }
}
```
This query would be sorted on the field `statusnet_conversation_id` in a descending fashion and would make all of the above key values available in the component which queried them in `this.props.data.edges.node`.

## A Note About Attachments
Every time this plugin runs at build time, it is _dynamically_ generating a graphql schema: what you are able to query is at the mercy of what the source plugin pulls in and builds the schema with. This is powerful because we do not have to explicitly define a schema ahead of time and only get what we want. But it is also a huge pain because if we are _expecting_ something and we do **not** get it from any individual post, it won't be in the schema, and declarations involving that item will crash our build.

Attachments are a prime example of this.

In order to thwart this, I've shimmed a placeholder attachment into the build process for any item which is fetched but lacks any attachments. The upside is, in just a line-and-a-half of code, I've undercut a nasty problem. Without this code, anytime you do the following:

```
query somethingWithAttachmenets {
  ...
    ...
      ...
        attachments {
          url
        }
}
```

If all you sourced were empty arrays, then your code is going to yell at you: it never built a node called "attachment" with knowledge of a "url" field.

The downside of this is, we have to live with a slightly weird result: you will never get _no_ attachments. You will always get at least one, and often, that one will be an empty attachment with a field `empty` set to `true`. 

At the moment, this is the best we can do. I'm unsatisfied with the complexity involved in other ways of dealing with this issue. Just keep in mind that if you want to check if you have no attachments, you need to check the truthiness of  `attachments[0].empty`.
