/**
 * @author    Pixel & Tonic, Inc. <support@pixelandtonic.com>
 * @copyright Copyright (c) 2014, Pixel & Tonic, Inc.
 * @license   http://craftcms.com/license Craft License Agreement
 * @see       http://craftcms.com
 * @package   craft.app.resources
 */

(function($){


/**
 * Rich Text input class
 */
Craft.BetterRedactorInput = Garnish.Base.extend(
{
	id: null,
	linkOptions: null,
	assetSources: null,
	elementLocale: null,
	redactorConfig: null,

	$textarea: null,
	redactor: null,
	linkOptionModals: null,

	init: function(settings)
	{
		this.id = settings.id;
		this.linkOptions = settings.linkOptions;
		this.assetSources = settings.assetSources;
		this.transforms = settings.transforms;
		this.elementLocale = settings.elementLocale;
		this.redactorConfig = settings.redactorConfig;

		this.linkOptionModals = [];

		if (!this.redactorConfig.lang)
		{
			this.redactorConfig.lang = settings.redactorLang;
		}

		if (!this.redactorConfig.direction)
		{
			this.redactorConfig.direction = (settings.direction || Craft.orientation);
		}

		this.redactorConfig.imageUpload = true;
		this.redactorConfig.fileUpload = true;
		this.redactorConfig.dragImageUpload = false;
		this.redactorConfig.dragFileUpload = false;

		// Prevent a JS error when calling core.destroy() when opts.plugins == false
		if (typeof this.redactorConfig.plugins !== typeof [])
		{
			this.redactorConfig.plugins = [];
		}

		var callbacks = {
			init: Craft.BetterRedactorInput.handleRedactorInit
		};

		if (typeof this.redactorConfig.callbacks == typeof [])
		{
			// Merge them together
			for (var i in callbacks)
			{
				if (typeof this.redactorConfig.callbacks[i] != typeof undefined)
				{
					this.redactorConfig.callbacks[i] = this.mergeCallbacks(callbacks[i], this.redactorConfig.callbacks[i]);
				}
			}
		}
		else
		{
			this.redactorConfig.callbacks = callbacks;
		}

		// Initialize Redactor
		this.$textarea = $('#'+this.id);

		this.initRedactor();

		if (typeof Craft.livePreview != 'undefined')
		{
			// There's a UI glitch if Redactor is in Code view when Live Preview is shown/hidden
			Craft.livePreview.on('beforeEnter beforeExit', $.proxy(function()
			{
				this.redactor.core.destroy();
			}, this));

			Craft.livePreview.on('enter slideOut', $.proxy(function()
			{
				this.initRedactor();
			}, this));
		}
	},

	mergeCallbacks: function(callback1, callback2)
	{
		return function() {
			callback1.apply(this, arguments);
			callback2.apply(this, arguments);
		}
	},

	initRedactor: function()
	{
		Craft.BetterRedactorInput.currentInstance = this;
		this.$textarea.redactor(this.redactorConfig);
		delete Craft.BetterRedactorInput.currentInstance;
	},

	onInitRedactor: function(redactor)
	{
		this.redactor = redactor;

		// Only customize the toolbar if there is one,
		// otherwise we get a JS error due to redactor.$toolbar being undefined
		if (this.redactor.opts.toolbar)
		{
			this.customizeToolbar();
		}

		this.leaveFullscreetOnSaveShortcut();

		this.redactor.core.editor()
			.on('focus', $.proxy(this, 'onEditorFocus'))
			.on('blur', $.proxy(this, 'onEditorBlur'));

		if (this.redactor.opts.toolbarFixed && !Craft.BetterRedactorInput.scrollPageOnReady)
		{
			Garnish.$doc.on('ready', function() {
				Garnish.$doc.trigger('scroll');
			});

			Craft.BetterRedactorInput.scrollPageOnReady = true;
		}
	},

	customizeToolbar: function()
	{
		// Override the Image and File buttons?
		if (this.assetSources.length)
		{
			var $imageBtn = this.replaceRedactorButton(
                    'image',
                    this.redactor.lang.get('image'),
                    '<i class="fa fa-picture-o"></i>'
                ),
				$fileBtn = this.replaceRedactorButton(
                    'file',
                    this.redactor.lang.get('file'),
                    '<i class="fa fa-paperclip"></i>'
                );

			if ($imageBtn)
			{
				this.redactor.button.addCallback($imageBtn, $.proxy(this, 'onImageButtonClick'));
			}

			if ($fileBtn)
			{
				this.redactor.button.addCallback($fileBtn, $.proxy(this, 'onFileButtonClick'));
			}
		}
		else
		{
			// Image and File buttons aren't supported
			this.redactor.button.remove('image');
			this.redactor.button.remove('file');
		}

		// Override the Link button?
		if (this.linkOptions.length)
		{
			var $linkBtn = this.replaceRedactorButton(
                'link',
                this.redactor.lang.get('link'),
                '<i class="fa fa-link"></i>'
            );

			if ($linkBtn)
			{
				var dropdownOptions = {};

				for (var i = 0; i < this.linkOptions.length; i++)
				{
					dropdownOptions['link_option'+i] = {
						title: this.linkOptions[i].optionTitle,
						func: $.proxy(this, 'onLinkOptionClick', i)
					};
				}

				// Add the default Link options
				$.extend(dropdownOptions, {
					link:
					{
						title: this.redactor.lang.get('link-insert'),
						func: 'link.show',
						observe: {
							element: 'a',
							in: {
								title: this.redactor.lang.get('link-edit'),
							},
							out: {
								title: this.redactor.lang.get('link-insert')
							}
						}
					},
					unlink:
					{
						title: this.redactor.lang.get('unlink'),
						func: 'link.unlink',
						observe: {
							element: 'a',
							out: {
								attr: {
									'class': 'redactor-dropdown-link-inactive',
									'aria-disabled': true
								}
							}
						}
					}
				});

				this.redactor.button.addDropdown($linkBtn, dropdownOptions);
			}
		}
	},

	onImageButtonClick: function()
	{
		this.redactor.selection.save();

		if (typeof this.assetSelectionModal == 'undefined')
		{
			this.assetSelectionModal = Craft.createElementSelectorModal('Asset', {
				storageKey: 'BetterRedactorFieldType.ChooseImage',
				multiSelect: true,
				sources: this.assetSources,
				criteria: { locale: this.elementLocale, kind: 'image' },
				onSelect: $.proxy(function(assets, transform)
				{
					if (assets.length)
					{
						this.redactor.selection.restore();
						for (var i = 0; i < assets.length; i++)
						{
							var asset = assets[i],
								url   = asset.url+'#asset:'+asset.id;

							if (transform)
							{
								url += ':'+transform;
							}

							this.redactor.insert.node($('<img src="'+url+'" />')[0]);
							this.redactor.code.sync();
						}
						this.redactor.observe.images();
					}
				}, this),
				closeOtherModals: false,
				transforms: this.transforms
			});
		}
		else
		{
			this.assetSelectionModal.show();
		}
	},

	onFileButtonClick: function()
	{
		this.redactor.selection.save();

		if (typeof this.assetLinkSelectionModal == 'undefined')
		{
			this.assetLinkSelectionModal = Craft.createElementSelectorModal('Asset', {
				storageKey: 'BetterRedactorFieldType.LinkToAsset',
				sources: this.assetSources,
				criteria: { locale: this.elementLocale },
				onSelect: $.proxy(function(assets)
				{
					if (assets.length)
					{
						this.redactor.selection.restore();
						var asset     = assets[0],
							url       = asset.url+'#asset:'+asset.id,
							selection = this.redactor.selection.text(),
							title     = selection.length > 0 ? selection : asset.label;
						this.redactor.insert.node($('<a href="'+url+'">'+title+'</a>')[0]);
						this.redactor.code.sync();
					}
				}, this),
				closeOtherModals: false,
				transforms: this.transforms
			});
		}
		else
		{
			this.assetLinkSelectionModal.show();
		}
	},

	onLinkOptionClick: function(key)
	{
		this.redactor.selection.save();

		if (typeof this.linkOptionModals[key] == typeof undefined)
		{
			var settings = this.linkOptions[key];

			this.linkOptionModals[key] = Craft.createElementSelectorModal(settings.elementType, {
				storageKey: (settings.storageKey || 'BetterRedactorFieldType.LinkTo'+settings.elementType),
				sources: settings.sources,
				criteria: $.extend({ locale: this.elementLocale }, settings.criteria),
				onSelect: $.proxy(function(elements)
				{
					if (elements.length)
					{
						this.redactor.selection.restore();
						var element   = elements[0],
							url       = element.url+'#'+settings.elementType.toLowerCase()+':'+element.id,
							selection = this.redactor.selection.text(),
							title = selection.length > 0 ? selection : element.label;
						this.redactor.insert.node($('<a href="'+url+'">'+title+'</a>')[0]);
						this.redactor.code.sync();
					}
				}, this),
				closeOtherModals: false
			});
		}
		else
		{
			this.linkOptionModals[key].show();
		}
	},

	onEditorFocus: function()
	{
		this.redactor.core.box().addClass('focus');
	},

	onEditorBlur: function()
	{
		this.redactor.core.box().removeClass('focus');
	},

	leaveFullscreetOnSaveShortcut: function()
	{
		if (typeof this.redactor.fullscreen != 'undefined' && typeof this.redactor.fullscreen.disable == 'function')
		{
			Craft.cp.on('beforeSaveShortcut', $.proxy(function()
			{
				if (this.redactor.fullscreen.isOpen)
				{
					this.redactor.fullscreen.disable();
				}
			}, this));
		}
	},

	replaceRedactorButton: function(key, title, icon)
	{
		// Ignore if the button isn't in use
		if (!this.redactor.button.get(key).length)
		{
			return;
		}

		// Create a placeholder button
		var placeholderKey = key+'_placeholder';
		this.redactor.button.addAfter(key, placeholderKey);

		// Remove the original
		this.redactor.button.remove(key);

		// Add the new one
		var $btn = this.redactor.button.addAfter(placeholderKey, key, title);

        if (icon) {
            this.redactor.button.setIcon($btn, icon);
        }

		// Set the dropdown
		//this.redactor.button.addDropdown($btn, dropdown);

		// Remove the placeholder
		this.redactor.button.remove(placeholderKey);

		return $btn;
	}
},
{
	handleRedactorInit: function()
	{
		// `this` is the current Redactor instance.
		// `Craft.BetterRedactorInput.currentInstance` is the current BetterRedactorInput instance
		Craft.BetterRedactorInput.currentInstance.onInitRedactor(this);
	}
});


})(jQuery);
