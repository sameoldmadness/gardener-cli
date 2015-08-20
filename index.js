#!/usr/bin/env node
var isbin = require('isbin');
var chalk = require('chalk');
var inquirer = require('inquirer');
var multiline = require('multiline');
var childProcess = require('child_process');
var Configstore = require('configstore');
var args = require('minimist')(process.argv);
var configstore = new Configstore('gardener');
var pkg = require('./package.json');

function exitWithError(message) {
    console.log(chalk.red(message));
    process.exit(1);
}

function exitWithSuccess(message) {
    console.log(chalk.green(message));
    process.exit();
}

function restore(preset) {
    preset.forEach(function (win) {
        var geometry = [0, win.xOffset, win.yOffset, win.width, win.height].join(',');

        childProcess.execSync('wmctrl -ir ' + win.windowId + ' -e ' + geometry);
    });
}

function showHelp() {
    console.log(multiline(function(){/*
  Save and restore windows position.

  Put windows back in place after unplugging external display.

  Usage
    gardener <action> <preset>

  Example
    gardener
    gardener --save my-preset
    gardener --restore

  Options
    --save=<preset>       Save preset
    --restore=<preset>    Restore preset
    --del                 Delete preset
    --help                Show this help
    --version             Print version

  If <preset> is not specified, it is "default".
    */}));
}

function savePreset(args) {
    var name = args.save !== true ? args.save : 'default';
    var preset =
        String(childProcess.execSync('wmctrl -lpG'))
            .trim()
            .split('\n')
            .map(function (row) {
                var cells = row.split(/ +/);

                return {
                    windowId:      cells[0],
                    desktopNumber: cells[1],
                    windowPid:     cells[2],
                    xOffset:       cells[3],
                    yOffset:       cells[4],
                    width:         cells[5],
                    height:        cells[6],
                    machineName:   cells[7],
                    windowTitle:   cells.slice(8).join(' '),
                };
            })
            .filter(function (win) {
                return win.desktopNumber !== '-1'
                   &&  win.windowPid     !== '0'
                   &&  win.windowTitle   !== 'Desktop';
            })
            .map(function (win) {
                return {
                    windowId: win.windowId,
                    xOffset:  win.xOffset,
                    yOffset:  win.yOffset,
                    width:    win.width,
                    height:   win.height,
                };
            });

    configstore.set(name, preset);
    exitWithSuccess('preset saved');
}

function deletePreset(args) {
    var presets = Object.keys(configstore.all);

    if (!presets.length) {
        exitWithError('no presets found');
    }

    inquirer.prompt([{
        type: "list",
        name: "preset",
        message: "Choose a preset to delete",
        choices: presets
    }], function (answers) {
        configstore.del(answers.preset);
        exitWithSuccess('preset deleted');
    });
}

function restorePreset(args) {
    var name = args.restore !== true ? args.restore : 'default';
    var preset = configstore.get(name);

    if (!preset) {
        exitWithError('preset not exist');
    }

    restore(preset);
    exitWithSuccess('preset restored');
}

function choosePreset() {
    var presets = Object.keys(configstore.all);

    if (!presets.length) {
        exitWithError('no presets found');
    }

    inquirer.prompt([{
        type: "list",
        name: "preset",
        message: "Choose a preset to restore",
        choices: presets
    }], function (answers) {
        var preset = configstore.get(answers.preset);

        restore(preset);
        exitWithSuccess('preset restored');
    });
}

if (!isbin('wmctrl')) {
    exitWithError('wmctrl is not installed');
}

if (args.help) {
    showHelp();
    process.exit();
}

if (args.version) {
    console.log(pkg.version);
    process.exit();
}

if (args.save) {
    savePreset(args);
}

if (args.restore) {
    restorePreset(args);
}

if (args.del) {
    deletePreset(args);
}

choosePreset();
