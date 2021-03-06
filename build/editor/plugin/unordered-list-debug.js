/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:07
*/
/*
combined modules:
editor/plugin/unordered-list
*/
/**
 * @ignore
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/unordered-list', [
    './list-utils/btn',
    './unordered-list/cmd'
], function (S, require) {
    var ListButton = require('./list-utils/btn');
    var ListCmd = require('./unordered-list/cmd');
    function unorderedList() {
    }
    S.augment(unorderedList, {
        pluginRenderUI: function (editor) {
            ListCmd.init(editor);
            ListButton.init(editor, {
                cmdType: 'insertUnorderedList',
                buttonId: 'unorderedList',
                menu: {
                    width: 75,
                    children: [
                        {
                            content: '\u25CF \u5706\u70B9',
                            value: 'disc'
                        },
                        {
                            content: '\u25CB \u5706\u5708',
                            value: 'circle'
                        },
                        {
                            content: '\u25A0 \u65B9\u5757',
                            value: 'square'
                        }
                    ]
                },
                tooltip: '\u65E0\u5E8F\u5217\u8868'
            });
        }
    });
    return unorderedList;
});

