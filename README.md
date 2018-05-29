#Tome 

## Link to View Live App
https://sharp-swirles-724079.netlify.com/

## API Documentation
`GET /api/readinglist/books`
Returns array of objects, each being a book saved using the add endpoint below.
```
response: 200, [
  {
    id: this._id,
    thumbnail: this.thumbnail,
    title: this.title,
    author: this.author,
    isbn: this.isbn,
    note: this.note,
    googleId: this.googleId
  },
  ...
]
```

`DELETE /api/readinglist/books/remove/:id`
Finds and removes a book from the database using its id.
```
response: 200, {
  message: 'Successful deletion'
}
```

`POST /api/readinglist/books/add`
Adds a book from the search results to the Reading List database.

```
request: [
  {
    id: req.body.id,
    thumbnail: req.body.thumbnail,
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    note: req.body.note,
    googleId: req.body.googleId
  };
  ...
]

response: (200),
  {
    id: this._id,
    thumbnail: this.thumbnail,
    title: this.title,
    author: this.author,
    isbn: this.isbn,
    note: this.note,
    googleId: this.googleId
  }
```

`POST /api/search`
Calls to the Google Books API to retrieve books based on the search query and all options passed into the call. Response is then serialized for the database.
```
request:
books.search('query', options, function(error, results) {
    if ( ! error ) {
        console.log(results);
    } else {
        console.log(error);
    }
});

response: 200, [
  {
    thumbnail: req.body.thumbnail,
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    googleId: req.body.googleId
  };
  ...
]
```
## Client Documentation 
Found here: https://github.com/sharihobbs/tome-client/blob/master/README.md

## App Built With:
* React
* HTML
* CSS
* NodeJS

## Authors/Contributors

* Shari Hobbs - (https://github.com/sharihobbs)

## Acknowledgments

* Thanks to friends and slack community peeps who offered their time and valuable feedback. 
* Search Powered by the Google Books API Family.
