/**
 * test macro for xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var XTemplate = require('xtemplate');

    describe('macro', function () {
        it('simple support', function () {
            var tpl = '{{#macro ("test", "t")}}{{t}}{{/macro}}call {{macro ("test", arg)}}';

            var render = new XTemplate(tpl).render({
                arg: 'macro'
            });
            expect(render).toBe('call macro');
        });

        it('support sub template macro define', function () {
            var tpl = '{{include ("macro/x")}}call {{macro ("test", arg)}}';
            KISSY.add('macro/x', '{{#macro ("test", "t")}}{{t}}{{/macro}}');
            var render = new XTemplate(tpl).render({
                arg: 'macro'
            });
            expect(render).toBe('call macro');
        });

        it('support use macro from parent template', function () {
            var tpl = '{{#macro( "test", "t")}}{{t}}2{{/macro}}{{include( "macro/x2")}}';
            KISSY.add('macro/x2', 'call {{macro ("test", arg)}}');
            var render = new XTemplate(tpl).render({
                arg: 'macro'
            });
            expect(render).toBe('call macro2');
        });

        it('support macro override without scope', function () {
            KISSY.add('xtemplate/parent', '{{#macro( "x")}}parent{{/macro}}');
            var render = new XTemplate('{{include( "xtemplate/parent")}}{{#macro ("x")}}{{content}} child{{/macro}}' +
                '{{macro ("x")}}').render({
                    title: 'title',
                    content: 'content'
                });
            expect(render).toBe(' child');
        });
    });
});