// Create plugin
(function($)
{
    /**
     * Make sure that this plugin is included last, or not all icons will show
     * up.
     */
    $.Redactor.prototype.icons = function()
    {
        return {
            init: function ()
            {
                console.log('init icons');
                var icons = {
                    'alignment': '<i class="fa fa-align-justify"></i>',
                    'format': '<i class="fa fa-paragraph"></i>',
                    'fullscreen': '<i class="fa fa-arrows-alt"></i>',
                    'horizontalrule': '<i class="fa fa-minus"></i>',
                    'html': '<i class="fa fa-code"></i>',
                    'lists': '<i class="fa fa-list"></i>',
                    'table': '<i class="fa fa-table"></i>',
                    'video': '<i class="fa fa-file-video-o"></i>'
                };

                $.each(this.button.all(), $.proxy(function(i,s)
                {

                    window.redactortmp = this.button;

                    var key = $(s).attr('rel');

                    console.log(key, icons[key]);

                    if (typeof icons[key] !== 'undefined')
                    {
                        var icon = icons[key];
                        var button = this.button.get(key);
                        console.log('setting', key, icon);
                        this.button.setIcon(button, icon);
                    }

                }, this));
            }
        };
    };
})(jQuery);
