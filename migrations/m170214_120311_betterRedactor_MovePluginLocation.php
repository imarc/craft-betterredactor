<?php
namespace Craft;

/**
 * The class name is the UTC timestamp in the format of mYYMMDD_HHMMSS_pluginHandle_migrationName
 */
class m170214_120311_betterRedactor_MovePluginLocation extends BaseMigration
{
	/**
	 * Any migration code in here is wrapped inside of a transaction.
	 *
	 * @return bool
	 */
	public function safeUp()
	{
		// Move any files in the old redactor plugins directory to the new location under /public
		$configDirectory = craft()->path->getConfigPath() . '/redactor_plugins';
		$publicDirectory = craft()->path->appPath . '../../public/redactor_plugins';

        if (IOHelper::folderExists($configDirectory) && !IOHelper::folderExists($publicDirectory)) {
            $files = array_filter(
                scandir($configDirectory),
                function($file) use ($configDirectory) {
                    return is_file("$configDirectory/$file");
                }
            );

            foreach ($files as $file) {
                if (preg_match('((.js|.css)$)i', $file)) {
                    IOHelper::copyFile(
                        "$configDirectory/$file",
                        "$publicDirectory/$file"
                    );
                }
            }
        }
	}
}
