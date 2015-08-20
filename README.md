# gardener-cli

Puts windows back in place after unplugging external display.

> When I have meetings I unplug the screen from my laptop to take the laptop to the meeting room, so all the windows are re-positioned to fit in one screen only. After the meeting, when I plug it back to the external screen, I need to manually move all the windows back in place.

Feel my pain? Look no further!

`gardener` is a tool to save and resore windows postion with ease.

## Install

```
$ npm install --global gardener-cli
```

## Examples

Save default preset:

```sh
$ gardener --save
```

Save preset with custom name:

```sh
$ gardener --save external-display
```

restoring  presets goes the same way:

```sh
$ gardener --restore
$ gardener --restore external-display
```

You can chose which preset to restore:

```sh
$ node index.js
? Choose a preset to restore (Use arrow keys)
❯ external-display
  laptop-screen
```

... or to delete:

```sh
$ node index.js --del
? Choose a preset to delete (Use arrow keys)
❯ external-display
  laptop-screen
```

## License

MIT © Roman Paradeev
