const jsreport = require('jsreport-core')();
jsreport.use(require('jsreport-handlebars')());
jsreport.use(require('jsreport-chrome-pdf')());

async function test() {
    try {
        await jsreport.init();
        console.log('Jsreport initialized');
        const result = await jsreport.render({
            template: {
                content: '<h1>Hello from Jsreport</h1>',
                engine: 'handlebars',
                recipe: 'chrome-pdf'
            }
        });
        console.log('PDF Generated, size:', result.content.length);
        process.exit(0);
    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}

test();
