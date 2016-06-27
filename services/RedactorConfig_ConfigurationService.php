<?php
namespace Craft;

class RedactorConfig_ConfigurationService extends BaseApplicationComponent
{
    public function loadFiles()
    {
        $templateService = craft()->templates;

        $redactor_path = $_SERVER['DOCUMENT_ROOT'] . '/redactor';

        if (is_dir($redactor_path)) {
            $files = array_map('is_file', scandir($redactor_path));
        } else {
            $files = array();
        }

        $files[] = 'redactorconfig/redactorConfig.js';
        $files[] = 'redactorconfig/redactorConfig.css';

        foreach ($files as $file) {
            if (preg_match('(.js$)i', $file)) {
                $templateService->includeJsResource($file);
            } elseif (preg_match('(.css$)i', $file)) {
                $templateService->includeCssFile($file);
            }
        }
    }
}
