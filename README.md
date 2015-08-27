# generator-piece-mail

A [Yeoman](http://yeoman.io) generator to create email campaigns using tried
and tested modular templates building your email row by row.  

The workflow provided gives you all the tools required to build, debug and test
HTML emails using Gulp.  

## Getting Started

Download a [config file](https://bitbucket.org/wbarton/generator-piece-mail/downloads/piecemai.json)  
Add it to your home directory named `.piecemail.json` and add your Gmail
credentials and Litmus API information.  

Install generator-piece-mail from npm, run:

```
$ npm install -g generator-piece-mail
```

Piece-mail generates a directory for you run the generator in your campaigns
directory with:

```
$ yo piece-mail
```

## Documentation

The generator will ask you a series of questions to build the campaign including
the option to point to some already existing templates which you may have styled
specifically for long running promotional campaigns like monthly newsletters.  

TODO: Document support for existing templates.  


### Gulp Tasks

There are a number of Gulp tasks that are used to build and test your campaign.  

#### gulp

    $ gulp

Watches your files and build your email and serves it to
[localhost:8008](http://localhost:8008/)

#### gulp build

    $ gulp build

Builds your email into `dist/built/index.html`. Ready to be imported to your
email broadcasting software.

#### gulp send

    $ gulp send

Sends an email to your Gmail address, you can pass an `eml` option to have it
sent to any other email address:  

    $ gulp send --eml=another@example.com

#### gulp test

    $ gulp test

If you opted for Litmus testing this will create a new Litmus test.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
