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
       count: 10 // optional
     }
   }
 ]
}
```

## Options
When requiring the plugin, there are several options that must be passed down and a few that can be optionally passed down, in order to determine whose data you are including and exactly how much.
* `instance` (required): The url (no trailing slash!) of the instance to which the user belongs. e.g. if you're signed up for pleroma at the main `https://pleroma.site`, you would use that exact string.
* `userId` (required): The integer id of the user for whom the feed is being fetched. When visiting a user profile on Pleroma, you can find this id in the url e.g. a userId of 1 is indicated by `https://pleroma.site/users/1`.
* `count` (optional): The number of posts to return from the Pleroma feed. **The default is 20.**

## Usage
Pleroma data from the given user's feed will be included as `allPleromaPost` in Gatsby's graphQL infrastructure.
