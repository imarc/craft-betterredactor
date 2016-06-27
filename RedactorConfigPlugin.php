<?php
/**
 * @copyright 2016 Imarc
 * @author Kevin Hamer [kh] <kevin@imarc.com>
 * @license Apache (see LICENSE file)
 */

namespace Craft;

/**
 * This is a WORK IN PROGRESS.
 *
 * This plugin provides configuration for Redactor II that:
 *
 *   * uses icons
 *   * uses codemirror and alignment
 *   * provides a less hacky way to add additional redactor plugins.
 */
class RedactorConfigPlugin extends BasePlugin
{
    public function getName()
    {
        return 'Redactor Config Field Type';
    }

    public function getVersion()
    {
        return '0.1';
    }

    public function getDeveloper()
    {
        return 'Imarc';
    }

    public function getDeveloperUrl()
    {
        return 'https://www.imarc.com';
    }
}
