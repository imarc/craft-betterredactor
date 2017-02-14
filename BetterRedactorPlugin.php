<?php
/**
 * @copyright 2016 Imarc
 * @author Kevin Hamer [kh] <kevin@imarc.com>
 * @license Apache (see LICENSE file)
 */

namespace Craft;

/**
 * This plugin provides configuration for Redactor II that:
 *
 *   * uses icons
 *   * uses codemirror and alignment
 *   * provides a less hacky way to add additional redactor plugins.
 *
 * CSS and JS files can be added to public/redactor_plugins/ and they
 * will automatically be included. This plugin uses the same
 * craft/config/redactor/ JSON configurations that Craft typically uses.
 *
 * When this plugin is installed, it will automatically convert any RichText
 * fields into BetterRedactor Rich Text fields. When uninstalled, it will
 * switch them back.
 */
class BetterRedactorPlugin extends BasePlugin
{
    public function getName()
    {
        return 'Better Redactor';
    }

    public function getDescription()
    {
        return Craft::t("An improved starting configuration for Redactor II as well as way to add additional plugins.");
    }

    public function getVersion()
    {
        return '0.3.x';
    }

    public function getDeveloper()
    {
        return 'Imarc';
    }

    public function getDeveloperUrl()
    {
        return 'https://www.imarc.com';
    }

    /**
     * When installed, this plugin converts RichText fields into BetterRedactor
     * fields. It also creates a folder, public/redactor_plugins, and
     * populates it with some starting plugins.
     */
    public function onAfterInstall()
    {
        craft()->db->createCommand()->update(
            'fields',
            array('type' => 'BetterRedactor'),
            array('type' => 'RichText')
        );

        $publicDirectory = craft()->path->appPath . '../../public/redactor_plugins';

        if (!IOHelper::folderExists($publicDirectory)) {
            $initialDirectory = craft()->path->getPluginsPath()
                .  '/betterredactor/redactor_plugins';

            $files = array_filter(
                scandir($initialDirectory),
                function($file) use ($initialDirectory) {
                    return is_file("$initialDirectory/$file");
                }
            );

            foreach ($files as $file) {
                if (preg_match('((.js|.css)$)i', $file)) {
                    IOHelper::copyFile(
                        "$initialDirectory/$file",
                        "$publicDirectory/$file"
                    );
                }
            }
        }
    }

    /**
     * When uninstalled, this plugin converts all BetterRedactor fields back
     * into RichText fields.
     */
    public function onBeforeUninstall()
    {
        craft()->db->createCommand()->update(
            'fields',
            array('type' => 'RichText'),
            array('type' => 'BetterRedactor')
        );
    }
}
