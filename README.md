Better Redactor
===============

Better Redactor is a [Craft](https://craftcms.com/) plugin that provides a more
feature rich initial configuration rich text fields.

Better Redactor uses the same [Redactor](https://imperavi.com/redactor/)
library that Craft provides, it just provides it's own field type that has more
configuration:

* It includes the codemirror, alignment, fullscreen, and table plugins
* It provides a Redactor plugin that configures icons for all the entire
  redactor toolbar
* You can add additional JS/CSS files (plugins) to a new folder,
  `public/redactor_plugins`, which are automatically included
* You can still create and use custom redactor configurations by adding them to
  the `craft/config/redactor` folder.


Installation
------------

### With Composer

if you have [composer](https://getcomposer.org/), you can install this plugin
quickly. This plugin makes use of
[composer/installers](https://github.com/composer/installers) to make the
plugin composer compatible.

In the root of your Craft project, you can initial composer and then

```
composer require imarc/craft-betterredactor
```

After, go into Craft and install the plugin via the Craft Plugins panel.


### Without Composer

You can also create a folder in `craft/plugins/` called `betterredactor` and
put all of these files in there. After, go into Craft and install the plugin
via the Craft Plugins panel.
