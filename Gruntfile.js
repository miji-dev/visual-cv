/* global module*/
module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            options: {
                separator: ";"
            },
            dist: {
                src: ["src/cv.js"],
                dest: "dist/<%= pkg.name %>.js"
            },
            examples: {
                src: ["src/cv.js"],
                dest: "examples/<%= pkg.name %>.js"
            }
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> <%= grunt.template.today('dd-mm-yyyy') %> */\n"
            },
            dist: {
                files: {
                    "dist/<%= pkg.name %>.min.js": ["<%= concat.dist.dest %>"]
                }
            },
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");

    grunt.registerTask("default", ["concat", "uglify"]);
};
