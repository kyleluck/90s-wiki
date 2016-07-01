# Wiki

You will make a 90s style wiki - where anyone from anywhere in the world can edit and create pages.

The URL schemes of this wiki are as follows:

* / will redirect to /HomePage
* /:pageName will render the contents of the specified pageName, if the page doesn't exist, it will display the place holder page, giving users a link to create that page
* /:pageName/edit will display a form for the user to edit the specified page
* /:pageName/save is the URL where the edit form will send a POST request to save the new version of the page

# Steps

## Setup

0. Create a new directory and initialize it as an express application. Follow the instructions here: http://expressjs.com/en/starter/installing.html if you don't remember how to do it.
0b. Install the hbs module and the body-parser module.

## Placeholder Page

1. Create a route with the page name as a route parameter: /:pageName, and render a default place holder page for the matching URLs. You might call the view template placeholder.hbs - put that in the views folder. In side placeholder.hbs, put in text that says: this page has not been created yet.
1b. Create a route for / - it should redirect to /HomePage - which will render the placeholder page for HomePage.
2. In the placeholder.hbs, add a link to /:pageName/edit so the user can click on that and navigate to the edit page. You can do that in handlebars using the syntax: <a href="/{{pageName}}/edit">Create this page.</a>. The pageName property must exist on the object in the second parameter of the response.render() method call. Example: response.render('placeholder', { pageName: ... })

## Creating Pages

3. Create the edit page for the /:pageName/edit route. The edit page will have a form. The form will have an action attribute set to /{{pageName}}/save, the method attribute will be POST. In the form there will be a textarea and a submit button (submit button's type is "submit"). The data that the user enters in the textarea will be the new contents of the page. The textarea's name attribute is important, it will be the attribute you use to retrieve the contents of the textarea on the server side.
4. Create a pages directory in your project folder.
5. Create the handler for the POST /:pageName/save route. The handler will take the content from the form and save it as a file under the pages directory. The file will be pages/PAGE_NAME.txt - substituting PAGE_NAME with the name of the page, which is taken from the :pageName route parameter. (request.params.pageName)
6. Viewing the saved page. Back in the /:pageName route, rewrite the handler to render the contents of FILE_NAME.txt for the given filename if it exists, or render the place holder page if it doesn't.

## Wiki Links

Make the pages linkable via CamelCased words.

7. Traditional wikis have the tradition of having CamelCased words in the context automatically turning into links. In other words, a sentence like "I love DigitalCrafts!" will turn into "I love <a href="/DigitalCrafts">DigitalCrafts</a>". There is an npm module that will do that for you, it's called wiki-linkify. Look up the documentation to learn how to use it to convert your content, while you render the content into your page.

http://npmjs.com/wiki-linkify

## Edit Existing Pages

Make existing pages editable. To do this you will need to add an "Edit this page" link to each /:pageName page, and allow the /:pageName/edit page to retrieve the existing content and populate the textarea with it.

8. Read in the contents of pages/FILE_NAME.txt and use it to populate the textarea in the edit page.
9. Check for an error from the fs.readFile() call. If an error exists, the file does not exist, so set contents of the textarea to be empty.
