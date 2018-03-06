'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var _ = require('lodash');
var _s = require('underscore.string');


var PieceMailGenerator = yeoman.generators.Base.extend({

    prompting: {

        // camapign name image domain
        askFor: function () {
            var done = this.async();

            // Have Yeoman greet the user.
            this.log(yosay(
                'Welcome to your next email campaign! Peace.'
            ));

            // Prompts the user to help build the campaign
            var prompts = [{
                    // Name the Poject, TODO: decide if to slugify project name.
                    type    : 'input',
                    name    : 'appname',
                    message : 'Your campaign name',
                    validate: function (value) {
                        // Trim input value and check if it's not empty
                        if (!value.replace(/^\s+/g, '').replace(/\s+$/g, '')) {
                            return 'You need to provide a project name';
                        }
                        return true;
                    }
                },{
                    type: 'input',
                    name: 'imageLocation',
                    message: 'Where will your images be kept?',
                    default: 'http://www.mydomain.com/',
                        validate: function (value) {
                            // Trim input value
                            var domain = value.replace(/^\s+/g, '').replace(/\s+$/g, '');
                            // Check if domain isn't empty
                            if (!domain) {
                                return 'You need to provide a domain';
                            }
                            // Check if domain is valid
                            if (!domain.match(/^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
                                return 'You need to provide a valid domain';
                            }
                            return true;
                        },
                        filter: function (value) {
                            // Add a trailing slash if it was missed off.
                            if (value[value.length - 1] !== '/') {
                                return value + '/';
                            }
                            return value;
                        }
                },{
                    type: 'confirm',
                    name: 'useLitmus',
                    message: 'Would you like to use Litmus for testing?'
                },{
                    type: 'confirm',
                    name: 'readyTemplates',
                    message: 'Have you got some templates ready?'
                },{
                    type: 'list',
                    name: 'headerTemplate',
                    message: 'Which header are you using?',
                    choices: [
                    { name: 'Simple logo', value: 'header-logo' },
                    { name: 'Logo with nav', value: 'header-logo-nav' },
                    { name: 'Logo with contact', value: 'header-logo-contact' },
                    ],
                    // Ask this question if we don't have any templates ready to use.
                    when: function (answers) {
                        return !getAnswer('readyTemplates')(answers);
                    }
                }, {
                    type: 'list',
                    name: 'footerTemplate',
                    message: 'Which footer are you using?',
                    choices: [
                        { name: 'Simple', value: 'footer-simple' },
                        //{ name: 'Logo with sign off', value: 'logo-with-sign-off' },
                    ],
                    // Ask this question if we don't have any templates ready to use.
                    when: function (answers) {
                        return !getAnswer('readyTemplates')(answers);
                    }
                }];

            function getAnswer ( aQuestion ) {
                return function ( answers ) {
                    return answers[ aQuestion ];
                }
            };

            this.prompt(prompts, function (answers) {
                this.appname        = answers.appname;
                this.imageLocation  = answers.imageLocation;
                this.useLitmus      = answers.useLitmus;
                this.readyTemplates = answers.readyTemplates;
                this.projectSlug        = _s.slugify(answers.appname);

                if (answers.readyTemplates){
                    this.headerTemplate = 'header';
                    this.footerTemplate = 'footer';
                } else {
                    this.headerTemplate = answers.headerTemplate;
                    this.footerTemplate = answers.footerTemplate;
                }

                done();
            }.bind(this));
        },


        askForRows: function () {
            var done = this.async();
            var rows = [];
            var row = function(self) {
                var row_quest = {
                    type: 'list',
                    name: "row",
                    message: "Need a row?",
                    choices: [
                    { name: 'Nope', value: false },
                    { name: '2 columns', value: 'row-2-col' },
                    { name: '2 thirds right', value: 'row-2-thirds-left' },
                    { name: '2 thirds left', value: 'row-2-thirds-right' },
                    { name: '3 columns', value: 'row-3-col' },
                    { name: 'Banner', value: 'row-banner' },
                    { name: 'Nav bar', value: 'row-nav-bar' },
                    { name: 'Text block', value: 'row-text-block' }
                    ]
                };
                self.prompt([row_quest], function(answers) {
                    if (answers.row !== false) {
                        rows.push(answers.row);
                        row(self);
                    } else {
                        self.rows = rows;
                        done();
                    }
                });
            }

            this.prompt(rows, function (answers) {
                this.name = answers.name;
                this. desc = answers.desc;

                row(this);
            }.bind(this));
        },
    },


    writing: {
        app: function () {
            var src = this;

            this.template('_package.json', this.projectSlug + '/package.json');
            this.template('gulpfile.js', this.projectSlug + '/gulpfile.js');
            this.template('brand-config.js', this.projectSlug + '/brand-config.js');
            this.template('index.html', this.projectSlug + '/src/index.html');

            var piecesDir = (this.readyTemplates) ? this.sourceRoot(this.destinationRoot()) + '/pieces/' : 'pieces/';

            // Copying the templates
            this.copy(piecesDir + 'pre-header.html', this.projectSlug + '/src/pieces/pre-header.html');
            this.copy(piecesDir + 'post-footer.html', this.projectSlug + '/src/pieces/post-footer.html');
            this.copy(piecesDir + 'button.html',  this.projectSlug + '/src/pieces/button.html');
            this.copy(piecesDir + 'spacing.html', this.projectSlug + '/src/pieces/spacing.html');
            this.copy(piecesDir + 'button.html',  this.projectSlug + '/src/pieces/button.html');
            this.copy(piecesDir + 'style.css',     this.projectSlug + '/src/style.css');

            this.copy(piecesDir + this.headerTemplate +'.html', this.projectSlug + '/src/pieces/header.html');
            this.copy(piecesDir + this.footerTemplate +'.html', this.projectSlug + '/src/pieces/footer.html');
            _.each(this.rows, function(r, i) {
                var rowNumber = i + 1;
                src.copy(piecesDir + r +'.html', src.projectSlug + '/src/pieces/r' + rowNumber + '-' + r + '.html');
            });
        }
    },

    end: function () {
        var src = this;
        process.chdir(this.projectSlug + '/');
        this.installDependencies({ 
            bower: false,
            callback: src.log(yosay( '... And we\'re done, cd into ' + this.projectSlug + ' and run gulp! Peace Out.'))
        });
    }
});

module.exports = PieceMailGenerator;
